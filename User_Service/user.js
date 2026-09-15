require("dotenv").config();

const express = require("express");

const connectDB = require("./dbconnect");
const User = require("./person_schema");

const app = express();

app.use(express.json());

connectDB();

// ============================
// View Profile
// ============================

app.get("/viewprofile", async (req, res) => {

    try {

        const userId = req.headers["x-user-id"];

        if (!userId) {
            return res.status(401).json({
                message: "User ID not provided"
            });
        }

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ============================
// Update Profile
// ============================

app.put("/updateprofile", async (req, res) => {

    try {

        const userId = req.headers["x-user-id"];

        const { name, phone } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) {
            user.name = name;
        }

        if (phone) {
            user.phone = phone;
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.listen(3004, () => {
    console.log("User Service running on port 3004");
});