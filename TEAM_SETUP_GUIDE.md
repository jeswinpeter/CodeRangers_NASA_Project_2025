# NASA Weather Intelligence - Team Development Guide

## 🚨 IMPORTANT: Dependency Management Rules

### Before Adding New Dependencies:
1. **Ask the team first** - discuss in your group chat
2. **Check if it's really needed** - can you achieve the same with existing libraries?
3. **Add to the correct requirements file**:
   - `requirements-core.txt` - Essential dependencies everyone needs
   - `requirements-ml.txt` - Machine learning features (optional)
   - `requirements-development.txt` - Development tools only

### When You Add a New Dependency:
1. **Update only the specific requirements file** (not the main one)
2. **Document WHY you added it** in your commit message
3. **Test that the app still works** with just core dependencies
4. **Notify the team** about the new dependency

### Quick Setup for New Team Members:
```bash
# Windows
setup.bat

# Mac/Linux  
./setup.sh
```

### Manual Setup:
```bash
# Backend (minimum requirements)
cd Backend
pip install -r requirements-core.txt

# Frontend
cd Dashboard
npm install
```

### Running the App:
```bash
# Terminal 1 - Backend
cd Backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd Dashboard
npm run dev
```

## 🐛 Common Issues:

### "Module not found" errors:
- Try installing just `requirements-core.txt` first
- Check if you're in the right directory
- Make sure Python/Node.js are installed

### Dependencies conflict:
- Delete any virtual environment and recreate it
- Install core dependencies first, then optional ones

### App won't start:
- Check that both backend (port 8000) and frontend (port 5173) are running
- Look for error messages in the terminal
- Try the browser console (F12) for frontend errors

## 📱 Contact:
If you have dependency issues, message the group chat with:
1. Your operating system
2. The exact error message
3. Which requirements file you tried to install