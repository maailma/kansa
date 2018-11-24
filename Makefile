NAME = kansa
BASE_CFG = config/docker-compose.base.yaml
DEV_CFG = config/docker-compose.dev.yaml
PROD_CFG = config/docker-compose.prod.yaml
PROD_CFG_TMPL = config/docker-compose.prod-template.yaml

DC = docker-compose -f $(CURDIR)/$(BASE_CFG) -f $(CURDIR)/$(DEV_CFG) -p $(NAME)
DC_PROD = docker-compose -f $(CURDIR)/$(BASE_CFG) -f $(CURDIR)/$(PROD_CFG) -p $(NAME)

start:
	$(DC) up --build

start-detached:
	$(DC) up -d --build

restart-%:
	$(DC) restart $*

update-%:
	$(DC) up -d --build --no-deps $*

stop:
	$(DC) stop

test-reset:
	docker exec kansa_postgres_1 psql api kansa -c "SELECT reset_test_users();"

test: test-reset | integration-tests/node_modules
	cd integration-tests && npm test
	@${MAKE} test-reset

integration-tests/node_modules:
	cd integration-tests && npm install

prod: prod-check
	$(DC_PROD) up -d --build

prod-check: | $(PROD_CFG)
	@grep '^\s\+[A-Z_]\+:\s*$$' $(PROD_CFG) ;\
	if [ $$? -eq 0 ] ; then \
		echo "Empty env var values not allowed in $(PROD_CFG)" ;\
		exit 1 ;\
	fi

$(PROD_CFG): $(PROD_CFG_TMPL)
	cp $(PROD_CFG_TMPL) $(PROD_CFG)

dev-env:
	@echo alias kansa="'$(DC)'"

prod-env: prod-check
	@echo alias kansa="'$(DC_PROD)'"
