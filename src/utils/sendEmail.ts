
import nodemailer, { Transporter } from "nodemailer"


interface sendInterface {
    to: string;
    subject: string;
    message: string
}


interface mailOptionsInterface {
    from: string;
    to: string;
    subject: string;
    text: string;
}

export class sendEmail {
    private static transPorter: Transporter;
    public static async send({ to, subject, message }: sendInterface) {

        // create transporter
        this.transPorter = nodemailer.createTransport({
            // @ts-ignore
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            service: process.env.SMTP_SERVICE,
            secure: false,
            auth: {
                user: process.env.SMTP_ADMIN_EMAIL,
                pass: process.env.SMTP_ADMIN_PASSWORD,
            },
        });

        const mailOptions: mailOptionsInterface = {
            from: process.env.SMTP_ADMIN_EMAIL || '',
            to,
            subject,
            text: message,
        };

        // send email 
        await this.transPorter.sendMail(mailOptions)
    }
}