import { Denops, ensureNumber } from "./deps.ts";
import { textWidth } from "./util.ts";

export async function floatWindow(denops: Denops, text: string[]) {
  const height = text.length;
  const width = textWidth(text);
  const buf = await denops.call("nvim_create_buf", 0, 1);
  await denops.call("nvim_buf_set_lines", buf, 0, -1, 1, text);
  const opts = {
    "relative": "cursor",
    "width": width,
    "height": height,
    "col": width + 2,
    "row": 0 - height - 2,
    "anchor": "NE",
    "style": "minimal",
    "focusable": true,
    "border": ["╭", "─", "╮", "│", "╯", "─", "╰", "│"].map(
      (v) => [v, "NormalFloat"],
    ),
  };
  const win = await denops.call("nvim_open_win", buf, 1, opts);
  denops.call(
    "win_execute",
    win,
    "nnoremap <silent> <buffer> q :bw!<CR>",
  );
}

export async function popupWindow(denops: Denops, text: string[]) {
  const height = text.length;
  const width = textWidth(text);
  const opts = {
    "pos": "topleft",
    "border": [1, 1, 1, 1],
    "line": `cursor-${height + 2}`,
    "maxwidth": width,
    "borderchars": ["─", "│", "─", "│", "╭", "╮", "╯", "╰"],
    "moved": "any",
  };
  await denops.call("popup_atcursor", text, opts);
}

let resultWinID: number;

export async function normalWindow(denops: Denops, text: string[]) {
  const height = text.length;
  const exists = await denops.call("bufexists", "[translate]") as boolean;
  if (exists) {
    const bufnr = await denops.call("bufnr", "\\[translate\\]");
    ensureNumber(bufnr);
    await denops.cmd(`silent call deletebufline(${bufnr}, 1, "$")`);
    await denops.call("setbufline", bufnr, 1, text);
    await denops.call("win_execute", resultWinID, `resize ${height}`, 1);
  } else {
    const currentWinID = await denops.call("win_getid");
    await denops.cmd(`${height}new [translate]`);
    await denops.cmd(
      `setlocal buftype=nofile noswapfile nonumber bufhidden=hide`,
    );
    const bufnr = await denops.call("bufnr");
    ensureNumber(bufnr);
    await denops.call("setbufline", bufnr, 1, text);
    await denops.cmd("nnoremap <silent> <buffer> q :bw!<CR>");
    resultWinID = await denops.call("win_getid") as number;
    await denops.call("win_gotoid", currentWinID);
  }
}
