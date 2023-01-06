import {
  Denops,
  ensureNumber,
  ensureString,
  GTR,
  mapping,
  Mode,
  vars,
} from "./deps.ts";
import { buildOption } from "./helper.ts";
import * as deepl from "./deepl.ts";

export async function main(denops: Denops): Promise<void> {
  const gtr = new GTR();

  const maps = [
    {
      lhs: "<silent> <Plug>(Translate)",
      rhs: ":Translate<CR>",
      mode: ["n", "v"],
    },
  ];

  for (const map of maps) {
    await mapping.map(denops, map.lhs, map.rhs, {
      mode: map.mode as Mode[],
    });
  }

  const breakChar = await vars.g.get(denops, "translate_sentence_break", {
    en: ".",
    ja: "。",
  }) as Record<string, string>;

  denops.dispatcher = {
    async translate(
      bang: unknown,
      start: unknown,
      end: unknown,
      arg: unknown,
    ): Promise<string[]> {
      ensureString(bang);

      const opt = await buildOption(
        denops,
        bang === "!",
        ensureNumber(start),
        ensureNumber(end),
        arg ? (arg as string) : "",
      );

      if (opt.isDeepL) {
        return deepl.translate(opt);
      }

      // NOTE: adjust sentence break.
      const bc = breakChar[opt.source] ?? "";
      const text = opt.text.split("\n").map((t) => t.trimStart()).join("")
        .replaceAll(bc, `${bc}\n`);

      const { trans } = await gtr.translate(text, {
        sourceLang: opt.source,
        targetLang: opt.target,
      });

      return trans.split("\n").map((t) => t.trimStart());
    },
  };
}
