# dev-env CLI Usage Guide

## General Usage

The dev-env CLI follows a consistent pattern:

```
dev-env COMMAND [options]
```

## Available Commands

### initialize-project

Creates a new project with standardized structure based on the project template.

```bash
dev-env initialize-project NAME [options]
```

Options:
- `--type TYPE` - Project type (infra, clients, products, experiments, web)
- `--github` - Initialize and push to GitHub repository
- `--public` - Make GitHub repository public (if --github is used)

Example:
```bash
dev-env initialize-project my-new-app --type products --github
```

This creates a new project in the products category with:
- Standard folder structure (docs/, scripts/, workflows/, assets/)
- README.md and manifest.md files
- Git initialization
- GitHub repository creation and push

### move-artifacts

Move artifacts between projects or locations.

```bash
dev-env move-artifacts SOURCE DESTINATION [options]
```

Options:
- `--type TYPE` - Artifact type (file or directory), default: file
- `--no-backup` - Skip creating backup of existing destination

Example:
```bash
dev-env move-artifacts ~/code/web/project1/docs/architecture.md ~/code/infra/docs/
```

### update-prompts

Update AI assistant prompt templates.

```bash
dev-env update-prompts [options]
```

Options:
- `--project PATH` - Target project to update prompts for
- `--all` - Update prompts for all projects
- `--prompt NAME` - Specific prompt template to update
- `--list` - List available prompt templates

Example:
```bash
dev-env update-prompts --project ~/code/web/my-project --prompt new-session-context-prompt
```

### validate-environment

Check environment configuration for compliance with standards.

```bash
dev-env validate-environment [options]
```

Options:
- `--skip-wsl` - Skip WSL environment checks
- `--skip-git` - Skip Git configuration checks
- `--skip-node` - Skip Node.js installation checks
- `--skip-docker` - Skip Docker installation checks
- `--skip-firebase` - Skip Firebase CLI checks
- `--skip-vscode` - Skip VS Code configuration checks
- `--verbose` - Show detailed check information
- `--no-fixes` - Don't show suggested fixes for issues

Example:
```bash
dev-env validate-environment --verbose
```

### backup

Create backups of projects or configurations.

```bash
dev-env backup [options]
```

Options:
- `--target PATH` - Project or configuration to backup
- `--type TYPE` - Backup type (project, config, all), default: project
- `--backup-dir DIR` - Directory to store backups, default: ~/dev-env-backups
- `--include-deps` - Include node_modules and other dependencies
- `--no-compress` - Skip compression of backup files

Example:
```bash
dev-env backup --target ~/code/web/my-project
```
