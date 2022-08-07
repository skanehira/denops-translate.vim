" translate.vim
" Author: skanehira
" License: MIT

function! translate#translate(bang, start, end, ...) abort
  try
    let text = denops#request('translate', "translate", [a:bang, a:start, a:end] + a:000)
    let ui = get(g:, 'translate_ui', 'popup')
    if ui ==# 'popup'
      call translate#window(text)
    elseif ui ==# 'buffer'
      call translate#buffer(text)
    else
      for line in text
        echom line
      endfor
    endif
  catch /.*/
    echohl ErrorMsg
    for msg in split(v:exception, "\n")
      echom msg
    endfor
    echohl None
  endtry
endfunction

function! translate#buffer(text) abort
  let height = len(a:text)
  let curwin = win_getid()
  let bufnr = bufnr('^\[translate\]$')
  if bufnr ==# -1
    exe height .. 'new [translate]'
    setlocal buftype=nofile noswapfile nonumber bufhidden=hide
    nnoremap <buffer> <silent> q :bw!<CR>
    let bufnr = bufnr()
    call win_gotoid(curwin)
  else
    let winlist = win_findbuf(bufnr)
    if len(winlist) ==# 0
      exe height .. 'new [translate]'
      call win_gotoid(curwin)
    else
      call win_execute(winlist[0], 'resize ' .. height)
    endif
    silent call deletebufline(bufnr, 1, '$')
  endif
  call setbufline(bufnr, 1, a:text)
endfunction

function s:get_windoe_width_height(text) abort
  let height = len(a:text)
  let width = max(map(copy(a:text), { _, text -> strdisplaywidth(text) }))
  return [height, width]
endfunction

if has('nvim')
  function! translate#window(text) abort
    let [height, width] = s:get_windoe_width_height(a:text)
    let bufnr = nvim_create_buf(0, 1)
    call nvim_buf_set_lines(bufnr,0, -1, 1, a:text)
    let opt = {
          \ 'relative': 'cursor',
          \ 'width': width,
          \ 'height': height,
          \ 'col': width + 2,
          \ 'row': 0 - height - 2,
          \ 'anchor': 'NE',
          \ 'style': 'minimal',
          \ 'focusable': v:true,
          \ 'border': map(['╭', '─', '╮', '│', '╯', '─', '╰', '│'], { _, v -> [v, 'NormalFloat'] }),
          \ }
    let winid = nvim_open_win(bufnr, 1, opt)
    call win_execute(winid, 'nnoremap <silent> <buffer> q :bw!<CR>')
  endfunction
else
  function! translate#window(text) abort
    let [height, width] = s:get_windoe_width_height(a:text)
    let opt = {
          \ 'pos': 'topleft',
          \ 'border': [1, 1, 1, 1],
          \ 'line': printf('cursor-%d', height + 2),
          \ 'maxwidth': width,
          \ 'borderchars': ['─', '│', '─', '│', '╭', '╮', '╯', '╰'],
          \ 'moved': 'any',
          \ }
    call popup_atcursor(a:text, opt)
  endfunction
endif
