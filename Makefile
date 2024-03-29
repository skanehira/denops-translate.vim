DIR_NAME := $(shell basename `git rev-parse --show-toplevel` .vim)
PLUGIN_NAME := $(shell echo $(DIR_NAME) | cut -d "-" -f 2)
DENOPS := $${DENOPS_TEST_DENOPS_PATH:-$$GHQ_ROOT/github.com/vim-denops/denops.vim}
VIM := $${DENOPS_TEST_VIM_EXECUTABLE:-$$(which vim)}
NVIM := $${DENOPS_TEST_NVIM_EXECUTABLE:-$$(which nvim)}

.PHONY: init
init:
	@repo=$$(basename `git rev-parse --show-toplevel`) && repo=($${repo/-/ }) && repo=$${repo[1]/\.*/ } && mv denops/template denops/$${repo}

.PHONY: test
test:
	@DENOPS_TEST_DENOPS_PATH=$(DENOPS) \
		DENOPS_TEST_NVIM_EXECUTABLE=$(NVIM) \
		DENOPS_TEST_VIM_EXECUTABLE=$(VIM) \
		deno test -A --unstable

.PHONY: test-themis
test-themis:
	@echo ==== test in Vim =====
	@THEMIS_VIM=$(VIM) THEMIS_ARGS="-e -s -u DEFAULTS" themis --runtimepath $(DENOPS)
	@echo ==== test in Neovim =====
	@THEMIS_VIM=$(NVIM) THEMIS_ARGS="-e -s -u NONE" themis --runtimepath $(DENOPS)

.PHONY: deps
deps:
	@deno run -A https://deno.land/x/udd@0.7.3/main.ts denops/$(PLUGIN_NAME)/deps.ts
	@deno run -A https://deno.land/x/udd@0.7.3/main.ts denops/$(PLUGIN_NAME)/deps_test.ts
