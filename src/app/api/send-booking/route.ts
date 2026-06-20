import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();

    const {
      guest_name,
      guest_email,
      guest_phone,
      room_name,
      check_in,
      check_out,
      num_guests,
      amount_total,
      status,
      notes,
    } = bookingData;

    if (!guest_name || !guest_email || !room_name || !check_in || !check_out) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const numNights = Math.ceil(
      (new Date(check_out).getTime() - new Date(check_in).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Email to property owner
    const ownerMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'agrawalhouse34@gmail.com',
      subject: `New Booking Request from ${guest_name} - Agrawal House`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2c5f2d; border-bottom: 2px solid #2c5f2d; padding-bottom: 10px;">
            New Booking Received
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Guest Details</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${guest_name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${guest_email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${guest_phone}</p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Booking Details</h3>
            <p style="margin: 8px 0;"><strong>Room:</strong> ${room_name}</p>
            <p style="margin: 8px 0;"><strong>Check-In:</strong> ${check_in}</p>
            <p style="margin: 8px 0;"><strong>Check-Out:</strong> ${check_out}</p>
            <p style="margin: 8px 0;"><strong>Nights:</strong> ${numNights}</p>
            <p style="margin: 8px 0;"><strong>Guests:</strong> ${num_guests}</p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> ₹${amount_total}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: 700; color: ${status === 'confirmed' ? '#2c5f2d' : '#b45309'};">${status}</span></p>
            ${notes ? `<p style="margin: 8px 0;"><strong>Special Requests:</strong></p><div style="background-color: #fff; padding: 12px; border-left: 4px solid #2c5f2d; margin-top: 8px;">${notes.replace(/\n/g, '<br>')}</div>` : ''}
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This booking was submitted from the Agrawal House website.
          </p>
        </div>
      `,
    };

    // Email to guest (confirmation)
    const guestMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: guest_email,
      subject: `Booking Confirmation - Agrawal House`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2c5f2d; border-bottom: 2px solid #2c5f2d; padding-bottom: 10px;">
            Thank You for Your Booking Request!
          </h2>
          
          <p style="font-size: 1.05rem; line-height: 1.6;">
            Dear ${guest_name},
          </p>
          
          <p style="line-height: 1.6;">
            We have received your booking request at <strong>Agrawal House</strong>. Here are your booking details:
          </p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Booking Summary</h3>
            <p style="margin: 8px 0;"><strong>Room:</strong> ${room_name}</p>
            <p style="margin: 8px 0;"><strong>Check-In:</strong> ${check_in}</p>
            <p style="margin: 8px 0;"><strong>Check-Out:</strong> ${check_out}</p>
            <p style="margin: 8px 0;"><strong>Nights:</strong> ${numNights}</p>
            <p style="margin: 8px 0;"><strong>Guests:</strong> ${num_guests}</p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> ₹${amount_total}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: 700; color: ${status === 'confirmed' ? '#2c5f2d' : '#b45309'};">${status}</span></p>
          </div>

          <div style="background-color: #fff3cd; padding: 16px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-size: 0.95rem;">
              <strong>What happens next?</strong><br />
              ${status === 'confirmed'
                ? 'Your booking is instantly confirmed! We look forward to welcoming you.'
                : 'Our team will review your request and contact you shortly to confirm the booking.'}
            </p>
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a1a1a;">Contact Information</h3>
            <p style="margin: 8px 0;"><strong>Phone:</strong> +91 7415160134, +91 9425094180</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> agrawalhouse34@gmail.com</p>
            <p style="margin: 8px 0;"><strong>Address:</strong> 27/1 Patwa Bakhal Gali, Patni Bazaar, Agrawal House, Ujjain, MP - 452002</p>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you have any questions, feel free to reply to this email or call us directly.
          </p>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(guestMailOptions),
    ]);

    return NextResponse.json(
      { success: true, message: 'Booking emails sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending booking emails:', error);
    return NextResponse.json(
      { error: 'Failed to send booking emails' },
      { status: 500 }
    );
  }
}