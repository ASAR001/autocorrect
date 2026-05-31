import CodeBlock from '../components/CodeBlock'

export default function CoreAlgorithm() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Core Algorithm</h1>
        <p class="text-neutral-400">
          How the Trie + Levenshtein engine searches through ~6,000 tech terms at WASM speed.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Architecture Overview</h2>
        <div class="rounded-xl border border-border bg-surface p-5 overflow-x-auto">
          <pre class="!bg-transparent !p-0 text-xs leading-relaxed text-neutral-300">
{`┌─────────────────────────────────────────────────┐
│                   Host (JS)                      │
│  ┌───────────┐    ┌──────────────────────────┐   │
│  │ User Input │───▶│ domainAutocorrect.suggest()│   │
│  └───────────┘    └──────────┬───────────────┘   │
│                              │ Shared Memory      │
├──────────────────────────────┼────────────────────┤
│                   WASM (Zig) │                    │
│  ┌───────────────────────────▼────────────────┐   │
│  │  init() → Build Trie from embedded dict    │   │
│  │  suggest() → Copy input, run DP search     │   │
│  │  get_result_*() → Return matches via ptrs  │   │
│  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘`}
          </pre>
        </div>
        <p class="text-sm text-neutral-400">
          The entire dictionary is embedded into the WASM binary at compile time via
          Zig's <code>@embedFile</code>. The Trie is constructed once during <code>init()</code>.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Trie Data Structure</h2>
        <p class="text-sm text-neutral-400">
          A Trie (prefix tree) is a tree where each node represents a character.
          Children are stored as linked lists to minimize per-node overhead in Zig's
          fixed-buffer allocator.
        </p>

        <div class="rounded-xl border border-border bg-surface p-5 overflow-x-auto">
          <pre class="!bg-transparent !p-0 text-xs leading-relaxed text-neutral-300">
{`           root
          /    \\
         T      R
        / \\      \\
       R   Y      E
      /     \\      \\
     E       P      A
    /         \\      \\
   E           E      C
  (tree)      (type)   T
                       (react)`}
          </pre>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <h3 class="font-mono text-xs font-semibold text-accent-light">TrieNode</h3>
            <pre class="text-xs">{`struct TrieNode {
    children: ?*TrieChild,  // head of linked list
    word: ?[]const u8,       // set at terminal nodes
}`}</pre>
          </div>
          <div class="space-y-2">
            <h3 class="font-mono text-xs font-semibold text-accent-light">TrieChild</h3>
            <pre class="text-xs">{`struct TrieChild {
    char: u8,
    node: *TrieNode,
    next: ?*TrieChild,      // sibling chain
}`}</pre>
          </div>
        </div>

        <p class="text-sm text-neutral-400">
          Inserting a word walks the Trie character-by-character, creating nodes
          as needed. At the terminal node, a pointer to the original dictionary
          word is stored (not a copy), keeping memory usage minimal.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Levenshtein Distance</h2>
        <p class="text-sm text-neutral-400">
          The engine computes the edit distance between the user's input and every
          candidate word in the Trie. The edit operations are:
        </p>
        <ul class="list-disc pl-5 space-y-1 text-sm text-neutral-400">
          <li><strong>Insert</strong> — add a character (cost: 1)</li>
          <li><strong>Delete</strong> — remove a character (cost: 1)</li>
          <li><strong>Replace</strong> — swap a character (cost: 1, or 0 if identical)</li>
        </ul>

        <h3 class="text-lg font-semibold mt-4">Dynamic Programming Row</h3>
        <p class="text-sm text-neutral-400">
          Instead of allocating a full N×M matrix for each search, the algorithm
          maintains a single Levenshtein <em>row</em> for the current Trie node.
          At each step, it computes:
        </p>

        <pre class="text-xs">{`current_row[i] = min(
    insert_cost  = current_row[i - 1] + 1,
    delete_cost  = prev_row[i] + 1,
    replace_cost = prev_row[i - 1] + (char match ? 0 : 1)
)`}</pre>

        <p class="text-sm text-neutral-400">
          For input <code>"reakt"</code> and candidate <code>"React"</code> (lowercased), the
          final cell computes distance 2 (replace <code>k→c</code>, insert nothing).
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Early Pruning</h2>
        <p class="text-sm text-neutral-400">
          The key optimization: if <strong>no value</strong> in the current row is{' '}
          ≤ maxDist, the entire subtree is pruned. This dramatically reduces
          the search space — most branches terminate after 1-2 characters.
        </p>

        <pre class="text-xs">{`// After computing the current row:
var min_dist_in_row = current_row[0]
for (each column) {
    if (cost < min_dist_in_row) min_dist_in_row = cost
}

// Prune if no hope of matching:
if (min_dist_in_row <= max_dist) {
    // Continue recursing into children
} else {
    // Skip this entire subtree
}`}</pre>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Memory Layout</h2>
        <div class="rounded-xl border border-border bg-surface p-5 overflow-x-auto">
          <pre class="!bg-transparent !p-0 text-xs leading-relaxed text-neutral-300">
{`WASM Linear Memory (4MB fixed buffer)
┌────────────────────────────────────────────┐
│ 0x0000                                      │
│   Trie nodes & child linked-lists          │
│   (created during init)                     │
├────────────────────────────────────────────┤
│                                              │
│   Search scratch space                      │
│   - Levenshtein rows (alloc+free per node)  │
│   - results[10] Suggestion array            │
│   - input_buffer[256]                       │
│                                              │
├────────────────────────────────────────────┤
│ 0x400000  (4MB boundary)                    │
└────────────────────────────────────────────┘`}
          </pre>
        </div>
        <p class="text-sm text-neutral-400">
          The fixed 4MB buffer means no dynamic heap growth. The entire Trie (~6,000
          terms) fits comfortably, with the rest used for search scratch space.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Exported WASM Functions</h2>
        <div class="overflow-x-auto rounded-xl border border-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Function</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Signature</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Purpose</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">init</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">() → void</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Build the Trie from embedded dictionary</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">get_input_ptr</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">() → *u8</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Return pointer to the 256-byte input buffer</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">suggest</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(len, maxDist, maxResults) → usize</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Run the search; returns result count</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">get_result_ptr</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(index) → *u8</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Get word pointer for result <em>index</em></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">get_result_len</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(index) → usize</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Get byte length of result <em>index</em></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">get_result_dist</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(index) → usize</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Get Levenshtein distance of result <em>index</em></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
