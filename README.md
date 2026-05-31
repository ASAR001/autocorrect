# Domain Autocorrect

A high-performance domain autocorrect engine powered by **Rust**. It uses a Trie-based Levenshtein distance search algorithm.

## Installation

```bash
npm install domain-autocorrect
# or
bun add domain-autocorrect
```

### Important: WASM Setup

This library requires `autocorrect.wasm` to be present in your public folder (or root of your web server). You can find the WASM file in the `node_modules/domain-autocorrect/wasm/` directory.

## Usage

### Core API

```typescript
import { domainAutocorrect } from 'domain-autocorrect';

const suggestions = await domainAutocorrect.suggest('reactjs', 2, 5);
console.log(suggestions); 
// [{ word: 'react', distance: 2 }, ...]
```

### Framework Hooks

#### React
```tsx
import { useReactAutocorrect } from 'domain-autocorrect';

function App() {
  const { input, setInput, suggestions, loading } = useReactAutocorrect();
  
  return (
    <input 
      value={input()} 
      onInput={(e) => setInput(e.target.value)} 
    />
  );
}
```

#### SolidJS
```tsx
import { useSolidAutocorrect } from 'domain-autocorrect';

function App() {
  const { input, setInput, suggestions, loading } = useSolidAutocorrect();
  
  return (
    <input 
      value={input()} 
      onInput={(e) => setInput(e.currentTarget.value)} 
    />
  );
}
```

#### Flutter / Dart
```dart
import 'package:domain_autocorrect_flutter/domain_autocorrect.dart';

final autocorrect = FlutterAutocorrect(maxDist: 2, maxResults: 5);
TextField(onChanged: autocorrect.setInput);
...autocorrect.suggestions.map((s) => Text('${s.word} (${s.distance})'));
```

## Development

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/)

## License
MIT
