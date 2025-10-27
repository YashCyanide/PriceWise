#!/bin/bash

# PriceWise - Automated Setup Script
# This script automates the setup process for the PriceWise application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Minimum required versions
MIN_NODE_VERSION="18.17.0"
MIN_NPM_VERSION="9.0.0"

# Print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Version comparison function
version_compare() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js installation and version
check_node() {
    print_header "Checking Node.js Installation"
    
    if command_exists node; then
        NODE_VERSION=$(node -v | sed 's/v//')
        print_info "Found Node.js version: $NODE_VERSION"
        
        if version_compare "$NODE_VERSION" "$MIN_NODE_VERSION"; then
            print_success "Node.js version is sufficient"
            return 0
        else
            print_warning "Node.js version $NODE_VERSION is below minimum required version $MIN_NODE_VERSION"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Check npm installation and version
check_npm() {
    print_header "Checking npm Installation"
    
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        print_info "Found npm version: $NPM_VERSION"
        
        if version_compare "$NPM_VERSION" "$MIN_NPM_VERSION"; then
            print_success "npm version is sufficient"
            return 0
        else
            print_warning "npm version $NPM_VERSION is below minimum required version $MIN_NPM_VERSION"
            return 1
        fi
    else
        print_error "npm is not installed"
        return 1
    fi
}

# Check Git installation
check_git() {
    print_header "Checking Git Installation"
    
    if command_exists git; then
        GIT_VERSION=$(git --version | awk '{print $3}')
        print_success "Git is installed (version: $GIT_VERSION)"
        return 0
    else
        print_error "Git is not installed"
        return 1
    fi
}

# Install Node.js (if needed)
install_node() {
    print_header "Installing Node.js"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Detected Linux system"
        print_info "Installing Node.js via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Detected macOS system"
        if command_exists brew; then
            print_info "Installing Node.js via Homebrew..."
            brew install node@18
        else
            print_error "Homebrew not found. Please install from https://brew.sh/"
            exit 1
        fi
    else
        print_error "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
    
    print_success "Node.js installed successfully"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Project Dependencies"
    
    if [ -f "package.json" ]; then
        print_info "Running npm install..."
        npm install
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_header "Setting Up Environment Variables"
    
    if [ -f ".env" ]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping .env setup"
            return 0
        fi
    fi
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    else
        print_info "Creating new .env file..."
        cat > .env << 'EOF'
# MongoDB Configuration
MONGODB_URI=

# BrightData Proxy Configuration
BRIGHT_DATA_USERNAME=
BRIGHT_DATA_PASSWORD=

# Email Configuration
EMAIL_USER=
EMAIL_PASSWORD=

# Optional: Hugging Face Token
HF_TOKEN=
EOF
        print_success "Created .env file template"
    fi
    
    print_warning "Please edit .env file and add your credentials"
    print_info "Required variables: MONGODB_URI, BRIGHT_DATA_USERNAME, BRIGHT_DATA_PASSWORD, EMAIL_USER, EMAIL_PASSWORD"
}

# Verify environment variables
verify_env() {
    print_header "Verifying Environment Configuration"
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found"
        return 1
    fi
    
    source .env 2>/dev/null || true
    
    local all_set=true
    
    if [ -z "$MONGODB_URI" ]; then
        print_error "MONGODB_URI is not set"
        all_set=false
    else
        print_success "MONGODB_URI is set"
    fi
    
    if [ -z "$BRIGHT_DATA_USERNAME" ]; then
        print_error "BRIGHT_DATA_USERNAME is not set"
        all_set=false
    else
        print_success "BRIGHT_DATA_USERNAME is set"
    fi
    
    if [ -z "$BRIGHT_DATA_PASSWORD" ]; then
        print_error "BRIGHT_DATA_PASSWORD is not set"
        all_set=false
    else
        print_success "BRIGHT_DATA_PASSWORD is set"
    fi
    
    if [ -z "$EMAIL_USER" ]; then
        print_error "EMAIL_USER is not set"
        all_set=false
    else
        print_success "EMAIL_USER is set"
    fi
    
    if [ -z "$EMAIL_PASSWORD" ]; then
        print_error "EMAIL_PASSWORD is not set"
        all_set=false
    else
        print_success "EMAIL_PASSWORD is set"
    fi
    
    if [ "$all_set" = false ]; then
        print_warning "Some environment variables are missing. Please update .env file"
        return 1
    fi
    
    print_success "All required environment variables are set"
    return 0
}

# Test MongoDB connection
test_mongodb() {
    print_header "Testing MongoDB Connection"
    
    if [ -z "$MONGODB_URI" ]; then
        print_warning "MONGODB_URI not set, skipping connection test"
        return 0
    fi
    
    print_info "Testing MongoDB connection..."
    
    node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✓ MongoDB connection successful');
            process.exit(0);
        })
        .catch((err) => {
            console.error('✗ MongoDB connection failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null && print_success "MongoDB connection successful" || print_warning "MongoDB connection failed (check credentials)"
}

# Build the project
build_project() {
    print_header "Building Project"
    
    print_info "Running build..."
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_warning "Build failed, but you can still run in development mode"
    fi
}

# Print next steps
print_next_steps() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}Your PriceWise application is ready!${NC}\n"
    echo -e "Next steps:"
    echo -e "  1. ${YELLOW}Edit .env file${NC} with your credentials (if not done already)"
    echo -e "     Required: MONGODB_URI, BRIGHT_DATA credentials, EMAIL credentials"
    echo -e ""
    echo -e "  2. ${YELLOW}Start development server:${NC}"
    echo -e "     ${BLUE}npm run dev${NC}"
    echo -e ""
    echo -e "  3. ${YELLOW}Open your browser:${NC}"
    echo -e "     ${BLUE}http://localhost:3000${NC}"
    echo -e ""
    echo -e "  4. ${YELLOW}Test the application:${NC}"
    echo -e "     - Paste an Amazon product URL"
    echo -e "     - Click 'Track' to start tracking"
    echo -e "     - Check your email for notifications"
    echo -e ""
    echo -e "For detailed setup instructions, see: ${BLUE}LOCAL_SETUP.md${NC}"
    echo -e ""
    print_success "Happy tracking! 🚀"
}

# Main setup flow
main() {
    clear
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║   PriceWise - Automated Setup         ║"
    echo "║   Amazon Price Tracker                ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Check prerequisites
    local need_install=false
    
    if ! check_node || ! check_npm; then
        need_install=true
        read -p "Would you like to install/update Node.js? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_node
        else
            print_error "Node.js is required. Please install manually and run this script again."
            exit 1
        fi
    fi
    
    check_git || print_warning "Git is not installed. Some features may not work."
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_env
    
    # Verify environment (optional, may fail if user hasn't filled .env yet)
    verify_env || print_warning "Please configure .env file before running the application"
    
    # Test MongoDB connection (optional)
    test_mongodb || true
    
    # Build project (optional)
    read -p "Would you like to build the project now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_project
    else
        print_info "Skipping build. You can build later with: npm run build"
    fi
    
    # Print next steps
    print_next_steps
}

# Run main function
main
