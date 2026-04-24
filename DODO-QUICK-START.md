# Dodo Payments - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add Your Dodo Credentials
Edit `.env` file:
```bash
DODO_PROJECT_ID=your_project_id_from_dodo
DODO_API_KEY=your_api_key_from_dodo
DODO_API_URL=https://api.dodopayments.com
```

### Step 2: Start the Application
```bash
npm run dev
```

### Step 3: Test Payment Flow
1. Go to `http://localhost:5173/download-notes`
2. Find a note with a price (price > 0)
3. Click "Download"
4. Dodo payment gateway will open
5. Complete payment to test

## 📊 How It Works

```
User clicks Download
    ↓
Check if note has price
    ↓
Show Dodo Payment Gateway
    ↓
User clicks "Pay ₹X"
    ↓
Redirected to Dodo Secure Gateway
    ↓
User completes payment
    ↓
Dodo sends webhook confirmation
    ↓
Backend verifies & records download
    ↓
Coins awarded to creator
    ↓
User redirected back to app
```

## 💰 Pricing Calculation

```
Note Price:        ₹100
GST (18%):         ₹18
─────────────────────
Total:             ₹118
```

## 🔐 Security

- ✅ SHA256 HMAC signature verification
- ✅ 256-bit SSL encryption
- ✅ Webhook signature validation
- ✅ Order ID encoding with userId
- ✅ Transaction audit trail

## 📝 Transaction Types

| Type | Description |
|------|-------------|
| `download_pending` | Payment initiated |
| `download_paid` | Payment successful |
| `download_failed` | Payment failed |
| `coin_earned` | Creator earnings |

## 🎯 Key Features

- **Instant Activation** - Download available immediately after payment
- **Creator Rewards** - 50% of note price goes to creator as coins
- **Admin Tracking** - All payments visible in admin panel
- **Error Handling** - Graceful handling of failed payments
- **Webhook Verification** - Secure payment confirmation

## 🔧 API Endpoints

### Initiate Payment
```
POST /api/notes/{noteId}/dodo-payment
```

### Webhook (Dodo → Your Server)
```
POST /api/dodo-webhook
```

### Check Status
```
GET /api/dodo-payment/{transactionId}/status
```

## 📱 User Experience

### For Buyers:
1. Click download on paid note
2. See order summary with pricing
3. Click "Pay" to proceed
4. Complete payment securely
5. Access note immediately

### For Sellers:
1. Set note price when uploading
2. Receive 50% of sale price as coins
3. See sales in admin panel
4. Track earnings over time

## ✅ Testing Checklist

- [ ] Dodo credentials configured
- [ ] Server running without errors
- [ ] Download page loads
- [ ] Paid notes show payment option
- [ ] Payment modal displays
- [ ] Order summary correct
- [ ] Payment gateway opens
- [ ] Webhook processes correctly
- [ ] Download recorded
- [ ] Creator receives coins

## 🐛 Troubleshooting

**Payment gateway not showing?**
- Verify note has `price > 0`
- Check Dodo credentials in .env
- Restart server after .env changes

**Webhook not working?**
- Check server logs for webhook errors
- Verify Dodo can reach your webhook URL
- Check webhook signature in logs

**Coins not awarded?**
- Verify note creator exists
- Check transaction history in admin
- Look for errors in server logs

## 📞 Support Resources

1. **Documentation**: See `DODO-PAYMENTS-SETUP.md`
2. **Server Logs**: Check console output for errors
3. **Admin Panel**: View transaction history
4. **Database**: Check transactions table

## 🎓 Example Payment Flow

```javascript
// User clicks download on note with price 100
// Frontend calls:
POST /api/notes/5/dodo-payment

// Backend responds:
{
  success: true,
  paymentUrl: "https://dodo.payments.com/pay/...",
  transactionId: "txn_123456",
  orderId: "note-5-user123-1701234567890"
}

// User redirected to paymentUrl
// After payment, Dodo sends webhook:
POST /api/dodo-webhook
{
  transactionId: "txn_123456",
  orderId: "note-5-user123-1701234567890",
  status: "success",
  amount: 11800,  // in paise
  signature: "sha256hash..."
}

// Backend processes:
// 1. Verifies signature ✓
// 2. Records download ✓
// 3. Awards 50 coins to creator ✓
// 4. Logs transaction ✓
```

## 🚀 Next Steps

1. Get Dodo Project ID and API Key from Dodo dashboard
2. Add credentials to .env
3. Restart server
4. Test with a paid note
5. Monitor admin panel for transactions

---

**Ready to go live?** Make sure all environment variables are set correctly and test thoroughly before deploying to production.
