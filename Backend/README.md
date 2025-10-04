# NASA Weather Intelligence Backend

A powerful FastAPI-based backend for NASA weather data analysis and machine learning predictions.

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Virtual environment (recommended)

### Installation

#### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd Backend

# Run the setup script
./setup.sh dev  # for development
# or
./setup.sh prod  # for production
```

#### Option 2: Manual Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt  # Full development setup
# or
pip install -r requirements-prod.txt  # Production only
```

### Running the Server

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
gunicorn main:app -w 4 -k uvicorn.workers.UnicornWorker --bind 0.0.0.0:8000
```

## 📦 Requirements Files

### `requirements.txt` (Complete Development)

Comprehensive set of dependencies including:

- **Core Framework**: FastAPI, Uvicorn
- **Data Science**: Pandas, NumPy, Scikit-learn, SciPy
- **Visualization**: Matplotlib, Seaborn, Plotly
- **Database**: SQLAlchemy, Alembic, Redis, PostgreSQL
- **Authentication**: JWT, Passlib
- **NASA APIs**: Astropy, Skyfield
- **Testing**: Pytest, Faker
- **Code Quality**: Black, Flake8, MyPy
- **Monitoring**: Prometheus, Structlog

### `requirements-prod.txt` (Production Minimal)

Essential dependencies for production deployment:

- Core API framework
- Data processing libraries
- Configuration management
- Logging and monitoring
- Performance optimization

### `requirements-dev.txt` (Development Tools)

Development-specific tools:

- Testing frameworks
- Code formatting and linting
- Documentation generation
- Debugging and profiling tools
- Development servers

## 🛠️ Development Tools

### Code Quality

```bash
# Format code
black .
isort .

# Lint code
flake8 .
mypy .

# Run tests
pytest --cov=app tests/

# Pre-commit hooks
pre-commit run --all-files
```

### Documentation

```bash
# Generate API docs (available at /docs when server is running)
# Sphinx documentation
sphinx-build -b html docs/ docs/_build/

# MkDocs documentation
mkdocs serve
```

## 🌟 Key Features

### API Endpoints

- `/api/weather/current` - Current weather data
- `/api/weather/forecast` - Weather forecasting
- `/api/weather/historical` - Historical weather data
- `/api/ml/predict` - Machine learning predictions
- `/docs` - Interactive API documentation

### Data Sources

- **NASA POWER API**: Solar and meteorological data
- **Geospatial Services**: Location-based weather data
- **Machine Learning**: Predictive weather modeling

### Performance Features

- **Async Support**: High-performance async/await operations
- **Caching**: Redis-based caching for improved response times
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Monitoring**: Prometheus metrics and structured logging

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
DEBUG=True
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# NASA API
NASA_API_BASE_URL=https://power.larc.nasa.gov/api
NASA_API_TIMEOUT=30

# Database
DATABASE_URL=postgresql://user:password@localhost/weatherdb

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements-prod.txt .
RUN pip install -r requirements-prod.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UnicornWorker", "--bind", "0.0.0.0:8000"]
```

### Traditional Deployment

```bash
# Install production dependencies
pip install -r requirements-prod.txt

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UnicornWorker --bind 0.0.0.0:8000
```

## 📊 Monitoring and Logging

- **Structured Logging**: JSON-formatted logs with contextual information
- **Metrics**: Prometheus metrics for monitoring API performance
- **Health Checks**: Built-in health check endpoints
- **Error Tracking**: Comprehensive error handling and tracking

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test files
pytest tests/test_weather.py

# Run with markers
pytest -m "not slow"
```

## 📝 API Documentation

- **Swagger UI**: Available at `/docs` when server is running
- **ReDoc**: Available at `/redoc` for alternative documentation view
- **OpenAPI Schema**: Available at `/openapi.json`

## 🤝 Contributing

1. Install development dependencies: `pip install -r requirements-dev.txt`
2. Install pre-commit hooks: `pre-commit install`
3. Follow code style guidelines (Black, isort, flake8)
4. Write tests for new features
5. Update documentation as needed

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions:

- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the logs for debugging information
