import { Option } from "./helper.ts";

export type DeepLResponse = {
  translations: [
    {
      text: string;
    }
  ];
};

export async function translate(opt: Option): Promise<string[]> {
  const body = new FormData();
  body.append("auth_key", opt.authKey!);
  body.append("source_lang", opt.source);
  body.append("target_lang", opt.target);
  body.append("text", opt.text);

  const resp = await fetch(opt.endpoint, {
    method: "POST",
    body: body,
  });

  // INFO: DeepL's error kinds
  // https://www.deepl.com/ja/docs-api/accessing-the-api/error-handling/
  if (resp.status != 200) {
    throw new Error(`status: ${resp.status}, text: ${resp.statusText}`);
  }
  return ((await resp.json()) as DeepLResponse).translations[0].text.split(
    "\r\n"
  );
}
