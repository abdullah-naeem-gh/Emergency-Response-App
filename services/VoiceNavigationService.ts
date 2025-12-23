// Try to import Voice module - it may not be available in Expo Go
let Voice: any = null;
let isVoiceModuleAvailable = false;

try {
  Voice = require('@react-native-voice/voice');
  isVoiceModuleAvailable = true;
} catch (error) {
  console.warn(
    '@react-native-voice/voice is not available. ' +
    'This feature requires a development build. ' +
    'Run: npx expo prebuild && npx expo run:ios (or run:android)'
  );
  isVoiceModuleAvailable = false;
}

import { openRouterService } from './OpenRouterService';

export interface VoiceCommand {
  type: 'navigate' | 'press' | 'scroll' | 'back' | 'unknown';
  target?: string;
  action?: string;
  confidence: number;
}

export interface VoiceNavigationOptions {
  language?: string;
  useAI?: boolean;
}

class VoiceNavigationService {
  private isListening: boolean = false;
  private onResultCallback?: (text: string) => void;
  private onErrorCallback?: (error: Error) => void;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private isModuleAvailable: boolean = isVoiceModuleAvailable;

  constructor() {
    if (this.isModuleAvailable) {
      this.setupVoiceHandlers();
    }
  }

  private setupVoiceHandlers() {
    if (!Voice) return;

    Voice.onSpeechStart = () => {
      console.log('Voice recognition started');
      this.onStartCallback?.();
    };

    Voice.onSpeechEnd = () => {
      console.log('Voice recognition ended');
      this.onEndCallback?.();
    };

    Voice.onSpeechResults = (e: any) => {
      // Handle both event.value (array) and event.value[0] formats
      const results = e.value || (e.results ? e.results[0] : null);
      if (results && results.length > 0) {
        const text = Array.isArray(results) ? results[0] : results;
        console.log('Voice recognition result:', text);
        this.onResultCallback?.(text);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.error('Voice recognition error:', e);
      this.onErrorCallback?.(new Error(e.error?.message || 'Voice recognition failed'));
    };

    Voice.onSpeechPartialResults = (e: any) => {
      // Handle partial results for real-time feedback
      const results = e.value || (e.results ? e.results[0] : null);
      if (results && results.length > 0) {
        const text = Array.isArray(results) ? results[0] : results;
        console.log('Voice recognition partial result:', text);
      }
    };
  }

  /**
   * Start listening for voice commands
   */
  async startListening(options: VoiceNavigationOptions = {}): Promise<void> {
    if (!this.isModuleAvailable || !Voice) {
      const error = new Error(
        'Voice navigation is not available. ' +
        'The native module may not be included in this build. ' +
        'Ensure you are using a custom build (not Expo Go).'
      );
      this.onErrorCallback?.(error);
      throw error;
    }

    try {
      if (this.isListening) {
        await this.stopListening();
      }

      const language = options.language || 'en-US';
      await Voice.start(language);
      this.isListening = true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.onErrorCallback?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop listening for voice commands
   */
  async stopListening(): Promise<void> {
    if (!this.isModuleAvailable || !Voice) {
      return;
    }

    try {
      if (this.isListening) {
        await Voice.stop();
        await Voice.cancel();
        this.isListening = false;
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  /**
   * Check if voice recognition is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isModuleAvailable || !Voice) {
      return false;
    }

    try {
      const available = await Voice.isAvailable();
      // Voice.isAvailable() returns a number (1 for available) or boolean
      return available === 1 || available === true;
    } catch (error) {
      console.error('Error checking voice availability:', error);
      return false;
    }
  }

  /**
   * Set callbacks for voice recognition events
   */
  setCallbacks(callbacks: {
    onResult?: (text: string) => void;
    onError?: (error: Error) => void;
    onStart?: () => void;
    onEnd?: () => void;
  }) {
    this.onResultCallback = callbacks.onResult;
    this.onErrorCallback = callbacks.onError;
    this.onStartCallback = callbacks.onStart;
    this.onEndCallback = callbacks.onEnd;
  }

  /**
   * Interpret voice command using rule-based matching first, then AI if enabled
   */
  async interpretCommand(
    text: string,
    options: VoiceNavigationOptions = {}
  ): Promise<VoiceCommand> {
    const lowerText = text.toLowerCase().trim();

    // Rule-based matching for common commands
    const ruleBasedCommand = this.ruleBasedInterpretation(lowerText);
    if (ruleBasedCommand.confidence > 0.7) {
      return ruleBasedCommand;
    }

    // Use AI for better interpretation if enabled
    if (options.useAI !== false) {
      try {
        const aiCommand = await this.aiInterpretation(text);
        if (aiCommand.confidence > ruleBasedCommand.confidence) {
          return aiCommand;
        }
      } catch (error) {
        console.error('AI interpretation failed, using rule-based:', error);
      }
    }

    return ruleBasedCommand;
  }

  /**
   * Rule-based command interpretation
   */
  private ruleBasedInterpretation(text: string): VoiceCommand {
    // Navigation commands
    const navigationPatterns = [
      { pattern: /(go to|navigate to|open|show|take me to)\s*(home|main)/i, target: '/(tabs)', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(map|maps|crowd map)/i, target: '/(tabs)/crowd-map', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(guides?|guide|first aid)/i, target: '/(tabs)/guides', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(chat|chatbot|ai|assistant)/i, target: '/(tabs)/chatbot', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(news|alerts?|updates?)/i, target: '/(tabs)/news', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(explore|discover)/i, target: '/(tabs)/explore', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(directory|contacts?|emergency contacts?)/i, target: '/(tabs)/directory', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(volunteer|volunteering)/i, target: '/(tabs)/volunteer', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(reports?|reporting)/i, target: '/(tabs)/reports', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(profile|account|settings)/i, target: '/(tabs)/profile', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(community)/i, target: '/(tabs)/community', type: 'navigate' as const },
      { pattern: /(go to|navigate to|open|show|take me to)\s*(sos|emergency|panic)/i, target: '/(panic)', type: 'navigate' as const },
    ];

    for (const nav of navigationPatterns) {
      if (nav.pattern.test(text)) {
        return {
          type: nav.type,
          target: nav.target,
          confidence: 0.9,
        };
      }
    }

    // Back navigation
    if (/(go back|back|return|previous)/i.test(text)) {
      return {
        type: 'back',
        confidence: 0.9,
      };
    }

    // Button press commands
    const buttonPatterns = [
      { pattern: /(press|click|tap|select|choose)\s*(call|phone|dial)/i, action: 'call', confidence: 0.85 },
      { pattern: /(press|click|tap|select|choose)\s*(send|submit)/i, action: 'send', confidence: 0.85 },
      { pattern: /(press|click|tap|select|choose)\s*(search)/i, action: 'search', confidence: 0.85 },
      { pattern: /(press|click|tap|select|choose)\s*(save|save report)/i, action: 'save', confidence: 0.85 },
      { pattern: /(press|click|tap|select|choose)\s*(cancel|close)/i, action: 'cancel', confidence: 0.85 },
      { pattern: /(press|click|tap|select|choose)\s*(ok|okay|confirm)/i, action: 'confirm', confidence: 0.85 },
    ];

    for (const btn of buttonPatterns) {
      if (btn.pattern.test(text)) {
        return {
          type: 'press',
          action: btn.action,
          confidence: btn.confidence,
        };
      }
    }

    // Scroll commands
    if (/(scroll|scroll down|scroll up)/i.test(text)) {
      const direction = /(up|down)/i.test(text) ? (/(up)/i.test(text) ? 'up' : 'down') : 'down';
      return {
        type: 'scroll',
        action: direction,
        confidence: 0.8,
      };
    }

    return {
      type: 'unknown',
      confidence: 0.3,
    };
  }

  /**
   * AI-powered command interpretation using OpenRouter
   */
  private async aiInterpretation(text: string): Promise<VoiceCommand> {
    try {
      const systemPrompt = `You are a voice command interpreter for an Emergency Response mobile app. 
Analyze the user's voice command and return ONLY a JSON object with this exact structure:
{
  "type": "navigate" | "press" | "scroll" | "back" | "unknown",
  "target": "route path like /(tabs)/guides" (only if type is "navigate"),
  "action": "action name like call, send, search" (only if type is "press" or "scroll"),
  "confidence": 0.0-1.0
}

Available navigation targets:
- /(tabs) or /(tabs)/index (home)
- /(tabs)/crowd-map (map)
- /(tabs)/guides (guides)
- /(tabs)/chatbot (chat)
- /(tabs)/news (news)
- /(tabs)/explore (explore)
- /(tabs)/directory (directory)
- /(tabs)/volunteer (volunteer)
- /(tabs)/reports (reports)
- /(tabs)/profile (profile)
- /(tabs)/community (community)
- /(panic) (SOS/emergency)

Available button actions: call, send, search, save, cancel, confirm
Available scroll actions: up, down

User command: "${text}"

Return ONLY the JSON object, no other text.`;

      const response = await openRouterService.generateChat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ], {
        temperature: 0.3,
        max_tokens: 200,
      });

      if (!response) {
        return { type: 'unknown', confidence: 0.3 };
      }

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: parsed.type || 'unknown',
          target: parsed.target,
          action: parsed.action,
          confidence: parsed.confidence || 0.7,
        };
      }

      return { type: 'unknown', confidence: 0.3 };
    } catch (error) {
      console.error('AI interpretation error:', error);
      return { type: 'unknown', confidence: 0.3 };
    }
  }

  /**
   * Get current listening state
   */
  getListeningState(): boolean {
    return this.isListening;
  }

  /**
   * Get module availability status
   */
  getModuleAvailable(): boolean {
    return this.isModuleAvailable;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (Voice && Voice.removeAllListeners) {
      Voice.removeAllListeners();
    }
    this.isListening = false;
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
    this.onStartCallback = undefined;
    this.onEndCallback = undefined;
  }
}

export const voiceNavigationService = new VoiceNavigationService();

