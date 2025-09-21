import { useCallback, useEffect, useRef, useState } from "react";
import { AudioPlayer } from "./audio";
import { WHITE_KEY_HEIGHT, WHITE_KEY_WIDTH } from "./constants";
import { MidiInputManager } from "./midi";
import {
  drawBlackKeys,
  drawWhiteKeyLabels,
  drawWhiteKeys,
  setupCanvas,
} from "./renderer";
import type { KeyInfo } from "./types";
import {
  calculateTotalWhiteKeys,
  generateKeys,
  getKeyFromPosition,
} from "./utils";

export function Keyboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const midiInputManagerRef = useRef<MidiInputManager | null>(null);
  const keysRef = useRef<{ whiteKeys: KeyInfo[]; blackKeys: KeyInfo[] } | null>(
    null
  );
  const currentPlayingKeysRef = useRef<Set<string>>(new Set()); // 現在再生中のキーのセット (note + octave)
  const mousePlayingKeyRef = useRef<KeyInfo | null>(null); // マウスで現在再生中のキー
  const isMouseDownRef = useRef<boolean>(false);

  // MIDI接続状態の管理
  const [midiStatus, setMidiStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [midiDevices, setMidiDevices] = useState<
    { id: string; name: string }[]
  >([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // 再描画をトリガーする関数
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const keys = keysRef.current;
    if (!canvas || !keys) {
      return;
    }

    const totalWhiteKeys = calculateTotalWhiteKeys();
    const logicalWidth = totalWhiteKeys * WHITE_KEY_WIDTH;
    const logicalHeight = WHITE_KEY_HEIGHT;

    const context = setupCanvas(canvas, logicalWidth, logicalHeight);

    // MIDI入力とマウス入力の両方を考慮して視覚的フィードバックを提供
    const pressedKeys = new Set([
      ...currentPlayingKeysRef.current, // MIDI入力で再生中のキー
      ...(mousePlayingKeyRef.current
        ? [
            `${mousePlayingKeyRef.current.note}${mousePlayingKeyRef.current.octave}`,
          ]
        : []), // マウスで再生中のキー
    ]);

    // 押されているキーの情報を作成
    const pressedKeyInfos = [...keys.whiteKeys, ...keys.blackKeys].filter(
      (key) => pressedKeys.has(`${key.note}${key.octave}`)
    );

    drawWhiteKeys(context, keys.whiteKeys, pressedKeyInfos);
    drawWhiteKeyLabels(context, keys.whiteKeys);
    drawBlackKeys(context, keys.blackKeys, pressedKeyInfos);

    context.restore();
  }, []);

  // MIDIコールバックを設定する関数
  const setupMidiCallbacks = useCallback(
    (midiManager: MidiInputManager) => {
      // MIDI入力のコールバックを設定
      midiManager.onNoteOn((note, octave, velocity) => {
        const audioPlayer = audioPlayerRef.current;
        if (audioPlayer) {
          const keyId = `${note}${octave}`;

          // MIDI入力から音を再生
          audioPlayer.playNote(note, octave);

          // 再生中のキーのセットに追加
          currentPlayingKeysRef.current.add(keyId);

          // 見た目を更新
          redraw();

          console.log(`MIDI Note On: ${note}${octave} (velocity: ${velocity})`);
        }
      });

      midiManager.onNoteOff((note, octave) => {
        const audioPlayer = audioPlayerRef.current;
        if (audioPlayer) {
          const keyId = `${note}${octave}`;

          audioPlayer.stopNote(note, octave);

          // 再生中のキーのセットから削除
          currentPlayingKeysRef.current.delete(keyId);

          redraw();

          console.log(`MIDI Note Off: ${note}${octave}`);
        }
      });
    },
    [redraw]
  );

  // MIDI接続を再試行する関数
  const reconnectMidi = useCallback(async () => {
    if (isConnecting) return;

    const midiManager = midiInputManagerRef.current;
    if (!midiManager) {
      // MIDIManagerを再作成
      midiInputManagerRef.current = new MidiInputManager();
    }

    setMidiStatus("connecting");
    setIsConnecting(true);

    try {
      const success = await (
        midiInputManagerRef.current as MidiInputManager
      ).initialize();
      if (success) {
        setMidiStatus("connected");

        // 利用可能なデバイスを更新
        const devices = (
          midiInputManagerRef.current as MidiInputManager
        ).getAvailableInputs();
        setMidiDevices(devices);

        // コールバック設定
        setupMidiCallbacks(midiInputManagerRef.current as MidiInputManager);

        // すべてのMIDI入力デバイスを有効化
        (midiInputManagerRef.current as MidiInputManager).enableAllInputs();

        if (devices.length > 0) {
          console.log("MIDI reconnected. Available devices:", devices);
        } else {
          console.log("MIDI connected but no input devices found");
          setMidiStatus("disconnected");
        }
      } else {
        setMidiStatus("error");
      }
    } catch (error) {
      console.error("MIDI reconnection failed:", error);
      setMidiStatus("error");
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, setupMidiCallbacks]);

  // AudioPlayerとMIDI入力の初期化
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer();
    midiInputManagerRef.current = new MidiInputManager();

    // MIDI初期化
    const initializeMidi = async () => {
      const midiManager = midiInputManagerRef.current;
      if (!midiManager) return;

      setMidiStatus("connecting");
      setIsConnecting(true);

      try {
        const success = await midiManager.initialize();
        if (success) {
          setMidiStatus("connected");

          // 利用可能なデバイスを更新
          const devices = midiManager.getAvailableInputs();
          setMidiDevices(devices);

          if (devices.length > 0) {
            console.log("Available MIDI devices:", devices);
          } else {
            console.log("No MIDI input devices found");
            setMidiStatus("disconnected");
          }
        } else {
          setMidiStatus("error");
        }
      } catch (error) {
        console.error("MIDI initialization failed:", error);
        setMidiStatus("error");
      } finally {
        setIsConnecting(false);
      }

      if (midiManager && midiStatus === "connected") {
        // MIDI入力のコールバックを設定
        setupMidiCallbacks(midiManager);

        // すべてのMIDI入力デバイスを有効化
        midiManager.enableAllInputs();
      }
    };

    initializeMidi();

    return () => {
      // クリーンアップ時に現在再生中の音も停止
      if (mousePlayingKeyRef.current && audioPlayerRef.current) {
        audioPlayerRef.current.stopNote(
          mousePlayingKeyRef.current.note,
          mousePlayingKeyRef.current.octave
        );
        mousePlayingKeyRef.current = null;
      }
      audioPlayerRef.current?.dispose();
      midiInputManagerRef.current?.dispose();
    };
  }, [setupMidiCallbacks, midiStatus]);

  // マウスダウンハンドラー
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const keys = keysRef.current;
      const audioPlayer = audioPlayerRef.current;

      if (!canvas || !keys || !audioPlayer) {
        return;
      }

      isMouseDownRef.current = true;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const clickedKey = getKeyFromPosition(
        x,
        y,
        keys.whiteKeys,
        keys.blackKeys
      );

      if (clickedKey) {
        // 既にマウスで再生中のキーがあれば停止
        if (mousePlayingKeyRef.current) {
          audioPlayer.stopNote(
            mousePlayingKeyRef.current.note,
            mousePlayingKeyRef.current.octave
          );
        }

        // 新しいキーの音を再生
        audioPlayer.playNote(clickedKey.note, clickedKey.octave);
        mousePlayingKeyRef.current = clickedKey;

        // 見た目を更新
        redraw();

        // 視覚的なフィードバック
        console.log(`Playing: ${clickedKey.note}${clickedKey.octave}`);
      }
    },
    [redraw]
  );

  // マウスムーブハンドラー（ドラッグ中の処理）
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isMouseDownRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      const keys = keysRef.current;
      const audioPlayer = audioPlayerRef.current;

      if (!canvas || !keys || !audioPlayer) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const hoveredKey = getKeyFromPosition(
        x,
        y,
        keys.whiteKeys,
        keys.blackKeys
      );

      // 現在のキーと違うキーの上に移動した場合
      if (
        hoveredKey &&
        mousePlayingKeyRef.current &&
        (hoveredKey.note !== mousePlayingKeyRef.current.note ||
          hoveredKey.octave !== mousePlayingKeyRef.current.octave)
      ) {
        // 前のキーを停止
        audioPlayer.stopNote(
          mousePlayingKeyRef.current.note,
          mousePlayingKeyRef.current.octave
        );

        // 新しいキーを再生
        audioPlayer.playNote(hoveredKey.note, hoveredKey.octave);
        mousePlayingKeyRef.current = hoveredKey;

        // 見た目を更新
        redraw();

        console.log(`Playing: ${hoveredKey.note}${hoveredKey.octave}`);
      } else if (!hoveredKey && mousePlayingKeyRef.current) {
        // キーから外れた場合は停止
        audioPlayer.stopNote(
          mousePlayingKeyRef.current.note,
          mousePlayingKeyRef.current.octave
        );
        mousePlayingKeyRef.current = null;

        // 見た目を更新
        redraw();

        console.log("Stopped (moved outside key)");
      }
    },
    [redraw]
  );

  // マウスアップハンドラー
  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
    const audioPlayer = audioPlayerRef.current;
    const currentKey = mousePlayingKeyRef.current;

    if (audioPlayer && currentKey) {
      audioPlayer.stopNote(currentKey.note, currentKey.octave);
      mousePlayingKeyRef.current = null;

      // 見た目を更新
      redraw();

      console.log(`Stopped: ${currentKey.note}${currentKey.octave}`);
    }
  }, [redraw]);

  // マウスリーブハンドラー（キャンバスから出た時も音を停止）
  const handleMouseLeave = useCallback(() => {
    isMouseDownRef.current = false;
    const audioPlayer = audioPlayerRef.current;
    const currentKey = mousePlayingKeyRef.current;

    if (audioPlayer && currentKey) {
      audioPlayer.stopNote(currentKey.note, currentKey.octave);
      mousePlayingKeyRef.current = null;

      // 見た目を更新
      redraw();

      console.log(
        `Stopped (mouse leave): ${currentKey.note}${currentKey.octave}`
      );
    }
  }, [redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const draw = () => {
      const keys = generateKeys();
      keysRef.current = keys; // キーデータを保存
      redraw(); // 統一した描画関数を使用
    };

    draw();
    window.addEventListener("resize", draw);

    return () => {
      window.removeEventListener("resize", draw);
    };
  }, [redraw]);

  return (
    <div>
      {/* MIDI接続状態表示 */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor:
                midiStatus === "connected"
                  ? "#4CAF50"
                  : midiStatus === "connecting"
                  ? "#FF9800"
                  : midiStatus === "error"
                  ? "#F44336"
                  : "#9E9E9E",
            }}
          />
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            MIDI:{" "}
            {midiStatus === "connected"
              ? `接続済み (${midiDevices.length}デバイス)`
              : midiStatus === "connecting"
              ? "接続中..."
              : midiStatus === "error"
              ? "接続エラー"
              : "未接続"}
          </span>
        </div>

        {midiDevices.length > 0 && (
          <div style={{ fontSize: "12px", color: "#666", maxWidth: "200px" }}>
            {midiDevices.map((device) => device.name).join(", ")}
          </div>
        )}

        {(midiStatus === "disconnected" || midiStatus === "error") && (
          <button
            type="button"
            onClick={reconnectMidi}
            disabled={isConnecting}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isConnecting ? "not-allowed" : "pointer",
              opacity: isConnecting ? 0.6 : 1,
            }}
          >
            {isConnecting ? "接続中..." : "再接続"}
          </button>
        )}
      </div>

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            display: "block",
            margin: "0 auto",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
