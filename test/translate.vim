let s:suite = themis#suite('translate')
let s:assert = themis#helper('assert')
let s:expect = themis#helper('expect')

call WaitDenopsLoading()

function s:suite.popup()
  call setline(1, ['hello', 'world'])
  call translate#translate('', 1, 2)
  let got = GetPopupText()
  call s:assert.equals(got, ['こんにちは', '世界'])
endfunction

function! s:suite.buffer()
  let g:translate_ui = 'buffer'
  call setline(1, ['hello', 'world'])
  call translate#translate('', 1, 2)
  let got = getbufline('[translate]', 1, '$')
  call s:assert.equals(got, ['こんにちは', '世界'])
  bw!
  let g:translate_ui = 'popup'
endfunction

function! s:suite.from_argument()
  call translate#translate('', 1, 1, 'en ja "this is a pen"')
  let got = GetPopupText()
  call s:assert.equals(got, ['これはペンです'])
endfunction

function! s:suite.bang()
  call translate#translate('!', 1, 1, 'ja en "this is a pen"')
  let got = GetPopupText()
  call s:assert.equals(got, ['これはペンです'])
endfunction
