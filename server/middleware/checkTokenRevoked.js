const RevokedToken = require('../models/RevokedToken');

const checkTokenRevoked = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    const revoked = await RevokedToken.findOne({ token });
    if (revoked) {
      log("Revoked token");
      return res.status(401).json({ message: 'Token has been revoked' });
    }
    next();
  } catch (err) {
    log("Error checking token revocation");
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = checkTokenRevoked;
