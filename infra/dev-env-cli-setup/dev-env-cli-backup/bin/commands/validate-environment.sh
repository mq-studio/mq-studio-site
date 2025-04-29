#!/bin/bash

# validate-environment - Check environment configuration
# Part of dev-env CLI

# Default values
CHECK_WSL=true
CHECK_GIT=true
CHECK_NODE=true
CHECK_DOCKER=true
CHECK_FIREBASE=true
CHECK_VSCODE=true
VERBOSE=false
SHOW_FIXES=true

# Display help information
show_help() {
  echo "dev-env validate-environment - Check environment configuration"
  echo ""
  echo "Usage: dev-env validate-environment [options]"
  echo ""
  echo "Options:"
  echo "  --skip-wsl         Skip WSL environment checks"
  echo "  --skip-git         Skip Git configuration checks"
  echo "  --skip-node        Skip Node.js installation checks"
  echo "  --skip-docker      Skip Docker installation checks"
  echo "  --skip-firebase    Skip Firebase CLI checks"
  echo "  --skip-vscode      Skip VS Code configuration checks"
  echo "  --verbose          Show detailed check information"
  echo "  --no-fixes         Don't show suggested fixes for issues"
  echo "  --help             Show this help message"
  echo ""
  echo "Examples:"
  echo "  dev-env validate-environment"
  echo "  dev-env validate-environment --verbose --skip-docker"
}

# Check if help requested
if [ "$1" == "--help" ]; then
  show_help
  exit 0
fi

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)
      show_help
      exit 0
      ;;
    --skip-wsl)
      CHECK_WSL=false
      shift
      ;;
    --skip-git)
      CHECK_GIT=false
      shift
      ;;
    --skip-node)
      CHECK_NODE=false
      shift
      ;;
    --skip-docker)
      CHECK_DOCKER=false
      shift
      ;;
    --skip-firebase)
      CHECK_FIREBASE=false
      shift
      ;;
    --skip-vscode)
      CHECK_VSCODE=false
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --no-fixes)
      SHOW_FIXES=false
      shift
      ;;
    *)
      echo "Error: Unexpected argument '$1'"
      show_help
      exit 1
      ;;
  esac
done

# Variables to track status
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run a check
run_check() {
  local name="$1"
  local command="$2"
  local expected_status="$3"
  local fix="$4"
  
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  echo -n "Checking $name... "
  
  # Run the command
  eval "$command" > /dev/null 2>&1
  local status=$?
  
  # Check if the status matches the expected status
  if [ $status -eq $expected_status ]; then
    echo "✅ Passed"
    if [ "$VERBOSE" = true ]; then
      echo "  Command: $command"
    fi
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    echo "❌ Failed"
    if [ "$VERBOSE" = true ]; then
      echo "  Command: $command"
      echo "  Expected status: $expected_status, got: $status"
    fi
    if [ "$SHOW_FIXES" = true ] && [ -n "$fix" ]; then
      echo "  Fix: $fix"
    fi
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  fi
}

echo "Starting environment validation..."

if [ "$CHECK_WSL" = true ]; then
  echo "--- WSL Checks ---"
  
  run_check "WSL version" "wsl --status | grep -q 'WSL 2'" 0 "Update to WSL 2 with 'wsl --set-default-version 2'"
  
  run_check "Ubuntu distribution" "grep -q 'Ubuntu' /etc/os-release" 0 "Install Ubuntu distribution from the Microsoft Store"
  
  run_check "WSL filesystem" "mount | grep -q '/dev/sdb.*on / type ext4'" 0 "Your WSL filesystem might be using a virtual hard disk. This is usually fine."
  
  run_check "OneDrive location" "mount | grep -q 'OneDrive'" 1 "Consider moving WSL to a non-OneDrive location for better performance"
  
  run_check "WSL integration in Docker Desktop" "grep -q 'WSL INTEGRATION' ~/.docker/config.json 2>/dev/null || grep -q 'wsl' ~/.docker/daemon.json 2>/dev/null" 0 "Enable WSL integration in Docker Desktop settings"
fi

if [ "$CHECK_GIT" = true ]; then
  echo "--- Git Checks ---"
  
  run_check "Git installation" "command -v git" 0 "Install Git with 'sudo apt update && sudo apt install -y git'"
  
  run_check "Git user name" "git config --get user.name" 0 "Set Git user name with 'git config --global user.name \"Your Name\"'"
  
  run_check "Git user email" "git config --get user.email" 0 "Set Git user email with 'git config --global user.email \"your.email@example.com\"'"
  
  run_check "GitHub CLI installation" "command -v gh" 0 "Install GitHub CLI: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
  
  run_check "GitHub authentication" "gh auth status" 0 "Authenticate to GitHub with 'gh auth login'"
fi

if [ "$CHECK_NODE" = true ]; then
  echo "--- Node.js Checks ---"
  
  run_check "Node.js installation" "command -v node" 0 "Install Node.js with 'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs'"
  
  run_check "npm installation" "command -v npm" 0 "Install npm with 'sudo apt install -y npm'"
  
  run_check "Node version (>= 16)" "node -v | grep -E 'v1[6-9]|v[2-9][0-9]'" 0 "Update Node.js to v16 or later"
  
  run_check "npm version (>= 7)" "npm -v | grep -E '^[7-9]|^[1-9][0-9]'" 0 "Update npm with 'npm install -g npm@latest'"
fi

if [ "$CHECK_DOCKER" = true ]; then
  echo "--- Docker Checks ---"
  
  run_check "Docker installation" "command -v docker" 0 "Install Docker Desktop for Windows and enable WSL integration"
  
  run_check "Docker running" "docker info" 0 "Start Docker Desktop application"
  
  run_check "Docker Compose installation" "command -v docker-compose" 0 "Install Docker Compose with 'sudo apt install -y docker-compose'"
  
  run_check "Docker permissions" "docker ps" 0 "Add your user to the docker group with 'sudo usermod -aG docker $USER' and restart your terminal"
fi

if [ "$CHECK_FIREBASE" = true ]; then
  echo "--- Firebase Checks ---"
  
  run_check "Firebase CLI installation" "command -v firebase" 0 "Install Firebase CLI with 'npm install -g firebase-tools'"
  
  run_check "Firebase login" "firebase projects:list" 0 "Log in to Firebase with 'firebase login'"
  
  run_check "Firebase version (>= 9)" "firebase --version | grep -E '^9|^[1-9][0-9]'" 0 "Update Firebase CLI with 'npm install -g firebase-tools@latest'"
fi

if [ "$CHECK_VSCODE" = true ]; then
  echo "--- VS Code Checks ---"
  
  run_check "VS Code installation" "command -v code" 0 "Install VS Code and add it to PATH: https://code.visualstudio.com/docs/setup/linux#_path-setup"
  
  run_check "Remote WSL extension" "grep -q 'ms-vscode-remote.remote-wsl' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'Remote - WSL' extension in VS Code"
  
  run_check "ESLint extension" "grep -q 'dbaeumer.vscode-eslint' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'ESLint' extension in VS Code"
  
  run_check "Prettier extension" "grep -q 'esbenp.prettier-vscode' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'Prettier' extension in VS Code"
  
  run_check "GitHub Pull Requests extension" "grep -q 'github.vscode-pull-request-github' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'GitHub Pull Requests and Issues' extension in VS Code"
fi

# Print summary
echo ""
echo "=== Validation Summary ==="
echo "Total checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"

if [ $FAILED_CHECKS -eq 0 ]; then
  echo "✅ All checks passed! Your environment is correctly configured."
  exit 0
else
  echo "❌ Some checks failed. Please address the issues above."
  exit 1
fi
