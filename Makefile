.PHONY: help setup sync-upstream run-dev start-local-api amplify-status

help:
	@echo "Available commands:"
	@echo "  make setup                       - Run local setup script"
	@echo "  make cleanup                     - Cleanup after running setup"
	@echo "  make sync-upstream               - Sync (pull down) upstream repo changes"
	@echo "  make start-local-api             - Start the local API mock server"
	@echo "  make run-dev                     - Run the application locally for development"
	@echo "  make amplify-init                - Initialize Amplify app locally and in cloud"
	@echo "  make amplify-status              - Check the status of Amplify resources"
	@echo "  make amplify-envs                - List Amplify environments"
	@echo "  make amplify-envs-add-prod       - Add prod environment"
	@echo "  make amplify-env-switch-prod     - Switch to prod environment locally"
	@echo "  make amplify-env-switch-staging  - Switch to staging environment locally"
	@echo "  make amplify-push                - Deploy resources to Amplify"

setup:
	./setup.sh

cleanup:
	npm cache clean --force

sync-upstream:
	./sync-upstream.sh

start-local-api:
	npm run start:api

run-dev:
	./run.sh

amplify-init:
	amplify init

amplify-status:
	@if [ ! -f amplify/backend/amplify-meta.json ]; then \
		echo "Creating empty amplify/backend/amplify-meta.json to avoid 'File does not exist' error..."; \
		echo "{}" > amplify/backend/amplify-meta.json; \
	fi
	@if [ ! -f "amplify/#current-cloud-backend/amplify-meta.json" ]; then \
		echo "Creating empty amplify/#current-cloud-backend/amplify-meta.json to avoid 'File does not exist' error..."; \
		mkdir -p "amplify/#current-cloud-backend"; \
		echo "{}" > "amplify/#current-cloud-backend/amplify-meta.json"; \
	fi
	amplify status

amplify-envs:
	amplify env list

amplify-envs-add-prod:
	amplify env add master

amplify-env-switch-prod:
	amplify env checkout master

amplify-env-switch-staging:
	amplify env checkout staging

amplify-env-delete-prod:
	amplify env remove master

amplify-env-delete-staging:
	amplify env remove staging

amplify-push:
	amplify push
