import app from './src/app.js';
import setupCorsMiddleware from './cors-middleware.js';
import setupStatusUpdateEndpoint from './status-update-endpoint.js';

// Thiết lập CORS middleware trước khi khởi động server
setupCorsMiddleware(app);

// Thiết lập endpoint cập nhật status riêng với CORS đặc biệt
setupStatusUpdateEndpoint(app);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 NoSmoke API Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Process terminated');
    });
});
