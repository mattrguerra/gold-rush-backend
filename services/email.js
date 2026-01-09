const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendBookingConfirmation(booking, customer, service) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customer.email,
        subject: 'Gold Rush Detailing - Booking Confirmation',
        html: `
            <h2>Booking Confirmed!</h2>
            <p>Thank you for booking with Gold Rush Detailing, ${customer.name}!</p>
            <h3>Booking Details:</h3>
            <ul>
                <li><strong>Service:</strong> ${service.name}</li>
                <li><strong>Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${booking.scheduled_time}</li>
                <li><strong>Vehicle:</strong> ${booking.vehicle_type}</li>
                <li><strong>Price:</strong> $${booking.total_price}</li>
            </ul>
            <p>We'll see you soon!</p>
            <p>Gold Rush Detailing<br>Richmond/Katy, TX</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent to:', customer.email);
    } catch (err) {
        console.error('Email error:', err.message);
    }
}

async function sendAdminNotification(booking, customer, service) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'New Booking Received!',
        html: `
            <h2>New Booking</h2>
            <h3>Customer:</h3>
            <ul>
                <li><strong>Name:</strong> ${customer.name}</li>
                <li><strong>Email:</strong> ${customer.email}</li>
                <li><strong>Phone:</strong> ${customer.phone || 'Not provided'}</li>
            </ul>
            <h3>Booking Details:</h3>
            <ul>
                <li><strong>Service:</strong> ${service.name}</li>
                <li><strong>Date:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()}</li>
                <li><strong>Time:</strong> ${booking.scheduled_time}</li>
                <li><strong>Vehicle:</strong> ${booking.vehicle_type}</li>
                <li><strong>Price:</strong> $${booking.total_price}</li>
            </ul>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Admin notification sent');
    } catch (err) {
        console.error('Admin email error:', err.message);
    }
}

module.exports = { sendBookingConfirmation, sendAdminNotification };