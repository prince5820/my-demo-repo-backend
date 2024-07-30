"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const databaseConfig_1 = __importDefault(require("./databaseConfig"));
const users_1 = require("./@types/users");
const generate_password_1 = __importDefault(require("generate-password"));
const mailConfig_1 = __importDefault(require("./mailConfig"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/sign-in/:email', (req, res) => {
    const email = req.params.email;
    databaseConfig_1.default.query('select * from is_user where email = ? limit 1', [email], (err, result) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        }
        if (result.length > 0) {
            res.status(200).send(result);
        }
        else {
            res.status(404).send('User does not exist with this email');
        }
    });
});
app.post('/sign-up', (req, res) => {
    const { firstName, lastName, email, password, gender, mobile, formattedDate, profileUrl, address } = req.body;
    const userEmail = email;
    databaseConfig_1.default.query('SELECT * FROM is_user where email = ?', [userEmail], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        if (result.length > 0) {
            return res.status(409).send('Email already used');
        }
        else {
            const sql = 'INSERT INTO is_user (first_name, last_name, email, password, gender, mobile, dob, profile_url, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [firstName, lastName, email, password, gender, mobile, formattedDate, profileUrl || null, address];
            databaseConfig_1.default.query(sql, values, (err, result) => {
                if (err) {
                    return res.status(500).send('Internal Server Error');
                }
                res.status(201).send(result);
            });
        }
    });
});
app.get('/forgot-password/:email', (req, res) => {
    const email = req.params.email;
    databaseConfig_1.default.query('SELECT * FROM is_user where email = ?', [email], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        if (result.length > 0) {
            const password = generate_password_1.default.generate({
                length: 10,
                numbers: true
            });
            if (password) {
                databaseConfig_1.default.query('UPDATE is_user SET password = ? where email = ?', [password, email], (err, result) => {
                    if (err) {
                        return res.status(500).send('Internal Server Error');
                    }
                    if (result) {
                        mailConfig_1.default.sendMail({
                            from: users_1.USER,
                            to: email,
                            subject: 'Forgot-password',
                            html: `Your new Password is <b>${password}</b>`
                        }).then((info) => {
                            res.status(200).send('Password Reset Successfully, sent in mail Please check');
                        }).catch((mailErr) => {
                            res.status(500).send('Internal Server Error');
                        });
                    }
                });
            }
        }
        else {
            res.status(404).send('User not found with this email');
        }
    });
});
app.listen(5000);
