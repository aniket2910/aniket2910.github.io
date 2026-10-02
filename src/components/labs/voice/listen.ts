"use client";

import {
  getRecognitionCtor,
  type Recognition,
  type SpeechEvent,
} from "./speech-types";

export interface ListenHandlers {
  onTranscript: (text: string) => void; // live interim + final text
  onFinal: (text: string) => void; // user finished with non-empty speech
  onIdle: () => void; // finished with nothing, or errored
}

// Starts one turn of browser speech recognition. Returns the instance (so the
// caller can stop() it) or null when the browser has no speech recognition.
export function startListening(h: ListenHandlers): Recognition | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = true;
  let finalText = "";
  rec.onresult = (e: SpeechEvent) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    h.onTranscript((finalText + interim).trim());
  };
  rec.onend = () => {
    const said = finalText.trim();
    if (said) h.onFinal(said);
    else h.onIdle();
  };
  rec.onerror = () => h.onIdle();
  rec.start();
  return rec;
}
