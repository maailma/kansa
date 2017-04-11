BASE_CFG = docker-compose.yml
PROD_CFG = docker-compose.prod.yml

start:
	docker-compose up --build

stop:
	docker-compose stop

prod: prod-check
	docker-compose -f $(BASE_CFG) -f $(PROD_CFG) up -d --build

prod-check:
	@grep '^\s\+[A-Z_]\+:\s*$$' $(PROD_CFG) ;\
	if [ $$? -eq 0 ] ; then \
		echo "Empty env var values not allowed in $(PROD_CFG)" ;\
		exit 1 ;\
	fi
