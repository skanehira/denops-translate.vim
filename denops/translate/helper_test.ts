import { assertEquals, Denops, test } from "./deps.ts";
import { buildOption } from "./helper.ts";

const tests = [
  {
    name: "no args",
    start: 1,
    end: 1,
    bang: false,
    args: ``,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "en",
      target: "ja",
      text: "hello",
      timeout: 30,
    },
  },
  {
    name: "1 args",
    start: 1,
    end: 1,
    bang: false,
    args: `"hello world"`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "en",
      target: "ja",
      text: "hello world",
      timeout: 30,
    },
  },
  {
    name: "2 args",
    start: 1,
    end: 2,
    bang: false,
    args: `ja en`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "ja",
      target: "en",
      text: "hello\nworld",
      timeout: 30,
    },
  },
  {
    name: "all args",
    start: 1,
    end: 1,
    bang: false,
    args: `en ja "hello world"`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "en",
      target: "ja",
      text: "hello world",
      timeout: 30,
    },
  },
  {
    name: "two words",
    start: 1,
    end: 1,
    bang: false,
    args: `en ja "hello world" gorilla`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "en",
      target: "ja",
      text: "hello world gorilla",
      timeout: 30,
    },
  },
  {
    name: "two words with double quotation",
    start: 1,
    end: 1,
    bang: false,
    args: `en ja "hello world" "gorilla"`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "en",
      target: "ja",
      text: "hello world gorilla",
      timeout: 30,
    },
  },
  {
    name: "three words",
    start: 1,
    end: 1,
    bang: false,
    args: `en ja "hello 'world' "gorilla"`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "en",
      target: "ja",
      text: "hello 'world' gorilla",
      timeout: 30,
    },
  },
  {
    name: "bang",
    start: 1,
    end: 1,
    bang: true,
    args: `"hello world"`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "ja",
      target: "en",
      text: "hello world",
      timeout: 30,
    },
  },
  {
    name: "bang with lang",
    start: 1,
    end: 1,
    bang: true,
    args: `en ja "hello world"`,
    want: {
      endpoint: "",
      isDeepL: false,
      source: "ja",
      target: "en",
      text: "hello world",
      timeout: 30,
    },
  },
];

for (const tt of tests) {
  test({
    mode: "all",
    name: tt.name,
    fn: async (denops: Denops) => {
      if (tt.name === "2 args" || tt.name === "no args") {
        await denops.call("setline", 1, ["hello", "world"]);
      }
      const got = await buildOption(denops, tt.bang, tt.start, tt.end, tt.args);
      assertEquals(got, tt.want);
    },
  });
}
