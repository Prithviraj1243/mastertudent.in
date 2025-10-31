#!/usr/bin/env python3
"""
Master Student Chatbot - Flask Backend
A Python-based AI chatbot for the Student Notes Marketplace using Google Gemini API
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Gemini Configuration
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class MasterStudentChatbot:
    def __init__(self):
        self.system_prompt = """
        You are Master Student, an AI assistant for the Student Notes Marketplace platform. 
        You help students with:
        - Finding and downloading study notes
        - Understanding subjects and topics
        - Guidance on uploading their own notes
        - Academic advice and study tips
        - Platform navigation and features
        
        Keep responses helpful, friendly, and focused on education. 
        Always encourage learning and academic excellence.
        Limit responses to 150 words for better user experience.
        Use simple language that students can easily understand.
        """
        
        # Initialize Gemini model
        try:
            self.model = genai.GenerativeModel('gemini-pro')
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {str(e)}")
            self.model = None
        
    def get_response(self, user_message, conversation_history=None):
        """Generate AI response using Google Gemini"""
        try:
            if not self.model:
                return self.get_fallback_response(user_message)
            
            # Build conversation context
            context = self.system_prompt + "\n\n"
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-5:]:  # Keep last 5 messages for context
                    role = "Student" if msg.get('role') == 'user' else "Master Student"
                    context += f"{role}: {msg.get('content', '')}\n"
            
            # Add current user message
            context += f"Student: {user_message}\nMaster Student:"
            
            # Generate response using Gemini
            response = self.model.generate_content(
                context,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=200,
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40
                )
            )
            
            if response.text:
                return response.text.strip()
            else:
                return self.get_fallback_response(user_message)
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return self.get_fallback_response(user_message)
    
    def get_fallback_response(self, user_message):
        """Provide fallback responses when API is unavailable"""
        user_message_lower = user_message.lower()
        
        if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'namaste']):
            return "Hello! I'm Master Student, your AI study companion. How can I help you with your studies today? 📚✨"
        
        elif any(word in user_message_lower for word in ['notes', 'download', 'study material', 'find']):
            return "I can help you find the perfect study notes! Use our search feature to find notes by subject, chapter, or topic. What subject are you looking for? 🔍📖"
        
        elif any(word in user_message_lower for word in ['upload', 'share', 'earn', 'money']):
            return "Great! You can upload your notes to help other students and earn money. Click on 'Upload Notes' and follow the simple steps. What subject notes do you want to share? 💰📝"
        
        elif any(word in user_message_lower for word in ['help', 'how', 'guide', 'tutorial']):
            return "I'm here to help! You can ask me about finding notes, uploading content, earning money, or any study-related questions. What would you like to know? 🤝💡"
        
        elif any(word in user_message_lower for word in ['subject', 'topics', 'course', 'syllabus']):
            return "We have notes for Mathematics, Physics, Chemistry, Biology, Computer Science, English and more! Which subject interests you? I can guide you to the best resources. 📚🎯"
        
        elif any(word in user_message_lower for word in ['exam', 'test', 'preparation', 'study tips']):
            return "Here are some study tips: 1) Create a study schedule 2) Take regular breaks 3) Practice with past papers 4) Use our quality notes 5) Join study groups. Need specific exam help? 📝⏰"
        
        else:
            return "I'm here to help with your studies! Ask me about finding notes, uploading content, earning money, or any academic questions you have. Let's make learning easier together! 🎓✨"

# Initialize chatbot
chatbot = MasterStudentChatbot()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Master Student Chatbot (Gemini)',
        'model': 'gemini-pro'
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        conversation_history = data.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Generate response
        response = chatbot.get_response(user_message, conversation_history)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'status': 'success',
            'model': 'gemini-pro'
        })
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Sorry, I encountered an error. Please try again.'
        }), 500

@app.route('/chat/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested questions for users"""
    suggestions = [
        "How do I find notes for my subject?",
        "How can I upload and earn from my notes?",
        "What subjects are available on the platform?",
        "How do I download notes?",
        "Can you give me study tips for exams?",
        "How does the earning system work?",
        "Which subjects are most popular?",
        "How do I improve my study habits?"
    ]
    
    return jsonify({
        'suggestions': suggestions,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('CHATBOT_PORT', 5000))
    debug = os.getenv('NODE_ENV') == 'development'
    
    logger.info(f"Starting Master Student Chatbot with Gemini API on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
