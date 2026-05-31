import CodeBlock from '../components/CodeBlock'
import { reactExample, reactCustomExample } from '../data/examples'

export default function ReactDocs() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">React</span>
          <span class="text-xs text-text-muted">useEffect + useState</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">useAutocorrect (React)</h1>
        <p class="text-neutral-400">
          React hook that wraps the WASM engine with idiomatic <code>useState</code> and
          <code>useEffect</code>.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Import</h2>
        <CodeBlock code={`import { useAutocorrect } from 'domain-autocorrect/react'`} lang="typescript" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Signature</h2>
        <pre class="text-sm">{`function useAutocorrect(
  defaultMaxDist?: number,     // default: 3
  defaultMaxResults?: number,  // default: 3
): {
  input: string
  setInput: (val: string) => void
  suggestions: Suggestion[]
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
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">string</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Current input value (controlled)</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">setInput</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(val: string) =&gt; void</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Direct <code>useState</code> setter</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">suggestions</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">Suggestion[]</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Results sorted by edit distance</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">loading</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">boolean</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">True while WASM is searching</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Usage</h2>
        <CodeBlock code={reactExample} lang="tsx" />
        <CodeBlock code={reactCustomExample} lang="typescript" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">How It Works</h2>
        <p class="text-sm text-neutral-400">
          The hook wraps the async WASM call in a <code>useEffect</code> that fires
          whenever <code>input</code>, <code>defaultMaxDist</code>, or{' '}
          <code>defaultMaxResults</code> change. An <strong>active flag</strong> pattern
          prevents stale updates when the component unmounts or input changes
          mid-request.
        </p>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Inputs shorter than 2 characters short-circuit to an empty array.</li>
          <li>The <code>active</code> flag is set to <code>false</code> in the cleanup
            function, preventing state updates after unmount.</li>
          <li>Every call re-initializes the loading state.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Caveats</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Requires React 16+.</li>
          <li>The hook is not a <strong>debounced</strong> search — every keystroke triggers a WASM call.
            Add your own debounce if needed for high-frequency typing.</li>
          <li>WASM initialization happens lazily on the first <code>suggest()</code> call
            (first-time fetch of the .wasm binary).</li>
        </ul>
      </section>
    </div>
  )
}
