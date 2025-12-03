# Dodo Payments Configuration Guide

**Status:** ✅ Configured  
**Project ID:** `pdt_CZikJJg7rTP13neCwBqng`  
**Checkout URL:** `https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng`

---

## ✅ Current Configuration

Your `.env` file has been updated with:

```bash
DODO_PROJECT_ID=pdt_CZikJJg7rTP13neCwBqng
DODO_CHECKOUT_URL=https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng
```

---

## 🔄 How It Works

### Payment Flow with Your Project ID

```
1. User clicks "Download" on a paid note
   ↓
2. Dodo Payment Gateway modal opens
   ↓
3. User clicks "Pay ₹X"
   ↓
4. System generates checkout URL with parameters:
   https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng?
   quantity=1&
   email=user@example.com&
   phone=9876543210&
   custom_order_id=note-5-user123-1701234567890&
   custom_description=Download: Note Title&
   custom_return_url=http://localhost:5173/download-notes?payment=success&
   custom_notify_url=http://localhost:8000/api/dodo-webhook
   ↓
5. User redirected to Dodo checkout page
   ↓
6. User completes payment
   ↓
7. Dodo sends webhook confirmation
   ↓
8. Download recorded, coins awarded
```

---

## 📝 Environment Variables

### Required
```bash
DODO_PROJECT_ID=pdt_CZikJJg7rTP13neCwBqng
DODO_CHECKOUT_URL=https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng
```

### Optional (for API calls)
```bash
DODO_API_KEY=your_api_key_if_available
DODO_API_URL=https://api.dodopayments.com
```

---

## 🔗 Checkout URL Parameters

When a user initiates payment, the system automatically adds:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `quantity` | `1` | Fixed quantity |
| `email` | User email | Customer email |
| `phone` | User phone | Customer phone |
| `custom_order_id` | Unique ID | Track order |
| `custom_description` | Note title | Payment description |
| `custom_return_url` | App URL | Redirect after payment |
| `custom_notify_url` | Webhook URL | Payment confirmation |

---

## 🚀 Testing the Integration

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Access Download Notes
Navigate to: `http://localhost:5173/download-notes`

### Step 3: Find a Paid Note
Look for notes with a price > 0

### Step 4: Click Download
- Payment gateway modal opens
- Click "Pay ₹X"
- You'll be redirected to Dodo checkout

### Step 5: Complete Payment
- Enter payment details on Dodo checkout
- Complete the transaction
- You'll be redirected back to the app

---

## 📊 Payment Tracking

### Order ID Format
```
note-{noteId}-{userId}-{timestamp}

Example: note-5-user123-1701234567890
```

This format allows the system to:
- Identify which note was purchased
- Identify which user made the purchase
- Track payment timestamp
- Prevent duplicate purchases

---

## 🔐 Security Considerations

### Webhook Verification
Dodo will send webhook confirmations to:
```
POST http://localhost:8000/api/dodo-webhook
```

The webhook includes:
- Transaction ID
- Order ID
- Payment status
- Amount
- Signature for verification

### Custom Metadata
Your custom parameters are passed through to Dodo:
- `custom_order_id` - Your internal order tracking
- `custom_description` - Payment description
- `custom_return_url` - Where to redirect after payment
- `custom_notify_url` - Where to send webhook

---

## 💰 Pricing

### How Pricing Works

When a user downloads a paid note:

1. **Note Price:** Set by the note uploader
2. **GST (18%):** Automatically calculated
3. **Total:** Price + GST

Example:
```
Note Price:    ₹100
GST (18%):     ₹18
─────────────────────
Total:         ₹118
```

### Coin Distribution

After successful payment:
- User's coin balance: Deducted by note price
- Creator's coin balance: Increased by 50% of note price

Example:
```
Note Price: ₹100
Creator Earnings: ₹50 (50% of price)
Platform Earnings: ₹50 (50% of price)
```

---

## 📱 User Experience

### For Buyers
1. Browse notes on `/download-notes`
2. Click "Download" on a paid note
3. See order summary (price + 18% GST)
4. Click "Pay ₹X"
5. Redirected to Dodo secure checkout
6. Complete payment
7. Redirected back to app
8. Download available immediately

### For Sellers
1. Set note price when uploading
2. Receive 50% of sale price as coins
3. See sales in admin panel
4. Track earnings over time

---

## 🔧 Troubleshooting

### Issue: Payment Gateway Not Opening
**Solution:**
- Verify note has `price > 0`
- Check `.env` has correct `DODO_CHECKOUT_URL`
- Restart server after `.env` changes

### Issue: Redirect Not Working
**Solution:**
- Verify `custom_return_url` is correct
- Check browser console for errors
- Verify server is running

### Issue: Webhook Not Processing
**Solution:**
- Check if webhook URL is accessible from Dodo servers
- Verify firewall allows incoming webhooks
- Check server logs for webhook errors

### Issue: Payment Completed But Download Not Recorded
**Solution:**
- Check server logs for webhook receipt
- Verify webhook signature validation
- Check database for transaction record

---

## 📈 Monitoring

### Key Metrics to Track

1. **Payment Success Rate**
   - Monitor successful vs failed payments
   - Check admin panel for transaction history

2. **Webhook Delivery**
   - Check server logs for webhook receipt
   - Verify all payments are confirmed

3. **Revenue**
   - Track total payments received
   - Monitor creator earnings
   - Calculate platform earnings

4. **User Activity**
   - Track downloads by payment method
   - Monitor user engagement
   - Analyze popular notes

---

## 🎯 Next Steps

### Immediate
1. ✅ Project ID configured
2. ✅ Checkout URL configured
3. ✅ Environment variables set
4. **→ Test payment flow**

### Testing
1. Start server: `npm run dev`
2. Go to `/download-notes`
3. Find a paid note
4. Click download
5. Complete payment on Dodo
6. Verify download recorded

### Production
1. Update return URLs for production domain
2. Configure webhook URL in Dodo dashboard
3. Test with real payments
4. Monitor transactions
5. Deploy to production

---

## 📞 Support

### Documentation
- Setup Guide: `DODO-PAYMENTS-SETUP.md`
- Quick Start: `DODO-QUICK-START.md`
- Code Reference: `DODO-CODE-REFERENCE.md`
- Implementation: `DODO-IMPLEMENTATION-SUMMARY.md`

### Debugging
1. Check server logs: `npm run dev`
2. Check browser console: F12 → Console
3. Check admin panel: Transaction history
4. Check database: Transactions table

### Dodo Support
- Dodo Dashboard: https://dashboard.dodopayments.com
- Project ID: `pdt_CZikJJg7rTP13neCwBqng`
- Checkout URL: https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng

---

## ✅ Verification Checklist

- [x] Project ID configured: `pdt_CZikJJg7rTP13neCwBqng`
- [x] Checkout URL configured: `https://checkout.dodopayments.com/buy/pdt_CZikJJg7rTP13neCwBqng`
- [x] Environment variables set in `.env`
- [ ] Server restarted after `.env` changes
- [ ] Payment flow tested
- [ ] Download recorded after payment
- [ ] Coins awarded to creator
- [ ] Admin panel shows transaction
- [ ] Webhook processing verified

---

**Configuration Date:** December 2, 2025  
**Status:** ✅ Ready for Testing  
**Version:** 1.0
