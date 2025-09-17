const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

exports.verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: "Token tidak disediakan." });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Token tidak valid!" });
    }
    req.userId = decoded.id;
    req.user = decoded;
    next();
  });
};
