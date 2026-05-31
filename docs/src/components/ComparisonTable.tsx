const rows = [
  { feature: 'Hook Name', react: 'useAutocorrect', solid: 'useAutocorrect', compose: 'ComposeAutocorrect', swift: 'SwiftAutocorrect' },
  { feature: 'Language', react: 'TypeScript', solid: 'TypeScript', compose: 'Kotlin', swift: 'Swift' },
  { feature: 'Reactive Primitive', react: 'useState', solid: 'createSignal + createResource', compose: 'StateFlow', swift: '@Published + ObservableObject' },
  { feature: 'Input Setter', react: 'setInput (sync)', solid: 'setInput (sync)', compose: 'setInput (suspend)', swift: 'setInput(_:) async' },
  { feature: 'Bridge', react: 'WASM', solid: 'WASM', compose: 'JNI', swift: 'C FFI' },
  { feature: 'Loading', react: 'boolean', solid: 'boolean (from Resource)', compose: 'StateFlow<Boolean>', swift: '@Published Bool' },
  { feature: 'Auto-fetch', react: 'useEffect on input change', solid: 'createResource auto-track', compose: 'Manual in setInput', swift: 'Manual in setInput' },
  { feature: 'Cleanup', react: 'Active flag + cleanup fn', solid: 'Built-in (Resource)', compose: 'Coroutine cancellation', swift: 'Task cancellation' },
]

export default function ComparisonTable() {
  return (
    <div class="overflow-x-auto rounded-xl border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-surface">
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Feature</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-accent-light">React</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-accent-light">SolidJS</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-accent-light">Compose</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-accent-light">SwiftUI</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {rows.map((row) => (
            <tr class="hover:bg-neutral-900/50">
              <td class="px-4 py-2.5 font-medium text-neutral-200">{row.feature}</td>
              <td class="px-4 py-2.5 text-neutral-400 font-mono text-xs">{row.react}</td>
              <td class="px-4 py-2.5 text-neutral-400 font-mono text-xs">{row.solid}</td>
              <td class="px-4 py-2.5 text-neutral-400 font-mono text-xs">{row.compose}</td>
              <td class="px-4 py-2.5 text-neutral-400 font-mono text-xs">{row.swift}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
