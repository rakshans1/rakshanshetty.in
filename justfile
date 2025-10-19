# Default recipe - show available commands
default:
  @just --list

# Install dependencies
deps:
  npm install

# Update Quartz framework from upstream
quartz-update:
  #!/usr/bin/env bash
  rm -rf quartz package.json tsconfig.json globals.d.ts index.d.ts package-lock.json
  mkdir -p quartz
  cp -r ../quartz/quartz/* quartz
  cp -r ../quartz/package.json package.json
  cp -r ../quartz/tsconfig.json tsconfig.json
  cp -r ../quartz/globals.d.ts globals.d.ts
  cp -r ../quartz/index.d.ts index.d.ts
  cp -r ../quartz/package-lock.json package-lock.json

# Sync content from Obsidian vault (to be implemented in Phase 2)
sync:
  @echo "🔄 Syncing blog content from vault..."
  node utils/content-sync/index.js

# Build the blog
build:
  npx quartz build

# Development server with auto-rebuild
dev:
  npx quartz build --serve

# Complete deployment pipeline
deploy: sync build
  @echo "✨ Build complete! Ready for deployment"

# Clean build artifacts
clean:
  rm -rf .quartz-cache public
