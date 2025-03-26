const log = require ('../utils/logger');

const checkTokenPresence = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      log("No token sent");
      return res.status(401).json({ message: 'No token provided' });
    }
    next();
  };
  
  module.exports = checkTokenPresence;
  