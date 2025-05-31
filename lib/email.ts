// Email service utility using EmailJS
import emailjs from '@emailjs/browser';

interface EmailData {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
}

// Initialize EmailJS
let initialized = false;

export const initializeEmailJS = () => {
  if (typeof window !== 'undefined' && !initialized) {
    try {
      emailjs.init("3gBjZmaoy13aQvCga"); // Your public key
      initialized = true;
      console.log("EmailJS initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing EmailJS:", error);
      return false;
    }
  }
  return initialized;
};

// Welcome email template data
export const WELCOME_EMAIL_TEMPLATE = {
  subject: "Welcome to Orbia Waitlist! 🚀",
  getHtmlContent: (name: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Orbia</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #22c55e; }
        .logo { font-size: 24px; font-weight: bold; color: #22c55e; }
        .content { padding: 30px 0; }
        .highlight { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Orbia</div>
          <p>Your Orbit of Personal Productivity</p>
        </div>
        
        <div class="content">
          <h2>Welcome to the waitlist, ${name}! 🎉</h2>
          
          <p>Thank you for joining the Orbia waitlist. You're now part of an exclusive group who will be among the first to experience the future of personal productivity through WhatsApp.</p>
          
          <div class="highlight">
            <strong>What's Next?</strong><br>
            We're working hard to bring you the best WhatsApp-powered personal assistant. We'll notify you via email as soon as we're ready to launch!
          </div>
          
          <p><strong>What can you expect from Orbia?</strong></p>
          <ul>
            <li>📅 Seamless calendar management through WhatsApp</li>
            <li>📄 Instant access to your documents and files</li>
            <li>🔗 GitHub, Gmail, and other service integrations</li>
            <li>🤖 AI-powered assistance that remembers your preferences</li>
            <li>🔒 Privacy-first approach with secure data handling</li>
          </ul>
          
          <p>In the meantime, feel free to follow our progress and share Orbia with friends who might be interested!</p>
          
          <p>Best regards,<br>The Orbia Team</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Orbia. All rights reserved.</p>
          <p>You received this email because you signed up for the Orbia waitlist.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  getTextContent: (name: string) => `
Welcome to the Orbia waitlist, ${name}!

Thank you for joining our waitlist. You're now part of an exclusive group who will be among the first to experience the future of personal productivity through WhatsApp.

What's Next?
We're working hard to bring you the best WhatsApp-powered personal assistant. We'll notify you via email as soon as we're ready to launch!

What can you expect from Orbia?
- Seamless calendar management through WhatsApp
- Instant access to your documents and files  
- GitHub, Gmail, and other service integrations
- AI-powered assistance that remembers your preferences
- Privacy-first approach with secure data handling

In the meantime, feel free to follow our progress and share Orbia with friends who might be interested!

Best regards,
The Orbia Team

© ${new Date().getFullYear()} Orbia. All rights reserved.
You received this email because you signed up for the Orbia waitlist.
  `
};

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'default_service',
  welcomeTemplateId: 'template_uyc8w3h',
  adminTemplateId: 'template_uyc8w3h', // You might want to create a separate admin template
  publicKey: '3gBjZmaoy13aQvCga'
};

// Email service functions using EmailJS
export async function sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`📧 Sending welcome email to ${email} for ${name}`);
    
    // Initialize EmailJS if not already done
    if (typeof window !== 'undefined') {
      initializeEmailJS();
    }
    
    // Prepare email parameters that match your EmailJS template
    const emailParams = {
      to_name: name,
      to_email: email,
      from_name: 'Orbia Team',
      subject: WELCOME_EMAIL_TEMPLATE.subject,
      message: `Hi ${name}! Welcome to the Orbia waitlist. You're now part of an exclusive group who will be among the first to experience the future of personal productivity through WhatsApp. We'll notify you via email as soon as we're ready to launch!`,
      html_content: WELCOME_EMAIL_TEMPLATE.getHtmlContent(name)
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.welcomeTemplateId,
      emailParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Welcome email sent successfully:', response.status, response.text);
    return { success: true };
    
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(waitlistData: any): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`📧 Sending admin notification for new signup: ${waitlistData.name}`);
    
    // Initialize EmailJS if not already done
    if (typeof window !== 'undefined') {
      initializeEmailJS();
    }
    
    // Prepare admin notification parameters
    const adminParams = {
      to_name: 'Admin',
      to_email: 'admin@orbia.com', // Replace with your admin email
      from_name: 'Orbia System',
      subject: 'New Orbia Waitlist Signup',
      message: `
New user joined the Orbia waitlist:

Name: ${waitlistData.name}
Email: ${waitlistData.email}
Phone: ${waitlistData.countryCode}${waitlistData.phoneNumber}
Signup Time: ${new Date().toISOString()}
      `.trim()
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.adminTemplateId,
      adminParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Admin notification sent successfully:', response.status, response.text);
    return { success: true };
    
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
    return { success: false, error };
  }
}

// Alternative function for form-based sending (as per your provided code)
export const sendEmailViaForm = async (formElement: HTMLFormElement): Promise<boolean> => {
  if (!formElement) {
    throw new Error("Form element is required");
  }

  if (typeof window === 'undefined') {
    throw new Error("EmailJS can only be used in browser environment");
  }

  try {
    initializeEmailJS();
    
    await emailjs.sendForm(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.welcomeTemplateId,
      formElement,
      EMAILJS_CONFIG.publicKey
    );
    
    return true;
  } catch (error) {
    console.error("Error sending email via form:", error);
    throw error;
  }
}; 