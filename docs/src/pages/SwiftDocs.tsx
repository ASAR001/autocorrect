import CodeBlock from '../components/CodeBlock'
import { swiftExample, swiftCustomExample } from '../data/examples'

export default function SwiftDocs() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">SwiftUI</span>
          <span class="text-xs text-text-muted">ObservableObject · @Published · C FFI</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">SwiftAutocorrect</h1>
        <p class="text-neutral-400">
          Swift <code>ObservableObject</code> class for SwiftUI that wraps the
          Rust autocorrect engine via C FFI. Exposes <code>@Published</code>{' '}
          properties for SwiftUI data flow.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Import</h2>
        <CodeBlock code={`import SwiftUI`} lang="swift" />
        <p class="text-sm text-text-muted">
          Add <code>SwiftAutocorrect.swift</code> to your Xcode target and include{' '}
          <code>autocorrect.h</code> in the bridging header.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Signature</h2>
        <pre class="text-sm">{`@MainActor
final class SwiftAutocorrect: ObservableObject {
  @Published var input: String
  @Published var suggestions: [Suggestion]
  @Published var loading: Bool

  init(maxDist: Int = 3, maxResults: Int = 3)
  func setInput(_ value: String)
}

struct Suggestion: Identifiable {
  let word: String
  let distance: Int
}`}</pre>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Properties</h2>
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
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">@Published String</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Current input; bind via <code>Binding(get:set:)</code></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">setInput()</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(String) -&gt; Void</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Sets input and starts async native search</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">suggestions</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">@Published [Suggestion]</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Ranked results; renders in <code>ForEach</code></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">loading</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">@Published Bool</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">True while native search is in-flight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Usage</h2>
        <CodeBlock code={swiftExample} lang="swift" />
        <CodeBlock code={swiftCustomExample} lang="swift" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Building the Native Library</h2>
        <p class="text-sm text-neutral-400">
          Compile the Rust core for iOS targets, then either use the SPM package
          or create an XCFramework for distribution.
        </p>
        <CodeBlock code={`# Quick build (requires iOS targets installed)
just build-ios

# Or manually:
cargo build --target aarch64-apple-ios --release
cargo build --target aarch64-apple-ios-sim --release

# Create XCFramework from the built .a files
xcodebuild -create-xcframework \\
  -library swift/Binaries/libautocorrect.a \\
  -headers swift/Sources/CAutocorrect/include/ \\
  -library target/aarch64-apple-ios-sim/release/libautocorrect.a \\
  -headers swift/Sources/CAutocorrect/include/ \\
  -output Autocorrect.xcframework`} lang="bash" />
        <p class="text-sm text-neutral-400 mt-2">
          Or open the <code>swift/</code> directory as an SPM package in
          Xcode (File &rarr; Add Package Dependencies &rarr; Add Local...).
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">C Header</h2>
        <p class="text-sm text-neutral-400">
          The bridging header declares the C ABI functions exported by the Rust
          library. These are the same <code>extern "C"</code> exports used by WASM.
        </p>
        <CodeBlock code={`// swift/Sources/CAutocorrect/include/autocorrect.h
void init(void);
static inline void ac_init(void) { init(); }
char* get_input_ptr(void);
size_t suggest(size_t input_len, size_t max_dist, size_t max_results);
const char* get_result_ptr(size_t index);
size_t get_result_len(size_t index);
size_t get_result_dist(size_t index);`} lang="c" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Caveats</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Requires <code>libautocorrect.a</code> linked in the Xcode target.</li>
          <li>Must include <code>autocorrect.h</code> in the project bridging header.</li>
          <li>Marked <code>@MainActor</code> &mdash; all mutations happen on the main thread.</li>
          <li>Inline the <code>init()</code> C call in <code>didFinishLaunchingWithOptions</code> for eager init.</li>
          <li>The search runs on a <code>Task</code> and is cancelled on subsequent <code>setInput</code> calls.</li>
        </ul>
      </section>
    </div>
  )
}
