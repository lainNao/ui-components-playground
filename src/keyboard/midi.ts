/**
 * MIDI関連の型定義（Web MIDI API）
 */
interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  onstatechange: ((event: MIDIConnectionEvent) => void) | null;
}

interface MIDIInput {
  id: string;
  name?: string;
  manufacturer?: string;
  state: MIDIPortDeviceState;
  type: "input";
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

interface MIDIOutput {
  id: string;
  name?: string;
  manufacturer?: string;
  state: MIDIPortDeviceState;
  type: "output";
}

interface MIDIMessageEvent {
  data: Uint8Array;
  timeStamp: number;
}

interface MIDIConnectionEvent {
  port: MIDIInput | MIDIOutput;
}

type MIDIPortDeviceState = "disconnected" | "connected";

// Navigator interface extension
declare global {
  interface Navigator {
    requestMIDIAccess(): Promise<MIDIAccess>;
  }
}

/**
 * MIDI関連のユーティリティ関数と型定義
 */

export interface MidiMessage {
  command: number;
  note: number;
  velocity: number;
}

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
}

/**
 * MIDIメッセージを解析
 */
export function parseMidiMessage(data: Uint8Array): MidiMessage | null {
  if (data.length < 3) {
    return null;
  }

  const [status, note, velocity] = data;
  const command = status & 0xf0;

  // ノートオン/ノートオフのみを処理
  if (command === 0x90 || command === 0x80) {
    return {
      command,
      note,
      velocity: command === 0x80 ? 0 : velocity, // ノートオフの場合は velocity を 0 に
    };
  }

  return null;
}

/**
 * MIDIノート番号からノート名とオクターブを取得
 */
export function midiNoteToNoteAndOctave(midiNote: number): {
  note: string;
  octave: number;
} {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;

  return {
    note: noteNames[noteIndex],
    octave: octave,
  };
}

/**
 * MIDI入力管理クラス
 */
export class MidiInputManager {
  private midiAccess: MIDIAccess | null = null;
  private activeInputs: Map<string, MIDIInput> = new Map();
  private onNoteOnCallback?: (
    note: string,
    octave: number,
    velocity: number
  ) => void;
  private onNoteOffCallback?: (note: string, octave: number) => void;

  /**
   * MIDI入力を初期化
   */
  async initialize(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      console.warn("Web MIDI API is not supported in this browser");
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupInputListeners();
      console.log("MIDI access initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize MIDI access:", error);
      return false;
    }
  }

  /**
   * 利用可能なMIDI入力デバイスの一覧を取得
   */
  getAvailableInputs(): MidiDevice[] {
    if (!this.midiAccess) {
      return [];
    }

    const devices: MidiDevice[] = [];
    for (const input of this.midiAccess.inputs.values()) {
      devices.push({
        id: input.id,
        name: input.name || "Unknown Device",
        manufacturer: input.manufacturer || "Unknown",
      });
    }

    return devices;
  }

  /**
   * 特定のMIDI入力デバイスを有効化
   */
  enableInput(deviceId: string): boolean {
    if (!this.midiAccess) {
      return false;
    }

    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) {
      console.warn(`MIDI input device not found: ${deviceId}`);
      return false;
    }

    input.onmidimessage = this.handleMidiMessage.bind(this);
    this.activeInputs.set(deviceId, input);
    console.log(`MIDI input enabled: ${input.name}`);
    return true;
  }

  /**
   * 特定のMIDI入力デバイスを無効化
   */
  disableInput(deviceId: string): void {
    const input = this.activeInputs.get(deviceId);
    if (input) {
      input.onmidimessage = null;
      this.activeInputs.delete(deviceId);
      console.log(`MIDI input disabled: ${input.name}`);
    }
  }

  /**
   * すべてのMIDI入力を有効化
   */
  enableAllInputs(): void {
    if (!this.midiAccess) {
      return;
    }

    for (const input of this.midiAccess.inputs.values()) {
      this.enableInput(input.id);
    }
  }

  /**
   * すべてのMIDI入力を無効化
   */
  disableAllInputs(): void {
    for (const deviceId of this.activeInputs.keys()) {
      this.disableInput(deviceId);
    }
  }

  /**
   * ノートオンコールバックを設定
   */
  onNoteOn(
    callback: (note: string, octave: number, velocity: number) => void
  ): void {
    this.onNoteOnCallback = callback;
  }

  /**
   * ノートオフコールバックを設定
   */
  onNoteOff(callback: (note: string, octave: number) => void): void {
    this.onNoteOffCallback = callback;
  }

  /**
   * 入力リスナーを設定
   */
  private setupInputListeners(): void {
    if (!this.midiAccess) {
      return;
    }

    // デバイスの接続/切断を監視
    this.midiAccess.onstatechange = (event) => {
      const port = event.port;
      if (port.type === "input") {
        if (port.state === "connected") {
          console.log(`MIDI input connected: ${port.name}`);
        } else if (port.state === "disconnected") {
          console.log(`MIDI input disconnected: ${port.name}`);
          this.disableInput(port.id);
        }
      }
    };
  }

  /**
   * MIDIメッセージを処理
   */
  private handleMidiMessage(event: MIDIMessageEvent): void {
    const message = parseMidiMessage(event.data);
    if (!message) {
      return;
    }

    const { note, octave } = midiNoteToNoteAndOctave(message.note);

    if (message.command === 0x90 && message.velocity > 0) {
      // ノートオン
      if (this.onNoteOnCallback) {
        this.onNoteOnCallback(note, octave, message.velocity);
      }
    } else {
      // ノートオフ（コマンドが0x80 または velocity が 0）
      if (this.onNoteOffCallback) {
        this.onNoteOffCallback(note, octave);
      }
    }
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    this.disableAllInputs();
    if (this.midiAccess) {
      this.midiAccess.onstatechange = null;
    }
    this.midiAccess = null;
  }
}
