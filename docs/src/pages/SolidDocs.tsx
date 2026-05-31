import CodeBlock from '../components/CodeBlock'
import { solidExample, solidCustomExample } from '../data/examples'

export default function SolidDocs() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">SolidJS</span>
          <span class="text-xs text-text-muted">createSignal + createResource</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">useAutocorrect (Solid)</h1>
        <p class="text-neutral-400">
          SolidJS hook using fine-grained reactivity with <code>createSignal</code> and
          automatic fetch tracking via <code>createResource</code>.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Import</h2>
        <CodeBlock code={`import { useAutocorrect } from 'domain-autocorrect/solid'`} lang="typescript" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Signature</h2>
        <pre class="text-sm">{`function useAutocorrect(
  defaultMaxDist?: number,     // default: 3
  defaultMaxResults?: number,  // default: 3
): {
  input: Accessor<string>
  setInput: Setter<string>
  suggestions: Resource<Suggestion[]>
  loading: boolean
}`}</pre>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Return Value</h2>
        <div class="overflow-x-auto rounded-xl border border-border">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Property</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">input</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">Accessor&lt;string&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Solid signal getter (call as <code>input()</code>)</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">setInput</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">Setter&lt;string&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Solid signal setter</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">suggestions</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">Resource&lt;Suggestion[]&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Reactive resource; call <code>suggestions()</code> to read</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">loading</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">boolean</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">True while WASM search is in-flight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Usage</h2>
        <CodeBlock code={solidExample} lang="tsx" />
        <CodeBlock code={solidCustomExample} lang="typescript" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">How It Works</h2>
        <p class="text-sm text-neutral-400">
          <code>createResource</code> automatically tracks the <code>input</code> signal
          as its source. Whenever <code>input</code> changes, the fetcher re-runs.
          This is the most concise implementation — no manual effect or cleanup needed.
        </p>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Inputs shorter than 2 characters return an empty array immediately.</li>
          <li>The <code>createResource</code> handles race conditions internally —
            only the latest fetch result is surfaced.</li>
          <li><code>suggestions.loading</code> is a boolean derived from the resource state.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Caveats</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Requires SolidJS 1.x.</li>
          <li>No built-in debouncing. For high-frequency keystrokes,
            wrap in <code>createMemo</code> with a delay or use a custom throttled source.</li>
          <li>The resource refetches on <em>any</em><code>input</code> change —
            even if the value is semantically the same.</li>
        </ul>
      </section>
    </div>
  )
}
