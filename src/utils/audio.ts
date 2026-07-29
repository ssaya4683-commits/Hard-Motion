type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type BeepOptions = {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
};

function playBeep({ frequency, durationMs, type = "sine" }: BeepOptions) {
  const audioWindow = window as AudioWindow;
  const AudioContextConstructor = globalThis.AudioContext || audioWindow.webkitAudioContext;

  if (!AudioContextConstructor) return;

  const audioContext = new AudioContextConstructor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const durationSeconds = durationMs / 1000;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + durationSeconds);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + durationSeconds + 0.01);
  oscillator.addEventListener("ended", () => void audioContext.close(), { once: true });
}

export function playSuccessBeep() {
  playBeep({ frequency: 880, durationMs: 150 });
}

export function playErrorBeep() {
  playBeep({ frequency: 220, durationMs: 220, type: "square" });
}
