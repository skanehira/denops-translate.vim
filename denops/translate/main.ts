import { Denops, ensure, GTR, is, mapping, Mode } from "./deps.ts";
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
    {
      lhs: "<silent> <Plug>(Translate-reverse)",
      rhs: ":Translate!<CR>",
      mode: ["n", "v"],
    },
  ];

  for (const map of maps) {
    await mapping.map(denops, map.lhs, map.rhs, {
      mode: map.mode as Mode[],
    });
  }

  denops.dispatcher = {
    async translate(
      bang: unknown,
      start: unknown,
      end: unknown,
      arg: unknown,
    ): Promise<string[]> {
      const opt = await buildOption(
        denops,
        ensure(bang, is.String) === "!",
        ensure(start, is.Number),
        ensure(end, is.Number),
        arg ? (arg as string) : "",
      );

      if (opt.isDeepL) {
        return deepl.translate(opt);
      }

      const { trans } = await gtr.translate(opt.text, {
        sourceLang: opt.source,
        targetLang: opt.target,
      });

      return trans.split("\n");
    },
  };
}
