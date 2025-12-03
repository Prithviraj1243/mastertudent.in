# 🚀 Chatbot Deployment Guide

## Pre-Deployment Checklist

- [ ] Gemini API key obtained
- [ ] API key added to .env
- [ ] Server restarted locally
- [ ] Chatbot tested on home page
- [ ] All documentation reviewed
- [ ] No console errors in browser
- [ ] Backend health check passes

## Local Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Health Check
```bash
curl http://localhost:8000/api/chatbot/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "geminiConfigured": true
}
```

### 3. Test Suggestions
```bash
curl http://localhost:8000/api/chatbot/suggestions
```

### 4. Test Chat
```bash
curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I upload notes?"}'
```

### 5. Manual Testing
1. Open http://localhost:8000
2. Click purple chat button (bottom-right)
3. Type: "How do I upload notes?"
4. Verify response appears
5. Click a suggested question
6. Verify it sends and gets response

## Deployment Steps

### For Netlify

1. **Add Environment Variable**
   - Go to Site settings → Build & deploy → Environment
   - Add: `GEMINI_API_KEY=your_key_here`

2. **Deploy**
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **Verify**
   - Visit deployed site
   - Test chatbot functionality
   - Check browser console for errors

### For Vercel

1. **Add Environment Variable**
   - Go to Settings → Environment Variables
   - Add: `GEMINI_API_KEY=your_key_here`

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Verify**
   - Visit deployed site
   - Test chatbot functionality

### For Self-Hosted (Docker/VPS)

1. **Set Environment Variable**
   ```bash
   export GEMINI_API_KEY=your_key_here
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Start**
   ```bash
   npm start
   ```

4. **Verify**
   - Test all endpoints
   - Monitor logs
   - Check API usage

## Post-Deployment Verification

### 1. Check Health Status
```bash
curl https://your-domain.com/api/chatbot/health
```

### 2. Test Chat Endpoint
```bash
curl -X POST https://your-domain.com/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'
```

### 3. Manual Testing
1. Visit your deployed site
2. Click chat button
3. Send a message
4. Verify response appears
5. Test suggested questions

### 4. Monitor Logs
- Check for any errors
- Monitor API response times
- Track error rates

## Performance Optimization

### 1. Enable Caching
Add to `server/routes.ts`:
```typescript
app.get("/api/chatbot/suggestions", (req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  // ... rest of code
});
```

### 2. Add Rate Limiting
```bash
npm install express-rate-limit
```

Then in `server/routes.ts`:
```typescript
import rateLimit from "express-rate-limit";

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.post("/api/chatbot/chat", chatLimiter, async (req, res) => {
  // ... rest of code
});
```

### 3. Monitor API Usage
- Check Google Cloud Console
- Monitor Gemini API costs
- Set up alerts for high usage

## Troubleshooting

### Chatbot Not Working

**Check 1: API Key**
```bash
# Verify key is set
echo $GEMINI_API_KEY

# Should output your key, not empty
```

**Check 2: Backend Health**
```bash
curl https://your-domain.com/api/chatbot/health
```

**Check 3: Browser Console**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

**Check 4: Server Logs**
- Look for error messages
- Check API response status codes
- Verify request/response format

### Slow Responses

**Solutions**:
1. Check internet connection
2. Monitor Gemini API status
3. Check server resources
4. Reduce max tokens if needed
5. Enable caching

### CORS Errors

**Solution**: Ensure backend is on same domain or configure CORS:
```typescript
import cors from "cors";
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## Monitoring & Analytics

### 1. Track API Usage
```bash
# Monitor requests
curl -s https://your-domain.com/api/chatbot/health | jq
```

### 2. Set Up Alerts
- Monitor error rates
- Alert on API failures
- Track response times

### 3. User Analytics
- Track chat usage
- Monitor popular questions
- Analyze user behavior

## Security Checklist

- [ ] API key not exposed in code
- [ ] API key stored in environment variables
- [ ] HTTPS enabled on production
- [ ] Input validation in place
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] CORS properly configured
- [ ] API key rotated periodically

## Rollback Plan

If issues occur:

1. **Disable Chatbot**
   - Remove ChatbotWidget from home.tsx
   - Redeploy

2. **Revert Changes**
   ```bash
   git revert <commit-hash>
   npm run build
   npm start
   ```

3. **Check Logs**
   - Review error messages
   - Check API usage
   - Verify configuration

## Cost Estimation

### Gemini API Pricing (as of Dec 2024)
- **Input**: $0.075 per 1M tokens
- **Output**: $0.30 per 1M tokens

### Example Usage
- 1000 messages/day
- ~100 tokens per message
- ~$0.03-0.10/day
- ~$1-3/month

Monitor actual usage in Google Cloud Console.

## Maintenance

### Weekly
- Check error logs
- Monitor API usage
- Verify chatbot responses

### Monthly
- Review analytics
- Update system prompt if needed
- Check for API updates

### Quarterly
- Rotate API key
- Review security
- Update dependencies

## Support Resources

- [Google Gemini API Docs](https://ai.google.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Deployment Guides](./CHATBOT-SETUP.md)

## Deployment Checklist

### Before Deployment
- [ ] All tests pass locally
- [ ] No console errors
- [ ] API key configured
- [ ] Documentation updated
- [ ] Team notified

### During Deployment
- [ ] Monitor deployment logs
- [ ] Verify build succeeds
- [ ] Check health endpoints
- [ ] Test core functionality

### After Deployment
- [ ] Verify chatbot works
- [ ] Monitor error rates
- [ ] Check API usage
- [ ] Gather user feedback

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: December 3, 2025
