// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const jwtSecret = "your-secret-key"; 

exports.verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(403).send({ message: "Token tidak disediakan." });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Token tidak valid!" });
        }
        req.userId = decoded.id;
        next();
    });
};