const jwt = require('jsonwebtoken');

const verifyJwtToken = (req, res, next) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded; // attach decoded user info if needed later
    next();
  });
};

module.exports = verifyJwtToken;
