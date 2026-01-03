.PHONY: help setup sync-upstream run-dev start-local-api amplify-status

help:
	@echo "Available commands:"
	@echo "  make setup            - Get local setup with dependencies"
	@echo "  make sync-upstream    - Sync (pull down) upstream repo changes"
	@echo "  make run-dev          - Run the application locally for development"
	@echo "  make start-local-api  - Start the local API mock server"
	@echo "  make amplify-status   - Check the status of Amplify resources"

sync-upstream:
	./sync-upstream.sh

setup:
	./setup.sh

run-dev:
	./run.sh

start-local-api:
	npm run start:api

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
