import { createSignal, createResource } from "solid-js";
import { domainAutocorrect } from "@/wasm/autocorrect";
import type { Suggestion } from "@/wasm/autocorrect";

export function useAutocorrect(defaultMaxDist = 3, defaultMaxResults = 3) {
  const [input, setInput] = createSignal("");
  
  const [suggestions] = createResource(input, async (val) => {
    if (val.length < 2) return [];
    return await domainAutocorrect.suggest(val, defaultMaxDist, defaultMaxResults);
  });

  return {
    input,
    setInput,
    suggestions,
    loading: suggestions.loading,
  };
}

export { domainAutocorrect } from "@/wasm/autocorrect";
export type { Suggestion } from "@/wasm/autocorrect";
