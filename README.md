# 🛰️ NASA Weather Intelligence Dashboard

A modern, full-stack weather intelligence dashboard that combines NASA's satellite data capabilities with machine learning predictions. Built with FastAPI backend and React frontend.

![NASA Weather Dashboard](https://img.shields.io/badge/NASA-Weather%20Intelligence-blue?style=for-the-badge&logo=nasa)
![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?style=flat-square&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)

## 🌟 Features

### Backend (FastAPI)

- 🔥 **High-Performance API** - Built with FastAPI for maximum speed
- 🌍 **Real-time Weather Data** - Current weather conditions by coordinates
- 📊 **7-Day Forecasting** - Extended weather predictions
- 🤖 **ML Weather Predictions** - AI-powered weather forecasting
- 🔐 **CORS Enabled** - Secure cross-origin resource sharing
- 📖 **Auto-generated API Docs** - Swagger/OpenAPI documentation

### Frontend (React + TypeScript)

- ⚡ **Modern React 18** - Latest React features with TypeScript
- 🎨 **Tailwind CSS** - Beautiful, responsive design
- 🌌 **Space-themed UI** - NASA-inspired interface design
- 📱 **Responsive Layout** - Works on desktop, tablet, and mobile
- 🔄 **Real-time Updates** - Live weather data updates
- ❌ **Error Handling** - Graceful fallbacks and user feedback
- 🌐 **API Integration** - Seamless backend connectivity

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to Backend directory:**

   ```bash
   cd Backend
   ```

2. **Create and activate virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI server:**

   ```bash
   python -m uvicorn main:app --reload
   ```

   The API will be available at: `http://localhost:8000`

   - API Documentation: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

### Frontend Setup

1. **Navigate to Dashboard directory:**

   ```bash
   cd Dashboard
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The dashboard will be available at: `http://localhost:5173`

## 📂 Project Structure

```
NASA_project_2025_V1/
├── Backend/                    # FastAPI Backend
│   ├── app/                   # Original app structure
│   │   ├── routers/          # API route handlers
│   │   │   ├── main.py       # Main routes
│   │   │   ├── weather.py    # Weather endpoints
│   │   │   └── ml.py         # ML prediction endpoints
│   │   ├── config.py         # Configuration
│   │   ├── nasa_client.py    # NASA API client
│   │   └── ml.py             # Machine learning models
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
│
├── Dashboard/                 # React Frontend
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── api.ts            # API client functions
│   │   ├── main.tsx          # React entry point
│   │   └── index.css         # Tailwind CSS imports
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tailwind.config.ts    # Tailwind CSS configuration
│
└── README.md                 # This file
```

## 🔧 API Endpoints

### Weather Data

- `GET /api/weather/current?lat={lat}&lon={lon}` - Get current weather
- `GET /api/weather/forecast?lat={lat}&lon={lon}` - Get 7-day forecast

### Machine Learning

- `GET /api/ml/predict?lat={lat}&lon={lon}&days={days}` - Get ML predictions

### System

- `GET /health` - Health check
- `GET /api/health` - API health check

## 🌐 Usage Examples

### Get Current Weather

```bash
curl "http://localhost:8000/api/weather/current?lat=40.7128&lon=-74.0060"
```

### Get Weather Forecast

```bash
curl "http://localhost:8000/api/weather/forecast?lat=40.7128&lon=-74.0060"
```

### Get ML Predictions

```bash
curl "http://localhost:8000/api/ml/predict?lat=40.7128&lon=-74.0060&days=7"
```

## 🛠️ Technology Stack

### Backend

- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.13** - Latest Python version
- **Uvicorn** - ASGI server for production
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning library
- **Requests** - HTTP library for API calls

### Frontend

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful icons
- **React Leaflet** - Interactive maps
- **Recharts** - Composable charting library

## 🚀 Deployment

### Backend Production

```bash
# Install production dependencies
pip install -r requirements.txt

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing open access to weather and satellite data
- **FastAPI** team for the excellent web framework
- **React** team for the amazing frontend library
- **Tailwind CSS** for the beautiful styling system

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ for NASA Weather Intelligence**
