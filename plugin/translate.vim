" translate.vim
" Author: skanehira
" License: MIT

if exists('loaded_translate')
  finish
endif
let g:loaded_translate = 1

command! -bang -range -nargs=? Translate call translate#translate("<bang>", <line1>, <line2>, <f-args>)
