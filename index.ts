import express, { Request, Response } from "express";
import { MysqlError } from "mysql";
import cors from "cors";
import dbConnection from "./databaseConfig";
import { SignUpDetail, USER } from "./@types/users";
import generator from 'generate-password';
import transporter from "./mailConfig";

const app = express();
app.use(express.json());
app.use(cors());

app.get('/sign-in/:email', (req: Request, res: Response) => {
  const email = req.params.email;
  dbConnection.query('select * from is_user where email = ? limit 1', [email], (err: MysqlError | null, result: any[]) => {
    if (err) {
      res.status(500).send('Internal Server Error');
    }

    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send('User does not exist with this email');
    }
  })
});

app.post('/sign-up', (req: Request, res: Response) => {
  const { firstName, lastName, email, password, gender, mobile, formattedDate, profileUrl, address }: SignUpDetail = req.body;
  const userEmail = email;

  dbConnection.query('SELECT * FROM is_user where email = ?', [userEmail], (err: MysqlError | null, result: any[]) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    if (result.length > 0) {
      return res.status(409).send('Email already used');
    } else {
      const sql = 'INSERT INTO is_user (first_name, last_name, email, password, gender, mobile, dob, profile_url, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [firstName, lastName, email, password, gender, mobile, formattedDate, profileUrl || null, address];

      dbConnection.query(sql, values, (err: MysqlError | null, result: any[]) => {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }

        res.status(201).send(result);
      })
    }
  })
});

app.get('/forgot-password/:email', (req: Request, res: Response) => {
  const email: string = req.params.email;

  dbConnection.query('SELECT * FROM is_user where email = ?', [email], (err: MysqlError | null, result: any[]) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    if (result.length > 0) {
      const password = generator.generate({
        length: 10,
        numbers: true
      });

      if (password) {
        dbConnection.query('UPDATE is_user SET password = ? where email = ?', [password, email], (err: MysqlError | null, result: any) => {
          if (err) {
            return res.status(500).send('Internal Server Error');
          }

          if (result) {
            transporter.sendMail({
              from: USER,
              to: email,
              subject: 'Forgot-password',
              html: `Your new Password is <b>${password}</b>`
            }).then((info) => {
              res.status(200).send('Password Reset Successfully, sent in mail Please check');
            }).catch((mailErr) => {
              res.status(500).send('Internal Server Error');
            })
          }
        })
      }
    } else {
      res.status(404).send('User not found with this email');
    }
  })
})

app.listen(5000);