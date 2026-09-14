import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import config from '@config/env';
import logger from '@utils/logger';

interface VoiceCloneResponse {
  voice_id: string;
  name: string;
  status: string;
  quality_score?: number;
}

interface TextToSpeechResponse {
  audio_url: string;
  duration: number;
  status: string;
}

class VoiceCloneService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.elevenlabs_base_url,
      headers: {
        'xi-api-key': config.elevenlabs_api_key,
        'Content-Type': 'application/json',
      },
    });

    // Add retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  async cloneVoice(name: string, audioFiles: Buffer[]): Promise<VoiceCloneResponse> {
    try {
      const formData = new FormData();
      formData.append('name', name);

      audioFiles.forEach((file, index) => {
        formData.append('files', new Blob([file]), `audio_${index}.wav`);
      });

      const response = await this.client.post('/v1/voices/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      logger.info(`Voice cloned successfully: ${response.data.voice_id}`);
      return response.data;
    } catch (error) {
      logger.error('Voice cloning failed:', error);
      throw error;
    }
  }

  async synthesizeText(
    text: string,
    voiceId: string,
    emotion: string = 'neutral'
  ): Promise<TextToSpeechResponse> {
    try {
      const response = await this.client.post(`/v1/text-to-speech/${voiceId}`, {
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      });

      logger.info(`Text synthesized successfully for voice: ${voiceId}`);
      return response.data;
    } catch (error) {
      logger.error('Text synthesis failed:', error);
      throw error;
    }
  }

  async getVoiceModels(): Promise<any[]> {
    try {
      const response = await this.client.get('/v1/voices');
      return response.data.voices;
    } catch (error) {
      logger.error('Failed to fetch voice models:', error);
      throw error;
    }
  }

  async deleteVoice(voiceId: string): Promise<void> {
    try {
      await this.client.delete(`/v1/voices/${voiceId}`);
      logger.info(`Voice deleted: ${voiceId}`);
    } catch (error) {
      logger.error('Voice deletion failed:', error);
      throw error;
    }
  }
}

export default new VoiceCloneService();
