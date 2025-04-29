# Development Environment CLI

A command-line interface tool for managing and optimizing the development environment.

## Installation

```bash
# Clone the repository
git clone <repository_url> dev-env
cd dev-env

# Run the installation script
./install.sh

# Restart your terminal or run
source ~/.bashrc
```

## Available Commands

- `initialize-project` - Create a new project with standardized structure
- `move-artifacts` - Move artifacts between projects or locations
- `update-prompts` - Update AI assistant prompt templates
- `validate-environment` - Check environment configuration
- `backup` - Create backups of projects or configurations

## Usage

```bash
# Show general help
dev-env --help

# Show command-specific help
dev-env initialize-project --help

# Create a new project
dev-env initialize-project my-new-app --type web

# Create a new project and push to GitHub
dev-env initialize-project my-new-app --type products --github
```

## Documentation

See the `docs/` directory for detailed documentation on each command.
