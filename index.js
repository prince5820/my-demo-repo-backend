const express = require("express");
const cors = require("cors");
const dbConnection = require("./databaseConfig");

const app = express();
app.use(express.json());
app.use(cors());

app.get('/sign-in/:email', (req, res) => {
  const email = req.params.email;
  dbConnection.query('select * from is_user where email = ? limit 1', [email], (err, result) => {
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

app.post('/sign-up', (req, res) => {
  const { firstName, lastName, email, password, gender, mobile, formattedDate, profileUrl, address } = req.body;
  const userEmail = email;

  dbConnection.query('SELECT * FROM is_user where email = ?', [userEmail], (err, result) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }

    if (result.length > 0) {
      return res.status(409).send('Email already used');
    } else {
      const sql = 'INSERT INTO is_user (first_name, last_name, email, password, gender, mobile, dob, profile_url, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [firstName, lastName, email, password, gender, mobile, formattedDate, profileUrl || null, address];

      dbConnection.query(sql, values, (err, result) => {
        if (err) {
          console.log('err in create user', err);
          return res.status(500).send('Internal Server Error');
        }

        res.status(201).send(result);
      })
    }
  })
});

app.listen(5000);