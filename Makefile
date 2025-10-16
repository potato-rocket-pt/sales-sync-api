.PHONY: help clean shared.pack bundle build start deploy

# Default target
.DEFAULT_GOAL := help

# === Shared package paths ===
SHARED_PKG_DIR := packages
AUTH_VENDOR    := auth/vendor
WS_VENDOR      := workspace/vendor

# === Shared package tarball creation ===
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

# === Bundle each Lambda with esbuild ===
bundle: shared.pack
	@echo "==> Bundling auth Lambda"
	npm run -w ./auth bundle
	@echo "==> Bundling workspace Lambda"
	npm run -w ./workspace bundle
	@echo "==> Bundling completed"

# === SAM build & deploy commands ===
build: bundle
	@echo "==> SAM build (zipping pre-bundled Lambdas)"
	sam build

start: build
	@echo "==> Starting local API"
	sam local start-api --port 8080 --env-vars env.staging.json

deploy: build
	@echo "==> Deploying to AWS"
	sam deploy --env-vars env.prod.json

# === Cleanup ===
clean:
	@echo "==> Cleaning build artifacts"
	rm -rf .aws-sam auth/bundle workspace/bundle

# === Help ===
help:
	@echo ""
	@echo "Sales Sync API Commands:"
	@echo "  make shared.pack   - Build and pack shared module tarballs"
	@echo "  make bundle        - Bundle auth and workspace Lambdas with esbuild"
	@echo "  make build         - Bundle + SAM build (no rebuild inside SAM)"
	@echo "  make start         - Run local API after build"
	@echo "  make deploy        - Deploy after bundle build"
	@echo "  make clean         - Remove .aws-sam and bundle folders"
	@echo ""
