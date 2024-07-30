import nodemailer, { Transporter } from 'nodemailer';
import { PASSWORD, USER } from './@types/users';

const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: USER,
    pass: PASSWORD,
  },
});

export default transporter;