import {
  Denops,
  ensureNumber,
  ensureString,
  mapping,
  Mode,
  vars,
} from "./deps.ts";
import { Option, parseArgs } from "./util.ts";
import { floatWindow, normalWindow, popupWindow } from "./window.ts";

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
      ensureString(bang);

      let opt = {} as Option;
      try {
        opt = await parseArgs(
          denops,
          bang === "!",
          start,
          end,
          arg ? arg as string : "",
        );
      } catch (e) {
        console.error(`
${e}
Usage:
  :Translate
  :Translate {text}
  :Translate {source} {target}
  :Translate {source} {target} {text}`);
        return;
      }

      const endpoint = await vars.g.get<string>(
        denops,
        "translate_endpoint",
        defaultEndpoint,
      );

      const usePopupWindow = await vars.g.get<boolean>(
        denops,
        "translate_popup_window",
        true,
      );

      ensureString(endpoint);
      const body = {
        source: opt.source,
        target: opt.target,
        text: opt.text,
      };

      const resp = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const text = (await resp.text() as string).split("\n");
      if (usePopupWindow) {
        if (await denops.call("has", "nvim")) {
          await popupWindow(denops, text);
        } else {
          await floatWindow(denops, text);
        }
        return;
      }

      normalWindow(denops, text);
    },
  };
}
