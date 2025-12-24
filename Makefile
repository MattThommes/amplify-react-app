.PHONY: help install dev build api

help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make dev      - Start the frontend development server"
	@echo "  make api      - Start the local API mock server"
	@echo "  make build    - Build the frontend for production"

install:
	npm install

dev:
	npm run dev

api:
	npm run start:api

build:
	npm run build

amplify-status:
	amplify status
