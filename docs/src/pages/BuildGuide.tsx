import CodeBlock from '../components/CodeBlock'
import { buildScripts } from '../data/examples'

export default function BuildGuide() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Build Guide</h1>
        <p class="text-neutral-400">
          Compiling the WASM core and building the TypeScript library.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Prerequisites</h2>
        <div class="rounded-xl border border-border bg-surface p-5 space-y-3">
          <div class="flex items-center gap-3">
            <span class="rounded-md bg-accent/20 px-2 py-0.5 font-mono text-xs text-accent-light">Bun</span>
            <span class="text-sm text-neutral-300">JavaScript runtime &amp; package manager</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="rounded-md bg-accent/20 px-2 py-0.5 font-mono text-xs text-accent-light">Zig</span>
            <span class="text-sm text-neutral-300">Compiler for the WASM core (Zig 0.11+)</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="rounded-md bg-accent/20 px-2 py-0.5 font-mono text-xs text-accent-light">just</span>
            <span class="text-sm text-neutral-300">Command runner (optional, but recommended)</span>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Installation</h2>
        <CodeBlock code="git clone <repo> && cd domain_autocorrect && bun install" lang="bash" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Build Commands</h2>
        <CodeBlock code={buildScripts} lang="bash" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Build Pipeline</h2>
        <div class="rounded-xl border border-border bg-surface p-5 overflow-x-auto">
          <pre class="!bg-transparent !p-0 text-xs leading-relaxed text-neutral-300">
{`src/assets/tech.txt          (source dictionary)
    │
    ▼  cp + embed
src/core/tech.txt ──────────  (copied at build time)
    │  @embedFile
    ▼
zig build-exe                             
    │  → core_build/autocorrect.wasm      (WASM binary, ~50KB)
    │
    ▼
src/core/autocorrect.ts      (WASM bridge)
src/client/*.ts              (framework hooks)
    │
    ▼  vite build (library mode)
hooks_build/
    ├── index.js              (CJS bundle)
    ├── index.mjs             (ESM bundle)
    └── index.d.ts            (Type declarations)`}
          </pre>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Custom Dictionary</h2>
        <p class="text-sm text-neutral-400">
          Override the default dictionary with a custom one via the{' '}
          <code>DICT_PATH</code> environment variable. The file must be a plain text,
          newline-delimited list of terms.
        </p>
        <CodeBlock code={`DICT_PATH=src/assets/my_terms.txt just build-wasm`} lang="bash" />
        <p class="text-sm text-neutral-400">
          The Zig compiler embeds the dictionary contents into the WASM binary at
          compile time via <code>@embedFile</code>. There is no runtime dictionary loading.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Zig Compile Flags</h2>
        <p class="text-sm text-neutral-400">
          The WASM compilation uses these flags directly from <code>package.json</code>:
        </p>
        <pre class="text-xs">{`zig build-exe src/core/autocorrect.zig \\
  -target wasm32-freestanding \\
  -fno-entry \\
  --export=init \\
  --export=get_input_ptr \\
  --export=suggest \\
  --export=get_result_ptr \\
  --export=get_result_len \\
  --export=get_result_dist \\
  -femit-bin=core_build/autocorrect.wasm`}</pre>
        <p class="text-sm text-neutral-400">
          Six functions are explicitly exported. The rest of the Zig code
          (Trie traversal, Levenshtein DP, result sorting) is internal and
          not accessible from JavaScript.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Output Structure</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-border bg-surface p-4 space-y-2">
            <h3 class="font-mono text-xs font-semibold text-accent-light">core_build/</h3>
            <p class="text-xs text-neutral-400">
              Contains <code>autocorrect.wasm</code> — the compiled Zig binary.
              This is the only WASM output and must be served at the application root.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-4 space-y-2">
            <h3 class="font-mono text-xs font-semibold text-accent-light">hooks_build/</h3>
            <p class="text-xs text-neutral-400">
              Contains the TypeScript bundles: <code>index.js</code> (CJS),{' '}
              <code>index.mjs</code> (ESM), and <code>index.d.ts</code> (types).
              Framework packages are externalized and not bundled.
            </p>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Development</h2>
        <p class="text-sm text-neutral-400">
          Run <code>just dev</code> to start the Vite dev server. The library entry
          is <code>index.ts</code> which re-exports all hooks and the WASM bridge.
          The library-mode Vite config uses <code>vite-plugin-dts</code> to generate
          type declarations on build.
        </p>
        <p class="text-sm text-neutral-400">
          Run <code>just dev-docs</code> to start the documentation SPA dev server at{' '}
          <code>localhost:5174</code>.
        </p>
      </section>
    </div>
  )
}
