# Gemini Project Context: MQ Studio

## Project Overview

This is a Next.js and TypeScript project for "MQ Studio," a digital studio for Professor Moura Quayle. The website showcases her work, including governance papers, watercolours, calligraphy, and musings. The project is set up for development within a VS Code Dev Container, ensuring a consistent development environment.

The frontend is built with React and styled using Tailwind CSS, following a defined design system with specific color tokens, typography, and layout conventions.

## Building and Running

### Key Commands

*   **Run the development server:**
    ```bash
    npm run dev
    ```

*   **Build the application for production:**
    ```bash
    npm run build
    ```

*   **Start the production server:**
    ```bash
    npm run start
    ```

*   **Run linter:**
    ```bash
    npm run lint
    ```

### Testing

*   **Run all tests:**
    ```bash
    npm run test:all
    ```

*   **Run unit tests:**
    ```bash
    npm run test:unit
    ```

*   **Run end-to-end tests:**
    ```bash
    npm run test:e2e
    ```

*   **Run Stagehand tests:**
    ```bash
    npm run test:stagehand
    ```

## Development Conventions

### Tech Stack

*   **Frontend:** Next.js, React, TypeScript
*   **Styling:** Tailwind CSS
*   **Development Environment:** VS Code Dev Container with Node.js 20 and Python 3.11

### Design System

The project follows a design system with the following conventions:

*   **Colors:** A specific color palette is defined as CSS custom properties. Key colors include Rice Paper (`--background`), Ink Black (`--foreground`), and Moura Teal (`--primary`).
*   **Typography:**
    *   Headings & Navigation: `Montserrat`
    *   Body Text: `Lora`
*   **Layout:** The site uses a responsive grid system and a base radius of `8px` for rounded corners.

### Testing

The project has a comprehensive testing setup that includes:

*   **Unit tests:** Written with Jest and React Testing Library.
*   **End-to-end tests:** Using Playwright.
*   **Stagehand tests:** For automated browser-based testing.
