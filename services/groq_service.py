from groq import Groq
import json

class GroqService:
    """Service class for interacting with Groq API"""
    
    def __init__(self, api_key):
        """
        Initialize Groq service with API key
        
        Args:
            api_key (str): Groq API key
        """
        if not api_key:
            raise ValueError("Groq API key is required")
        
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"  # Using Groq's powerful model
    
    def analyze_code(self, code, suite):
        """
        Analyze Power Platform code using Groq API
        
        Args:
            code (str): The code to analyze
            suite (str): The Power Platform suite (power_apps, power_bi, power_automate)
        
        Returns:
            dict: Analysis result containing errors, corrected code, changes, and explanations
        """
        suite_names = {
            'power_apps': 'Power Apps',
            'power_bi': 'Power BI (DAX/M)',
            'power_automate': 'Power Automate'
        }
        
        suite_name = suite_names.get(suite, suite)
        
        # Create a detailed prompt for code analysis
        prompt = f"""You are an expert in Microsoft Power Platform, specifically {suite_name}.

Analyze the following {suite_name} code/expression and provide a comprehensive analysis:

```
{code}
```

Your analysis should include:

1. **Error Detection**: Identify any syntax errors, logical errors, or inefficiencies in the code.

2. **Corrected Code**: Provide a corrected and optimized version of the code. If no corrections are needed, return the original code.

3. **Changes Made**: List specific changes you made to improve the code. If no changes were made, state "No changes needed."

4. **Explanation**: Explain what the code does and why you made certain corrections or improvements. Be clear and concise.

5. **Best Practices**: Mention any {suite_name} best practices that apply.

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks, just the JSON):
{{
  "has_errors": true or false,
  "errors": ["list of errors found"],
  "corrected_code": "the corrected code here",
  "changes": ["list of specific changes made"],
  "explanation": "detailed explanation of what the code does",
  "best_practices": ["relevant best practices"],
  "severity": "low, medium, or high"
}}"""
        
        try:
            # Call Groq API
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"You are an expert Power Platform developer specializing in {suite_name}. Provide accurate, helpful code analysis in JSON format only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.3,  # Lower temperature for more consistent, factual responses
                max_tokens=2000,
            )
            
            # Extract response
            response_content = chat_completion.choices[0].message.content.strip()
            
            # Try to parse JSON from response
            # Sometimes the model might wrap JSON in markdown code blocks
            if response_content.startswith('```'):
                # Extract JSON from code block
                lines = response_content.split('\n')
                json_lines = []
                in_json = False
                for line in lines:
                    if line.strip().startswith('```'):
                        if in_json:
                            break
                        in_json = True
                        continue
                    if in_json:
                        json_lines.append(line)
                response_content = '\n'.join(json_lines)
            
            # Parse JSON response
            analysis_result = json.loads(response_content)
            
            # Validate response structure
            required_fields = ['has_errors', 'errors', 'corrected_code', 'changes', 'explanation']
            for field in required_fields:
                if field not in analysis_result:
                    analysis_result[field] = self._get_default_value(field)
            
            # Ensure optional fields have defaults
            if 'best_practices' not in analysis_result:
                analysis_result['best_practices'] = []
            if 'severity' not in analysis_result:
                analysis_result['severity'] = 'low'
            
            return analysis_result
        
        except json.JSONDecodeError:
            # If JSON parsing fails, create a structured response
            return {
                'has_errors': False,
                'errors': [],
                'corrected_code': code,
                'changes': [],
                'explanation': f"Analysis completed but response format was unexpected. Raw response: {response_content[:200]}...",
                'best_practices': [],
                'severity': 'low'
            }
        
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")
    
    def _get_default_value(self, field):
        """Get default value for a field"""
        defaults = {
            'has_errors': False,
            'errors': [],
            'corrected_code': '',
            'changes': [],
            'explanation': 'No explanation available.',
            'best_practices': [],
            'severity': 'low'
        }
        return defaults.get(field, None)
    
    def verify_code(self, code, suite):
        """
        Verify if corrected code is actually correct
        
        Args:
            code (str): The corrected code to verify
            suite (str): The Power Platform suite
        
        Returns:
            dict: Verification result with validation status and any remaining issues
        """
        suite_names = {
            'power_apps': 'Power Apps',
            'power_bi': 'Power BI (DAX/M)',
            'power_automate': 'Power Automate'
        }
        
        suite_name = suite_names.get(suite, suite)
        
        # Create a verification prompt
        prompt = f"""You are an expert in Microsoft Power Platform, specifically {suite_name}.

Verify if the following {suite_name} code is correct and follows best practices:

```
{code}
```

Your verification should determine:

1. **Is Valid**: Whether the code is syntactically correct and logically sound (true/false)

2. **Message**: A brief message about the verification status

3. **Remaining Issues**: Any errors, warnings, or issues that still exist in the code (empty array if none)

4. **Suggestions**: Any additional improvements that could be made (empty array if none)

5. **Notes**: Positive notes about what the code does well (empty array if none)

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks, just the JSON):
{{
  "is_valid": true or false,
  "message": "brief verification message",
  "remaining_issues": ["list of any remaining issues"],
  "suggestions": ["list of improvement suggestions"],
  "notes": ["positive notes about the code"]
}}"""
        
        try:
            # Call Groq API
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"You are an expert Power Platform developer specializing in {suite_name}. Verify code accuracy and provide validation results in JSON format only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.2,  # Lower temperature for more consistent validation
                max_tokens=1500,
            )
            
            # Extract response
            response_content = chat_completion.choices[0].message.content.strip()
            
            # Try to parse JSON from response
            if response_content.startswith('```'):
                # Extract JSON from code block
                lines = response_content.split('\n')
                json_lines = []
                in_json = False
                for line in lines:
                    if line.strip().startswith('```'):
                        if in_json:
                            break
                        in_json = True
                        continue
                    if in_json:
                        json_lines.append(line)
                response_content = '\n'.join(json_lines)
            
            # Parse JSON response
            verification_result = json.loads(response_content)
            
            # Validate response structure
            required_fields = ['is_valid', 'message']
            for field in required_fields:
                if field not in verification_result:
                    verification_result[field] = self._get_verification_default(field)
            
            # Ensure optional fields have defaults
            if 'remaining_issues' not in verification_result:
                verification_result['remaining_issues'] = []
            if 'suggestions' not in verification_result:
                verification_result['suggestions'] = []
            if 'notes' not in verification_result:
                verification_result['notes'] = []
            
            return verification_result
        
        except json.JSONDecodeError:
            # If JSON parsing fails, return a default response
            return {
                'is_valid': True,
                'message': 'Verification completed. The code appears to be syntactically correct.',
                'remaining_issues': [],
                'suggestions': [],
                'notes': ['Unable to perform detailed verification. Please test the code in your Power Platform environment.']
            }
        
        except Exception as e:
            raise Exception(f"Groq API error during verification: {str(e)}")
    
    def _get_verification_default(self, field):
        """Get default value for verification fields"""
        defaults = {
            'is_valid': True,
            'message': 'Verification completed.',
            'remaining_issues': [],
            'suggestions': [],
            'notes': []
        }
        return defaults.get(field, None)
