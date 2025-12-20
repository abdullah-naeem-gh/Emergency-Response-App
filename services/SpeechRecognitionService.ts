import * as FileSystem from 'expo-file-system';

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
  private readonly API_ENDPOINT = 'https://speech.googleapis.com/v1/speech:recognize';
  private readonly API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY || '';

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
        maxAlternatives = 1,
      } = options;

      // Check if offline mode is requested and available
      if (enableOffline) {
        return await this.transcribeOffline(audioUri, language);
      }

      // Use cloud-based transcription for better accuracy
      return await this.transcribeCloud(audioUri, language, maxAlternatives);
    } catch (error) {
      console.error('Speech recognition error:', error);
      return null;
    }
  }

  /**
   * Cloud-based transcription using Google Speech-to-Text API
   */
  private async transcribeCloud(
    audioUri: string,
    language: SupportedLanguage,
    maxAlternatives: number
  ): Promise<TranscriptionResult | null> {
    try {
      // Read audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64' as any,
      });

      // Get audio format from file
      const audioFormat = this.getAudioFormat(audioUri);

      // Prepare request
      const requestBody = {
        config: {
          encoding: audioFormat.encoding,
          sampleRateHertz: audioFormat.sampleRate,
          languageCode: language,
          alternativeLanguageCodes: language === 'en-US' ? ['ur-PK'] : ['en-US'],
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: false,
          maxAlternatives,
        },
        audio: {
          content: audioBase64,
        },
      };

      // Make API request
      const response = await fetch(
        `${this.API_ENDPOINT}?key=${this.API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return null;
      }

      const result = data.results[0];
      const alternative = result.alternatives[0];

      return {
        text: alternative.transcript,
        confidence: alternative.confidence || 0.8,
        language: data.results[0].languageCode as SupportedLanguage,
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
    encoding: 'LINEAR16' | 'FLAC' | 'MULAW' | 'AMR' | 'AMR_WB' | 'OGG_OPUS' | 'SPEEX_WITH_HEADER_BYTE' | 'WEBM_OPUS';
    sampleRate: number;
  } {
    // Default to high-quality settings
    // expo-av typically records in LINEAR16 format
    const extension = audioUri.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'm4a':
      case 'mp4':
        return { encoding: 'LINEAR16', sampleRate: 44100 };
      case 'wav':
        return { encoding: 'LINEAR16', sampleRate: 44100 };
      case 'flac':
        return { encoding: 'FLAC', sampleRate: 44100 };
      default:
        return { encoding: 'LINEAR16', sampleRate: 44100 };
    }
  }

  /**
   * Detect language from audio (auto-detect)
   */
  async detectLanguage(audioUri: string): Promise<SupportedLanguage | null> {
    try {
      const result = await this.transcribeCloud(audioUri, 'en-US', 1);
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
      console.warn('Google Speech API key not configured');
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
}

export const speechRecognitionService = new SpeechRecognitionService();

