# 🤖 Master Student Chatbot

An AI-powered study assistant for the Student Notes Marketplace platform, built with Python Flask backend and React frontend.

## 🚀 Features

- **AI-Powered Conversations**: Uses OpenAI GPT-3.5-turbo for intelligent responses
- **Study-Focused**: Specialized in helping students with notes, subjects, and academic guidance
- **Real-time Chat**: Instant messaging with typing indicators and timestamps
- **Smart Suggestions**: Pre-built quick questions for common queries
- **Fallback Responses**: Works even when API is unavailable
- **Modern UI**: Beautiful chat interface with animations and responsive design

## 🛠️ Setup Instructions

### 1. Prerequisites

- Python 3.7 or higher
- Node.js and npm
- OpenAI API key (optional, has fallback responses)

### 2. Get OpenAI API Key (Optional)

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the key for configuration

### 3. Configure Environment

Edit the `.env` file in the root directory:

```bash
# Existing configuration
USE_SQLITE=1
NODE_ENV=development
PORT=8001

# Chatbot Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here
CHATBOT_PORT=5000
```

**Note**: Replace `your_actual_openai_api_key_here` with your real OpenAI API key. If you don't have one, the chatbot will use fallback responses.

### 4. Install Dependencies

#### Python Dependencies (Chatbot Backend)
```bash
cd chatbot
pip3 install -r requirements.txt
cd ..
```

#### Node.js Dependencies (Main App)
```bash
npm install
```

### 5. Start the Application

#### Option 1: Use the Startup Script (Recommended)
```bash
./start-with-chatbot.sh
```

#### Option 2: Manual Start
```bash
# Terminal 1: Start chatbot backend
cd chatbot
python3 app.py

# Terminal 2: Start main application
USE_SQLITE=1 PORT=8000 npm run dev
```

### 6. Access the Application

- **Main Application**: http://localhost:8000
- **Chatbot API**: http://localhost:5000
- **Chatbot Health Check**: http://localhost:5000/health

## 🎯 How to Use

1. **Open the main application** at http://localhost:8000
2. **Look for the chatbot icon** in the bottom-left corner of the home page
3. **Click the icon** to open the Master Student chatbot
4. **Start chatting** with questions like:
   - "How do I find notes for my subject?"
   - "How can I upload and earn from my notes?"
   - "What subjects are available?"
   - "Can you help me with study tips?"

## 🤖 Chatbot Capabilities

### Study Assistance
- Finding and downloading study notes
- Subject and topic guidance
- Academic advice and study tips
- Platform navigation help

### Smart Features
- **Context Awareness**: Remembers conversation history
- **Quick Suggestions**: Pre-built common questions
- **Fallback Responses**: Works without internet/API
- **Real-time Typing**: Shows when AI is thinking
- **Minimizable Interface**: Can be collapsed while browsing

## 🔧 API Endpoints

### Chatbot Backend (Port 5000)

- `GET /health` - Health check
- `POST /chat` - Send message to chatbot
- `GET /chat/suggestions` - Get suggested questions

### Example Chat Request
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I upload notes?",
    "history": []
  }'
```

## 🎨 UI Features

- **Floating Chat Button**: Always accessible in bottom-left
- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on all screen sizes
- **Message History**: Scrollable conversation view
- **Typing Indicators**: Shows when AI is responding
- **Minimize/Maximize**: Collapsible interface
- **Quick Actions**: Suggested questions for new users

## 🔒 Security & Privacy

- **API Key Protection**: Environment variable configuration
- **CORS Enabled**: Secure cross-origin requests
- **Input Validation**: Sanitized user inputs
- **Error Handling**: Graceful failure management

## 🐛 Troubleshooting

### Common Issues

1. **Chatbot not responding**
   - Check if Python backend is running on port 5000
   - Verify OpenAI API key in `.env` file
   - Check browser console for errors

2. **Import errors in React**
   - Ensure chatbot component is in correct path
   - Restart the development server

3. **Python dependencies issues**
   - Update pip: `pip3 install --upgrade pip`
   - Install dependencies: `pip3 install -r chatbot/requirements.txt`

4. **Port conflicts**
   - Change CHATBOT_PORT in `.env` if 5000 is occupied
   - Update the port in chatbot component fetch URLs

### Debug Mode

Set `NODE_ENV=development` in `.env` to enable debug logging.

## 📝 Customization

### Adding New Responses
Edit `chatbot/app.py` and modify the `get_fallback_response` method to add more predefined responses.

### Changing UI Appearance
Modify `client/src/components/master-student-chatbot.tsx` to customize colors, animations, and layout.

### API Configuration
Update the OpenAI model, temperature, and other parameters in `chatbot/app.py`.

## 🚀 Production Deployment

For production deployment:

1. Use a production WSGI server like Gunicorn
2. Set up proper environment variables
3. Configure reverse proxy (nginx)
4. Enable HTTPS
5. Set up monitoring and logging

## 📞 Support

If you encounter any issues:

1. Check the console logs in both browser and terminal
2. Verify all dependencies are installed
3. Ensure API keys are properly configured
4. Check network connectivity for API calls

---

**Happy Learning with Master Student! 🎓✨**
