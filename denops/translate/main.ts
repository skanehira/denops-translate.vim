import {
  Denops,
  ensureNumber,
  ensureString,
  mapping,
  Mode,
  vars,
} from "./deps.ts";

const defaultEndpoint =
  "https://script.google.com/macros/s/AKfycbywwDmlmQrNPYoxL90NCZYjoEzuzRcnRuUmFCPzEqG7VdWBAhU/exec";

export async function main(denops: Denops): Promise<void> {
  await denops.cmd(
    `command! -bang -range -nargs=? Translate call denops#notify("${denops.name}", "translate", ["<bang>", <line1>, <line2>, <f-args>])`,
  );

  const maps = [
    {
      lhs: "<silent> <Plug>(Translate)",
      rhs: ":<C-u>Translate<CR>",
      mode: ["n"],
    },
    {
      lhs: "<silent> <Plug>(VTranslate)",
      rhs: ":Translate<CR>",
      mode: ["v"],
    },
  ];

  for (const map of maps) {
    mapping.map(
      denops,
      map.lhs,
      map.rhs,
      {
        mode: map.mode as Mode[],
      },
    );
  }

  denops.dispatcher = {
    async translate(
      bang: unknown,
      start: unknown,
      end: unknown,
      arg: unknown,
    ): Promise<void> {
      ensureNumber(start);
      ensureNumber(end);

      let input: string[] = [];
      if (arg) {
        ensureString(arg);
        input = [arg];
      } else {
        input = await denops.eval(`getline(${start}, ${end})`) as string[];
      }

      const endpoint = await vars.g.get<string>(
        denops,
        "translate_endpoint",
        defaultEndpoint,
      );
      ensureString(endpoint);

      const body = {
        source: "en",
        target: "ja",
        text: input.join("\n"), // TODO support CLRF
      };

      if (bang) {
        [body.source, body.target] = [body.target, body.source];
      }

      const resp = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const text = (await resp.text() as string).split("\n");
      const height = text.length;

      const exists = await denops.call("bufexists", "[translate]") as boolean;
      if (exists) {
        const bufnr = await denops.call("bufnr", "\\[translate\\]");
        ensureNumber(bufnr);
        await denops.cmd(`silent call deletebufline(${bufnr}, 1, "$")`);
        await denops.call("setbufline", bufnr, 1, text);
      } else {
        await denops.cmd(`${height}new [translate]`);
        await denops.cmd(
          `setlocal buftype=nofile noswapfile nonumber bufhidden=hide`,
        );
        const bufnr = await denops.call("bufnr");
        ensureNumber(bufnr);
        await denops.call("setbufline", bufnr, 1, text);
        await denops.cmd("nnoremap <silent> <buffer> q :bw!<CR>");
      }
    },
  };
}
