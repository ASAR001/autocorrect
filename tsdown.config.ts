import { defineConfig } from "tsdown";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { wasm } from "rolldown-plugin-wasm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const base = {
  alias: { "@": resolve(__dirname, "web_packages") },
  copy: ["web_packages/wasm/dist/autocorrect.wasm"],
};

export default defineConfig([
  {
    ...base,
    entry: ["web_packages/wasm/index.ts"],
    outDir: "web_packages/wasm/dist",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: false,
    deps: { neverBundle: ["react", "solid-js"] },
    plugins: [wasm()],
  },
  {
    ...base,
    entry: ["web_packages/react/index.ts"],
    outDir: "web_packages/react/dist",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: false,
    deps: { neverBundle: ["react"] },
  },
  {
    ...base,
    entry: ["web_packages/solid/index.ts"],
    outDir: "web_packages/solid/dist",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: false,
    deps: { neverBundle: ["solid-js"] },
  },
]);
