import { useEffect, useRef } from 'react';
import { useVoiceNavigation } from '@/components/VoiceNavigationProvider';
import { VoiceCommand } from '@/services/VoiceNavigationService';

interface VoiceButtonPressHandlers {
  onCall?: () => void;
  onSend?: () => void;
  onSearch?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  onCustomAction?: (action: string) => void;
}

/**
 * Hook for screens to handle voice button press commands
 * 
 * @example
 * ```tsx
 * const MyScreen = () => {
 *   const handleCall = () => {
 *     // Handle call action
 *   };
 *   
 *   useVoiceButtonPress({
 *     onCall: handleCall,
 *   });
 *   
 *   return <View>...</View>;
 * };
 * ```
 */
export function useVoiceButtonPress(handlers: VoiceButtonPressHandlers) {
  const { isActive, transcript } = useVoiceNavigation();
  const handlersRef = useRef(handlers);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!isActive || !transcript) return;

    // This is a simple implementation - in a real app, you might want to
    // use the VoiceNavigationService to interpret commands more accurately
    const lowerText = transcript.toLowerCase();

    // Check for button press commands
    if (lowerText.includes('call') || lowerText.includes('phone') || lowerText.includes('dial')) {
      handlersRef.current.onCall?.();
    } else if (lowerText.includes('send') || lowerText.includes('submit')) {
      handlersRef.current.onSend?.();
    } else if (lowerText.includes('search')) {
      handlersRef.current.onSearch?.();
    } else if (lowerText.includes('save')) {
      handlersRef.current.onSave?.();
    } else if (lowerText.includes('cancel') || lowerText.includes('close')) {
      handlersRef.current.onCancel?.();
    } else if (lowerText.includes('ok') || lowerText.includes('okay') || lowerText.includes('confirm')) {
      handlersRef.current.onConfirm?.();
    }

    // Call custom handler for any action
    if (handlersRef.current.onCustomAction) {
      handlersRef.current.onCustomAction(lowerText);
    }
  }, [isActive, transcript]);
}

