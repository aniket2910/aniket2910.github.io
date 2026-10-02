// Minimal shapes for the Web Speech API (SpeechRecognition is not in the
// standard TS DOM lib). SpeechSynthesis* types ARE standard, so not declared.

export interface SpeechAlternative {
  transcript: string;
}

export interface SpeechResult {
  0: SpeechAlternative;
  isFinal: boolean;
}

export interface SpeechResultList {
  length: number;
  [index: number]: SpeechResult;
}

export interface SpeechEvent {
  resultIndex: number;
  results: SpeechResultList;
}

export interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
}

export type RecognitionCtor = new () => Recognition;

// Resolve the browser's SpeechRecognition constructor (vendor-prefixed in some
// browsers). Returns null when the browser has no speech recognition at all.
export function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
