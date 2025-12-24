.PHONY: help setup sync-upstream run-dev start-local-api amplify-status

help:
	@echo "Available commands:"
	@echo "  make setup            - Get local setup with dependencies"
	@echo "  make sync-upstream    - Sync (pull down) upstream repo changes"
	@echo "  make run-dev          - Run the application locally for development"
	@echo "  make start-local-api  - Start the local API mock server"
	@echo "  make amplify-status   - Check the status of Amplify resources"

setup:
	./setup.sh

sync-upstream:
	./sync-upstream.sh

run-dev:
	./run.sh

start-local-api:
	npm run start:api

amplify-status:
	amplify status
