.PHONY: mod clean build start help

# Show usage if no option
.DEFAULT_GOAL := help


help:
	@echo "Sales Sync API"

clean: ## Remove binary
	rm -rf ./.aws-sam
	
build:
	sam build

start: build ## Start Lambda and API Gateway on localhost
	sam local start-api --port 8080 --env-vars env.staging.json

deploy: build
	sam deploy --env-vars env.prod.json