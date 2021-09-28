import { Denops, isString } from "./deps.ts";

export async function main(denops: Denops): Promise<void> {
  await denops.cmd(
    `command! -nargs=1 Translate call denops#notify("${denops.name}", "translate", [<f-args>])`,
  );

  denops.dispatcher = {
    async translate(arg: unknown): Promise<void> {
      if (isString(arg)) {
        console.log("hello", arg);
      }
      await Promise.resolve();
    },
  };
}
