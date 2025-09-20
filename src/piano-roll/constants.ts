import type { NotePattern } from "./types";

export const OCTAVE_START = 0;
export const OCTAVE_END = 7;
export const WHITE_KEYS_PER_OCTAVE = 7;
export const WHITE_KEY_WIDTH = 25;
export const WHITE_KEY_HEIGHT = 110;
export const BLACK_KEY_WIDTH = WHITE_KEY_WIDTH * 0.6;
export const BLACK_KEY_HEIGHT = WHITE_KEY_HEIGHT * 0.6;

export const NOTE_PATTERN: ReadonlyArray<NotePattern> = [
  { note: "C", kind: "white" },
  { note: "C#", kind: "black" },
  { note: "D", kind: "white" },
  { note: "D#", kind: "black" },
  { note: "E", kind: "white" },
  { note: "F", kind: "white" },
  { note: "F#", kind: "black" },
  { note: "G", kind: "white" },
  { note: "G#", kind: "black" },
  { note: "A", kind: "white" },
  { note: "A#", kind: "black" },
  { note: "B", kind: "white" },
];
