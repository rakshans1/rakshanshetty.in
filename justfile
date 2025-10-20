# Default recipe - show available commands
default:
  @just --list

# Install dependencies
deps:
  npm install

# Update Quartz framework from upstream
quartz-update:
  #!/usr/bin/env bash
  rm -rf quartz package.json tsconfig.json globals.d.ts index.d.ts package-lock.json docs/quartz
  mkdir -p quartz docs/quartz
  cp -r ../quartz/quartz/* quartz
    cp -r ../quartz/docs/* docs/quartz
  cp -r ../quartz/package.json package.json
  cp -r ../quartz/tsconfig.json tsconfig.json
  cp -r ../quartz/globals.d.ts globals.d.ts
  cp -r ../quartz/index.d.ts index.d.ts
  cp -r ../quartz/package-lock.json package-lock.json

sync:
  #!/usr/bin/env bash
  export BRAIN_VAULT="$HOME/Documents/brain/notes"
  export BRAIN_PUBLIC_VAULT="$HOME/projects/node/rakshanshetty.in/content"
  node utils/content-sync/index.js
  mv content/blog-index.md content/index.md

# Build the blog
build:
  npx quartz build

# Development server with auto-rebuild
serve:
  npx quartz build --serve --port 9020 --wsPort 9920

# Complete deployment pipeline
deploy: sync build
  @echo "✨ Build complete! Ready for deployment"

# Clean build artifacts
clean:
  rm -rf .quartz-cache public
