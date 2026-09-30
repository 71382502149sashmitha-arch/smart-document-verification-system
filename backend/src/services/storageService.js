/**
 * Storage Service — Local file storage abstraction (swap-ready for S3/cloud)
 */
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import logger from '../utils/logger.js';

class StorageService {
  constructor() {
    this.baseDir = config.upload.dir;
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  /**
   * Move file from temp to permanent storage
   */
  async moveFile(tempPath, userId, documentType, filename) {
    const destDir = path.join(this.baseDir, String(userId), documentType);
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, filename);
    fs.copyFileSync(tempPath, destPath);
    fs.unlinkSync(tempPath);
    return destPath;
  }

  /**
   * Get absolute path for a stored file
   */
  getAbsolutePath(relativePath) {
    return path.resolve(relativePath);
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (error) {
      logger.error('File deletion failed:', error.message);
    }
    return false;
  }

  /**
   * Check if file exists
   */
  exists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Get file stats
   */
  getStats(filePath) {
    try {
      return fs.statSync(filePath);
    } catch {
      return null;
    }
  }

  /**
   * Clean up temp files for a user
   */
  cleanTemp(userId) {
    const tempDir = path.join(this.baseDir, String(userId), 'temp');
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      }
    } catch (error) {
      logger.error('Temp cleanup failed:', error.message);
    }
  }
}

export default new StorageService();
