import { useMemo } from "react";
import "./SeekBar.scss";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function SeekBar({
  duration = 0,
  currentTime = 0,
  canSeek = false,
  onSeekStart,
  onSeekChange,
  onSeekEnd,
}) {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const max = safeDuration > 0 ? safeDuration : 1;
  const safeValue = clamp(Number(currentTime) || 0, 0, max);
  const progressPercent = safeDuration > 0 ? (safeValue / safeDuration) * 100 : 0;

  const disabled = !canSeek || safeDuration <= 0;

  const thumbLeft = useMemo(() => `${progressPercent}%`, [progressPercent]);

  const emitSeek = (rawValue) => {
    const value = clamp(Number(rawValue) || 0, 0, max);
    onSeekChange?.(value);
  };

  return (
    <div className={`sp-bar ${disabled ? "is-disabled" : ""}`}>
      <div className="sp-bar-track" />
      <div className="sp-bar-fill" style={{ width: `${progressPercent}%` }} />
      <div className="sp-bar-thumb" style={{ left: thumbLeft }} />

      <input
        className="sp-bar-range"
        type="range"
        min={0}
        max={max}
        step={0.01}
        value={safeValue}
        disabled={disabled}
        aria-label="Seek song position"
        onMouseDown={() => onSeekStart?.()}
        onMouseUp={(event) => onSeekEnd?.(Number(event.currentTarget.value))}
        onTouchStart={() => onSeekStart?.()}
        onTouchEnd={(event) => onSeekEnd?.(Number(event.currentTarget.value))}
        onKeyDown={() => onSeekStart?.()}
        onKeyUp={(event) => onSeekEnd?.(Number(event.currentTarget.value))}
        onInput={(event) => emitSeek(event.currentTarget.value)}
        onChange={(event) => emitSeek(event.currentTarget.value)}
      />
    </div>
  );
}

export default SeekBar;
