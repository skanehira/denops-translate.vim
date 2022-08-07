import { Denops, ensureString, vars } from "./deps.ts";
import { validLanguages } from "./languages.ts";

export type Option = {
  source: string;
  target: string;
  text: string;
};

export async function parseArgs(
  denops: Denops,
  bang: boolean,
  start: number,
  end: number,
  arg: string
): Promise<Option> {
  const parts: string[] = [];

  let i = 0;
  const max = arg.length;
  let word = "";
  let skipWhitespace = false;

  while (i < max) {
    const char = arg[i];
    if (char === '"') {
      skipWhitespace = !skipWhitespace;
      i++;
      if (i < max && arg[i] === " ") {
        word += arg[i];
        i++;
      }
      continue;
    }
    if (!skipWhitespace && char === " ") {
      parts.push(word);
      word = "";
    } else {
      word += char;
    }
    i++;
  }

  if (word !== "") {
    parts.push(word);
  }

  const message: string[] = [];

  switch (parts.length) {
    case 1:
      ensureString(parts[0]);
      message.push(parts[0]);
      break;
    case 2:
    case 0:
      for (const m of (await denops.eval(
        `getline(${start}, ${end})`
      )) as string[]) {
        message.push(m);
      }
      break;
    default: {
      message.push(parts[2]);
    }
  }

  const source = await vars.g.get<string>(denops, "translate_source", "en");
  const target = await vars.g.get<string>(denops, "translate_target", "ja");

  const opt = {
    source: source,
    target: target,
    text: message.join("\n"),
  } as Option;

  if (parts.length >= 2) {
    opt.source = parts[0];
    opt.target = parts[1];
  }

  if (bang) {
    [opt.source, opt.target] = [opt.target, opt.source];
  }

  if (!validLanguages.has(opt.source)) {
    throw new Error(`invalid language: ${opt.source}`);
  }
  if (!validLanguages.has(opt.target)) {
    throw new Error(`invalid language: ${opt.target}`);
  }

  return opt;
}
