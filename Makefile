NAME = kansa
BASE_CFG = config/docker-compose.base.yaml
DEV_CFG = config/docker-compose.dev.yaml
PROD_CFG = config/docker-compose.prod.yaml
PROD_CFG_TMPL = config/docker-compose.prod-template.yaml

DC = docker-compose -f $(BASE_CFG) -f $(DEV_CFG) -p $(NAME)

start:
	$(DC) up --build

start-detached:
	$(DC) up -d --build

update-%:
	$(DC) up -d --build --no-deps $*

stop:
	$(DC) stop

test: | intergration-tests/node_modules
	cd integration-tests && npm test

intergration-tests/node_modules:
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
