import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'twinscanda@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'twinscanda@gmail.com',
        subject: 'Confirmation of cancelation',
        text: `Hey, we are very sorry you have cancelled your subscription ${name}. Please let us know if we could improve somehow and make you stay with us.`
    })
}

export { sendWelcomeEmail, sendCancelationEmail }