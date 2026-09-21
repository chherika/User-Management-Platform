require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

// ============================
// JWT Authentication
// ============================

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired"
            });
        }

        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

// ============================
// Role Authentication
// ============================

const requireRole = (role) => {

    return (req, res, next) => {

        if (req.user.role !== role) {
            return res.status(403).json({
                message: `Access denied. ${role} role required.`
            });
        }

        next();
    };
};

// ============================
// Register
// ============================

app.use(
    "/register",
    createProxyMiddleware({
        target: "http://localhost:3001",
        changeOrigin: true
    })
);

// ============================
// Login
// ============================

app.use(
    "/auth",
    createProxyMiddleware({
        target: "http://localhost:3002",
        changeOrigin: true
    })
);

// ============================
// Admin
// ============================

app.use(
    "/admin",
    authenticateToken,
    requireRole("admin"),
    createProxyMiddleware({
       target: "54.242.76.121:3003",
        changeOrigin: true
    })
);

// ============================
// User
// ============================

app.use(
    "/user",
    authenticateToken,
    requireRole("user"),
    createProxyMiddleware({
        target: "http://100.31.156.135:3004",
        changeOrigin: true,

        on: {
            proxyReq: (proxyReq, req) => {

                console.log("USER FROM JWT:", req.user);

                proxyReq.setHeader(
                    "x-user-id",
                    req.user.id
                );

                proxyReq.setHeader(
                    "x-user-email",
                    req.user.email
                );

                proxyReq.setHeader(
                    "x-user-role",
                    req.user.role
                );
            }
        }
    })
);

app.get("/", (req, res) => {
    res.json({
        message: "API Gateway is running"
    });
});

app.listen(3000, () => {
    console.log("API Gateway running on port 3000");
});