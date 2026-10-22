// Original synthesized micro-SFX; no imported audio or artwork.
let context: AudioContext | undefined;
let lastHover = 0;
let pad: { oscillators: OscillatorNode[]; gain: GainNode } | undefined;
export function setSoundscape(enabled: boolean, volume: number) {
  if (!enabled || volume <= 0) {
    if (pad) {
      pad.oscillators.forEach((osc) => osc.stop());
      pad.gain.disconnect();
      pad = undefined;
    }
    return;
  }
  try {
    context ??= new AudioContext();
    void context.resume();
    if (!pad) {
      const gain = context.createGain();
      gain.gain.value = 0;
      gain.connect(context.destination);
      const oscillators = [174.61, 261.63, 349.23].map((frequency) => {
        const osc = context!.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequency;
        osc.connect(gain);
        osc.start();
        return osc;
      });
      pad = { gain, oscillators };
    }
    pad.gain.gain.setTargetAtTime(
      (volume / 100) * 0.018,
      context.currentTime,
      0.4,
    );
  } catch {
    /* Audio is optional. */
  }
}
export function playSfx(
  kind: "hover" | "click" | "open" | "reward",
  enabled: boolean,
  volume: number,
) {
  if (!enabled || volume <= 0) return;
  if (kind === "hover" && performance.now() - lastHover < 100) return;
  if (kind === "hover") lastHover = performance.now();
  try {
    context ??= new AudioContext();
    void context.resume();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const duration = kind === "open" ? 0.12 : kind === "reward" ? 0.18 : 0.08;
    const frequency =
      kind === "hover"
        ? 1350
        : kind === "open"
          ? 640
          : kind === "reward"
            ? 960
            : 850;
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(
      frequency * 0.78,
      now + duration,
    );
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime((0.038 * volume) / 100, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.015);
  } catch {
    /* A muted browser should never block the interaction. */
  }
}
