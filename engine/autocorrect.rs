#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

/// Embedded dictionary — compiled into the WASM binary at build time.
const DICT: &str = include_str!("tech.txt");

// ── Allocator ───────────────────────────────────────────────
// 4 MB fixed buffer arena. All trie nodes, child links, and
// intermediate Levenshtein rows are allocated from this space.
// A simple bump pointer with checkpoint/restore provides LIFO
// deallocation matching the original Zig FixedBufferAllocator.

const BUFFER_SIZE: usize = 4 * 1024 * 1024;
static mut BUFFER: [u8; BUFFER_SIZE] = [0u8; BUFFER_SIZE];
static mut ALLOC_OFFSET: usize = 0;

unsafe fn alloc_trie_node() -> *mut TrieNode {
    let size = core::mem::size_of::<TrieNode>();
    let align = core::mem::align_of::<TrieNode>();
    let aligned = (ALLOC_OFFSET + align - 1) & !(align - 1);
    ALLOC_OFFSET = aligned + size;
    BUFFER.as_mut_ptr().add(aligned) as *mut TrieNode
}

unsafe fn alloc_trie_child() -> *mut TrieChild {
    let size = core::mem::size_of::<TrieChild>();
    let align = core::mem::align_of::<TrieChild>();
    let aligned = (ALLOC_OFFSET + align - 1) & !(align - 1);
    ALLOC_OFFSET = aligned + size;
    BUFFER.as_mut_ptr().add(aligned) as *mut TrieChild
}

unsafe fn alloc_row(count: usize) -> *mut usize {
    let size = count * core::mem::size_of::<usize>();
    let align = core::mem::align_of::<usize>();
    let aligned = (ALLOC_OFFSET + align - 1) & !(align - 1);
    ALLOC_OFFSET = aligned + size;
    BUFFER.as_mut_ptr().add(aligned) as *mut usize
}

unsafe fn checkpoint() -> usize {
    ALLOC_OFFSET
}

unsafe fn restore(cp: usize) {
    ALLOC_OFFSET = cp;
}

// ── Trie data structures ───────────────────────────────────
// Mirrors the Zig implementation: each TrieNode holds an
// optional word reference (pointer + length into the embedded
// dictionary) and a linked list of TrieChild for children.

#[repr(C)]
struct TrieNode {
    has_children: bool,
    children: *const TrieChild,
    has_word: bool,
    word_ptr: *const u8,
    word_len: usize,
}

#[repr(C)]
struct TrieChild {
    char: u8,
    node: *const TrieNode,
    next: *const TrieChild,
}

static mut ROOT: *mut TrieNode = core::ptr::null_mut();

// ── Result storage ─────────────────────────────────────────
// Matches the Zig `Suggestion` struct and fixed-size results
// array. Result word pointers reference sub-slices of the
// embedded DICT data so no extra allocation is needed.

#[repr(C)]
struct Suggestion {
    word_ptr: *const u8,
    word_len: usize,
    distance: usize,
}

const EMPTY_SUGGESTION: Suggestion = Suggestion {
    word_ptr: core::ptr::null(),
    word_len: 0,
    distance: 0,
};

static mut INPUT_BUFFER: [u8; 256] = [0u8; 256];
static mut RESULTS: [Suggestion; 10] = [EMPTY_SUGGESTION; 10];
static mut RESULTS_COUNT: usize = 0;

// ── Helpers ────────────────────────────────────────────────

fn to_lower(c: u8) -> u8 {
    if c >= b'A' && c <= b'Z' {
        c + (b'a' - b'A')
    } else {
        c
    }
}

// ── Trie operations ────────────────────────────────────────

unsafe fn insert(word: &[u8]) {
    let mut node: *mut TrieNode = ROOT;
    for &c in word {
        let lc = to_lower(c);
        node = get_or_add_child(node, lc);
    }
    (*node).has_word = true;
    (*node).word_ptr = word.as_ptr();
    (*node).word_len = word.len();
}

unsafe fn get_or_add_child(parent: *mut TrieNode, char: u8) -> *mut TrieNode {
    // Walk existing children list
    if (*parent).has_children {
        let mut child_ptr = (*parent).children;
        while !child_ptr.is_null() {
            if (*child_ptr).char == char {
                return (*child_ptr).node as *mut TrieNode;
            }
            child_ptr = (*child_ptr).next;
        }
    }

    // Not found — prepend a new child
    let new_node = alloc_trie_node();
    core::ptr::write(new_node, TrieNode {
        has_children: false,
        children: core::ptr::null(),
        has_word: false,
        word_ptr: core::ptr::null(),
        word_len: 0,
    });

    let new_child = alloc_trie_child();
    core::ptr::write(new_child, TrieChild {
        char,
        node: new_node,
        next: if (*parent).has_children { (*parent).children } else { core::ptr::null() },
    });

    (*parent).children = new_child;
    (*parent).has_children = true;
    new_node
}

// ── Levenshtein search ─────────────────────────────────────
// Recursive trie traversal with row-based Levenshtein distance
// computation and min-distance pruning.

unsafe fn search_recursive(
    node: *const TrieNode,
    char: u8,
    input: &[u8],
    prev_row: *const usize,
    max_dist: usize,
    limit: usize,
) {
    let cp = checkpoint();

    let columns = input.len() + 1;
    let current_row = alloc_row(columns);

    // column 0: always delete from prefix
    *current_row.add(0) = *prev_row.add(0) + 1;

    let mut min_dist: usize = *current_row.add(0);
    for i in 1..columns {
        let insert_cost = *current_row.add(i - 1) + 1;
        let delete_cost = *prev_row.add(i) + 1;
        let replace_cost = if to_lower(input[i - 1]) == char {
            *prev_row.add(i - 1)
        } else {
            *prev_row.add(i - 1) + 1
        };

        let cost = insert_cost.min(delete_cost).min(replace_cost);
        *current_row.add(i) = cost;

        if cost < min_dist {
            min_dist = cost;
        }
    }

    if *current_row.add(columns - 1) <= max_dist {
        if (*node).has_word {
            add_result(
                Suggestion {
                    word_ptr: (*node).word_ptr,
                    word_len: (*node).word_len,
                    distance: *current_row.add(columns - 1),
                },
                limit,
            );
        }
    }

    if min_dist <= max_dist {
        if (*node).has_children {
            let mut child_ptr = (*node).children;
            while !child_ptr.is_null() {
                search_recursive(
                    (*child_ptr).node,
                    (*child_ptr).char,
                    input,
                    current_row,
                    max_dist,
                    limit,
                );
                child_ptr = (*child_ptr).next;
            }
        }
    }

    restore(cp);
}

unsafe fn add_result(s: Suggestion, limit: usize) {
    // Deduplicate
    for i in 0..RESULTS_COUNT {
        let r = &RESULTS[i];
        if r.word_len == s.word_len {
            let mut equal = true;
            for j in 0..r.word_len {
                if *r.word_ptr.add(j) != *s.word_ptr.add(j) {
                    equal = false;
                    break;
                }
            }
            if equal {
                return;
            }
        }
    }

    if RESULTS_COUNT < limit {
        RESULTS[RESULTS_COUNT] = s;
        RESULTS_COUNT += 1;
    } else {
        // Find and replace the worst result
        let mut worst_idx = 0usize;
        let mut max_d = RESULTS[0].distance;
        for j in 1..RESULTS_COUNT {
            if RESULTS[j].distance > max_d {
                max_d = RESULTS[j].distance;
                worst_idx = j;
            }
        }

        if s.distance < max_d {
            RESULTS[worst_idx] = s;
        } else {
            return;
        }
    }

    // Bubble sort by distance
    for i in 0..RESULTS_COUNT {
        for j in 0..(RESULTS_COUNT - 1 - i) {
            if RESULTS[j].distance > RESULTS[j + 1].distance {
                let tmp_ptr = RESULTS[j].word_ptr;
                let tmp_len = RESULTS[j].word_len;
                let tmp_dist = RESULTS[j].distance;
                RESULTS[j].word_ptr = RESULTS[j + 1].word_ptr;
                RESULTS[j].word_len = RESULTS[j + 1].word_len;
                RESULTS[j].distance = RESULTS[j + 1].distance;
                RESULTS[j + 1].word_ptr = tmp_ptr;
                RESULTS[j + 1].word_len = tmp_len;
                RESULTS[j + 1].distance = tmp_dist;
            }
        }
    }
}

// ── Exported WASM functions ────────────────────────────────
// These six exports maintain the exact same ABI as the Zig
// original. The TypeScript bridge (src/core/autocorrect.ts)
// requires no changes.

#[no_mangle]
pub unsafe extern "C" fn init() {
    let root_ptr = alloc_trie_node();
    core::ptr::write(root_ptr, TrieNode {
        has_children: false,
        children: core::ptr::null(),
        has_word: false,
        word_ptr: core::ptr::null(),
        word_len: 0,
    });
    ROOT = root_ptr;

    for word in DICT.as_bytes().split(|&c| c == b'\r' || c == b'\n') {
        if !word.is_empty() {
            insert(word);
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn get_input_ptr() -> *mut u8 {
    INPUT_BUFFER.as_mut_ptr()
}

#[no_mangle]
pub unsafe extern "C" fn suggest(
    input_len: usize,
    max_dist: usize,
    max_results: usize,
) -> usize {
    let len = if input_len < 255 { input_len } else { 255 };
    let input = &INPUT_BUFFER[..len];
    RESULTS_COUNT = 0;
    let limit = if max_results < 10 { max_results } else { 10 };

    let columns = len + 1;
    let cp = checkpoint();
    let current_row = alloc_row(columns);
    for i in 0..columns {
        *current_row.add(i) = i;
    }

    if (*ROOT).has_children {
        let mut child_ptr = (*ROOT).children;
        while !child_ptr.is_null() {
            search_recursive(
                (*child_ptr).node,
                (*child_ptr).char,
                input,
                current_row,
                max_dist,
                limit,
            );
            child_ptr = (*child_ptr).next;
        }
    }

    // Free the initial row
    restore(cp);

    RESULTS_COUNT
}

#[no_mangle]
pub unsafe extern "C" fn get_result_ptr(index: usize) -> *const u8 {
    RESULTS[index].word_ptr
}

#[no_mangle]
pub unsafe extern "C" fn get_result_len(index: usize) -> usize {
    RESULTS[index].word_len
}

#[no_mangle]
pub unsafe extern "C" fn get_result_dist(index: usize) -> usize {
    RESULTS[index].distance
}

#[cfg(feature = "jni")]
mod jni_bridge;
