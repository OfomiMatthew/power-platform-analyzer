# Power Platform Code Analyzer

A modern web application for analyzing and improving Power Platform code (Power Apps, Power BI, Power Automate) using AI-powered analysis.

## Features

- 🎯 Support for Power Apps, Power BI, and Power Automate
- 🤖 AI-powered code analysis using Groq API
- ✨ Automatic error detection and correction
- 💡 Intelligent code suggestions and explanations
- 🎨 Clean, minimalistic UI with Tailwind CSS
- ⚡ Fast and responsive interface

## Setup

### Prerequisites

- Python 3.8 or higher
- Groq API key

### Installation

1. Clone this repository and navigate to the project directory

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file based on `.env.example` and add your Groq API key:
```bash
GROQ_API_KEY=your_actual_api_key_here
```

### Running the Application

1. Ensure your virtual environment is activated
2. Run the Flask application:
```bash
python app.py
```

3. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Select a Power Platform suite from the dropdown (Power Apps, Power BI, or Power Automate)
2. Paste your code or expression in the editor
3. Click "Analyze Code" to get AI-powered insights
4. Review the analysis results, including:
   - Error detection
   - Corrected code
   - Highlighted changes
   - Detailed explanations

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, Tailwind CSS, JavaScript
- **AI**: Groq API
- **Code Editor**: Custom implementation with syntax awareness

## License

MIT License
