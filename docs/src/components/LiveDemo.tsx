import { createSignal, createResource, Show, For } from 'solid-js'
import { domainAutocorrect } from 'domain-autocorrect'

export default function LiveDemo() {
  const [input, setInput] = createSignal('')
  const [maxDist, setMaxDist] = createSignal(3)
  const [maxResults, setMaxResults] = createSignal(3)

  const [suggestions] = createResource(
    () => ({ input: input(), maxDist: maxDist(), maxResults: maxResults() }),
    async ({ input, maxDist, maxResults }) => {
      if (input.length < 2) return []
      return domainAutocorrect.suggest(input, maxDist, maxResults)
    },
  )

  return (
    <div class="rounded-xl border border-border bg-surface p-6 space-y-5">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-text-muted">Try it out</label>
        <input
          type="text"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder="e.g. 'typscript', 'reakt', 'vuee'..."
          class="w-full rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
        />
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-text-muted">Max Distance:</label>
          <select
            value={maxDist()}
            onChange={(e) => setMaxDist(Number(e.currentTarget.value))}
            class="rounded-md border border-border bg-surface-raised px-2 py-1 text-xs outline-none focus:border-accent"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-text-muted">Max Results:</label>
          <select
            value={maxResults()}
            onChange={(e) => setMaxResults(Number(e.currentTarget.value))}
            class="rounded-md border border-border bg-surface-raised px-2 py-1 text-xs outline-none focus:border-accent"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        </div>
      </div>

      <Show when={suggestions.loading}>
        <div class="flex items-center gap-2 text-sm text-text-muted">
          <div class="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Searching...
        </div>
      </Show>

      <Show when={!suggestions.loading && suggestions()!.length > 0}>
        <div class="space-y-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Suggestions</h4>
          <ul class="space-y-1.5">
            <For each={suggestions()}>
              {(s) => (
                <li class="flex items-center justify-between rounded-md bg-surface-raised px-3 py-2 text-sm border border-border/50">
                  <span class="font-medium">{s.word}</span>
                  <span class="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-light">
                    dist {s.distance}
                  </span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <Show when={!suggestions.loading && input().length >= 2 && suggestions()!.length === 0}>
        <p class="text-sm text-text-muted">No suggestions found for "{input()}".</p>
      </Show>

      <Show when={input().length === 1}>
        <p class="text-xs text-text-muted">Type at least 2 characters to search.</p>
      </Show>
    </div>
  )
}
