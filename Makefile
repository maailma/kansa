NAME = kansa
BASE_CFG = config/docker-compose.base.yaml
DEV_CFG = config/docker-compose.dev.yaml
PROD_CFG = config/docker-compose.prod.yaml
PROD_CFG_TMPL = config/docker-compose.prod-template.yaml
DEBUG_CFG = config/docker-compose.debug.yml

DC = docker-compose -f $(BASE_CFG) -f $(DEV_CFG) -p $(NAME)

start:
	$(DC) up --build

debug:
	$(DC) -f $(DEBUG_CFG) up --build
	# TODO /Debugger listening on ws://0.0.0.0:9229/(\w+-\w+-\w+-\w+-\w+)/
	# chrome-devtools://devtools/bundled/js_app.html?ws=localhost:9229/$1

start-detached:
	$(DC) up -d --build

update-%:
	$(DC) up -d --build --no-deps $*

stop:
	$(DC) stop

test: | integration-tests/node_modules
	cd integration-tests && npm test

integration-tests/node_modules:
	cd integration-tests && npm install

prod: prod-check
	$(DC) up -d --build

prod-check: | $(PROD_CFG)
	@grep '^\s\+[A-Z_]\+:\s*$$' $(PROD_CFG) ;\
	if [ $$? -eq 0 ] ; then \
		echo "Empty env var values not allowed in $(PROD_CFG)" ;\
		exit 1 ;\
	fi

$(PROD_CFG): $(PROD_CFG_TMPL)
	cp $(PROD_CFG_TMPL) $(PROD_CFG)
