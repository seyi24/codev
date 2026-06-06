"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { MicIcon } from "lucide-react";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";

function PureDictateButton({
  status,
  input,
  setInput,
}: {
  status: UseChatHelpers<ChatMessage>["status"];
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
}) {
  const baseTextRef = useRef("");
  const interimTextRef = useRef("");

  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      const trimmed = transcript.trim();
      if (!trimmed) {
        return;
      }

      if (isFinal) {
        const base = baseTextRef.current.trim();
        const next = base ? `${base} ${trimmed}` : trimmed;
        baseTextRef.current = next;
        interimTextRef.current = "";
        setInput(next);
        return;
      }

      interimTextRef.current = trimmed;
      const base = baseTextRef.current.trim();
      setInput(base ? `${base} ${trimmed}` : trimmed);
    },
    [setInput]
  );

  const { isListening, isSupported, toggle, stop } = useSpeechRecognition({
    onTranscript: handleTranscript,
    onError: (message) => toast.error(message),
  });

  useEffect(() => {
    if (status !== "ready") {
      stop();
    }
  }, [status, stop]);

  const handleToggle = () => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (!isListening) {
      baseTextRef.current = input;
      interimTextRef.current = "";
    }

    toggle();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={isListening ? "Stop dictating" : "Dictate message"}
          aria-pressed={isListening}
          className={cn(
            "h-7 w-7 rounded-lg border border-border/40 p-1 transition-colors",
            isListening
              ? "border-destructive/50 bg-destructive/10 text-destructive animate-pulse"
              : "text-foreground hover:border-border hover:text-foreground",
            !isSupported && "text-muted-foreground/30 cursor-not-allowed"
          )}
          data-testid="dictate-button"
          disabled={status !== "ready"}
          onClick={(event) => {
            event.preventDefault();
            handleToggle();
          }}
          type="button"
          variant="ghost"
        >
          <MicIcon className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isListening ? "Stop dictating" : "Dictate"}
      </TooltipContent>
    </Tooltip>
  );
}

export const DictateButton = memo(PureDictateButton);
