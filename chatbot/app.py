#!/usr/bin/env python3
"""
Master Student Chatbot - Flask Backend
A Python-based AI chatbot for the Student Notes Marketplace using Google Gemini API
"""

import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import logging
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
        - Guidance on uploading their own notes and earning coins
        - Academic advice and study tips
        - Platform navigation and features
        - Support issues and troubleshooting
        
        IMPORTANT PLATFORM KNOWLEDGE:
        - When students upload notes, they must be APPROVED by admin before earning coins
        - The approval process ensures quality and prevents spam
        - Once approved, students earn coins based on downloads and ratings
        - For support issues (like "uploaded notes but no coins"), explain the approval process first
        - If user still has issues after explanation, offer to send their concern to support team
        
        Keep responses helpful, friendly, and focused on education. 
        Always encourage learning and academic excellence.
        Limit responses to 150 words for better user experience.
        Use simple language that students can easily understand.
        Address users by their name when available.
        """
        
        # Initialize Gemini model
        try:
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {str(e)}")
            self.model = None
        
    def get_response(self, user_message, user_data=None, conversation_history=None):
        """Generate AI response using Google Gemini"""
        try:
            if not self.model:
                return self.get_fallback_response(user_message)
            
            # Build conversation context
            context = self.system_prompt + "\n\n"
            
            # Add user information if available
            if user_data:
                user_name = user_data.get('firstName', user_data.get('name', 'Student'))
                user_info = f"Current user: {user_name}"
                if user_data.get('school'):
                    user_info += f" from {user_data.get('school')}"
                if user_data.get('class'):
                    user_info += f" (Class {user_data.get('class')})"
                context += f"USER INFO: {user_info}\n\n"
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-5:]:  # Keep last 5 messages for context
                    role = "Student" if msg.get('role') == 'user' else "Master Student"
                    context += f"{role}: {msg.get('content', '')}\n"
            
            # Add current user message
            user_name = user_data.get('firstName', 'Student') if user_data else 'Student'
            context += f"{user_name}: {user_message}\nMaster Student:"
            
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
            
            if response.candidates and response.candidates[0].content.parts:
                return response.candidates[0].content.parts[0].text.strip()
            else:
                return self.get_fallback_response(user_message)
            
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return self.get_fallback_response(user_message)
    
    def detect_support_issue(self, user_message):
        """Detect if user message indicates a support issue"""
        support_keywords = [
            'uploaded notes but no coins',
            'not receiving coins',
            'notes not approved',
            'coins not credited',
            'uploaded but no money',
            'notes uploaded no payment',
            'where are my coins',
            'not getting paid',
            'support',
            'help with payment',
            'issue with coins'
        ]
        
        user_message_lower = user_message.lower()
        return any(keyword in user_message_lower for keyword in support_keywords)
    
    def send_support_email(self, user_data, user_message):
        """Send support email to admin"""
        try:
            support_email = os.getenv('SUPPORT_EMAIL', 'prithvirajsharma1243@gmail.com')
            
            # Create email content
            user_name = user_data.get('firstName', 'Unknown') if user_data else 'Unknown'
            user_email = user_data.get('email', 'Not provided') if user_data else 'Not provided'
            
            subject = f"Student Support Request - {user_name}"
            
            body = f"""
            New support request from Student Notes Marketplace chatbot:
            
            Student Name: {user_name}
            Student Email: {user_email}
            School: {user_data.get('school', 'Not provided') if user_data else 'Not provided'}
            Class: {user_data.get('class', 'Not provided') if user_data else 'Not provided'}
            
            Issue Description:
            {user_message}
            
            Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            
            Please investigate and respond to the student's concern.
            """
            
            # For now, just log the email (you can integrate with SendGrid later)
            logger.info(f"Support email would be sent to {support_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Body: {body}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send support email: {str(e)}")
            return False
    
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
        'model': 'gemini-2.5-flash'
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip()
        user_data = data.get('user', None)
        conversation_history = data.get('history', [])
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        # Check if this is a support issue
        if chatbot.detect_support_issue(user_message):
            # First, provide explanation about approval process
            user_name = user_data.get('firstName', 'Student') if user_data else 'Student'
            support_response = f"Hi {user_name}! I understand your concern about not receiving coins for uploaded notes. Here's how it works:\n\n"
            support_response += "📝 **Notes Approval Process:**\n"
            support_response += "1. When you upload notes, they go to admin for review\n"
            support_response += "2. Admin checks quality and authenticity\n"
            support_response += "3. Once approved, you start earning coins from downloads\n"
            support_response += "4. This process ensures high-quality content for all students\n\n"
            support_response += "If your notes were uploaded recently, please wait for admin approval. If it's been more than 48 hours, I'll send your concern to our support team for investigation."
            
            # Send support email
            if user_data:
                chatbot.send_support_email(user_data, user_message)
                support_response += "\n\n✅ I've also forwarded your concern to our support team at prithvirajsharma1243@gmail.com for further assistance."
            
            return jsonify({
                'response': support_response,
                'timestamp': datetime.now().isoformat(),
                'status': 'success',
                'model': 'gemini-2.5-flash',
                'support_email_sent': True
            })
        
        # Generate normal response
        response = chatbot.get_response(user_message, user_data, conversation_history)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'status': 'success',
            'model': 'gemini-2.5-flash'
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
    logger.info("Note: In production, this app should be run with Gunicorn, not Flask's dev server")
    
    # Only use Flask dev server in development
    if debug:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=True
        )
    else:
        logger.warning("Production mode detected. Use Gunicorn to run this app.")
