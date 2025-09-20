export type KeyKind = "white" | "black";

export interface KeyInfo {
  note: string;
  octave: number;
  x: number;
  kind: KeyKind;
}

export interface NotePattern {
  note: string;
  kind: KeyKind;
}

export interface KeyState {
  key: KeyInfo;
  isPressed: boolean;
}
