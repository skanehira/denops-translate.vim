let s:suite = themis#suite('translate')
let s:assert = themis#helper('assert')
let s:expect = themis#helper('expect')

call WaitDenopsLoading()

function s:suite.popup()
  let g:translate_ui = 'popup'
  call setline(1, ['hello, world'])
  call translate#translate('', 1, 2)
  let got = GetPopupText()
  call s:assert.equals(got, ['こんにちは世界'])
endfunction

function! s:suite.buffer()
  let g:translate_ui = 'buffer'
  call setline(1, ['hello. world'])
  call translate#translate('', 1, 2)
  let got = getbufline('[translate]', 1, '$')
  call s:assert.equals(got, ['こんにちは。', '世界'])
  %bw!
endfunction

function! s:suite.from_argument()
  let g:translate_ui = 'buffer'
  call translate#translate('', 1, 1, 'en ja "this is a pen"')
  let got = getbufline('[translate]', 1, '$')
  call s:assert.equals(got, ['これはペンです'])
  %bw!
endfunction

function! s:suite.bang()
  let g:translate_ui = 'buffer'
  call translate#translate('!', 1, 1, 'ja en "this is a pen"')
  let got = getbufline('[translate]', 1, '$')
  call s:assert.equals(got, ['これはペンです'])
  %bw!
endfunction
