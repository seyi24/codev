"use client";

import { getSpeechChunks } from "@/lib/prepare-text-for-speech";
import { useCallback, useEffect, useRef, useState } from "react";

type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const chunkIndexRef = useRef(0);
  const chunksRef = useRef<string[]>([]);
  const callbacksRef = useRef<SpeakOptions>({});

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" && "speechSynthesis" in window
    );

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    chunkIndexRef.current = 0;
    chunksRef.current = [];
    setIsSpeaking(false);
  }, []);

  const speakNextChunk = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const chunks = chunksRef.current;
    const index = chunkIndexRef.current;

    if (index >= chunks.length) {
      setIsSpeaking(false);
      callbacksRef.current.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      chunkIndexRef.current += 1;
      speakNextChunk();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      callbacksRef.current.onError?.("Could not read the response aloud.");
      callbacksRef.current.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        options?.onError?.("Text-to-speech is not supported in this browser.");
        return;
      }

      const chunks = getSpeechChunks(text);
      if (chunks.length === 0) {
        options?.onError?.("There is no text to read aloud.");
        return;
      }

      window.speechSynthesis.cancel();
      callbacksRef.current = options ?? {};
      chunksRef.current = chunks;
      chunkIndexRef.current = 0;
      setIsSpeaking(true);
      options?.onStart?.();
      speakNextChunk();
    },
    [speakNextChunk]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
  };
}
