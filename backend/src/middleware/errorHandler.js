const errorHandler = (err, req, res, next) => {
  // 記錄錯誤
  console.error('Error occurred:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      name: err.name
    }
  });

  // 根據錯誤類型返回適當的狀態碼
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Prisma 錯誤處理
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed';
  }

  // JWT 錯誤處理
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // 驗證錯誤處理
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // 自定義錯誤處理
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 在開發環境中返回詳細錯誤信息
  const errorResponse = {
    error: {
      message: message,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack
      })
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  res.status(statusCode).json(errorResponse);
};

// 404 錯誤處理
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.url,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
};

// 自定義錯誤類別
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError
};
