#!/bin/bash

# SpecKit Installation Script
# Installs GitHub's Spec-Driven Development toolkit in any project
# Usage: ./install-speckit.sh [--ai claude|gemini|copilot]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
AI_ASSISTANT=""
SKIP_GIT_CHECK=false
CLEANUP_ON_ERROR=true

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect AI assistant if not specified
detect_ai_assistant() {
    if [ -d ".claude" ] && [ -f ".claude/commands/specify.md" ]; then
        echo "claude"
    elif [ -f ".github/copilot-instructions.md" ]; then
        echo "copilot"
    elif [ -f "GEMINI.md" ]; then
        echo "gemini"
    else
        echo ""
    fi
}

# Cleanup function
cleanup() {
    if [ "$CLEANUP_ON_ERROR" = true ]; then
        print_warning "Cleaning up temporary files..."
        rm -rf speckit-temp website-mq-studio 2>/dev/null || true
    fi
}

# Set trap for cleanup on error
trap cleanup EXIT

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --ai)
            AI_ASSISTANT="$2"
            shift 2
            ;;
        --skip-git-check)
            SKIP_GIT_CHECK=true
            shift
            ;;
        --no-cleanup)
            CLEANUP_ON_ERROR=false
            shift
            ;;
        --help|-h)
            echo "SpecKit Installation Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --ai <assistant>    Specify AI assistant (claude, gemini, copilot)"
            echo "  --skip-git-check    Skip git repository check"
            echo "  --no-cleanup        Don't cleanup on error"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Example:"
            echo "  $0 --ai claude"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Header
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     SpecKit Installation Script          ║"
echo "║     Spec-Driven Development Toolkit      ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

# Check for uvx
if ! command_exists uvx; then
    print_error "uvx is not installed. Please install it first:"
    echo "  - On Ubuntu/Debian: pip install uv"
    echo "  - Or visit: https://github.com/astral-sh/uv"
    exit 1
fi

# Check for git (unless skipped)
if [ "$SKIP_GIT_CHECK" = false ]; then
    if ! command_exists git; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    # Check if in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_warning "Not in a git repository. Initialize one? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            git init
            print_success "Git repository initialized"
        else
            print_warning "Proceeding without git initialization"
        fi
    fi
fi

# Detect or confirm AI assistant
if [ -z "$AI_ASSISTANT" ]; then
    detected_ai=$(detect_ai_assistant)
    if [ -n "$detected_ai" ]; then
        print_status "Detected existing $detected_ai setup"
        AI_ASSISTANT="$detected_ai"
    else
        print_status "Please select your AI assistant:"
        echo "  1) Claude Code"
        echo "  2) GitHub Copilot"
        echo "  3) Gemini CLI"
        read -p "Enter choice (1-3): " choice
        case $choice in
            1) AI_ASSISTANT="claude" ;;
            2) AI_ASSISTANT="copilot" ;;
            3) AI_ASSISTANT="gemini" ;;
            *) 
                print_error "Invalid choice"
                exit 1
                ;;
        esac
    fi
fi

print_status "Using AI assistant: $AI_ASSISTANT"

# Get project name (use current directory name if not provided)
PROJECT_NAME=$(basename "$PWD")
print_status "Project name: $PROJECT_NAME"

# Check if SpecKit is already installed
if [ -d ".claude/commands" ] && [ -f ".claude/commands/specify.md" ]; then
    print_warning "SpecKit appears to be already installed."
    read -p "Reinstall? This will overwrite existing SpecKit files (y/n): " response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Installation cancelled"
        exit 0
    fi
fi

# Create backup of existing SpecKit files if they exist
if [ -d ".claude/commands" ] || [ -d "scripts" ] || [ -d "templates" ]; then
    BACKUP_DIR="speckit-backup-$(date +%Y%m%d-%H%M%S)"
    print_status "Backing up existing files to $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    [ -d ".claude/commands" ] && cp -r .claude/commands "$BACKUP_DIR/" 2>/dev/null || true
    [ -d "scripts" ] && cp -r scripts "$BACKUP_DIR/" 2>/dev/null || true
    [ -d "templates" ] && cp -r templates "$BACKUP_DIR/" 2>/dev/null || true
    [ -d "memory" ] && cp -r memory "$BACKUP_DIR/" 2>/dev/null || true
    print_success "Backup created at $BACKUP_DIR"
fi

# Install SpecKit
print_status "Installing SpecKit from GitHub..."

# Create temporary directory for installation
TEMP_DIR="speckit-temp-$$"

# Run uvx to initialize SpecKit
if ! uvx --from git+https://github.com/github/spec-kit.git specify init "$TEMP_DIR" --ai "$AI_ASSISTANT" 2>&1 | while IFS= read -r line; do
    echo "$line"
    if [[ "$line" == *"ERROR"* ]]; then
        exit 1
    fi
done; then
    print_error "Failed to initialize SpecKit"
    exit 1
fi

# Check if temporary directory was created
if [ ! -d "$TEMP_DIR" ]; then
    print_error "SpecKit initialization failed - directory not created"
    exit 1
fi

# Create necessary directories if they don't exist
print_status "Setting up project structure..."
mkdir -p .claude/commands scripts templates memory

# Copy SpecKit files to project root
print_status "Copying SpecKit files..."

# Copy command files
if [ -d "$TEMP_DIR/.claude/commands" ]; then
    cp -r "$TEMP_DIR/.claude/commands/"* .claude/commands/ 2>/dev/null || true
    print_success "Command templates installed"
fi

# Copy scripts
if [ -d "$TEMP_DIR/scripts" ]; then
    cp -r "$TEMP_DIR/scripts/"* scripts/ 2>/dev/null || true
    chmod +x scripts/*.sh 2>/dev/null || true
    print_success "Scripts installed and made executable"
fi

# Copy templates
if [ -d "$TEMP_DIR/templates" ]; then
    cp -r "$TEMP_DIR/templates/"* templates/ 2>/dev/null || true
    print_success "Templates installed"
fi

# Copy memory files
if [ -d "$TEMP_DIR/memory" ]; then
    cp -r "$TEMP_DIR/memory/"* memory/ 2>/dev/null || true
    print_success "Memory files installed"
fi

# Clean up temporary directory
rm -rf "$TEMP_DIR"

# Update .gitignore if it exists
if [ -f ".gitignore" ]; then
    print_status "Updating .gitignore..."
    
    # Add SpecKit entries if not already present
    if ! grep -q "# SpecKit" .gitignore 2>/dev/null; then
        echo "" >> .gitignore
        echo "# SpecKit" >> .gitignore
        echo "speckit-backup-*/" >> .gitignore
        echo "speckit-temp*/" >> .gitignore
        print_success ".gitignore updated"
    fi
fi

# Create initial constitution if it doesn't exist
if [ ! -f "memory/constitution.md" ]; then
    print_status "Creating initial constitution..."
    cat > memory/constitution.md << 'EOF'
# Project Constitution

## Core Principles
1. Simplicity over complexity
2. User needs drive development
3. Maintainability is non-negotiable
4. Performance matters
5. Accessibility is required

## Development Standards
- Write clear, self-documenting code
- Test critical paths
- Document decisions
- Review before merge

## Architecture Decisions
- [Add your project-specific decisions here]

---
*Update this constitution as your project evolves*
EOF
    print_success "Constitution template created"
fi

# Validate installation
print_status "Validating installation..."

VALIDATION_PASSED=true

# Check for required files
REQUIRED_FILES=(
    ".claude/commands/specify.md"
    ".claude/commands/plan.md"
    ".claude/commands/tasks.md"
    "scripts/create-new-feature.sh"
    "scripts/setup-plan.sh"
    "templates/spec-template.md"
    "templates/plan-template.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Missing required file: $file"
        VALIDATION_PASSED=false
    fi
done

# Test script execution
if [ -f "scripts/create-new-feature.sh" ]; then
    if ! bash scripts/create-new-feature.sh --help >/dev/null 2>&1; then
        print_warning "Feature creation script may need configuration"
    fi
fi

# Final status
echo ""
if [ "$VALIDATION_PASSED" = true ]; then
    print_success "SpecKit installation completed successfully!"
    echo ""
    echo "╔══════════════════════════════════════════════╗"
    echo "║              Next Steps                      ║"
    echo "╚══════════════════════════════════════════════╝"
    echo ""
    echo "1. Open this project in your AI assistant ($AI_ASSISTANT)"
    echo "2. Use these commands to start spec-driven development:"
    echo "   • /specify - Create a new feature specification"
    echo "   • /plan - Generate implementation plan from spec"
    echo "   • /tasks - Create task breakdown from plan"
    echo ""
    echo "3. Update memory/constitution.md with your project principles"
    echo ""
    echo "Example workflow:"
    echo "  /specify Create a user authentication system"
    echo ""
    
    # Offer to commit changes
    if [ "$SKIP_GIT_CHECK" = false ] && git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Would you like to commit the SpecKit installation? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            git add -A
            git commit -m "Install SpecKit for spec-driven development

- Add Claude/Gemini/Copilot command templates
- Install feature creation scripts
- Set up project templates
- Initialize project constitution

Installed via install-speckit.sh" || true
            print_success "Changes committed to git"
        fi
    fi
else
    print_error "Installation completed with errors. Please check the output above."
    exit 1
fi

# Clear the trap
trap - EXIT