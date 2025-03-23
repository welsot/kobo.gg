# CLAUDE.md - Development Guidelines

We develop Android application for Kobo.gg service,
main goal of this service is to let people easily upload epub books
and provide them with short code (and url) using which they can download epub, mobi, pdf
books on their Kobo/Kindle e-reader

## Build/Run Commands
- `npm run tauri android dev` - Run Tauri Android app dev build
- `npx tsc --noEmit` - Type checking only

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, no unused variables or parameters
- **Formatting**: 2-space indentation, use semicolons
- **Imports**: Group imports: React, third-party, internal modules, types
- **Components**: React functional components with explicit typing
- **API**: Use typed clients from api/ directory for networking
- **Error Handling**: Proper try/catch with typed errors
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **File Structure**: Group related functionality in directories
- **State Management**: Use React hooks for local state
- **Styling**: CSS modules for component-scoped styles

## Tools Used
- Vite + React + TypeScript + Tauri
- TypeScript strict mode enabled
- Hero Icons Library for icons
- Framer-motion library for animations