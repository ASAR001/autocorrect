import CodeBlock from '../components/CodeBlock'
import { flutterExample, flutterCustomExample } from '../data/examples'

export default function FlutterDocs() {
  return (
    <div class="space-y-10">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">Flutter</span>
          <span class="text-xs text-text-muted">Dart · ChangeNotifier · dart:ffi</span>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">FlutterAutocorrect</h1>
        <p class="text-neutral-400">
          Dart <code>ChangeNotifier</code> class for Flutter that wraps the Rust
          autocorrect engine via <code>dart:ffi</code>. Zero platform channels —
          pure Dart FFI calls to the C ABI exported by the Rust core.
        </p>
      </div>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Import</h2>
        <CodeBlock code={`import 'package:domain_autocorrect_flutter/domain_autocorrect.dart'`} lang="dart" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Signature</h2>
        <pre class="text-sm">{`class FlutterAutocorrect extends ChangeNotifier {
  final int maxDist;
  final int maxResults;

  String get input;
  List<Suggestion> get suggestions;
  bool get loading;

  FlutterAutocorrect({int maxDist = 3, int maxResults = 3})
  void setInput(String value)
}

class Suggestion {
  final String word;
  final int distance;
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
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">String</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Current input; read in <code>ListenableBuilder</code></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">setInput()</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">(String) -&gt; void</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Updates input and triggers native search via dart:ffi</td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">suggestions</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">List&lt;Suggestion&gt;</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">Ranked results; render with <code>.map()</code></td>
              </tr>
              <tr class="hover:bg-neutral-900/50">
                <td class="px-4 py-2.5 font-mono text-xs text-accent-light">loading</td>
                <td class="px-4 py-2.5 font-mono text-xs text-neutral-400">bool</td>
                <td class="px-4 py-2.5 text-xs text-neutral-400">True while native search is in-flight</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Usage</h2>
        <CodeBlock code={flutterExample} lang="dart" />
        <CodeBlock code={flutterCustomExample} lang="dart" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Building the Native Library</h2>
        <p class="text-sm text-neutral-400">
          Compile the Rust core for Flutter targets (Android + iOS) without the
          JNI feature — Flutter uses <code>dart:ffi</code> to call the C ABI directly.
        </p>
        <CodeBlock code={`# Quick build (requires Android NDK + iOS targets installed)
just build-flutter

# Or manually:
cargo build --release --target aarch64-linux-android
cargo build --release --target armv7-linux-androideabi
cargo build --release --target x86_64-linux-android
cargo build --release --target i686-linux-android
cargo build --release --target aarch64-apple-ios
cargo build --release --target aarch64-apple-ios-sim

# Copy Android .so files
cp target/aarch64-linux-android/release/libautocorrect.so \\
   flutter/android/src/main/jniLibs/arm64-v8a/
cp target/armv7-linux-androideabi/release/libautocorrect.so \\
   flutter/android/src/main/jniLibs/armeabi-v7a/
cp target/x86_64-linux-android/release/libautocorrect.so \\
   flutter/android/src/main/jniLibs/x86_64/
cp target/i686-linux-android/release/libautocorrect.so \\
   flutter/android/src/main/jniLibs/x86/

# Copy iOS .a files
cp target/aarch64-apple-ios/release/libautocorrect.a flutter/ios/
cp target/aarch64-apple-ios-sim/release/libautocorrect.a flutter/ios/`} lang="bash" />
        <p class="text-sm text-neutral-400 mt-2">
          The <code>just build-flutter</code> command copies <code>.so</code> files into{' '}
          <code>flutter/android/src/main/jniLibs/</code> and <code>.a</code> files into{' '}
          <code>flutter/ios/</code>.
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Dart FFI Bridge</h2>
        <p class="text-sm text-neutral-400">
          The Dart code maps the 6 C ABI functions exported by the Rust core using{' '}
          <code>dart:ffi</code>. On Android the library is loaded via{' '}
          <code>DynamicLibrary.open()</code>; on iOS it is statically linked and
          symbols are resolved via <code>DynamicLibrary.process()</code>.
        </p>
        <CodeBlock code={`// flutter/lib/src/flutter_bridge.dart
typedef InitNative = Void Function();
typedef InitDart = void Function();

typedef GetInputPtrNative = Pointer<Uint8> Function();
typedef GetInputPtrDart = Pointer<Uint8> Function();

typedef SuggestNative = IntPtr Function(IntPtr, IntPtr, IntPtr);
typedef SuggestDart = int Function(int, int, int);

// ... get_result_ptr, get_result_len, get_result_dist

class AutocorrectBridge {
  late final InitDart initFn;
  late final GetInputPtrDart getInputPtr;
  late final SuggestDart suggest;

  void _load() {
    DynamicLibrary lib;
    if (Platform.isAndroid) {
      lib = DynamicLibrary.open('libautocorrect.so');
    } else if (Platform.isIOS || Platform.isMacOS) {
      lib = DynamicLibrary.process();
    }
    initFn = lib.lookupFunction<InitNative, InitDart>('init');
    getInputPtr = lib.lookupFunction<GetInputPtrNative, GetInputPtrDart>('get_input_ptr');
    suggest = lib.lookupFunction<SuggestNative, SuggestDart>('suggest');
    // ...
  }
}`} lang="dart" />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Platform Setup</h2>
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-medium mb-2">Android</h3>
            <p class="text-sm text-neutral-400">
              Place the <code>.so</code> files under <code>flutter/android/src/main/jniLibs/</code>.
              The <code>build.gradle</code> declares <code>jniLibs.srcDirs</code> so they are
              automatically bundled into the APK.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium mb-2">iOS</h3>
            <p class="text-sm text-neutral-400">
              The <code>domain_autocorrect_flutter.podspec</code> declares{' '}
              <code>vendored_libraries</code> pointing to <code>libautocorrect.a</code>.
              Run <code>pod install</code> in your Flutter project's <code>ios/</code> directory
              to link the static library.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium mb-2">macOS</h3>
            <p class="text-sm text-neutral-400">
              Build as <code>cdylib</code> for <code>aarch64-apple-darwin</code> and link
              <code>libautocorrect.dylib</code> via the macOS podspec or manually in Xcode.
            </p>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Caveats</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-sm text-neutral-400">
          <li>The native library is lazily loaded and initialized on the first call to <code>setInput</code>.</li>
          <li>FFI calls are synchronous; the search is fast enough that it won't block the UI for the ~6k term dictionary.</li>
          <li>Call <code>dispose()</code> when the widget is removed to clean up listeners.</li>
          <li>Input is clamped to 255 bytes and max results to 10 (engine constraints).</li>
          <li>Use <code>ListenableBuilder</code> or <code>AnimatedBuilder</code> to react to state changes.</li>
        </ul>
      </section>
    </div>
  )
}
