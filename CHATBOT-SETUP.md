# 🤖 Chatbot Integration Setup Guide

## Overview
A beautiful AI-powered chatbot has been integrated into your StudentNotesMarketplace using Google Gemini API. The chatbot appears as a floating widget on the home page and helps users with platform-related questions.

## What Was Added

### 1. Backend Service (`server/chatbot.ts`)
- Google Gemini API integration
- Conversation history management
- Session-based chat for each user
- Suggested questions system
- Error handling and fallbacks

### 2. API Routes (`server/routes.ts`)
Three new endpoints added:
- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/suggestions` - Get suggested questions
- `GET /api/chatbot/health` - Health check for chatbot service

### 3. React Component (`client/src/components/chatbot-widget.tsx`)
Beautiful floating chat widget with:
- Smooth animations and transitions
- Message history display
- Loading states
- Suggested questions
- Auto-scroll to latest messages
- Responsive design
- Dark theme matching your app

### 4. Home Page Integration (`client/src/pages/home.tsx`)
- ChatbotWidget component added to home page
- Accessible to all users (authenticated and guests)
- Floating button in bottom-right corner

## Setup Instructions

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### Step 2: Add API Key to .env
```bash
# In .env file, replace:
GEMINI_API_KEY=your_gemini_api_key_here

# With your actual key:
GEMINI_API_KEY=AIzaSyD...your_key_here
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test the Chatbot
1. Open http://localhost:8000 (or your deployment URL)
2. Click the purple chat button in bottom-right corner
3. Type a message or click a suggested question
4. Chat with the AI assistant!

## Features

### 🎯 Smart Responses
The chatbot is trained to help with:
- How to upload notes
- Earning system explanation
- Subscription information
- Download process
- Teacher approval system
- Technical support
- Study tips

### 💬 Conversation History
- Each user has their own conversation session
- History is maintained during the session
- Keeps last 40 messages for context
- Automatically cleared when session ends

### 🎨 Beautiful UI
- Gradient backgrounds
- Smooth animations
- Loading indicators
- Message bubbles with different styles
- Responsive design for all devices
- Dark theme matching app

### ⚡ Performance
- Lazy loading of suggestions
- Efficient message handling
- Optimized API calls
- No external dependencies beyond Gemini API

## API Endpoints

### Send Message
```bash
POST /api/chatbot/chat
Content-Type: application/json

{
  "message": "How do I upload notes?"
}

Response:
{
  "success": true,
  "message": "To upload notes, go to the Upload section...",
  "timestamp": 1702000000000
}
```

### Get Suggestions
```bash
GET /api/chatbot/suggestions

Response:
{
  "success": true,
  "suggestions": [
    "How do I upload notes?",
    "How does the earning system work?",
    ...
  ]
}
```

### Health Check
```bash
GET /api/chatbot/health

Response:
{
  "success": true,
  "status": "healthy",
  "geminiConfigured": true
}
```

## Customization

### Change System Prompt
Edit `server/chatbot.ts` and modify the `systemPrompt` variable:

```typescript
const systemPrompt = `You are a helpful AI assistant for StudentNotesMarketplace...`;
```

### Modify Suggested Questions
Edit `server/chatbot.ts` and update `suggestedQuestions`:

```typescript
export const suggestedQuestions = [
  "Your custom question 1",
  "Your custom question 2",
  ...
];
```

### Customize Widget Appearance
Edit `client/src/components/chatbot-widget.tsx`:
- Change colors in className attributes
- Modify animation speeds
- Adjust chat window size
- Change button position

## Deployment

### For Netlify/Vercel
1. Add `GEMINI_API_KEY` to environment variables
2. Ensure backend is running on same domain or CORS is configured
3. Deploy normally with `npm run build`

### For Self-Hosted
1. Set `GEMINI_API_KEY` in your environment
2. Ensure backend is accessible from frontend
3. Test chatbot before going live

## Troubleshooting

### Chatbot not responding
- Check if `GEMINI_API_KEY` is set in .env
- Verify API key is valid on Google AI Studio
- Check browser console for errors
- Ensure backend is running

### API key errors
```
Error: GEMINI_API_KEY is not set
```
Solution: Add your API key to .env and restart server

### CORS errors
If chatbot can't reach backend:
- Ensure backend is running on correct port
- Check that API routes are registered
- Verify frontend URL matches backend expectations

### Chat window not appearing
- Check if JavaScript is enabled
- Clear browser cache
- Verify component is imported in home.tsx
- Check browser console for errors

## Security Notes

⚠️ **Important**: Never commit your API key to git
- Use .env files (already in .gitignore)
- Use environment variables in production
- Rotate keys periodically
- Monitor API usage in Google Cloud Console

## Performance Tips

1. **Rate Limiting**: Consider adding rate limiting to `/api/chatbot/chat`
2. **Session Cleanup**: Implement session cleanup for inactive users
3. **Caching**: Cache suggested questions if they don't change
4. **Monitoring**: Monitor API costs and usage

## File Structure
```
server/
  ├── chatbot.ts              (Chatbot service)
  └── routes.ts               (API endpoints)

client/
  └── src/
      ├── components/
      │   └── chatbot-widget.tsx    (React component)
      └── pages/
          └── home.tsx              (Integration)

.env                           (Configuration)
```

## Next Steps

1. ✅ Add your Gemini API key to .env
2. ✅ Restart the development server
3. ✅ Test the chatbot on home page
4. ✅ Customize system prompt if needed
5. ✅ Deploy to production

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Google Gemini API documentation
3. Check browser console for error messages
4. Verify all files are in correct locations

---

**Status**: ✅ Ready for deployment
**Last Updated**: December 3, 2025
