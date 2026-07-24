import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM;
const WELCOME_SUBJECT = "Welcome to Who Ate All The Icecream";

export async function sendWelcomeEmail(email, username) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: WELCOME_SUBJECT,
    html: `
                <h1>Welcome, ${username}!</h1>

                <p>Your account has been created successfully.</p>

                <p>Thank you for helping test the game.</p>
                
                <p>You can now log in and begin building your settlement.</p>
            `,
  });

  if (error) {
    throw error;
  }

  return data;
}
