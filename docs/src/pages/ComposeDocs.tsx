import CodeBlock from '../components/CodeBlock'
import { composeExample, composeCustomExample } from '../data/examples'

export default function ComposeDocs() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">Jetpack Compose</span>
          <span class="text-xs text-text-muted">Kotlin · StateFlow · JNI</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">ComposeAutocorrect</h1>
        <p class="text-neutral-400">
          Kotlin class for Jetpack Compose that wraps the Rust autocorrect
          engine via JNI. Exposes <code>StateFlow</code> properties for
          reactive Compose integration.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Import</h2>
        <CodeBlock code={`import com.techautocorrect.ComposeAutocorrect`} lang="kotlin" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Signature</h2>
        <pre class="text-sm">{`class ComposeAutocorrect(
  maxDist: Int = 3,
  maxResults: Int = 3,
) {
  val input: StateFlow<String>
  val suggestions: StateFlow<List<Suggestion>>
  val loading: StateFlow<Boolean>
  suspend fun setInput(value: String)
}

data class Suggestion(
  val word: String,
  val distance: Int,
)`}</pre>
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
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">StateFlow&lt;String&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Current input; collect with <code>.collectAsState()</code></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">setInput()</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">suspend (String) -&gt; Unit</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Updates input and triggers native search via JNI</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">suggestions</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">StateFlow&lt;List&lt;Suggestion&gt;&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Reactive list of ranked results</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">loading</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">StateFlow&lt;Boolean&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">True while native search is in-flight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Usage</h2>
        <CodeBlock code={composeExample} lang="kotlin" />
        <CodeBlock code={composeCustomExample} lang="kotlin" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Building the Native Library</h2>
        <p class="text-sm text-neutral-400">
          The Rust core must be compiled for Android targets with the <code>jni</code>{' '}
          feature, then placed in the Gradle project's <code>jniLibs/</code> directory.
        </p>
        <CodeBlock code={`# Quick build (requires Android NDK targets installed)
just build-android

# Or manually:
cargo build --target aarch64-linux-android --release --features jni
cargo build --target armv7-linux-androideabi --release --features jni
cargo build --target x86_64-linux-android --release --features jni`} lang="bash" />
        <p class="text-sm text-neutral-400 mt-2">
          The <code>just build-android</code> command copies <code>.so</code> files into{' '}
           <code>android/library/src/main/jniLibs/</code>. Open the{' '}
           <code>android/</code> directory in Android Studio to build the
          Kotlin library alongside your app.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">JNI Bridge</h2>
        <p class="text-sm text-neutral-400">
          The Rust library must export JNI-compatible functions (prefixed with the
          fully-qualified class name). The Kotlin class wraps these via{' '}
          <code>@JvmStatic external</code> declarations in the companion object.
        </p>
        <CodeBlock code={`// Rust JNI exports expected by ComposeAutocorrect.kt
#[no_mangle]
pub extern "C" fn Java_com_techautocorrect_ComposeAutocorrect_nativeInit(
  _env: JNIEnv, _class: JClass,
) { ... }

#[no_mangle]
pub extern "C" fn Java_com_techautocorrect_ComposeAutocorrect_nativeSuggest(
  _env: JNIEnv, _class: JClass,
  input: JString, max_dist: jint, max_results: jint,
) -> jint { ... }`} lang="rust" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Caveats</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>Requires the <code>libautocorrect.so</code> in <code>jniLibs/</code>.</li>
          <li><code>setInput</code> is a <code>suspend</code> function &mdash; call from a coroutine scope.</li>
          <li>Use <code>collectAsStateWithLifecycle()</code> for lifecycle-aware collection in Compose.</li>
          <li>The class lazily initializes the native engine on the first call to <code>setInput</code>.</li>
        </ul>
      </section>
    </div>
  )
}
