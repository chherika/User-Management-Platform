require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");

const connectDB = require("./dbconnect");
const User = require("./person_schema");

const app = express();

app.use(express.json());

connectDB();

app.post("/userregister", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check duplicate email
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "user",
            phone
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.listen(3001, () => {
    console.log("Register Service running on port 3001");
});