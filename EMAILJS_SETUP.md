# EmailJS Setup Guide for Orbia Waitlist

## Overview
This guide will help you set up EmailJS to send welcome emails when users join the Orbia waitlist.

## EmailJS Configuration

The current configuration uses:
- **Service ID**: `default_service`
- **Template ID**: `template_uyc8w3h` 
- **Public Key**: `3gBjZmaoy13aQvCga`

## Template Variables

Your EmailJS template should include these variables that will be automatically populated:

### Welcome Email Template Variables:
- `{{to_name}}` - User's name
- `{{to_email}}` - User's email address
- `{{from_name}}` - "Orbia Team"
- `{{subject}}` - "Welcome to Orbia Waitlist! 🚀"
- `{{message}}` - Welcome message text
- `{{html_content}}` - Full HTML email content (optional)

### Admin Notification Template Variables:
- `{{to_name}}` - "Admin"
- `{{to_email}}` - Your admin email
- `{{from_name}}` - "Orbia System"
- `{{subject}}` - "New Orbia Waitlist Signup"
- `{{message}}` - Signup details

## Sample EmailJS Template

Create a template in EmailJS with this structure:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{subject}}</title>
</head>
<body>
    <h2>Hi {{to_name}}!</h2>
    <p>{{message}}</p>
    <p>Best regards,<br>{{from_name}}</p>
</body>
</html>
```

## Setup Steps

1. **Go to EmailJS Dashboard**: Visit [emailjs.com](https://www.emailjs.com)

2. **Email Services**: 
   - Connect your email service (Gmail, Outlook, etc.)
   - Note your Service ID (should be `default_service`)

3. **Create Email Template**:
   - Create a new template with ID `template_uyc8w3h`
   - Use the variables listed above
   - Set the "To Email" field to `{{to_email}}`
   - Set the "Subject" field to `{{subject}}`

4. **Get Your Public Key**:
   - Go to Account → API Keys
   - Copy your Public Key (should be `3gBjZmaoy13aQvCga`)

5. **Test Your Template**:
   - Use EmailJS's test feature to verify your template works

## Template Example

Here's a complete example template you can use:

**Subject**: `{{subject}}`

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Orbia</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #22c55e; }
        .logo { font-size: 24px; font-weight: bold; color: #22c55e; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Orbia</div>
            <p>Your Orbit of Personal Productivity</p>
        </div>
        <h2>Hi {{to_name}}!</h2>
        <p>{{message}}</p>
        <p>Best regards,<br>{{from_name}}</p>
    </div>
</body>
</html>
```

## Troubleshooting

- **Emails not sending**: Check browser console for EmailJS errors
- **Template not found**: Verify your Template ID matches `template_uyc8w3h`
- **Service not found**: Verify your Service ID matches `default_service`
- **Invalid public key**: Verify your Public Key matches `3gBjZmaoy13aQvCga`

## Environment Variables (Optional)

You can move the configuration to environment variables if needed:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=default_service
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_uyc8w3h
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=3gBjZmaoy13aQvCga
```

Then update `lib/email.ts` to use these variables instead of hardcoded values.

## Features Implemented

✅ **Waitlist Modal**: Beautiful modal with form validation  
✅ **Country Flags**: Country code selector with flag emojis  
✅ **EmailJS Integration**: Welcome emails sent via EmailJS  
✅ **Database Storage**: Waitlist entries saved to database  
✅ **Error Handling**: Proper error messages and validation  
✅ **Toast Notifications**: Success/error feedback  
✅ **Admin Notifications**: Email alerts for new signups  

## Testing

To test the waitlist functionality:

1. Open the app in your browser
2. Click any "Join Waitlist" button
3. Fill out the form with valid information
4. Submit and check:
   - Database entry is created
   - Welcome email is sent to user
   - Admin notification is sent
   - Success message is displayed

The EmailJS integration will automatically send emails based on your configured templates. 