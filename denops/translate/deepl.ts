import { Option } from "./helper.ts";

export type DeepLResponse = {
  translations: [
    {
      text: string;
    }
  ];
};

export async function translate(opt: Option): Promise<string[]> {
  const body = {
    source_lang: opt.source,
    target_lang: opt.target,
    text: [opt.text.replace(/[\r\n]/g, "")],
  };
  const headers = new Headers();
  headers.append("Authorization", `DeepL-Auth-Key ${opt.authKey}`);
  headers.append("User-Agent", `denops-translate`);
  headers.append("Content-Type", `application/json`);

  const resp = await fetch(opt.endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers,
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
