
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSpeechToTextParams {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useSpeechToText = ({ onTranscript, onError }: UseSpeechToTextParams = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (isListening || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Speech recognition could not be started:', error);
      onError?.('Speech recognition could not be started.');
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (!isListening || !recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
      onTranscript?.(finalTranscript);
    };

    recognition.onerror = (event) => {
      // Ignore the 'aborted' error which is common on unmount or programmatic stop
      if (event.error === 'aborted') {
        return;
      }
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript, onError]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};

// Add SpeechRecognition types to the window object for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

    