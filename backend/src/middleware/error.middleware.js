const { ApiError } = require('../utils/ApiError');

function notFound(req, res) {
  res.status(404).json({ message: `Route topilmadi: ${req.method} ${req.originalUrl}` });
}

// Central error handler - never leak raw stack traces / driver errors to
// clients. Frontend forms rely on `message` being a human-readable string.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: "Kiritilgan ma'lumotlar noto'g'ri.", details: err.errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "ma'lumot";
    return res.status(409).json({ message: `Bu ${field} allaqachon ro'yxatdan o'tgan.` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: "Noto'g'ri ID format." });
  }

  console.error('[unhandled error]', err);
  res.status(500).json({ message: "Ma'lumotni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring." });
}

module.exports = { notFound, errorHandler };
