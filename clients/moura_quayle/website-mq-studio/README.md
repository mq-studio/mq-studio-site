# Website MQ Studio

Development environment powered by VS Code Dev Containers with full-stack AI development capabilities.

## Getting Started

1. Open in VS Code: `code .`
2. When prompted, click "Reopen in Container"
3. Wait for container to build (first time may take several minutes)
4. Start developing!

## Features

- **Isolated Development Environment**: Complete containerized setup with Node.js 20 and Python 3.11
- **AI Coding Assistants**: Pre-configured with Claude Code and Gemini Code Assist
- **Project-Specific Extensions**: Frontend (ESLint, Prettier), Backend (Python, Pylance), Database (Prisma), and more
- **Consistent Across Team Members**: Exact same environment for all developers
- **SSH Key Integration**: Read-only mount of SSH keys for secure Git operations
- **Port Forwarding**: Pre-configured for common development ports (3000, 5000, 5432, 6379, 8000, 8080)

## Tech Stack Support

- **Frontend**: React, Next.js, TypeScript/JavaScript
- **Backend**: Python (FastAPI, Django), Node.js (NestJS)
- **Database**: PostgreSQL, Redis
- **Tools**: Docker, Git, Prisma ORM

## Configuration

See `.devcontainer/devcontainer.json` for full configuration details.

### VS Code Extensions Included

- **Core**: EditorConfig, GitLens, Todo Tree
- **Frontend**: ESLint, Prettier
- **Backend**: Python, Pylance
- **Database**: Prisma
- **AI**: Claude Code, Gemini Code Assist
- **DevOps**: Docker, YAML, OpenAPI

## Development Commands

The container includes global packages:
- `@nestjs/cli` - NestJS framework CLI
- `create-react-app` - React application generator
- `next` - Next.js framework
- `prisma` - Database toolkit
- `vercel` - Deployment platform CLI

## Next Steps

1. Configure API keys for AI assistants (if needed)
2. Customize `.devcontainer/devcontainer.json` for project-specific needs
3. Add additional VS Code extensions via the devcontainer.json
4. Commit `.devcontainer/` to version control for team consistency

## TestSprite MCP Integration

1. Rebuild the development container after pulling the latest changes so Node.js 22 and the TestSprite MCP server (`@testsprite/testsprite-mcp`) are provisioned.
2. Add the "Testsprite API" secret to 1Password and run development commands through `.devcontainer/run-with-secrets.sh` so `TESTSPRITE_API_KEY` is injected from the template entry.
3. (Optional) If you need local overrides, populate `TESTSPRITE_API_KEY` in `.env.local`—see `.env.example` for the placeholder.
4. In your MCP-compatible IDE (Cursor, VS Code, etc.), keep the default configuration (`command: "npx"`, args: `@testsprite/testsprite-mcp@latest`). Invoke your assistant with `Help me test this project with TestSprite` to kick off a session.
5. Review execution details in the TestSprite dashboard. The generated `testsprite_tests/` directory is ignored by Git, but you can inspect artifacts locally as needed.

> **Note:** The TestSprite MCP server is distributed under the Business Source License 1.1, which permits non-production use only. Keep usage confined to local development unless you obtain a commercial license from TestSprite.

# MQ Studio
MQ Studio is a living, digital studio for Professor Moura Quayle. It's designed as a space where governance papers, watercolours, calligraphy, and musings coexist, reflecting an interconnected practice of thinking, feeling, and doing.

## Implemented Features (Current Checkpoint)
This repository contains the initial build of the MQ Studio website with the following core features implemented:

*   **HeroToday Block**: The homepage features a dynamic "Today in MQ Studio" hero section. It displays the latest artwork, publication, and musing, providing a snapshot of current work and offering three themed entry points into the site: "Thinking," "Feeling," and "Doing."

*   **Marginalia Component**: To echo the voice of David Fushtey, a responsive `Marginalia` component displays his quotes as side annotations on relevant pages (like "About" and "Publications"). On desktop, these appear in a right-hand rail; on mobile, they reflow as distinct callout blocks.

*   **Musings Audio Player**: Musings that include an `audioUrl` are automatically rendered with a custom, accessible audio player, complete with play/pause controls, a scrubbable progress bar, and time indicators. An analytics event (`musing_play`) is tracked on playback.

*   **Filterable Publications**: The "Publications" page features a dynamic tag filtering system. All content tags are aggregated into a set of interactive buttons that allow users to filter the list of publications.

*   **Accessibility Focus Ring**: To ensure a clear and accessible experience for keyboard users, all interactive elements (`buttons`, `links`, etc.) have a distinct, high-contrast focus ring that appears on `:focus-visible`.

## Design System
The front-end is built upon a flexible design system defined by CSS custom properties (variables).

### Color Tokens
The color palette is defined in `:root` in `index.html`.
| Variable                | Light Mode | Description                     |
| ----------------------- | ---------- | ------------------------------- |
| `--background`          | `#FDFCF8`  | Rice Paper (Primary background) |
| `--foreground`          | `#1A1A1A`  | Ink Black (Primary text)        |
| `--primary`             | `#00A8A8`  | Moura Teal (Primary interactive)|
| `--secondary`           | `#2C5985`  | Scholar Blue (Headings, "Thinking") |
| `--accent`              | `#E91E63`  | Living Pink ("Feeling")         |
| `--muted`               | `#FFF8F0`  | Studio Cream (Card backgrounds) |
| `--muted-foreground`    | `#4A4A4A`  | Charcoal Wash (Body text)       |
| `--destructive`         | `#8D2305`  | Shufa Red (Signature moments)   |
| `--border`              | `#D8D5CC`  | Light Gray (Borders, dividers)  |
| `--ring`                | `#00A8A8`  | Moura Teal (Focus ring color)   |
| `--accent-seasonal`     | (dynamic)  | Varies by system date (Yellow, Coral, Violet, or Blue) |

### Typography
*   **Headings & Navigation**: `Montserrat`
*   **Body Text**: `Lora`

### Layout
*   **Grid**: The layout is responsive, built on a flexible grid system. Components like the artwork gallery adapt from a single column on mobile to four columns on large desktops.
*   **Sizing**: A base radius of `8px` (`--radius`) is used for rounded corners on cards, buttons, and other elements.
*   **Texture**: The site background uses a subtle, cold-press watercolor paper texture to enhance the "studio" fee
# Deployment trigger
