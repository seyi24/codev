import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

type MockSpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

let lastRecognition: MockSpeechRecognitionInstance | null = null;

const mockStart = vi.fn();
const mockStop = vi.fn();
const mockAbort = vi.fn();

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  start = mockStart;
  stop = mockStop;
  abort = mockAbort;
  onresult: MockSpeechRecognitionInstance["onresult"] = null;
  onerror: MockSpeechRecognitionInstance["onerror"] = null;
  onend: MockSpeechRecognitionInstance["onend"] = null;

  constructor() {
    lastRecognition = this;
  }
}

function installSpeechRecognitionMock() {
  Object.defineProperty(window, "SpeechRecognition", {
    writable: true,
    configurable: true,
    value: MockSpeechRecognition,
  });

  Object.defineProperty(window, "webkitSpeechRecognition", {
    writable: true,
    configurable: true,
    value: undefined,
  });
}

function removeSpeechRecognitionMock() {
  Object.defineProperty(window, "SpeechRecognition", {
    writable: true,
    configurable: true,
    value: undefined,
  });

  Object.defineProperty(window, "webkitSpeechRecognition", {
    writable: true,
    configurable: true,
    value: undefined,
  });
}

function makeResultEvent(
  transcript: string,
  isFinal: boolean,
): SpeechRecognitionEvent {
  const alternative = { transcript, confidence: 1 };
  const result = {
    isFinal,
    length: 1,
    0: alternative,
    item: () => alternative,
  };

  return {
    resultIndex: 0,
    results: {
      length: 1,
      0: result,
      item: () => result,
    },
  } as unknown as SpeechRecognitionEvent;
}

describe("useSpeechRecognition", () => {
  beforeEach(() => {
    lastRecognition = null;
    mockStart.mockReset();
    mockStop.mockReset();
    mockAbort.mockReset();
    installSpeechRecognitionMock();
  });

  afterEach(() => {
    removeSpeechRecognitionMock();
  });

  it("reports speech recognition as supported when API exists", async () => {
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript: vi.fn() }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });
  });

  it("starts listening and configures recognition", async () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript, lang: "fr-FR" }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    act(() => {
      result.current.start();
    });

    expect(mockStart).toHaveBeenCalledOnce();
    expect(result.current.isListening).toBe(true);
    expect(lastRecognition?.continuous).toBe(true);
    expect(lastRecognition?.interimResults).toBe(true);
    expect(lastRecognition?.lang).toBe("fr-FR");
  });

  it("stops listening", async () => {
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript: vi.fn() }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(mockStop).toHaveBeenCalledOnce();
    expect(result.current.isListening).toBe(false);
  });

  it("toggles between start and stop", async () => {
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript: vi.fn() }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isListening).toBe(false);
    expect(mockStop).toHaveBeenCalledOnce();
  });

  it("calls onTranscript with final and interim results", async () => {
    const onTranscript = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    act(() => {
      result.current.start();
    });

    act(() => {
      lastRecognition?.onresult?.(makeResultEvent("hello", false));
      lastRecognition?.onresult?.(makeResultEvent("world", true));
    });

    expect(onTranscript).toHaveBeenCalledWith("hello", false);
    expect(onTranscript).toHaveBeenCalledWith("world", true);
  });

  it("calls onError when speech recognition is not supported", async () => {
    removeSpeechRecognitionMock();

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript: vi.fn(), onError }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(false);
    });

    act(() => {
      result.current.start();
    });

    expect(onError).toHaveBeenCalledWith(
      "Speech recognition is not supported in this browser.",
    );
    expect(result.current.isListening).toBe(false);
  });

  it("calls onError when microphone access is denied", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onTranscript: vi.fn(), onError }),
    );

    await waitFor(() => {
      expect(result.current.isSupported).toBe(true);
    });

    act(() => {
      result.current.start();
    });

    act(() => {
      lastRecognition?.onerror?.({ error: "not-allowed" });
    });

    expect(onError).toHaveBeenCalledWith("Microphone access was denied.");
    expect(result.current.isListening).toBe(false);
  });
});
