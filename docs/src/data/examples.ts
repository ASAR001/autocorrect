export const reactExample = `import { useAutocorrect } from 'domain-autocorrect/react'

function SearchInput() {
  const { input, setInput, suggestions, loading } = useAutocorrect()

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a tech term..."
      />
      {loading && <span>Searching...</span>}
      <ul>
        {suggestions.map((s) => (
          <li key={s.word}>{s.word} <small>(dist {s.distance})</small></li>
        ))}
      </ul>
    </div>
  )
}`

export const reactCustomExample = `// Custom max distance and max results
const { input, setInput, suggestions } = useAutocorrect(2, 5)`

export const solidExample = `import { useAutocorrect } from 'domain-autocorrect/solid'

function SearchInput() {
  const { input, setInput, suggestions, loading } = useAutocorrect()

  return (
    <div>
      <input
        value={input()}
        onInput={(e) => setInput(e.currentTarget.value)}
        placeholder="Type a tech term..."
      />
      <Show when={loading && !suggestions.loading}>
        <span>Searching...</span>
      </Show>
      <For each={suggestions()}>
        {(s) => (
          <li>{s.word} <small>(dist {s.distance})</small></li>
        )}
      </For>
    </div>
  )
}`

export const solidCustomExample = `// Custom max distance and max results
const { input, setInput, suggestions } = useAutocorrect(2, 5)`

export const composeExample = `import com.techautocorrect.ComposeAutocorrect

// In a @Composable function:
val autocorrect = remember { ComposeAutocorrect(maxDist = 2, maxResults = 5) }

val suggestions by autocorrect.suggestions.collectAsStateWithLifecycle()
val loading by autocorrect.loading.collectAsStateWithLifecycle()

TextField(
    value = autocorrect.input.value,
    onValueChange = { autocorrect.setInput(it) },
    label = { Text("Tech term...") }
)

if (loading) CircularProgressIndicator()

suggestions.forEach { s ->
    Text("\${s.word} (dist \${s.distance})")
}`

export const composeCustomExample = `// Custom max distance and max results
val autocorrect = remember { ComposeAutocorrect(maxDist = 2, maxResults = 5) }`

export const swiftExample = `import SwiftUI

struct SearchView: View {
    @StateObject private var autocorrect = SwiftAutocorrect(maxDist: 2, maxResults: 5)

    var body: some View {
        VStack {
            TextField("Tech term...", text: Binding(
                get: { autocorrect.input },
                set: { autocorrect.setInput(\$0) }
            ))
            if autocorrect.loading { ProgressView() }
            ForEach(autocorrect.suggestions, id: \\.word) { s in
                Text("\\(s.word) (dist \\(s.distance))")
            }
        }
    }
}`

export const swiftCustomExample = `// Custom max distance and max results
@StateObject private var autocorrect = SwiftAutocorrect(maxDist: 2, maxResults: 5)`

export const apiExample = `import { domainAutocorrect } from 'domain-autocorrect'

const results = await domainAutocorrect.suggest('typscript', 2, 3)
// [{ word: 'TypeScript', distance: 1 }]

const results2 = await domainAutocorrect.suggest('reakt', 3, 5)
// [{ word: 'React', distance: 2 }, { word: 'Redis', distance: 3 }, ...]`

export const buildScripts = `# Development
just dev           # Start Vite dev server
just build         # Build all TS outputs (hooks_build/ + react_hook/ + solid_hook/)
just build-core    # Core WASM bridge only
just build-react   # Core + React hook
just build-solid   # Core + Solid hook
just build-wasm    # Build Rust → WASM (core_build/)
just build-all     # Build all TS + WASM
just clean         # Remove build artifacts

# With custom dictionary
DICT_PATH=src/assets/my_terms.txt just build-wasm`

export const flutterExample = `import 'package:domain_autocorrect_flutter/domain_autocorrect.dart';

class SearchWidget extends StatefulWidget {
  @override
  State<SearchWidget> createState() => _SearchWidgetState();
}

class _SearchWidgetState extends State<SearchWidget> {
  final _ac = FlutterAutocorrect(maxDist: 2, maxResults: 5);

  @override
  void dispose() {
    _ac.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _ac,
      builder: (context, _) => Column(
        children: [
          TextField(
            onChanged: _ac.setInput,
            decoration: InputDecoration(hintText: 'Tech term...'),
          ),
          if (_ac.loading) CircularProgressIndicator(),
          ..._ac.suggestions.map(
            (s) => Text('\${s.word} (dist \${s.distance})'),
          ),
        ],
      ),
    );
  }
}`

export const flutterCustomExample = `// Custom max distance and max results
final _ac = FlutterAutocorrect(maxDist: 2, maxResults: 5)`

export const wasmBridge = `// How the TypeScript bridge communicates with WASM
const instance = await initWasm()
const ptr = instance.get_input_ptr()

// Copy user input into WASM memory
const view = new Uint8Array(instance.memory.buffer)
view.set(encoded.subarray(0, len), ptr)

// Run the search
const count = instance.suggest(len, maxDist, maxResults)

// Read results back from WASM memory
for (let i = 0; i < count; i++) {
  const resPtr = instance.get_result_ptr(i)
  const resLen = instance.get_result_len(i)
  const distance = instance.get_result_dist(i)
  const word = decoder.decode(new Uint8Array(
    instance.memory.buffer, resPtr, resLen
  ))
}`
