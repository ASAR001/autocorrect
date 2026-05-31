import { Link } from '@tanstack/solid-router'
import LiveDemo from '../components/LiveDemo'
import CodeBlock from '../components/CodeBlock'

export default function Home() {
  return (
    <div class="space-y-12">
      <section class="space-y-4">
        <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
          Domain <span class="text-accent-light">Autocorrect</span>
        </h1>
        <p class="max-w-2xl text-lg text-neutral-400 leading-relaxed">
          High-performance tech term autocorrect powered by a hand-written
          Trie + Levenshtein engine compiled to WebAssembly. Ships with
          framework hooks for React, SolidJS, Jetpack Compose, and SwiftUI.
        </p>
        <div class="flex flex-wrap gap-3">
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">WASM</span>
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">Rust</span>
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">TypeScript</span>
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">React</span>
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">SolidJS</span>
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">Compose</span>
          <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">SwiftUI</span>
        </div>
      </section>

      <section>
        <LiveDemo />
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-bold">Quick Start</h2>
        <CodeBlock code={`npm install domain-autocorrect`} lang="bash" />
        <p class="text-sm text-text-muted">
          Requires Rust for building the WASM core. See the{' '}
          <Link href="/build" class="text-accent-light hover:underline">Build Guide</Link> for setup.
        </p>
      </section>

      <section class="space-y-6">
        <h2 class="text-2xl font-bold">How It Works</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-border bg-surface p-5 space-y-2">
            <div class="text-xl">🌳</div>
            <h3 class="font-semibold">Trie Indexing</h3>
            <p class="text-sm text-text-muted">
              All ~6,000 tech terms are pre-loaded into a Trie at WASM initialization.
              Each character is a linked-list child node for compact memory usage.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-5 space-y-2">
            <div class="text-xl">📏</div>
            <h3 class="font-semibold">Levenshtein Search</h3>
            <p class="text-sm text-text-muted">
              A recursive DP search walks the Trie with a Levenshtein row,
              pruning branches where the minimum distance exceeds the threshold.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-5 space-y-2">
            <div class="text-xl">⚡</div>
            <h3 class="font-semibold">WASM Execution</h3>
            <p class="text-sm text-text-muted">
              The entire engine compiles to a ~50KB WebAssembly binary.
              A fixed 4MB buffer handles all memory, and results travel over
              a shared <code>ArrayBuffer</code>.
            </p>
          </div>
          <div class="rounded-xl border border-border bg-surface p-5 space-y-2">
            <div class="text-xl">🔌</div>
            <h3 class="font-semibold">Framework Hooks</h3>
            <p class="text-sm text-text-muted">
              Each framework gets an idiomatic wrapper: Solid uses{' '}
              <code>createResource</code>, React uses <code>useEffect</code>,
              Compose uses <code>StateFlow</code> + JNI, and SwiftUI uses{' '}
              <code>@Published</code> + C FFI.
            </p>
          </div>
        </div>
      </section>

      <section class="flex flex-wrap gap-4">
        <Link
          href="/api"
          class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-light transition-colors"
        >
          Explore the API →
        </Link>
        <Link
          href="/core-algorithm"
          class="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-neutral-200 hover:border-accent hover:text-accent-light transition-colors"
        >
          Deep Dive: Core Algorithm →
        </Link>
      </section>
    </div>
  )
}
