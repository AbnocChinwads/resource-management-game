import { Resend } from "resend";

/**
 * Central email service.
 *
 * All application emails should be sent through this module.
 * This keeps the rest of the application independent of
 * the underlying email provider.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({
    to,
    subject,
    html,
    text,
}) {
    return resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
    });
}

export async function sendWelcomeEmail(email, username) {
    return sendEmail({
        to: email,
        subject: "Welcome to Who Ate All The Icecream",
        html: `
            <h1>Welcome ${username}!</h1>

            <p>
                Thanks for creating your Who Ate All The Icecream account.
            </p>

            <p>
                We hope you enjoy building your settlement!
            </p>
        `,
    });
}

export async function sendVerificationEmail({ user, url }) {
    return sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `
            <h1>Verify your email</h1>

            <p>Hello ${user.name},</p>

            <p>
                Please click the link below to verify your email address.
            </p>

            <p>
                <a href="${url}">
                    Verify Email
                </a>
            </p>
        `,
    });
}

export async function sendPasswordChangedEmail(email, username) {
    return sendEmail({
        to: email,
        subject: "Your password has been changed",
        html: `
            <h1>Password Changed</h1>

            <p>Hello ${username},</p>

            <p>
                Your account password has been changed.
            </p>

            <p>
                If this wasn't you, please reset your password immediately.
            </p>
        `,
    });
}

export async function sendEmailChangedEmail(oldEmail, username) {
    return sendEmail({
        to: oldEmail,
        subject: "Your email address has changed",
        html: `
            <h1>Email Changed</h1>

            <p>Hello ${username},</p>

            <p>
                Your account email address has been changed.
            </p>

            <p>
                If this wasn't you, please contact support immediately.
            </p>
        `,
    });
}
