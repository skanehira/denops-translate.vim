import { Denops, ensureString, vars, path, xdg } from "./deps.ts";

export type DeepLResponse = {
  translations: [
    {
      detected_source_language: string;
      text: string;
    }
  ];
};

export const defaultEndpoint =
  "https://script.google.com/macros/s/AKfycbywwDmlmQrNPYoxL90NCZYjoEzuzRcnRuUmFCPzEqG7VdWBAhU/exec";

export const deeplAuthokeyPath = path.join(
  xdg.config(),
  "denops_translate",
  "deepl_authkey"
);

export const onece = <A extends unknown, R extends Promise<unknown>>(
  f: (arg?: A) => R
) => {
  let v: R | undefined;
  return (arg?: A): R => {
    return v || (v = f(arg));
  };
};

export async function readDeepLAuthkey(): Promise<string> {
  try {
    const text = await Deno.readTextFile(deeplAuthokeyPath);
    return text.trim();
  } catch (e) {
    throw new Error(
      `Cannot read DeepL's authkey from ${deeplAuthokeyPath}: ${e.message}`
    );
  }
}

export const getDeepLAuthKey = onece(readDeepLAuthkey);

export type Option = {
  endpoint: string;
  isDeepL: boolean;
  authKey?: string;
  source: string;
  target: string;
  text: string;
};

export async function buildOption(
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
      for (const m of (await denops.call("getline", start, end)) as string[]) {
        message.push(m);
      }
      break;
    default: {
      message.push(parts[2]);
    }
  }

  const source = await vars.g.get<string>(denops, "translate_source", "en");
  const target = await vars.g.get<string>(denops, "translate_target", "ja");
  const endpoint = await vars.g.get<string>(
    denops,
    "translate_endpoint",
    defaultEndpoint
  );

  const opt = {
    endpoint: endpoint,
    isDeepL: endpoint.includes("deepl.com"),
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

  if (opt.isDeepL) {
    opt.authKey = await getDeepLAuthKey();
  }

  return opt;
}

export function makeRequestBody(opt: Option): BodyInit {
  if (opt.isDeepL) {
    const body = new FormData();
    body.append("auth_key", opt.authKey!);
    body.append("source_lang", opt.source);
    body.append("target_lang", opt.target);
    body.append("text", opt.text);
    return body;
  }

  const body = {
    source: opt.source,
    target: opt.target,
    text: opt.text,
  };

  return JSON.stringify(body);
}

export async function handleResponse(
  resp: Response,
  opt: Option
): Promise<string[]> {
  if (opt.isDeepL) {
    // INFO: DeepL's error kinds
    // https://www.deepl.com/ja/docs-api/accessing-the-api/error-handling/
    if (resp.status != 200) {
      throw new Error(`status: ${resp.status}, text: ${resp.statusText}`);
    }
    return ((await resp.json()) as DeepLResponse).translations[0].text.split(
      "\r\n"
    );
  }
  return ((await resp.text()) as string).split("\n");
}
