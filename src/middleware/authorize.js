const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.',
        },
      });
    }
    next();
  };
};

module.exports = authorize;
