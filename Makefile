.PHONY: mod clean build start shared.pack help

# Show usage if no option
.DEFAULT_GOAL := help
SHARED_PKG_DIR := packages
AUTH_VENDOR    := auth/vendor
WS_VENDOR      := workspace/vendor

shared.pack:
	@echo "==> Packing @sales-sync/shared from: $(abspath $(SHARED_PKG_DIR))"
	@test -f "$(SHARED_PKG_DIR)/package.json" || (echo "ERROR: package.json not found in $(abspath $(SHARED_PKG_DIR))"; exit 1)
	@cd "$(SHARED_PKG_DIR)" && npm run build
	@cd "$(SHARED_PKG_DIR)" && TARBALL=$$(npm pack --json | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)[0].filename))"); \
		echo "==> Tarball: $$TARBALL"; \
		mkdir -p "$(AUTH_VENDOR)" "$(WS_VENDOR)"; \
		cp "$$TARBALL" "../$(AUTH_VENDOR)/shared.tgz"; \
		cp "$$TARBALL" "../$(WS_VENDOR)/shared.tgz"; \
		rm -f "$$TARBALL"
	@echo "==> Updated vendor tarballs: $(AUTH_VENDOR)/shared.tgz and $(WS_VENDOR)/shared.tgz"


help:
	@echo "Sales Sync API"

clean: ## Remove binary
	rm -rf ./.aws-sam
	
build: shared.pack
	sam build

start: build ## Start Lambda and API Gateway on localhost
	sam local start-api --port 8080 --env-vars env.staging.json

deploy: build
	sam deploy --env-vars env.prod.json


