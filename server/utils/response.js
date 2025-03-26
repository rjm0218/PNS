// utils/response.js
exports.success = (res, data, message = "Success") => {
    return res.status(200).json({ message, data });
  };
  
  exports.error = (res, message = "Error", status = 400, details = null) => {
    return res.status(status).json({ message, error: true, details });
  };
  