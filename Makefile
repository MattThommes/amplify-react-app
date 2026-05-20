.PHONY: help setup sync-upstream run-dev start-local-api

help:
	@echo "Available commands:"
	@echo "  make setup                       - Run local setup script"
	@echo "  make cleanup                     - Cleanup after running setup"
	@echo "  make sync-upstream               - Sync (pull down) upstream repo changes"
	@echo "  make start-local-api             - Start the local API mock server"
	@echo "  make run-dev                     - Run the application locally for development"

setup:
	./setup.sh

# Careful; this does a lot
reset:
	./setup.sh --reset

sync-upstream:
	./sync-upstream.sh

run-dev:
	./run.sh

start-local-api:
	npm run start:api

cleanup:
	npm cache clean --force
