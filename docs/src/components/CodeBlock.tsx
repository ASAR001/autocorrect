import { createSignal } from "solid-js";

export default function CodeBlock(props: { code: string; lang?: string }) {
  const [copied, setCopied] = createSignal(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(props.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="relative group">
      <div class="flex items-center justify-between rounded-t-lg bg-surface-raised/60 px-4 py-2 border-b border-border/50">
        <span class="text-xs text-text-muted">{props.lang ?? 'tsx'}</span>
        <button
          class="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-light transition-colors cursor-pointer"
          onClick={handleCopy}
        >
          {copied() ? (
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          {copied() ? "Copied" : "Copy"}
        </button>
      </div>
      <pre class="!mt-0 !rounded-t-none border-x border-b border-border/50">{props.code}</pre>
    </div>
  )
}
