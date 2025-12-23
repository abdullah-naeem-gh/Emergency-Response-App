export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterChatRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenRouterChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  error?: {
    message: string;
    type: string;
    code?: number;
  };
}

export interface OpenRouterError {
  type: 'quota_exceeded' | 'rate_limit' | 'api_error' | 'unknown';
  message: string;
  retryAfter?: number; // seconds
}

class OpenRouterService {
  private readonly API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
  
  // Free models available on OpenRouter
  // Using deepseek as default - it works reliably without configuration
  private readonly DEFAULT_MODEL = 'deepseek/deepseek-r1-0528:free';
  private readonly FALLBACK_MODELS = [
    'meta-llama/llama-3-8b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-7b-it:free',
    'mistralai/mistral-7b-instruct:free',
  ];

  /**
   * Parse error from OpenRouter API response
   */
  private parseError(errorData: any): OpenRouterError {
    const message = errorData?.error?.message || errorData?.message || 'Unknown error';
    const code = errorData?.error?.code;
    const type = errorData?.error?.type;

    // Check for quota/rate limit errors
    if (code === 429 || type === 'rate_limit_exceeded' || message.toLowerCase().includes('rate limit')) {
      // Extract retry time from message if available
      const retryMatch = message.match(/retry.*?(\d+)\s*(?:second|minute|hour)/i);
      const retryAfter = retryMatch ? parseInt(retryMatch[1]) : undefined;

      return {
        type: 'rate_limit',
        message: 'Too many requests. Please wait a moment and try again.',
        retryAfter,
      };
    }

    // Check for quota errors
    if (code === 402 || message.toLowerCase().includes('quota') || message.toLowerCase().includes('credits')) {
      return {
        type: 'quota_exceeded',
        message: 'API quota exceeded. Please check your OpenRouter account credits.',
      };
    }

    return {
      type: code ? 'api_error' : 'unknown',
      message: message || 'An error occurred while processing your request.',
    };
  }

  /**
   * Generate chat completion using OpenRouter API
   * @param messages - Array of messages (system, user, assistant)
   * @param options - Optional generation config
   * @param triedModels - Array of models already tried (for fallback logic)
   * @returns Response text or null if error. Throws OpenRouterError for quota/rate limit errors.
   */
  async generateChat(
    messages: OpenRouterMessage[],
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
    },
    triedModels: string[] = []
  ): Promise<string | null> {
    try {
      if (!this.API_KEY) {
        console.error('OpenRouter API key is not configured');
        return null;
      }

      const model = options?.model || this.DEFAULT_MODEL;
      
      // If this model was already tried, skip it
      if (triedModels.includes(model)) {
        // Try next fallback model
        const allModels = [this.DEFAULT_MODEL, ...this.FALLBACK_MODELS];
        const nextModelIndex = allModels.findIndex(m => !triedModels.includes(m));
        if (nextModelIndex >= 0 && nextModelIndex < allModels.length) {
          console.log(`Trying fallback model: ${allModels[nextModelIndex]}`);
          return await this.generateChat(messages, {
            ...options,
            model: allModels[nextModelIndex],
          }, [...triedModels, model]);
        }
        // All models tried, throw error
        throw new Error('All available models have been rate-limited. Please try again later.');
      }

      const requestBody: OpenRouterChatRequest = {
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2048,
        top_p: options?.top_p ?? 0.95,
      };

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://emergency-response-app', // Optional: for tracking
          'X-Title': 'Emergency Response App', // Optional: for tracking
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`OpenRouter API error for model ${model}:`, response.status, errorData);
        
        // Helper function to try next fallback model
        const tryNextFallback = () => {
          const allModels = [this.DEFAULT_MODEL, ...this.FALLBACK_MODELS];
          const nextModelIndex = allModels.findIndex(m => !triedModels.includes(m) && m !== model);
          
          if (nextModelIndex >= 0 && nextModelIndex < allModels.length) {
            console.log(`Model ${model} unavailable (${response.status}), trying fallback: ${allModels[nextModelIndex]}`);
            return this.generateChat(messages, {
              ...options,
              model: allModels[nextModelIndex],
            }, [...triedModels, model]);
          }
          return null;
        };
        
        // For rate limit errors (429), try fallback models
        if (response.status === 429) {
          const fallbackResult = tryNextFallback();
          if (fallbackResult) return fallbackResult;
          
          // All models tried, throw structured error
          const parsedError = this.parseError(errorData);
          throw parsedError;
        }
        
        // For model not found/unavailable errors (404), try fallback models
        if (response.status === 404) {
          const fallbackResult = tryNextFallback();
          if (fallbackResult) return fallbackResult;
          
          // All models tried, throw error
          throw new Error('No available models found. Please check your OpenRouter configuration.');
        }
        
        // For quota errors (402), throw immediately (no point trying other models)
        if (response.status === 402) {
          const parsedError = this.parseError(errorData);
          throw parsedError;
        }
        
        // Try fallback model for server errors (500+)
        if (response.status >= 500) {
          const fallbackResult = tryNextFallback();
          if (fallbackResult) return fallbackResult;
        }
        
        // For other errors, try fallback once before giving up
        const fallbackResult = tryNextFallback();
        if (fallbackResult) return fallbackResult;
        
        // If no fallback available, throw generic error
        throw new Error(`API error: ${response.status}`);
      }

      const data: OpenRouterChatResponse = await response.json();

      // Check for errors in response body
      if (data.error) {
        console.error('OpenRouter API error:', data.error);
        const parsedError = this.parseError({ error: data.error });
        if (parsedError.type === 'quota_exceeded' || parsedError.type === 'rate_limit') {
          throw parsedError;
        }
        return null;
      }

      // Extract text from response
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        if (choice.message?.content) {
          return choice.message.content;
        }
      }

      return null;
    } catch (error) {
      // Re-throw OpenRouterError for quota/rate limit errors
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }
      console.error('Error calling OpenRouter API:', error);
      return null;
    }
  }

  /**
   * Generate a response for emergency-related queries
   * This method includes context about the app's capabilities
   * @throws OpenRouterError for quota/rate limit errors
   */
  async generateEmergencyResponse(
    userMessage: string,
    conversationHistory: OpenRouterMessage[] = []
  ): Promise<string | null> {
    // Build messages array with system context
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: `You are an AI assistant for an Emergency Response App. You help users with:
- First Aid guidance and medical emergencies
- Emergency alerts and disaster information
- Emergency contacts (police, ambulance, rescue services)
- General emergency preparedness

Be concise, helpful, and prioritize safety. If a user asks about something urgent or life-threatening, always recommend they call emergency services immediately.`,
    };

    // Add current user message
    const userMessageObj: OpenRouterMessage = {
      role: 'user',
      content: userMessage,
    };

    // Build messages array: system message, conversation history, and current user message
    const messages = [systemMessage, ...conversationHistory, userMessageObj];

    return await this.generateChat(messages, {
      temperature: 0.7,
      max_tokens: 1024,
    });
  }

  /**
   * Convert Gemini-style messages to OpenRouter format
   * (For backward compatibility)
   */
  convertGeminiMessages(geminiMessages: Array<{ role: string; parts?: Array<{ text: string }> }>): OpenRouterMessage[] {
    return geminiMessages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : (msg.role === 'user' ? 'user' : 'system'),
      content: msg.parts && Array.isArray(msg.parts) && msg.parts[0]?.text 
        ? msg.parts[0].text 
        : '',
    }));
  }
}

export const openRouterService = new OpenRouterService();

