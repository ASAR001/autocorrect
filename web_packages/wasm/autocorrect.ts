type AutocorrectWasm = {
  init: () => void;
  get_input_ptr: () => number;
  suggest: (len: number, max_dist: number, max_results: number) => number;
  get_result_ptr: (index: number) => number;
  get_result_len: (index: number) => number;
  get_result_dist: (index: number) => number;
  memory: WebAssembly.Memory;
};

let wasm: AutocorrectWasm | null = null;

async function initWasm() {
  if (wasm) return wasm;

  const response = await fetch("/autocorrect.wasm");
  const buffer = await response.arrayBuffer();
  const result = await WebAssembly.instantiate(buffer);

  wasm = result.instance.exports as unknown as AutocorrectWasm;
  wasm.init();
  return wasm;
}

export type Suggestion = {
  word: string;
  distance: number;
};

export const domainAutocorrect = {
  async suggest(
    input: string,
    maxDist: number = 3,
    maxResults: number = 3,
  ): Promise<Suggestion[]> {
    const instance = await initWasm();

    const encoder = new TextEncoder();
    const encoded = encoder.encode(input);
    const len = Math.min(encoded.length, 255);

    const ptr = instance.get_input_ptr();
    const view = new Uint8Array(instance.memory.buffer);
    view.set(encoded.subarray(0, len), ptr);

    const count = instance.suggest(len, maxDist, maxResults);

    const decoder = new TextDecoder();
    const suggestions: Suggestion[] = [];

    for (let i = 0; i < count; i++) {
      const resPtr = instance.get_result_ptr(i);
      const resLen = instance.get_result_len(i);
      const distance = instance.get_result_dist(i);

      const word = decoder.decode(
        new Uint8Array(instance.memory.buffer, resPtr, resLen),
      );
      suggestions.push({ word, distance });
    }

    return suggestions;
  },
};
