# 🚀 Chatbot Quick Start

## 3-Step Setup

### 1️⃣ Get API Key
- Go to https://aistudio.google.com/app/apikey
- Click "Create API Key"
- Copy the key

### 2️⃣ Add to .env
```
GEMINI_API_KEY=your_key_here
```

### 3️⃣ Restart Server
```bash
npm run dev
```

## Done! 🎉

Visit http://localhost:8000 and click the chat button in the bottom-right corner.

---

## What's Included

✅ **Backend Service** - Google Gemini integration  
✅ **API Endpoints** - Chat, suggestions, health check  
✅ **React Component** - Beautiful floating widget  
✅ **Home Page Integration** - Ready to use  
✅ **Conversation History** - Per-user sessions  
✅ **Suggested Questions** - Quick access to common topics  

## Features

- 💬 AI-powered responses
- 🎨 Beautiful dark theme UI
- ⚡ Fast and responsive
- 📱 Mobile friendly
- 🔒 Secure (no data stored)
- 🌙 Smooth animations

## Files Added

```
server/chatbot.ts                    (Backend service)
client/src/components/chatbot-widget.tsx  (React component)
```

## Files Modified

```
server/routes.ts                     (Added 3 API routes)
client/src/pages/home.tsx            (Added widget)
.env                                 (Added GEMINI_API_KEY)
```

## Testing

```bash
# Check if chatbot is healthy
curl http://localhost:8000/api/chatbot/health

# Get suggestions
curl http://localhost:8000/api/chatbot/suggestions

# Send a message
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I upload notes?"}'
```

## Customization

### Change Widget Position
Edit `client/src/components/chatbot-widget.tsx`:
```typescript
// Line ~30: Change "bottom-6 right-6" to your preferred position
className="fixed bottom-6 right-6 z-40..."
```

### Change System Prompt
Edit `server/chatbot.ts`:
```typescript
const systemPrompt = `Your custom prompt here...`;
```

### Add More Suggestions
Edit `server/chatbot.ts`:
```typescript
export const suggestedQuestions = [
  "Your question 1",
  "Your question 2",
  ...
];
```

## Deployment Checklist

- [ ] Add `GEMINI_API_KEY` to production environment
- [ ] Test chatbot on staging
- [ ] Monitor API usage
- [ ] Set up error logging
- [ ] Configure rate limiting if needed

## Need Help?

See `CHATBOT-SETUP.md` for detailed documentation.

---

**Status**: ✅ Production Ready
