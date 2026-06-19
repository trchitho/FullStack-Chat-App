import { useEffect } from "react";

export const useCallRingtone = (mode, active) => {
  useEffect(() => {
    if (!active) return undefined;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;
    const context = new AudioContextClass();
    let stopped = false;
    const playPulse = () => {
      if (stopped || document.hidden) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(mode === "incoming" ? 520 : 420, now);
      oscillator.frequency.linearRampToValueAtTime(mode === "incoming" ? 660 : 480, now + 0.35);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(mode === "incoming" ? 0.055 : 0.035, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.7);
    };
    context.resume().then(playPulse).catch(() => {});
    const interval = window.setInterval(playPulse, mode === "incoming" ? 1800 : 2400);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      context.close().catch(() => {});
    };
  }, [active, mode]);
};
