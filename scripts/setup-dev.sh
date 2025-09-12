#!/bin/bash

# 🛠️  ZenMachine Development Environment Setup
# This script sets up the complete development environment

set -e  # Exit on error

echo "🧘 Setting up ZenMachine Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="Linux"
else
    print_error "Unsupported platform: $OSTYPE"
    exit 1
fi

print_status "Detected platform: $PLATFORM"

# Check Node.js version
check_node() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        print_warning "Please install Node.js 20.11+ from https://nodejs.org"
        return 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="20.11.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        print_success "Node.js version $NODE_VERSION is compatible"
    else
        print_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+"
        return 1
    fi
}

# Check npm version
check_npm() {
    print_status "Checking npm version..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        return 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version $NPM_VERSION found"
}

# Install global dependencies
install_global_deps() {
    print_status "Installing global dependencies..."
    
    # Check if Angular CLI is installed
    if ! command -v ng &> /dev/null; then
        print_status "Installing Angular CLI..."
        npm install -g @angular/cli@20
    else
        print_success "Angular CLI already installed"
    fi
    
    # Check if other global tools are installed
    if ! command -v lighthouse &> /dev/null; then
        print_status "Installing Lighthouse..."
        npm install -g lighthouse
    fi
    
    if ! command -v @lhci/cli &> /dev/null; then
        print_status "Installing Lighthouse CI..."
        npm install -g @lhci/cli@0.12.x
    fi
}

# Install project dependencies
install_project_deps() {
    print_status "Installing project dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Project dependencies installed"
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        # Install husky
        npm run prepare
        
        # Make hook files executable
        if [ -f ".husky/pre-commit" ]; then
            chmod +x .husky/pre-commit
        fi
        
        if [ -f ".husky/pre-push" ]; then
            chmod +x .husky/pre-push
        fi
        
        print_success "Git hooks configured"
    else
        print_warning "Not in a Git repository, skipping Git hooks setup"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p coverage
    mkdir -p dist
    mkdir -p test-results
    mkdir -p lighthouse/reports
    mkdir -p logs
    
    print_success "Directories created"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Create development environment file if it doesn't exist
    if [ ! -f "src/environments/environment.development.ts" ]; then
        cat > src/environments/environment.development.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  monitoring: {
    enabled: false,
    sentry: {
      dsn: '',
    },
  },
  security: {
    enableCSP: true,
    allowedDomains: ['localhost:4200', 'api.jamendo.com', 'api.picsum.photos'],
  },
};
EOF
        print_success "Development environment file created"
    fi
    
    # Create local environment file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# Local development environment variables
NODE_ENV=development
ENABLE_DEBUG=true
ENABLE_MONITORING=false

# API Configuration
API_BASE_URL=http://localhost:3000
JAMENDO_API_URL=https://api.jamendo.com/v3.0
PICSUM_API_URL=https://api.picsum.photos

# Security Configuration
ENABLE_CSP=true
ENABLE_SECURITY_HEADERS=true

# Development Tools
ENABLE_DEVTOOLS=true
ENABLE_PERFORMANCE_MONITORING=true
EOF
        print_success "Local environment file created"
    fi
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if build works
    print_status "Testing build..."
    if npm run build > /dev/null 2>&1; then
        print_success "Build test passed"
    else
        print_error "Build test failed"
        return 1
    fi
    
    # Check if tests work
    print_status "Testing unit tests..."
    if npm run test:unit > /dev/null 2>&1; then
        print_success "Unit test configuration verified"
    else
        print_warning "Unit tests may need configuration"
    fi
    
    # Check if linting works
    print_status "Testing linting..."
    if npm run lint > /dev/null 2>&1; then
        print_success "Linting configuration verified"
    else
        print_warning "Linting may need configuration"
    fi
}

# Setup Docker (if available)
setup_docker() {
    if command -v docker &> /dev/null; then
        print_status "Docker detected, setting up development container..."
        
        # Build development image
        if docker build -f Dockerfile.dev -t zenmachine:dev . > /dev/null 2>&1; then
            print_success "Docker development image built"
        else
            print_warning "Docker image build failed"
        fi
    else
        print_warning "Docker not found, skipping container setup"
    fi
}

# Main execution
main() {
    echo "🚀 Starting development environment setup..."
    echo ""
    
    # Pre-flight checks
    check_node || exit 1
    check_npm || exit 1
    
    # Installation steps
    install_global_deps
    install_project_deps
    setup_git_hooks
    create_directories
    setup_environment
    setup_docker
    
    # Verification
    verify_installation
    
    echo ""
    print_success "🎉 Development environment setup complete!"
    echo ""
    print_status "You can now start development with:"
    echo "  npm run start          # Start development server"
    echo "  npm run test:unit      # Run unit tests"
    echo "  npm run test:e2e       # Run E2E tests"
    echo "  npm run lint           # Run linting"
    echo "  npm run build          # Build for production"
    echo ""
    print_status "For Docker development:"
    echo "  docker-compose up zenmachine-dev"
    echo ""
    print_status "Happy coding! 🧘‍♂️"
}

# Run main function
main "$@"