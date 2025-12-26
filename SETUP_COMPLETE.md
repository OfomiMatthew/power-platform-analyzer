# Power Platform Code Analyzer - Setup Guide

## Quick Start Instructions

### 1. Configure Your API Key

Create a `.env` file in the project root with your Groq API key:

```bash
# Copy the example file
copy .env.example .env
```

Then edit `.env` and replace `your_groq_api_key_here` with your actual Groq API key from https://console.groq.com/

### 2. The Virtual Environment and Dependencies Are Already Set Up! ✅

The virtual environment has been created and all dependencies are installed.

### 3. Run the Application

Activate the virtual environment (if not already active):

```bash
.\venv\Scripts\Activate.ps1
```

Start the Flask server:

```bash
python app.py
```

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

## Usage Instructions

1. **Select a Power Platform Suite** - Choose from:

   - Power Apps (formulas and expressions)
   - Power BI (DAX and M queries)
   - Power Automate (flow expressions)

2. **Paste Your Code** - Enter the code you want to analyze in the editor

3. **Click "Analyze Code"** - The AI will:
   - Detect errors and inefficiencies
   - Provide corrected code
   - Highlight specific changes
   - Explain what the code does
   - Suggest best practices

## Project Structure

```
power_platform_code_analyzer/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create this!)
├── .env.example           # Example environment file
├── README.md              # Project documentation
├── SETUP_COMPLETE.md      # This file
├── services/
│   ├── __init__.py
│   └── groq_service.py    # Groq API integration
├── templates/
│   └── index.html         # Main UI template
├── static/
│   └── js/
│       └── app.js         # Frontend JavaScript
└── venv/                  # Virtual environment (already created)
```

## Features Implemented ✅

- ✅ Python Flask backend
- ✅ Tailwind CSS for modern, minimalistic UI
- ✅ Groq API integration for AI-powered analysis
- ✅ Dynamic suite selection (Power Apps, Power BI, Power Automate)
- ✅ Context-aware code editor
- ✅ Error detection and correction
- ✅ Change highlighting
- ✅ Code explanations
- ✅ Best practices suggestions
- ✅ Copy-to-clipboard functionality
- ✅ Responsive design
- ✅ Virtual environment setup

## Next Steps

1. Get your Groq API key from https://console.groq.com/
2. Add it to a new `.env` file
3. Run `python app.py`
4. Start analyzing your Power Platform code!

## Troubleshooting

**Issue**: Import errors when running the app  
**Solution**: Make sure the virtual environment is activated:

```bash
.\venv\Scripts\Activate.ps1
```

**Issue**: Missing API key error  
**Solution**: Create a `.env` file with your Groq API key:

```
GROQ_API_KEY=your_actual_key_here
```

**Issue**: Port 5000 already in use  
**Solution**: Stop other applications using port 5000, or modify the port in app.py

Enjoy analyzing your Power Platform code! 🚀
