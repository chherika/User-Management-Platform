require("dotenv").config();

const express = require("express");

const connectDB = require("./dbconnect");
const User = require("./person_schema");

const app = express();

app.use(express.json());

connectDB();

// Search User
app.get("/searchuser", async (req, res) => {

    try {

        const { search } = req.query;

        if (!search) {
            return res.status(400).json({
                message: "Search value is required"
            });
        }

        const users = await User.find({
            $or: [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ]
        }).select("-password");

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(users);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// View All Users
app.get("/viewalluser", async (req, res) => {

    try {

        const users = await User.find()
            .select("-password");

        res.json(users);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// Delete User
app.delete("/deluser", async (req, res) => {

    try {

        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const deletedUser =
            await User.findOneAndDelete({
                email: email.toLowerCase()
            });

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully",
            email: deletedUser.email
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.listen(3003, () => {
    console.log("Admin Service running on port 3003");
});