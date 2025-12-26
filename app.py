from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from services.groq_service import GroqService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Groq service
groq_service = GroqService(api_key=os.getenv('GROQ_API_KEY'))

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_code():
    """
    Analyze Power Platform code using AI
    
    Expected JSON payload:
    {
        "code": "string - the code to analyze",
        "suite": "string - power_apps, power_bi, or power_automate"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '').strip()
        suite = data.get('suite', '').strip()
        
        if not code:
            return jsonify({'error': 'Code is required'}), 400
        
        if not suite or suite not in ['power_apps', 'power_bi', 'power_automate']:
            return jsonify({'error': 'Valid suite selection is required'}), 400
        
        # Analyze code using Groq API
        analysis_result = groq_service.analyze_code(code, suite)
        
        return jsonify(analysis_result), 200
    
    except Exception as e:
        app.logger.error(f"Error analyzing code: {str(e)}")
        return jsonify({'error': f'An error occurred during analysis: {str(e)}'}), 500

@app.route('/verify', methods=['POST'])
def verify_code():
    """
    Verify corrected code to ensure it's actually correct
    
    Expected JSON payload:
    {
        "code": "string - the corrected code to verify",
        "suite": "string - power_apps, power_bi, or power_automate"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '').strip()
        suite = data.get('suite', '').strip()
        
        if not code:
            return jsonify({'error': 'Code is required'}), 400
        
        if not suite or suite not in ['power_apps', 'power_bi', 'power_automate']:
            return jsonify({'error': 'Valid suite selection is required'}), 400
        
        # Verify code using Groq API
        verification_result = groq_service.verify_code(code, suite)
        
        return jsonify(verification_result), 200
    
    except Exception as e:
        app.logger.error(f"Error verifying code: {str(e)}")
        return jsonify({'error': f'An error occurred during verification: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Power Platform Code Analyzer'
    }), 200

if __name__ == '__main__':
    # Check if API key is configured
    if not os.getenv('GROQ_API_KEY'):
        print("WARNING: GROQ_API_KEY not found in environment variables.")
        print("Please create a .env file with your Groq API key.")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
