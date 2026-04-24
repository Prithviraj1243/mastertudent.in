import { MailService } from '@sendgrid/mail';

// In dev SQLite mode, skip strict SendGrid requirement
if (!process.env.SENDGRID_API_KEY && process.env.USE_SQLITE === '1') {
  // no-op; functions will return true and log
} else if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Skip email sending if API key is not properly configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.warn('SendGrid API key not properly configured, skipping email');
      return true; // Return true to not break the flow
    }

    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const welcomeEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to MasterStudent!</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .features { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature { margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 MasterStudent</div>
          <h1>Welcome to Your Study Success Platform!</h1>
        </div>
        
        <div class="content">
          <p>Hi ${userName}!</p>
          
          <p>Welcome to <strong>MasterStudent</strong> - where top-performing students share their study notes and you can access premium educational content to boost your academic performance!</p>
          
          <div class="features">
            <h3>🚀 What You Get:</h3>
            <div class="feature">📚 <strong>Premium Study Notes</strong> from top students across India</div>
            <div class="feature">🎯 <strong>Comprehensive Coverage</strong> - Classes 9-12, JEE, NEET, CUET & more</div>
            <div class="feature">🪙 <strong>100 Free Coins</strong> to start downloading notes immediately</div>
            <div class="feature">⚡ <strong>3 Free Downloads</strong> daily to explore our content</div>
            <div class="feature">📈 <strong>Earn & Learn</strong> - Get coins for engagement and participation</div>
          </div>
          
          <p>Ready to accelerate your studies? Start browsing our extensive collection of high-quality notes!</p>
          
          <div style="text-align: center;">
            <a href="https://masterstudent.in" class="button">
              Start Learning Now →
            </a>
          </div>
          
          <p><strong>Pro Tip:</strong> Complete your profile setup to discover notes perfectly matched to your curriculum and interests!</p>
        </div>
        
        <div class="footer">
          <p>Questions? Just reply to this email - we're here to help!</p>
          <p>Happy studying! 📖✨</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const welcomeEmailText = `
Welcome to MasterStudent, ${userName}!

You've joined India's premier platform where top-performing students share their study notes.

What You Get:
• Premium study notes from top students
• Coverage for Classes 9-12, JEE, NEET, CUET & more  
• 100 free coins to start downloading
• 3 free downloads daily
• Earn coins through engagement

Ready to boost your studies? Visit: https://masterstudent.in

Questions? Just reply to this email!
Happy studying!
`;

  return await sendEmail({
    to: userEmail,
    from: 'welcome@masterstudent.com', // You should verify this domain in SendGrid
    subject: '🎉 Welcome to MasterStudent - Your Study Success Starts Here!',
    text: welcomeEmailText,
    html: welcomeEmailHtml,
  });
}