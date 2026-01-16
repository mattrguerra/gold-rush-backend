const express = require('express');
const router = express.Router();
const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Email to Gold Rush
        const adminEmail = new Brevo.SendSmtpEmail();
        adminEmail.sender = { name: 'Gold Rush Website', email: 'noreply@goldrushdetailing.com' };
        adminEmail.to = [{ email: 'contact@goldrushdetailing.com', name: 'Gold Rush Contact' }];
        adminEmail.replyTo = { email: email, name: name };
        adminEmail.subject = `Contact Form: ${subject} - ${name}`;
        adminEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
                <h1 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px;">New Contact Form Submission</h1>
                
                <div style="background: #1a1a1a; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Name:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Email:</strong> <a href="mailto:${email}" style="color: #d4af37;">${email}</a></p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Phone:</strong> ${phone || 'Not provided'}</p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Subject:</strong> ${subject}</p>
                </div>
                
                <div style="background: #1a1a1a; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <h3 style="margin-top: 0; color: #d4af37;">Message</h3>
                    <p style="margin: 10px 0; white-space: pre-wrap;">${message}</p>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">Reply directly to this email to respond to ${name}.</p>
            </div>
        `;

        // Confirmation email to customer
        const confirmEmail = new Brevo.SendSmtpEmail();
        confirmEmail.sender = { name: 'Gold Rush Detailing', email: 'noreply@goldrushdetailing.com' };
        confirmEmail.to = [{ email: email, name: name }];
        confirmEmail.subject = 'We Received Your Message - Gold Rush Detailing';
        confirmEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
                <h1 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px;">Message Received!</h1>
                
                <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                <p style="font-size: 16px; line-height: 1.6; color: #999;">Thank you for reaching out to Gold Rush Detailing. We've received your message and will get back to you within 24 hours.</p>
                
                <div style="background: #1a1a1a; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <h3 style="margin-top: 0; color: #d4af37;">Your Message</h3>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Subject:</strong> ${subject}</p>
                    <p style="margin: 10px 0; white-space: pre-wrap; color: #999;">${message}</p>
                </div>
                
                <p style="margin-top: 30px; color: #999;">Need immediate assistance? Give us a call:</p>
                <p style="color: #999;">
                    Phone: <a href="tel:+18323302403" style="color: #d4af37;">(832) 330-2403</a>
                </p>
                
                <p style="margin-top: 30px; font-size: 16px;">Talk soon!</p>
                <p style="color: #d4af37; font-weight: bold; font-size: 18px;">– Gold Rush Detailing</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666;">
                    <p>Gold Rush Detailing | Richmond & Katy, TX<br>
                    <a href="https://goldrushdetailing.com" style="color: #d4af37;">www.goldrushdetailing.com</a></p>
                </div>
            </div>
        `;

        // Send both emails
        await Promise.all([
            apiInstance.sendTransacEmail(adminEmail),
            apiInstance.sendTransacEmail(confirmEmail)
        ]);
        
        console.log('Contact form emails sent');
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending contact form:', error.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;