# SpecKit Installation Script

A reusable script to install GitHub's Spec-Driven Development toolkit in any project.

## Prerequisites

- **uvx** (part of uv package manager)
  ```bash
  pip install uv
  ```
- **git** (optional, but recommended)

## Installation

1. Download the script to your project:
```bash
curl -O https://raw.githubusercontent.com/YOUR_REPO/main/install-speckit.sh
chmod +x install-speckit.sh
```

Or copy it manually to your project root.

2. Run the installation:
```bash
./install-speckit.sh
```

## Usage Options

### Basic Installation
```bash
./install-speckit.sh
```
Interactive mode - prompts for AI assistant choice

### Specify AI Assistant
```bash
./install-speckit.sh --ai claude    # For Claude Code
./install-speckit.sh --ai copilot   # For GitHub Copilot  
./install-speckit.sh --ai gemini    # For Gemini CLI
```

### Skip Git Check
```bash
./install-speckit.sh --skip-git-check
```
Use when installing in non-git directories

### Keep Files on Error
```bash
./install-speckit.sh --no-cleanup
```
Useful for debugging installation issues

## What Gets Installed

```
your-project/
├── .claude/
│   └── commands/
│       ├── specify.md    # /specify command template
│       ├── plan.md       # /plan command template
│       └── tasks.md      # /tasks command template
├── scripts/
│   ├── create-new-feature.sh
│   ├── setup-plan.sh
│   └── (other utility scripts)
├── templates/
│   ├── spec-template.md
│   ├── plan-template.md
│   └── tasks-template.md
└── memory/
    └── constitution.md   # Project principles template
```

## Features

### Auto-Detection
- Detects existing AI assistant setup
- Identifies if SpecKit is already installed
- Checks for git repository

### Backup System
- Automatically backs up existing SpecKit files before reinstall
- Creates timestamped backup directories
- Preserves your customizations

### Validation
- Verifies all required files are installed
- Tests script executability
- Reports any missing components

### Git Integration
- Optional git commit after installation
- Updates .gitignore automatically
- Works with or without git

## Post-Installation

After installation, you can:

1. **Use in Claude Code** (or your AI assistant):
   - Type `/specify` to create a new feature specification
   - Type `/plan` to generate an implementation plan
   - Type `/tasks` to create task breakdowns

2. **Use Scripts Directly**:
   ```bash
   ./scripts/create-new-feature.sh "User authentication system"
   ```

3. **Customize Templates**:
   - Edit files in `templates/` to match your workflow
   - Update `memory/constitution.md` with project principles

## Troubleshooting

### "uvx not found"
Install uv package manager:
```bash
pip install uv
```

### "Permission denied"
Make the script executable:
```bash
chmod +x install-speckit.sh
```

### Installation fails with "inappropriate ioctl"
The script needs to run non-interactively. Use:
```bash
./install-speckit.sh --ai claude  # Specify AI directly
```

### Scripts don't execute
Ensure scripts have execute permissions:
```bash
chmod +x scripts/*.sh
```

## Lessons Learned

This script was created based on real-world installation experience and handles:

1. **The uvx interactive menu issue** - By allowing --ai parameter
2. **Directory structure problems** - By copying files to root instead of subdirectory
3. **Git integration** - Making commits optional but suggested
4. **Existing installations** - With backup and restore capabilities
5. **Validation** - Ensuring everything works before declaring success

## Compatibility

- ✅ Linux (including WSL2)
- ✅ macOS
- ✅ Works with Claude Code, GitHub Copilot, and Gemini CLI
- ✅ Git repositories and standalone projects

## License

This installation script is provided as-is for use with the SpecKit toolkit from GitHub.