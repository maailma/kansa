VT = \033[$(1)m
VT0 := $(call VT,0)
VT_DIM := $(call VT,2)
VT_HL := $(call VT,33;1)
CHK := $(call VT,32;1)✓${VT0}
ERR := $(call VT,31;1)✖${VT0}

DIST_DIR = dist
REL_BRANCH = gh-pages

release:
	@if ! git diff-index --quiet HEAD; then echo "$(ERR) Git working directory is not clean!\n"; exit 1; fi
	$(eval HEAD = $(shell git rev-parse --short HEAD))
	@echo "Building $(VT_HL)kansa-admin$(VT0) release from commit $(VT_HL)$(HEAD)$(VT0)"
	git clean --force -x $(DIST_DIR)
	npm run build:prod
	git checkout $(REL_BRANCH)
	git rm -r --ignore-unmatch .
	mv $(DIST_DIR)/* .
	git add .
	git commit -m 'Updating kansa-admin release from commit $(HEAD)'
	@echo "$(CHK) Done! New commit pushed to branch $(VT_HL)$(REL_BRANCH)$(VT0)"
