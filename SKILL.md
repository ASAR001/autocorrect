# SKILL: domain-autocorrect (npm package)

## Overview
`domain-autocorrect` is an npm package providing a Trie + Levenshtein distance autocorrect engine powered by a **Rust** core compiled to **WebAssembly**. It ships three entry points:

| Import path | What it provides |
|---|---|
| `domain-autocorrect` | Core WASM bridge (`domainAutocorrect.suggest()`) |
| `domain-autocorrect/react` | Core + React `useAutocorrect` hook |
| `domain-autocorrect/solid` | Core + SolidJS `useAutocorrect` hook |

## Architecture

```
Rust core (#![no_std]) → WASM (wasm32-unknown-unknown)
                              ↓
                    src/core/autocorrect.ts   ← WASM bridge (lazy init, shared memory, pointer ops)
                              ↓
              ┌───────────────┼───────────────┐
         index.ts        index-react.ts    index-solid.ts
         (core only)     (core + React)    (core + Solid)
```

- **Rust engine** (`src/core/autocorrect.rs`): 4MB bump allocator, Trie built from embedded `tech.txt`, recursive search with single-row Levenshtein DP + min-distance pruning. Exports 6 C ABI functions (`init`, `get_input_ptr`, `suggest`, `get_result_ptr`, `get_result_len`, `get_result_dist`).
- **WASM bridge** (`src/core/autocorrect.ts`): Singleton `domainAutocorrect` that lazily fetches + instantiates WASM, writes input into shared memory, calls `suggest()`, reads results back via pointers.
- **React hook** (`src/client/reactHooks.ts`): `useState` + `useEffect` with an active flag pattern to avoid stale closures.
- **SolidJS hook** (`src/client/solidHooks.ts`): `createSignal` + `createResource` for auto-tracked reactive results.
- **Dictionary** (`src/assets/tech.txt`): ~5,951 tech terms, newline-delimited. Copied to `src/core/tech.txt` at build time for `include_str!`.

## Building

### Prerequisites
- [Bun](https://bun.sh/) (package manager + runtime)
- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### Commands
```bash
just build         # Build all 3 TS outputs (hooks_build/ + react_hook/ + solid_hook/)
just build-wasm    # Build Rust → WASM (core_build/autocorrect.wasm)
just build-all     # Build TS + WASM
just dev           # Vite dev server on localhost:5173

# Custom dictionary
DICT_PATH=my_terms.txt just build-wasm
```

### Build outputs
| Directory | Contents |
|---|---|
| `hooks_build/` | Core WASM bridge (`index.mjs`, `index.js`, `index.d.ts`) |
| `react_hook/` | Core + React hook (`index-react.mjs`, `index-react.js`, `index-react.d.ts`) |
| `solid_hook/` | Core + Solid hook (`index-solid.mjs`, `index-solid.js`, `index-solid.d.ts`) |
| `core_build/` | `autocorrect.wasm` |

### WASM file deployment
The WASM file must be served from `/autocorrect.wasm` (root of the web server). During development, configure your bundler to copy or serve it:
```ts
// vite.config.ts
export default defineConfig({
  publicDir: '../core_build', // serves autocorrect.wasm at /
})
```

## Key APIs

### Core: `domainAutocorrect.suggest()`
```ts
import { domainAutocorrect } from 'domain-autocorrect'

const results: Suggestion[] = await domainAutocorrect.suggest(
  'reakt',  // input string (clamped to 255 bytes)
  2,        // maxDist: Levenshtein distance threshold (default 3)
  5         // maxResults: max suggestions to return (clamped to 10, default 3)
)
// [{ word: 'React', distance: 2 }, ...]
```

### React: `useAutocorrect()`
```tsx
import { useAutocorrect } from 'domain-autocorrect/react'

// Basic
const { input, setInput, suggestions, loading } = useAutocorrect()

// Custom params
const hook = useAutocorrect(2, 5) // maxDist=2, maxResults=5
```

### SolidJS: `useAutocorrect()`
```tsx
import { useAutocorrect } from 'domain-autocorrect/solid'

const { input, setInput, suggestions, loading } = useAutocorrect()
// suggestions is a Resource<Suggestion[]> (auto-tracked)
```

## Development workflows

### Adding a new tech term
1. Edit `src/assets/tech.txt` — add one term per line
2. Run `just build-wasm` (or `just build-all`) to recompile with the new dictionary

### Modifying the Rust core
1. Edit `src/core/autocorrect.rs`
2. Run `just build-wasm` to recompile WASM
3. Test via `just dev` (starts local dev server)

### Modifying a hook
1. Edit `src/client/reactHooks.ts` or `src/client/solidHooks.ts`
2. Run `just build` to rebuild TS outputs
3. Import the local build in a test project

### Changing WASM memory size
Edit `BUFFER_SIZE` in `src/core/autocorrect.rs:20`. Default is 4MB.

## Critical constraints
- **WASM Memory:** Rust uses a fixed 4MB buffer. Keep input/results within limits.
- **Input clamping:** 255 bytes max. `suggest()` silently truncates longer inputs.
- **Results clamping:** 10 results max. `suggest()` returns at most `max_results` (capped at 10).
- **TypeScript:** Use `import type { Suggestion }` in consumer code to avoid `MISSING_EXPORT` production errors (Rollup quirk).
- **WASM path:** The bridge fetches `/autocorrect.wasm` — must be available at that path.
- **Dependencies:** `package.json` self-references via `"domain_autocorrect": "."`.
