// 基本周波数 (A4 = 440Hz)
const A4_FREQUENCY = 440;
const A4_NOTE_NUMBER = 69; // MIDIノート番号

// ノート名からMIDIノート番号への変換マップ
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

/**
 * ノート名とオクターブから周波数を計算
 */
export function getFrequency(note: string, octave: number): number {
  const semitone = NOTE_TO_SEMITONE[note];
  if (semitone === undefined) {
    throw new Error(`Invalid note: ${note}`);
  }

  const midiNote = (octave + 1) * 12 + semitone;
  const semitonesFromA4 = midiNote - A4_NOTE_NUMBER;

  return A4_FREQUENCY * 2 ** (semitonesFromA4 / 12);
}

/**
 * Web Audio APIを使って音を再生
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private activeOscillators: Map<
    string,
    { oscillator: OscillatorNode; gainNode: GainNode }
  > = new Map();

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * 指定したノートの音を再生開始
   */
  playNote(note: string, octave: number): void {
    const key = `${note}${octave}`;

    // 既に再生中の場合は即座に停止（フェードアウト無し）
    this.stopNoteImmediate(note, octave);

    try {
      const audioContext = this.getAudioContext();
      const frequency = getFrequency(note, octave);

      // オシレーター（音源）を作成
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // ゲインノード（音量調整）を作成
      const gainNode = audioContext.createGain();
      // より滑らかなフェードイン（0から開始）
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.001
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.2,
        audioContext.currentTime + 0.02
      );

      // 接続: オシレーター → ゲイン → スピーカー
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 再生開始
      oscillator.start();

      // アクティブなオシレーターとして記録（gainNodeも一緒に保存）
      this.activeOscillators.set(key, { oscillator, gainNode });

      // 注意: 自動停止タイマーは削除しました。手動で停止制御を行う必要があります。
    } catch (error) {
      console.warn("Failed to play note:", error);
    }
  }

  /**
   * 指定したノートの音を即座に停止（フェードアウト無し）
   */
  private stopNoteImmediate(note: string, octave: number): void {
    const key = `${note}${octave}`;
    const entry = this.activeOscillators.get(key);

    if (entry) {
      try {
        const { oscillator } = entry;
        oscillator.stop();
        this.activeOscillators.delete(key);
      } catch (error) {
        console.warn("Failed to stop note immediately:", error);
        this.activeOscillators.delete(key);
      }
    }
  }

  /**
   * 指定したノートの音を停止
   */
  stopNote(note: string, octave: number): void {
    const key = `${note}${octave}`;
    const entry = this.activeOscillators.get(key);

    if (entry) {
      try {
        const { oscillator, gainNode } = entry;
        const audioContext = this.getAudioContext();

        // 現在の音量から滑らかにフェードアウト
        const currentTime = audioContext.currentTime;
        gainNode.gain.cancelScheduledValues(currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);

        // Mapからすぐに削除（新しい再生の邪魔をしないように）
        this.activeOscillators.delete(key);

        // フェードアウト完了後に停止
        setTimeout(() => {
          try {
            oscillator.stop();
          } catch {
            // 既に停止している場合のエラーを無視
          }
        }, 40); // 少し余裕を持って40ms後
      } catch (error) {
        console.warn("Failed to stop note:", error);
        this.activeOscillators.delete(key);
      }
    }
  }

  /**
   * すべての音を停止
   */
  stopAllNotes(): void {
    for (const [key] of this.activeOscillators) {
      const [note, octaveStr] = key.match(/^(.+?)(\d+)$/)?.slice(1) || [];
      if (note && octaveStr) {
        this.stopNote(note, parseInt(octaveStr));
      }
    }
  }

  /**
   * AudioContextを閉じる（クリーンアップ）
   */
  dispose(): void {
    this.stopAllNotes();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
