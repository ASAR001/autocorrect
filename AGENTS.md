# Agent Guide: domain_autocorrect

## Monorepo Structure
- **Root** — library package (`domain-autocorrect`): tsdown build, Rust core, hooks
- **`docs/`** — documentation SPA (`domain-autocorrect-docs`): Vite + SolidJS

Each sub-project has its own `package.json` and is managed with `bun --cwd <dir>`.

## Commands & Workflow
- **Package Manager:** Use `bun`.
- **Task Runner:** `just`. Available recipes: `install`, `dev`, `build`, `build-core`, `build-react`, `build-solid`, `build-wasm`, `build-android`, `build-ios`, `build-all`, `build-all-native`, `docs-dev`, `docs-build`, `docs-preview`, `clean`.
- **Install all deps:** `just install` (runs `bun install` in root + docs).
- **Docs Dev Server:** `just dev` (Vite on `localhost:5174`).
- **Bundle Library:** `just build` — runs `tsdown` (config: `tsdown.config.ts`). Bundles all three outputs in a single pass:
  - `hooks_build/` — core WASM bridge (no framework deps)
  - `react_hook/` — core + React `useAutocorrect` hook (`import from 'domain-autocorrect/react'`)
  - `solid_hook/` — core + Solid `useAutocorrect` hook (`import from 'domain-autocorrect/solid'`)
- **WASM Build:** `just build-wasm` (Rust core build → `build/core/wasm32-unknown-unknown/release/autocorrect.wasm`). Requires `rustup` with `wasm32-unknown-unknown` target. Depends on `DICT_PATH` env var (defaults to `src/assets/tech.txt`, copied to `src/core/tech.txt` before compilation).
- **Android Build:** `just build-android` — cross-compiles Rust for 4 Android ABIs (requires `rustup` targets: `aarch64-linux-android`, `armv7-linux-androideabi`, `x86_64-linux-android`, `i686-linux-android`) then builds AAR in `src/consumers/android/`. Uses JDK 21 (brew `openjdk@21`) and Android SDK at `/opt/homebrew/share/android-commandlinetools/`.
- **iOS Build:** `just build-ios` — cross-compiles Rust for `aarch64-apple-ios` and `aarch64-apple-ios-sim`, copies `.a` to `src/consumers/swift/Binaries/`. Run `swift build` in `src/consumers/swift/` separately.
- **Full Build (TS+WASM):** `just build-all` (builds hooks and WASM).
- **Full Build (Native):** `just build-all-native` (builds Android and iOS).
- **Clean:** `just clean` removes `hooks_build/`, `react_hook/`, `solid_hook/`, `core_build/`, `docs/dist/`, `target/`, and `src/consumers/android/` build artifacts.

### Documentation SPA (`docs/`)
- **Dev Server:** `just docs-dev` — starts Vite dev server on `localhost:5174`.
- **Build:** `just docs-build` — production build → `docs/dist/`.
- **Preview:** `just docs-preview` — preview the production build.
- **Tech Stack:** SolidJS + TanStack Router + TailwindCSS v4 (`@tailwindcss/vite`).
- **WASM Loading:** The docs Vite config sets `publicDir` to `../build/core/wasm32-unknown-unknown/release` so `/autocorrect.wasm` is served during dev & build.
- **Config Files:** `docs/vite.config.ts`, `docs/package.json`.

## Architecture
- **Hooks & Frameworks:** (located in `src/consumers/`)
  - `solidHooks.ts`: Provides `useAutocorrect` for SolidJS.
  - `reactHooks.ts`: Provides `useAutocorrect` for React.
  - `ComposeAutocorrect.kt`: Kotlin class with JNI bindings, `StateFlow` properties, `suspend setInput` — for Jetpack Compose.
  - `SwiftAutocorrect.swift`: Swift `ObservableObject` with `@Published` properties, C FFI bridge, async Task-based search — for SwiftUI.
  - `jni_bridge.rs`: Rust JNI wrapper with 4 exported functions (conditionally compiled with `features = ["jni"]`).
  - `autocorrect.h`: C header for iOS bridging (includes `ac_init` Swift keyword workaround).
- **Core Logic:** (located in `src/core/`)
  - `autocorrect.rs`: Rust (`#![no_std]`) implementation of a Levenshtein distance search over a Trie. Compiles to WASM via `wasm32-unknown-unknown` / staticlib for iOS / cdylib for Android.
  - `autocorrect.ts`: WASM bridge handling memory mapping and pointer arithmetic.
- **Entry Points:** (inside `src/`)
  - `src/index.ts` — core WASM bridge only (no framework deps)
  - `src/index-react.ts` — core + React hook
  - `src/index-solid.ts` — core + Solid hook
- **Docs SPA:** Self-contained in `docs/` with its own `package.json` and `vite.config.ts`. Imports the library as `domain-autocorrect` (resolves to `file:..`). Pages: Home (with live demo), API Reference, Core Algorithm deep dive, per-framework hook guides (React, Solid, Vue, Angular), and Build Guide. Components: `LiveDemo`, `CodeBlock`, `Sidebar`, `ComparisonTable`.

## Critical Constraints
- **WASM Memory:** Rust uses a fixed 4MB buffer. Keep input/results within reasonable limits.
- **TypeScript:** Use `import type { Suggestion }` to avoid `MISSING_EXPORT` errors in production builds (Rolldown quirk with types from WASM bridge).
- **Static Assets:** `build/core/wasm32-unknown-unknown/release/autocorrect.wasm` must be present for the app to function.
- **Build Order:** Library must be built (`just build`) before docs dev/build, since docs imports the built package via `"domain-autocorrect": "file:.."`.
- **Never read `node_modules`:** Never search, read, or glob inside any `node_modules` directory. It causes path exhaustion errors and is never useful.
