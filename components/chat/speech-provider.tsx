"use client";

import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SpeechContextValue = {
  isSupported: boolean;
  speakingMessageId: string | null;
  speakMessage: (messageId: string, text: string) => void;
  stopSpeaking: () => void;
  isMessageSpeaking: (messageId: string) => boolean;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within SpeechProvider");
  }
  return context;
}

export function SpeechProvider({
  chatId,
  children,
}: {
  chatId: string;
  children: ReactNode;
}) {
  const { speak, stop, isSupported, isSpeaking } = useTextToSpeech();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  );
  const speakingMessageIdRef = useRef<string | null>(null);

  const stopSpeaking = useCallback(() => {
    stop();
    speakingMessageIdRef.current = null;
    setSpeakingMessageId(null);
  }, [stop]);

  const speakMessage = useCallback(
    (messageId: string, text: string) => {
      if (speakingMessageIdRef.current === messageId) {
        stopSpeaking();
        return;
      }

      stop();
      speakingMessageIdRef.current = messageId;
      setSpeakingMessageId(messageId);

      speak(text, {
        onEnd: () => {
          speakingMessageIdRef.current = null;
          setSpeakingMessageId(null);
        },
        onError: () => {
          speakingMessageIdRef.current = null;
          setSpeakingMessageId(null);
        },
      });
    },
    [speak, stop, stopSpeaking]
  );

  const isMessageSpeaking = useCallback(
    (messageId: string) => speakingMessageId === messageId && isSpeaking,
    [isSpeaking, speakingMessageId]
  );

  useEffect(() => {
    stopSpeaking();
  }, [chatId, stopSpeaking]);

  const value = useMemo(
    () => ({
      isSupported,
      speakingMessageId,
      speakMessage,
      stopSpeaking,
      isMessageSpeaking,
    }),
    [isSupported, isMessageSpeaking, speakMessage, speakingMessageId, stopSpeaking]
  );

  return (
    <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>
  );
}
