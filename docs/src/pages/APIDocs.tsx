import CodeBlock from '../components/CodeBlock'
import { apiExample, wasmBridge } from '../data/examples'

export default function APIDocs() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">API Reference</h1>
        <p class="text-neutral-400">
          The low-level WASM bridge and its TypeScript wrapper.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">domainAutocorrect.suggest()</h2>
        <p class="text-sm text-neutral-400">
          The primary public API for the autocorrect engine. Available as a named export
          under <code>domain-autocorrect</code>.
        </p>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted w-1/4">Signature</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr>
                <td class="px-4 py-3 font-mono text-xs text-neutral-200">
                  suggest(input, maxDist?, maxResults?)
                </td>
                <td class="px-4 py-3 text-neutral-400">
                  Returns a <code>Promise&lt;Suggestion[]&gt;</code> of tech terms sorted by edit distance.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Parameters</h2>
        <div class="overflow-x-auto rounded-xl border border-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Name</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Default</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-200">input</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">string</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">— (required)</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">The misspelled term to correct. Max 255 bytes.</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-200">maxDist</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">number</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">3</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Maximum Levenshtein edit distance. Higher = more results but slower.</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-200">maxResults</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">number</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">3</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Maximum results to return. Capped at 10 internally.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Suggestion Type</h2>
        <pre class="text-sm">{`export type Suggestion = {
  word: string      // The matching tech term
  distance: number  // Levenshtein distance from input
}`}</pre>
        <ul class="list-disc pl-5 space-y-1 text-sm text-neutral-400">
          <li>Results are sorted by <code>distance</code> (ascending).</li>
          <li><code>distance = 0</code> means an exact match.</li>
          <li>Duplicate words are automatically deduplicated.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Example Usage</h2>
        <CodeBlock code={apiExample} lang="typescript" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">WASM Bridge Internals</h2>
        <p class="text-sm text-neutral-400">
          The <code>domainAutocorrect</code> singleton lazily initializes the WASM module on first call.
          It copies input into shared memory via pointer arithmetic, calls the exported
          <code>suggest</code> function, and decodes results from the module's linear memory.
        </p>
        <CodeBlock code={wasmBridge} lang="typescript" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Limitations</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Input is capped at <strong>255 bytes</strong> (UTF-8). Longer inputs are truncated.</li>
          <li>Results are capped at <strong>10 items</strong> (hard limit in the Zig buffer).</li>
          <li>The WASM heap is a <strong>fixed 4MB</strong> pre-allocated buffer.</li>
          <li>The dictionary is <strong>compiled into the binary</strong> — it cannot be changed at runtime.</li>
          <li>The engine is <strong>case-insensitive</strong> (everything lowercased).</li>
        </ul>
      </section>
    </div>
  )
}
