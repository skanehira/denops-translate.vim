import { assertRejects } from "./deps.ts";
import { translate } from "./deepl.ts";

Deno.test({
  name: "timeout",
  fn: async () => {
    await assertRejects(
      async () => {
        return await translate({
          endpoint: "https://api-free.deepl.com/v2/translate",
          source: "en",
          target: "ja",
          isDeepL: true,
          text: "hello world",
          timeout: 0,
        });
      },
      Error,
      "The signal has been aborted",
    );
  },
});
