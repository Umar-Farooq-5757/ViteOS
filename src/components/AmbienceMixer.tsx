import type React from "react";
import { useEffect, useRef } from "react";
import { AMBIENCES } from "../lib/ambiences";
import { cn } from "../lib/utils";

import { FaPause, FaPlay, FaWind } from "react-icons/fa";
import { useAmbience } from "../hooks/useAmbience";

export const AmbienceMixer: React.FC = () => {
  const tracks = useAmbience((s) => s.tracks);
  const isPaused = useAmbience((s) => s.isPaused);

  const togglePlayback = useAmbience((s) => s.togglePlayback);
  const toggle = useAmbience((s) => s.toggle);
  const setVolume = useAmbience((s) => s.setVolume);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  /*
   * Sync audio with mixer state.
   */
  useEffect(() => {
    for (const ambience of AMBIENCES) {
      const state = tracks[ambience.id];

      let audio = audioRefs.current[ambience.id];

      if (!audio) {
        if (!state?.enabled) continue;

        audio = new Audio(ambience.url);
        audio.loop = true;
        audio.preload = "none";

        audioRefs.current[ambience.id] = audio;
      }

      audio.volume = state?.volume ?? 0;

      if (state?.enabled && !isPaused) {
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      } else if (!audio.paused) {
        audio.pause();
      }
    }
  }, [tracks, isPaused]);

  /*
   * Clean up audio when component unmounts.
   */
  useEffect(() => {
    const refs = audioRefs.current;

    return () => {
      for (const audio of Object.values(refs)) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const activeCount = Object.values(tracks).filter(
    (track) => track.enabled,
  ).length;

  return (
    <div
      className={cn(
        "w-full h-full overflow-hidden rounded-2xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
      )}>
      {/* =========================================================
          Header
      ========================================================= */}

      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        {/* Icon */}
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-xl",
            "border border-white/15",
            "bg-white/10",
            "text-white/80",
          )}>
          <FaWind className="size-3.5" />
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-wide text-white">
            Ambience
          </div>

          <div className="text-[10px] text-white/45">
            {activeCount === 0
              ? "Choose a sound"
              : `${activeCount} sound${activeCount === 1 ? "" : "s"} playing`}
          </div>
        </div>

        {/* Active count */}
        {activeCount > 0 && (
          <div
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5",
              "border border-white/15",
              "bg-white/10",
              "text-[10px] font-semibold tabular-nums text-white/80",
            )}>
            {activeCount}
          </div>
        )}

        {/* Master play/pause */}
        <button
          type="button"
          onClick={togglePlayback}
          disabled={activeCount === 0}
          aria-label={
            isPaused
              ? "Play selected ambience sounds"
              : "Pause selected ambience sounds"
          }
          title={isPaused ? "Play all ambience" : "Pause all ambience"}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-xl",
            "border border-white/15",
            "bg-white/10",
            "text-white/75",
            "outline-none transition-all duration-200",
            "hover:bg-white/20 hover:text-white",
            "active:scale-95",
            "focus-visible:ring-2 focus-visible:ring-white/40",
            "disabled:pointer-events-none disabled:opacity-30",
          )}>
          {isPaused ? (
            <FaPlay className="ml-0.5 size-2.5" />
          ) : (
            <FaPause className="size-2.5" />
          )}
        </button>
      </div>

      {/* =========================================================
          Tracks
      ========================================================= */}

      <div className="grid grid-cols-3 gap-1.5 overflow-y-auto p-2.5 overscroll-contain">
        {AMBIENCES.map((ambience) => {
          const state = tracks[ambience.id];

          const enabled = !!state?.enabled;
          const volume = state?.volume ?? 0;

          const Icon = ambience.icon;

          return (
            <div
              key={ambience.id}
              role="button"
              tabIndex={0}
              aria-pressed={enabled}
              aria-label={`${enabled ? "Stop" : "Play"} ${ambience.label}`}
              onClick={() => toggle(ambience.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(ambience.id);
                }
              }}
              className={cn(
                "group relative flex min-h-11 cursor-pointer items-center",
                "rounded-xl px-2",
                "border outline-none",
                "transition-all duration-300",
                "focus-visible:ring-2 focus-visible:ring-white/40",

                enabled
                  ? [
                      "border-white/20",
                      "bg-white/15",
                      "shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
                    ]
                  : [
                      "border-transparent",
                      "bg-white/[0.035]",
                      "hover:border-white/10",
                      "hover:bg-white/9",
                    ],
              )}>
              {/* =================================================
                  Track Icon
              ================================================= */}

              <div
                className={cn(
                  "relative grid size-8 shrink-0 place-items-center rounded-lg",
                  "border transition-all duration-300",

                  enabled
                    ? [
                        "border-white/20",
                        "bg-white/15",
                        "text-white",
                        "shadow-[0_0_18px_rgba(255,255,255,0.08)]",
                      ]
                    : [
                        "border-white/10",
                        "bg-white/6",
                        "text-white/50",
                        "group-hover:text-white/80",
                      ],
                )}>
                <Icon
                  className={cn(
                    "size-3.5 transition-transform duration-300",
                    enabled && "group-hover:scale-110",
                  )}
                />

                {/* Playing indicator */}
                {enabled && !isPaused && (
                  <span
                    className={cn(
                      "absolute -right-0.5 -top-0.5",
                      "size-1.5 rounded-full",
                      "bg-white",
                      "shadow-[0_0_7px_rgba(255,255,255,0.8)]",
                      "motion-safe:animate-pulse",
                    )}
                  />
                )}
              </div>

              {/* =================================================
                  Track Content
              ================================================= */}

              <div className="relative ml-2.5 min-w-0 flex-1">
                {/* Disabled label */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center",
                    "truncate text-xs",
                    "transition-all duration-300",

                    enabled
                      ? "pointer-events-none -translate-x-2 opacity-0"
                      : "translate-x-0 text-white/65 group-hover:text-white/90",
                  )}>
                  {ambience.label}
                </div>

                {/* Enabled volume control */}
                <div
                  className={cn(
                    "flex h-8 items-center gap-2",
                    "transition-all duration-500 ease-out",

                    enabled
                      ? "w-full translate-x-0 opacity-100"
                      : "pointer-events-none w-0 -translate-x-2 opacity-0",
                  )}>
                  <VolumeSlider
                    value={volume}
                    label={ambience.label}
                    disabled={!enabled}
                    onChange={(value) => setVolume(ambience.id, value)}
                  />

                  <span
                    className={cn(
                      "w-7 shrink-0 text-right",
                      "text-[10px] font-medium tabular-nums",
                      "text-white/55",
                    )}>
                    {Math.round(volume * 100)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===============================================================
   Glass Volume Slider
================================================================ */

const VolumeSlider: React.FC<{
  value: number;
  label: string;
  disabled: boolean;
  onChange: (value: number) => void;
}> = ({ value, label, disabled, onChange }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const element = trackRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const percentage = (clientX - rect.left) / rect.width;

    onChange(Math.max(0, Math.min(1, percentage)));
  };

  const pct = Math.round(value * 100);

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={`${label} volume`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        e.stopPropagation();

        e.currentTarget.setPointerCapture(e.pointerId);

        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          setFromClientX(e.clientX);
        }
      }}
      onKeyDown={(e) => {
        e.stopPropagation();

        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();

          onChange(Math.max(0, value - 0.05));
        }

        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();

          onChange(Math.min(1, value + 0.05));
        }

        if (e.key === "Home") {
          e.preventDefault();
          onChange(0);
        }

        if (e.key === "End") {
          e.preventDefault();
          onChange(1);
        }
      }}
      className={cn(
        "group relative h-5 flex-1",
        "cursor-pointer touch-none select-none",
        "outline-none",
        "focus-visible:ring-2 focus-visible:ring-white/30",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
      )}>
      {/* Track */}
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 h-1.5",
          "-translate-y-1/2 rounded-full",
          "border border-white/10",
          "bg-black/10",
          "backdrop-blur-sm",
        )}
      />

      {/* Fill */}
      <div
        className={cn(
          "absolute left-0 top-1/2 h-1.5",
          "-translate-y-1/2 rounded-full",
          "bg-white/70",
          "shadow-[0_0_8px_rgba(255,255,255,0.15)]",
          "transition-[width] duration-75",
        )}
        style={{
          width: `${pct}%`,
        }}
      />

      {/* Thumb */}
      <div
        className={cn(
          "absolute top-1/2 size-3",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full",
          "border border-white/50",
          "bg-white",
          "shadow-[0_1px_6px_rgba(0,0,0,0.2)]",
          "transition-transform duration-100",
          "group-hover:scale-125",
          "group-focus-visible:scale-125",
        )}
        style={{
          left: `${pct}%`,
        }}
      />
    </div>
  );
};

export default AmbienceMixer;
