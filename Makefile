.PHONY: init
init:
	@repo=$$(basename `git rev-parse --show-toplevel`) && repo=($${repo/-/ }) && repo=$${repo[1]/\.*/ } && mv denops/template denops/$${repo}

.PHONY: coverage
coverage: test
	@deno coverage cov
	@rm -rf cov

.PHONY: test
test:
	@DENOPS_PATH=$$GOPATH/src/github.com/vim-denops/denops.vim DENOPS_TEST_NVIM=$$(which nvim) DENOPS_TEST_VIM=$$(which vim) deno test -A --unstable --coverage=cov

.PHONY: update-deps
update-deps:
	@udd denops/template/deps.ts
