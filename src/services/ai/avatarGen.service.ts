import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import config from '@config/env';
import logger from '@utils/logger';

interface AvatarGenerationResponse {
  avatar_id: string;
  status: string;
  preview_url: string;
  video_url?: string;
  processing_progress: number;
}

interface VideoSynthesisResponse {
  video_id: string;
  video_url: string;
  duration: number;
  status: string;
}

class AvatarService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.heygen_base_url,
      headers: {
        Authorization: `Bearer ${config.heygen_api_key}`,
        'Content-Type': 'application/json',
      },
    });

    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  async generateAvatar(
    name: string,
    avatarStyle: string = 'realistic',
    photoUrls: string[] = []
  ): Promise<AvatarGenerationResponse> {
    try {
      const response = await this.client.post('/v1/avatars', {
        name,
        avatar_style: avatarStyle,
        photos: photoUrls,
        resolution: 'fhd',
      });

      logger.info(`Avatar generated: ${response.data.avatar_id}`);
      return response.data;
    } catch (error) {
      logger.error('Avatar generation failed:', error);
      throw error;
    }
  }

  async synthesizeVideo(
    text: string,
    avatarId: string,
    voiceId: string,
    emotion: string = 'neutral'
  ): Promise<VideoSynthesisResponse> {
    try {
      const response = await this.client.post('/v1/videos', {
        text,
        avatar_id: avatarId,
        voice_id: voiceId,
        emotion,
        quality: 'fhd',
      });

      logger.info(`Video synthesized: ${response.data.video_id}`);
      return response.data;
    } catch (error) {
      logger.error('Video synthesis failed:', error);
      throw error;
    }
  }

  async getAvatarStatus(avatarId: string): Promise<any> {
    try {
      const response = await this.client.get(`/v1/avatars/${avatarId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get avatar status:', error);
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<any> {
    try {
      const response = await this.client.get(`/v1/videos/${videoId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get video status:', error);
      throw error;
    }
  }
}

export default new AvatarService();
