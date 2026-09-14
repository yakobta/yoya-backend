import { v2 as cloudinary } from 'cloudinary';
import config from '@config/env';
import logger from '@utils/logger';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

class StorageService {
  async uploadFile(
    file: Buffer,
    filename: string,
    folder: string = 'yoya'
  ): Promise<string> {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            public_id: filename,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.end(file);
      });

      logger.info(`File uploaded: ${filename}`);
      return (result as any).secure_url;
    } catch (error) {
      logger.error('File upload failed:', error);
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`File deleted: ${publicId}`);
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw error;
    }
  }

  async uploadAudio(file: Buffer, filename: string): Promise<string> {
    return this.uploadFile(file, filename, 'yoya/audio');
  }

  async uploadVideo(file: Buffer, filename: string): Promise<string> {
    return this.uploadFile(file, filename, 'yoya/video');
  }

  async uploadImage(file: Buffer, filename: string): Promise<string> {
    return this.uploadFile(file, filename, 'yoya/images');
  }
}

export default new StorageService();
