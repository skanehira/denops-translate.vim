import {
  Denops,
  ensureNumber,
  ensureString,
  mapping,
  Mode,
  vars,
} from "./deps.ts";
import { Option, parseArgs } from "./util.ts";

const defaultEndpoint =
  "https://script.google.com/macros/s/AKfycbywwDmlmQrNPYoxL90NCZYjoEzuzRcnRuUmFCPzEqG7VdWBAhU/exec";

export async function main(denops: Denops): Promise<void> {
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

  denops.dispatcher = {
    async translate(
      bang: unknown,
      start: unknown,
      end: unknown,
      arg: unknown
    ): Promise<string[]> {
      ensureString(bang);

      let opt = {} as Option;
      try {
        opt = await parseArgs(
          denops,
          bang === "!",
          ensureNumber(start),
          ensureNumber(end),
          arg ? (arg as string) : ""
        );
      } catch (e) {
        throw e.message;
      }

      const endpoint = await vars.g.get<string>(
        denops,
        "translate_endpoint",
        defaultEndpoint
      );

      const body = {
        source: opt.source,
        target: opt.target,
        text: opt.text,
      };

      const resp = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return ((await resp.text()) as string).split("\n");
    },
  };
}
