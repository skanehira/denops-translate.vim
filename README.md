# denops-translate.vim
A new [translate.vim](https://github.com/skanehira/translate.vim)

## Requirements
- [denops.vim](https://github.com/vim-denops/denops.vim)

## Usage
```vim
:Translate[!] [{source} {target}] [{text}]
```

Translate `{text}` from `{source}` to `{target}`.  
When arguments doesn't specified, then current line will be translated from `g:translate_target` to `g:translate_source`.  
If you use `!`, then `{source}` and `{target}` will be exchanged.

## Author
skanehira
