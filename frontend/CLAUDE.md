# Kobo.gg Frontend Guidelines

## Build Commands
```
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run typecheck  # Generate types and run type checker
npm run format     # Format code with prettier
npm run format:check # Check formatting without changing files
```

## Code Style
- **TypeScript**: Use explicit typing; avoid `any`
- **Components**: Use functional components with named exports
- **Naming**: 
  - PascalCase for components 
  - camelCase for functions/variables
  - Prefix hooks with "use" (e.g., useCurrentUser)
- **Imports**: Group in order: React/libraries, then local imports
- **Error Handling**: Use try/catch with appropriate error logging
- **Styling**: Use Tailwind CSS classes
- **State Management**: Use Context API and Zustand
- **File Structure**: 
  - Group related components in folders
  - Keep components focused and small
- **Exports**: Prefer named exports over default exports