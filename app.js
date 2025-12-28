require('dotenv').config();
require('./config/database').connect();

const express = require('express');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');

const app = express();

// Middleware สำหรับอ่าน JSON body
app.use(express.json());

// --- REGISTER ROUTE ---
app.post('/register', async (req, res) => {
    try {
        // 1. Get user input
        const { first_name, last_name, email, password } = req.body;

        // 2. Validate user input
        if (!(email && password && first_name && last_name)) {
            return res.status(400).send("All input is required");
        }

        // 3. Check if user already exists
        const oldUser = await User.findOne({ email: email.toLowerCase() });
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        // 4. Encrypt password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // 5. Create user in database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        // 6. Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY || "your_secret_key", // ใส่ fallback กรณีลืมตั้งใน .env
            { expiresIn: "2h" }
        );

        // 7. Save user token (Optional: บางคนไม่เก็บลง DB แต่จะส่งกลับไปเฉยๆ)
        user.token = token;

        // 8. Return new user
        res.status(201).json(user);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error"); // ต้องส่ง response กลับเมื่อเกิด error
    }
});
app.post('/login', async (req, res) => {
    try {
        // 1. Get user input
        const { email, password } = req.body;
        
        // 2. Validate user input
        if (!(email && password)) {
            return res.status(400).send("All input is required");
        }
        const user = await User.findOne({ email });
        
        if (user && (await bcrypt.compare(password, user.password))) {
            // 3. Create token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY || "your_secret_key", // ใส่ fallback กรณีลืมตั้งใน .env
                { expiresIn: "2h" }
            )

            user.token = token;
            res.status(200).json(user);
        // 4. Return user
        }
        res.status(400).send("Invalid Credentials");
    
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
app.post('/welcome', auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

module.exports = app;