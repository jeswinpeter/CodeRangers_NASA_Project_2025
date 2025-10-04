#!/bin/bash
# NASA Weather Intelligence Backend Setup Script

echo "🛰️ NASA Weather Intelligence Backend Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Python 3.9+ is installed
print_status "Checking Python version..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d " " -f 2)
    print_success "Python $PYTHON_VERSION found"
else
    print_error "Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Create virtual environment
print_status "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install requirements based on environment
ENV=${1:-dev}
case $ENV in
    "prod"|"production")
        print_status "Installing production dependencies..."
        pip install -r requirements-prod.txt
        ;;
    "dev"|"development"|*)
        print_status "Installing development dependencies..."
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
        ;;
esac

print_success "Installation completed!"

# Setup pre-commit hooks if in development mode
if [ "$ENV" = "dev" ] || [ "$ENV" = "development" ] || [ -z "$ENV" ]; then
    print_status "Setting up pre-commit hooks..."
    pre-commit install
    print_success "Pre-commit hooks installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating .env file..."
    cat > .env << EOL
# NASA Weather Intelligence Configuration
DEBUG=True
ENVIRONMENT=development

# NASA API Configuration
NASA_API_BASE_URL=https://power.larc.nasa.gov/api
NASA_API_TIMEOUT=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
RELOAD=True

# Database Configuration (if needed)
DATABASE_URL=sqlite:///./weather.db

# Redis Configuration (if needed)
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
EOL
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

print_success "🚀 Setup complete! You can now run:"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload"