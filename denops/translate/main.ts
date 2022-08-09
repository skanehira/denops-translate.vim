import { Denops, ensureNumber, ensureString, mapping, Mode } from "./deps.ts";
import { buildOption, makeRequestBody, handleResponse } from "./helper.ts";

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

      const opt = await buildOption(
        denops,
        bang === "!",
        ensureNumber(start),
        ensureNumber(end),
        arg ? (arg as string) : ""
      );

      const body = makeRequestBody(opt);

      const resp = await fetch(opt.endpoint, {
        method: "POST",
        body: body,
      });

      return handleResponse(resp, opt);
    },
  };
}
