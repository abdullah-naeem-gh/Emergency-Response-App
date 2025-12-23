// Use legacy filesystem API for now to keep compatibility with Expo Go
// The new File / Directory API can be adopted later without changing behavior here.
import * as FileSystem from 'expo-file-system/legacy';

export type SupportedLanguage = 'en-US' | 'ur-PK' | 'en-PK';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: SupportedLanguage;
  duration: number;
}

export interface SpeechRecognitionOptions {
  language?: SupportedLanguage;
  enableOffline?: boolean;
  maxAlternatives?: number;
}

class SpeechRecognitionService {
  private readonly API_ENDPOINT = 'https://api.deepgram.com/v1/listen';
  private readonly API_KEY = process.env.EXPO_PUBLIC_DEEPGRAM_API_KEY || '';

  /**
   * Transcribe audio file to text
   * @param audioUri - URI of the audio file
   * @param options - Recognition options
   */
  async transcribeAudio(
    audioUri: string,
    options: SpeechRecognitionOptions = {}
  ): Promise<TranscriptionResult | null> {
    try {
      const {
        language = 'en-US',
        enableOffline = false,
      } = options;

      // Check if offline mode is requested and available
      if (enableOffline) {
        return await this.transcribeOffline(audioUri, language);
      }

      // Use cloud-based transcription for better accuracy
      return await this.transcribeDeepgram(audioUri, language);
    } catch (error) {
      console.error('Speech recognition error:', error);
      return null;
    }
  }

  /**
   * Cloud-based transcription using Deepgram
   */
  private async transcribeDeepgram(
    audioUri: string,
    language: SupportedLanguage
  ): Promise<TranscriptionResult | null> {
    try {
      if (!this.API_KEY) {
        throw new Error(
          'Deepgram API key missing. Set EXPO_PUBLIC_DEEPGRAM_API_KEY to enable transcription.'
        );
      }

      const mimeType = this.getMimeType(audioUri);

      const response = await FileSystem.uploadAsync(
        `${this.API_ENDPOINT}?model=nova-3&language=${language}&smart_format=true&punctuate=true`,
        audioUri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            Authorization: `Token ${this.API_KEY}`,
            'Content-Type': mimeType,
          },
        }
      );

      if (response.status >= 400) {
        const errorText = response.body || `HTTP ${response.status}`;
        console.error('Deepgram transcription error:', response.status, errorText);
        return null;
      }

      const data = JSON.parse(response.body || '{}');
      const alternative =
        data?.results?.channels?.[0]?.alternatives?.[0] ||
        data?.results?.alternatives?.[0];

      if (!alternative || !alternative.transcript) {
        return null;
      }

      return {
        text: alternative.transcript as string,
        confidence: (alternative.confidence as number) ?? 0.8,
        language,
        duration: 0, // Duration would need to be calculated separately
      };
    } catch (error) {
      console.error('Cloud transcription error:', error);
      // Fallback to offline if cloud fails
      return await this.transcribeOffline(audioUri, language);
    }
  }

  /**
   * Offline transcription (mock implementation)
   * In production, this would use an offline speech recognition library
   */
  private async transcribeOffline(
    audioUri: string,
    language: SupportedLanguage
  ): Promise<TranscriptionResult | null> {
    // Note: True offline speech recognition requires native libraries
    // This is a placeholder that would need to be implemented with:
    // - react-native-voice (for real-time, not file-based)
    // - Custom native module with offline models
    // - Or a hybrid approach with cached models

    console.warn('Offline transcription not fully implemented. Using fallback.');

    // Return a placeholder result
    // In production, this would use an offline recognition engine
    return {
      text: '[Offline transcription not available. Please check internet connection.]',
      confidence: 0.5,
      language,
      duration: 0,
    };
  }

  /**
   * Get audio format from file URI
   */
  private getAudioFormat(audioUri: string): {
    sampleRate: number;
  } {
    // Default sample rate; Deepgram auto-detects encoding
    return { sampleRate: 44100 };
  }

  /**
   * Detect language from audio (auto-detect)
   */
  async detectLanguage(audioUri: string): Promise<SupportedLanguage | null> {
    try {
      const result = await this.transcribeDeepgram(audioUri, 'en-US');
      return result?.language || null;
    } catch (error) {
      console.error('Language detection error:', error);
      return null;
    }
  }

  /**
   * Transcribe with automatic language detection
   */
  async transcribeWithAutoDetect(
    audioUri: string,
    options: Omit<SpeechRecognitionOptions, 'language'> = {}
  ): Promise<TranscriptionResult | null> {
    // Try English first, then Urdu
    let result = await this.transcribeAudio(audioUri, { ...options, language: 'en-US' });

    // If confidence is low, try Urdu
    if (!result || result.confidence < 0.7) {
      const urduResult = await this.transcribeAudio(audioUri, { ...options, language: 'ur-PK' });
      if (urduResult && urduResult.confidence > (result?.confidence || 0)) {
        result = urduResult;
      }
    }

    return result;
  }

  /**
   * Check if speech recognition is available
   */
  async isAvailable(): Promise<boolean> {
    // Check if API key is configured
    if (!this.API_KEY) {
      console.warn('Deepgram API key not configured');
      return false;
    }
    return true;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return ['en-US', 'ur-PK', 'en-PK'];
  }

  /**
   * Get language display name
   */
  getLanguageName(language: SupportedLanguage): string {
    switch (language) {
      case 'en-US':
        return 'English (US)';
      case 'ur-PK':
        return 'Urdu (Pakistan)';
      case 'en-PK':
        return 'English (Pakistan)';
      default:
        return 'Unknown';
    }
  }

  /**
   * Map file extension to mime type for Deepgram upload
   */
  private getMimeType(audioUri: string): string {
    const extension = audioUri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'wav':
        return 'audio/wav';
      case 'flac':
        return 'audio/flac';
      case 'ogg':
      case 'opus':
        return 'audio/ogg';
      case 'webm':
        return 'audio/webm';
      case 'm4a':
      case 'mp4':
        return 'audio/mp4';
      default:
        return 'application/octet-stream';
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();

