# MoodLog - Agent Guidelines

## Build/Lint/Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type-check TypeScript and Svelte files
- `npm run check:watch` - Type-check in watch mode
- `npm run lint` - Run Prettier and ESLint checks
- `npm run format` - Format code with Prettier

## Code Style

- **Framework**: SvelteKit with Svelte 5 (use runes: $state, $derived, $effect)
- **TypeScript**: Strict mode enabled. All code must be fully typed
- **Formatting**: Prettier with single quotes, no trailing commas, 100 char width, 2 spaces
- **Imports**: Use `$lib` alias for src/lib imports (e.g., `import { foo } from '$lib/utils'`)
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Components**: Use `.svelte` extension; TypeScript in `<script lang="ts">` tags
- **Error Handling**: Use try-catch for async operations; provide user-friendly error messages
- **Linting**: Follow ESLint config (typescript-eslint + eslint-plugin-svelte)

## Svelte MCP Tools

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
