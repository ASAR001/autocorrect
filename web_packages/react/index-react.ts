import { useState, useEffect } from "react";
import { domainAutocorrect } from "@/wasm/autocorrect";
import type { Suggestion } from "@/wasm/autocorrect";

export function useAutocorrect(defaultMaxDist = 3, defaultMaxResults = 3) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const results = await domainAutocorrect.suggest(input, defaultMaxDist, defaultMaxResults);
        if (active) {
          setSuggestions(results);
        }
      } catch (error) {
        console.error("Autocorrect error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      active = false;
    };
  }, [input, defaultMaxDist, defaultMaxResults]);

  return {
    input,
    setInput,
    suggestions,
    loading,
  };
}

export { domainAutocorrect } from "@/wasm/autocorrect";
export type { Suggestion } from "@/wasm/autocorrect";
