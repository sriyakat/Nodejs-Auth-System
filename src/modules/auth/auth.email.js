const fs = require('fs');
const tls = require('tls');
const nodemailer = require('nodemailer');

const assertEmailConfiguration = () => {
    const requiredSettings = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];
    const isPlaceholder = (value) => /your-|placeholder|change.?me|example\.com/i.test(value);
    const missingSettings = requiredSettings.filter((setting) => {
        const value = process.env[setting];
        return !value || isPlaceholder(value);
    });

    if (missingSettings.length > 0) {
        const error = new Error(`Missing or placeholder email configuration: ${missingSettings.join(', ')}`);
        error.code = 'EMAIL_NOT_CONFIGURED';
        throw error;
    }

    const port = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        const error = new Error('SMTP_PORT must be a valid port number.');
        error.code = 'EMAIL_NOT_CONFIGURED';
        throw error;
    }

    const frontendUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173');
    if (!['http:', 'https:'].includes(frontendUrl.protocol)) {
        const error = new Error('FRONTEND_URL must use HTTP or HTTPS.');
        error.code = 'EMAIL_NOT_CONFIGURED';
        throw error;
    }

    return frontendUrl;
};

const sendPasswordResetEmail = async (email, token) => {
    const frontendUrl = assertEmailConfiguration();
    const resetUrl = new URL('/reset-password', frontendUrl);
    resetUrl.searchParams.set('token', token);
    const transporterOptions = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    };

    if (process.env.SMTP_TLS_CA_FILE) {
        try {
            transporterOptions.tls = {
                ca: [
                    ...tls.rootCertificates,
                    fs.readFileSync(process.env.SMTP_TLS_CA_FILE)
                ]
            };
        } catch (cause) {
            const error = new Error('Unable to read SMTP_TLS_CA_FILE.', { cause });
            error.code = 'SMTP_TLS_CA_FILE_ERROR';
            throw error;
        }
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Reset your password',
            text: `Use this link to reset your password. It expires in 30 minutes and can only be used once:\n\n${resetUrl.href}\n\nIf you did not request this, you can ignore this email.`,
            html: `<p>Use the link below to reset your password. It expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl.href}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`
        });
    } catch (cause) {
        const certificateErrorCodes = new Set([
            'SELF_SIGNED_CERT_IN_CHAIN',
            'DEPTH_ZERO_SELF_SIGNED_CERT',
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
            'CERT_HAS_EXPIRED',
            'ERR_TLS_CERT_ALTNAME_INVALID'
        ]);
        const certificateErrorMessage = /self-signed certificate|certificate verify failed|unable to verify|certificate has expired|does not match certificate/i.test(cause.message || '');

        if (certificateErrorCodes.has(cause.code) || certificateErrorMessage) {
            const error = new Error('SMTP TLS certificate is not trusted. Configure the trusted root CA or disable SMTP traffic interception.', { cause });
            error.code = 'SMTP_TLS_CERTIFICATE_ERROR';
            throw error;
        }

        throw cause;
    }
};

module.exports = { assertEmailConfiguration, sendPasswordResetEmail };
