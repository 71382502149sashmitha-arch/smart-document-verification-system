import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'smart_doc_verify',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'sdvs_default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '16777216', 10),
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'image/tiff', 'image/bmp', 'application/pdf'
    ],
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  ocrEngine: process.env.OCR_ENGINE || 'tesseract',
  demoMode: process.env.DEMO_MODE === 'true',
};

export default config;
