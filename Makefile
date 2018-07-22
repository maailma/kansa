NAME = api
BASE_CFG = config/docker-compose.base.yaml
DEV_CFG = config/docker-compose.dev.yaml
PROD_CFG = config/docker-compose.prod.yaml
PROD_CFG_TMPL = config/docker-compose.prod-template.yaml

start:
	docker-compose -f $(BASE_CFG) -f $(DEV_CFG) -p $(NAME) up --build

stop:
	docker-compose stop

prod: prod-check
	docker-compose -f $(BASE_CFG) -f $(PROD_CFG) -p $(NAME) up -d --build

prod-check: | $(PROD_CFG)
	@grep '^\s\+[A-Z_]\+:\s*$$' $(PROD_CFG) ;\
	if [ $$? -eq 0 ] ; then \
		echo "Empty env var values not allowed in $(PROD_CFG)" ;\
		exit 1 ;\
	fi

$(PROD_CFG): $(PROD_CFG_TMPL)
	cp $(PROD_CFG_TMPL) $(PROD_CFG)
