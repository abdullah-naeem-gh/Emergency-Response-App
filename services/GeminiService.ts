export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiGenerateContentRequest {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    code: number;
    message: string;
    status?: string;
    details?: Array<{
      '@type'?: string;
      reason?: string;
      domain?: string;
      metadata?: {
        service?: string;
      };
    }>;
  };
}

export interface GeminiError {
  type: 'quota_exceeded' | 'rate_limit' | 'api_error' | 'unknown';
  message: string;
  retryAfter?: number; // seconds
}

class GeminiService {
  private readonly API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private readonly API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  private readonly PROJECT_NAME = process.env.EXPO_PUBLIC_PROJECT_NAME || '';

  /**
   * Parse error from Gemini API response
   */
  private parseError(errorData: any): GeminiError {
    const status = errorData?.error?.status || errorData?.status;
    const message = errorData?.error?.message || errorData?.message || 'Unknown error';
    const code = errorData?.error?.code;

    // Check for quota/rate limit errors (429)
    if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
      // Extract retry time from message (e.g., "Please retry in 38.892350392s")
      const retryMatch = message.match(/retry in ([\d.]+)s/i);
      const retryAfter = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : undefined;

      return {
        type: 'quota_exceeded',
        message: 'AI service quota exceeded. Please try again later or check your API plan.',
        retryAfter,
      };
    }

    // Check for rate limit errors
    if (code === 429) {
      return {
        type: 'rate_limit',
        message: 'Too many requests. Please wait a moment and try again.',
      };
    }

    return {
      type: code ? 'api_error' : 'unknown',
      message: message || 'An error occurred while processing your request.',
    };
  }

  /**
   * Generate content using Gemini API
   * @param prompt - The user's prompt/question
   * @param conversationHistory - Optional conversation history for context
   * @param options - Optional generation config
   * @returns Response text or null if error. Throws GeminiError for quota/rate limit errors.
   */
  async generateContent(
    prompt: string,
    conversationHistory: GeminiMessage[] = [],
    options?: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxOutputTokens?: number;
    }
  ): Promise<string | null> {
    try {
      if (!this.API_KEY) {
        console.error('Gemini API key is not configured');
        return null;
      }

      // Build conversation history
      const contents = conversationHistory.map(msg => ({
        parts: msg.parts,
      }));

      // Add current user prompt
      contents.push({
        parts: [{ text: prompt }],
      });

      const requestBody: GeminiGenerateContentRequest = {
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          topK: options?.topK ?? 40,
          topP: options?.topP ?? 0.95,
          maxOutputTokens: options?.maxOutputTokens ?? 2048,
        },
      };

      const response = await fetch(`${this.API_ENDPOINT}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', response.status, errorData);
        
        // For quota/rate limit errors, throw a structured error
        if (response.status === 429) {
          const parsedError = this.parseError(errorData);
          throw parsedError;
        }
        
        // For other errors, throw generic error
        throw new Error(`API error: ${response.status}`);
      }

      const data: GeminiGenerateContentResponse = await response.json();

      // Check for errors in response body
      if (data.error) {
        console.error('Gemini API error:', data.error);
        const parsedError = this.parseError({ error: data.error });
        if (parsedError.type === 'quota_exceeded' || parsedError.type === 'rate_limit') {
          throw parsedError;
        }
        return null;
      }

      // Check for blocked content
      if (data.promptFeedback?.blockReason) {
        console.warn('Content blocked:', data.promptFeedback.blockReason);
        return 'I apologize, but I cannot process that request.';
      }

      // Extract text from response
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content?.parts && candidate.content.parts.length > 0) {
          return candidate.content.parts[0].text || null;
        }
      }

      return null;
    } catch (error) {
      // Re-throw GeminiError for quota/rate limit errors
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }
      console.error('Error calling Gemini API:', error);
      return null;
    }
  }

  /**
   * Generate a response for emergency-related queries
   * This method includes context about the app's capabilities
   * @throws GeminiError for quota/rate limit errors
   */
  async generateEmergencyResponse(
    userMessage: string,
    conversationHistory: GeminiMessage[] = []
  ): Promise<string | null> {
    // Add system context for emergency assistance
    const systemContext: GeminiMessage = {
      role: 'user',
      parts: [
        {
          text: `You are an AI assistant for an Emergency Response App. You help users with:
- First Aid guidance and medical emergencies
- Emergency alerts and disaster information
- Emergency contacts (police, ambulance, rescue services)
- General emergency preparedness

Be concise, helpful, and prioritize safety. If a user asks about something urgent or life-threatening, always recommend they call emergency services immediately.

User question: ${userMessage}`,
        },
      ],
    };

    const enhancedHistory = [systemContext, ...conversationHistory];

    // generateContent will throw GeminiError for quota/rate limit errors
    return await this.generateContent(userMessage, enhancedHistory, {
      temperature: 0.7,
      maxOutputTokens: 1024,
    });
  }
}

export const geminiService = new GeminiService();

