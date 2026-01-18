const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const API_BASE = 'https://gold-rush-backend-production.up.railway.app';
const ACTION_SECRET = process.env.ACTION_SECRET || 'goldrushadmin';

// Admin email addresses for notifications
const ADMIN_EMAILS = [
    { email: 'booking@goldrushdetailing.com', name: 'Dominick | Gold Rush Detailing' },
    { email: 'webdev@goldrushdetailing.com', name: 'Webmaster | Gold Rush Detailing' }
];

function generateActionToken(bookingId) {
    return Buffer.from(`${bookingId}-${ACTION_SECRET}`).toString('base64');
}

const sendBookingConfirmation = async (booking, customer, service) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        
        sendSmtpEmail.sender = { name: 'Gold Rush Detailing', email: 'noreply@goldrushdetailing.com' };
        sendSmtpEmail.to = [{ email: customer.email, name: customer.name }];
        sendSmtpEmail.subject = 'Booking Confirmation - Gold Rush Detailing';
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
                <h1 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px;">Booking Confirmed!</h1>
                
                <p style="font-size: 16px; line-height: 1.6;">Hi ${customer.name},</p>
                <p style="font-size: 16px; line-height: 1.6; color: #999;">Thank you for booking with Gold Rush Detailing. Here are your appointment details:</p>
                
                <div style="background: #1a1a1a; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Service:</strong> ${service.name}</p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Time:</strong> ${booking.scheduled_time}</p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Vehicle:</strong> ${booking.vehicle_type || 'Not specified'}</p>
                    <p style="margin: 10px 0;"><strong style="color: #d4af37;">Price:</strong> $${booking.total_price}</p>
                    ${customer.address ? `<p style="margin: 10px 0;"><strong style="color: #d4af37;">Location:</strong> ${customer.address}</p>` : ''}
                </div>
                
                <p style="font-size: 16px; color: #d4af37; margin-top: 30px;"><strong>What to expect:</strong></p>
                <ul style="color: #999; line-height: 1.8;">
                    <li>We'll arrive at your location at the scheduled time</li>
                    <li>Please ensure the vehicle is accessible</li>
                    <li>We bring all equipment and supplies</li>
                </ul>
                
                <p style="margin-top: 30px; color: #999;">Need to reschedule or have questions?</p>
                <p style="color: #999;">
                    Phone: <a href="tel:+18323302403" style="color: #d4af37;">(832) 330-2403</a><br>
                    Email: <a href="mailto:info@goldrushdetailing.com" style="color: #d4af37;">info@goldrushdetailing.com</a>
                </p>
                
                <p style="margin-top: 30px; font-size: 16px;">We look forward to making your vehicle shine!</p>
                <p style="color: #d4af37; font-weight: bold; font-size: 18px;">— Gold Rush Detailing</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; font-size: 12px; color: #666;">
                    <p>Gold Rush Detailing | Richmond & Katy, TX<br>
                    <a href="https://goldrushdetailing.com" style="color: #d4af37;">www.goldrushdetailing.com</a></p>
                </div>
            </div>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Confirmation email sent to:', customer.email);
    } catch (error) {
        console.error('Error sending confirmation email:', error.message);
    }
};

const sendAdminNotification = async (booking, customer, service) => {
    try {
        const token = generateActionToken(booking.id);
        const confirmUrl = `${API_BASE}/api/booking-actions/confirm/${booking.id}/${token}`;
        const cancelUrl = `${API_BASE}/api/booking-actions/cancel/${booking.id}/${token}`;
        
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        
        sendSmtpEmail.sender = { name: 'Gold Rush Detailing', email: 'noreply@goldrushdetailing.com' };
        sendSmtpEmail.to = ADMIN_EMAILS;
        sendSmtpEmail.subject = `New Booking: ${service.name} - ${customer.name}`;
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
                <h1 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 30px;">New Booking Received</h1>
                
                <div style="background: #1a1a1a; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <h3 style="margin-top: 0; color: #d4af37;">Customer Info</h3>
                    <p style="margin: 10px 0;"><strong>Name:</strong> ${customer.name}</p>
                    <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${customer.email}" style="color: #d4af37;">${customer.email}</a></p>
                    <p style="margin: 10px 0;"><strong>Phone:</strong> <a href="tel:${customer.phone}" style="color: #d4af37;">${customer.phone || 'Not provided'}</a></p>
                    ${customer.address ? `<p style="margin: 10px 0;"><strong>Address:</strong> ${customer.address}</p>` : ''}
                </div>
                
                <div style="background: #1a1a1a; padding: 25px; margin: 25px 0; border-left: 4px solid #d4af37;">
                    <h3 style="margin-top: 0; color: #d4af37;">Booking Details</h3>
                    <p style="margin: 10px 0;"><strong>Service:</strong> ${service.name}</p>
                    <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 10px 0;"><strong>Time:</strong> ${booking.scheduled_time}</p>
                    <p style="margin: 10px 0;"><strong>Vehicle:</strong> ${booking.vehicle_type || 'Not specified'}</p>
                    <p style="margin: 10px 0;"><strong>Price:</strong> $${booking.total_price}</p>
                    ${booking.notes ? `<p style="margin: 10px 0;"><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${confirmUrl}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 5px; border-radius: 4px;">✓ CONFIRM BOOKING</a>
                    <a href="${cancelUrl}" style="display: inline-block; background: #ef4444; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 5px; border-radius: 4px;">✕ CANCEL BOOKING</a>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="https://goldrushdetailing.com/admin.html" style="display: inline-block; background: #d4af37; color: #0a0a0a; padding: 15px 30px; text-decoration: none; font-weight: bold;">View in Dashboard</a>
                </div>
            </div>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Admin notification sent to:', ADMIN_EMAILS.map(e => e.email).join(', '));
    } catch (error) {
        console.error('Error sending admin notification:', error.message);
    }
};

module.exports = { sendBookingConfirmation, sendAdminNotification };