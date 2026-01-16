const express = require('express');
const router = express.Router();
const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        
        sendSmtpEmail.sender = { name: 'Gold Rush Website', email: 'noreply@goldrushdetailing.com' };
        sendSmtpEmail.to = [{ email: 'contact@goldrushdetailing.com', name: 'Gold Rush Contact' }];
        sendSmtpEmail.replyTo = { email: email, name: name };
        sendSmtpEmail.subject = `Contact Form: ${subject} - ${name}`;
        sendSmtpEmail.htmlContent = `
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

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending contact form:', error.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;