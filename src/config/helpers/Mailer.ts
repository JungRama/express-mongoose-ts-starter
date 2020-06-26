import MailGen from 'mailgen'
import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()

export default class Mailer {
    static sendEmail = (
        theme: string = 'salted', 
        to: string,
        subject: string,
        intro: string,
        message: string,
        actionText: string,
        actionLink: string
        ) => {
        
        // GENERATE MAIL 
        const mailGenerator = new MailGen({
            theme,
            product: {
                name: process.env.APP_NAME as string,
                link: process.env.APP_URL as string
            }
        })

        const email = {
            body: {
                intro,
                action: {
                    instructions: message,
                    button: {
                        color: '#33b5e5',
                        text: actionText,
                        link: actionLink,
                    },
                },
            },
        }

        const emailTemplate = mailGenerator.generate(email)

        // SET INFO
        const msg = {
            to,
            from: process.env.MAIL_ADDRESS as string,
            subject,
            html: emailTemplate,
          }
          
        try {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
            return sgMail.send(msg)
        } catch (error) {
            throw new Error(error.message)
        }
    }
}