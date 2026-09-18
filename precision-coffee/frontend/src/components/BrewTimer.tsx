import { useEffect, useRef, useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import type { PourStage } from "../types";
import { formatTimeLabel } from "../constants";

/* 30fps: cukup halus untuk MM:SS.cc + progress bar pakai transisi CSS */
const FRAME_MS = 1000 / 30;

export function BrewTimer() {
  const { state, dispatch } = useApp();
  const recipe = state.adjustedRecipe || state.recipe;
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [muted, setMuted] = useState(false);

  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const lastStageIdxRef = useRef<number>(-1);
  const audioRef = useRef<AudioContext | null>(null);

  const totalDurationMs = (recipe?.total_time_s ?? 0) * 1000;
  const totalStages = recipe?.stages ?? [];

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      try {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new Ctor();
      } catch {
        audioRef.current = null;
      }
    }
    if (audioRef.current?.state === "suspended") void audioRef.current.resume();
  }, []);

  const beep = useCallback(
    (freq: number, dur = 0.12, when = 0) => {
      if (muted) return;
      const ctx = audioRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + when;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    },
    [muted]
  );

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setIsRunning(false);
    setIsComplete(false);
    setElapsedMs(0);
    elapsedRef.current = 0;
    startRef.current = 0;
    lastStageIdxRef.current = -1;
  }, []);

  useEffect(() => {
    reset();
  }, [recipe, reset]);

  useEffect(() => {
    if (!isRunning) return;
    const tick = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;
      elapsedRef.current = elapsed;

      // alert saat stage berganti
      const idx = findStageIndex(totalStages, elapsed / 1000);
      if (idx > lastStageIdxRef.current) {
        if (lastStageIdxRef.current >= 0) beep(660, 0.1);
        lastStageIdxRef.current = idx;
      }

      if (elapsed >= totalDurationMs) {
        setElapsedMs(totalDurationMs);
        setIsRunning(false);
        setIsComplete(true);
        beep(880, 0.14);
        beep(1100, 0.14, 0.16);
        return;
      }

      // throttle 30fps
      if (now - lastFrameRef.current >= FRAME_MS) {
        lastFrameRef.current = now;
        setElapsedMs(elapsed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, totalDurationMs, totalStages, beep]);

  const start = () => {
    if (totalDurationMs <= 0 || isRunning) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    ensureAudio();
    lastFrameRef.current = performance.now();
    startRef.current = performance.now();
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const resume = () => {
    if (isRunning) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    ensureAudio();
    lastFrameRef.current = performance.now();
    startRef.current = performance.now() - elapsedRef.current;
    setIsRunning(true);
  };

  const toggleMute = () => {
    setMuted((m) => !m);
  };

  const elapsedSeconds = elapsedMs / 1000;
  const currentStage = findCurrentStage(totalStages, elapsedSeconds);
  const nextStage = findNextStage(totalStages, elapsedSeconds);
  const progressPct = totalDurationMs > 0 ? Math.min((elapsedMs / totalDurationMs) * 100, 100) : 0;

  if (!recipe) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = Math.floor(elapsedSeconds % 60);
  const centi = Math.floor((elapsedMs % 1000) / 10);

  const stageElapsed = currentStage ? elapsedSeconds - currentStage.start_second : 0;
  const stageDuration = currentStage ? currentStage.duration_seconds : 0;
  const stageProgress = stageDuration > 0 ? Math.min((stageElapsed / stageDuration) * 100, 100) : 0;

  const timeDisplay =
    totalDurationMs >= 3600000
      ? `${Math.floor(elapsedMs / 3600000)}:${String(Math.floor((elapsedMs % 3600000) / 60000)).padStart(2, "0")}:${String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centi).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-slide-in">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-deep-brown">Timer</h2>
        <p className="text-muted font-medium mt-1">
          {recipe.equipment} · {recipe.dose_g}g : {recipe.total_water_g}g
        </p>
      </div>

      <div className="card p-6 sm:p-8 text-center">
        <div
          className="font-extrabold text-deep-brown tabular-nums tracking-tight font-mono text-timer"
          aria-live="off"
        >
          {timeDisplay}
        </div>

        <div className="mt-6 w-full">
          <div className="flex justify-between text-xs font-medium text-muted mb-1.5 tabular-nums">
            <span>0:00</span>
            <span>{progressPct.toFixed(0)}%</span>
            <span>{formatTimeLabel(recipe.total_time_s)}</span>
          </div>
          <div className="bar-track h-4">
            <div
              className="bar-fill bg-soft-yellow"
              role="progressbar"
              aria-label="Progress total seduh"
              aria-valuenow={Math.floor(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {currentStage && (
        <div className="card p-5 sm:p-6 ring-2 ring-soft-yellow animate-pop" key={currentStage.label}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Lagi Jalan</span>
            <span className="chip bg-soft-yellow/30 text-deep-brown">{currentStage.label}</span>
          </div>
          <p className="text-base font-semibold text-deep-brown mb-3">{currentStage.instruction}</p>
          <div className="flex items-center gap-3">
            <div className="bar-track flex-1 h-2.5">
              <div
                className="bar-fill bg-deep-brown"
                role="progressbar"
                aria-label={`Progress tahap ${currentStage.label}`}
                aria-valuenow={Math.floor(stageProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${stageProgress}%` }}
              />
            </div>
            {currentStage.target_water_g > 0 && (
              <span className="text-sm font-bold text-deep-brown tabular-nums whitespace-nowrap">
                {currentStage.target_water_g}g
              </span>
            )}
          </div>
        </div>
      )}

      {nextStage && (
        <div className="card p-4 opacity-70">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Berikutnya</span>
            <span className="text-sm font-bold text-deep-brown">{nextStage.label}</span>
          </div>
          <p className="text-sm text-deep-brown/70">{nextStage.instruction}</p>
          <span className="text-xs font-medium text-muted mt-1 block">
            Mulai detik {nextStage.start_second}
            {nextStage.target_water_g > 0 ? ` · Target: ${nextStage.target_water_g}g` : ""}
          </span>
        </div>
      )}

      {isComplete && (
        <div className="card p-6 text-center bg-soft-yellow/10 border-soft-yellow/40 animate-pop">
          <div className="text-3xl font-extrabold text-deep-brown mb-2">Selesai! ☕</div>
          <p className="text-deep-brown/70 font-medium mb-4">
            Total waktu: {formatTimeLabel(recipe.total_time_s)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={reset} className="btn-secondary">Seduh Lagi</button>
            <button
              onClick={() => dispatch({ type: "SET_PHASE", phase: "feedback" })}
              className="btn-primary"
            >
              Gimana Rasanya?
            </button>
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!isRunning ? (
            <button
              onClick={elapsedMs > 0 ? resume : start}
              className="btn-primary text-lg px-10 sm:px-12"
            >
              {elapsedMs > 0 ? "Resume" : "Start"}
            </button>
          ) : (
            <button onClick={pause} className="btn-secondary text-lg px-10 sm:px-12">
              Pause
            </button>
          )}
          {elapsedMs > 0 && (
            <button onClick={reset} className="btn-secondary">Reset</button>
          )}
          <button
            onClick={toggleMute}
            className="btn-ghost"
            aria-pressed={muted}
            aria-label={muted ? "Bunyikan notifikasi stage" : "Bisukan notifikasi stage"}
          >
            {muted ? "🔇 Bunyikan" : "🔔 Bisukan"}
          </button>
        </div>
      )}

      <button
        onClick={() => dispatch({ type: "SET_PHASE", phase: "recipe" })}
        className="btn-ghost block mx-auto"
      >
        ← Balik ke resep
      </button>
    </div>
  );
}

function findStageIndex(stages: PourStage[], elapsedSeconds: number): number {
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    if (elapsedSeconds >= s.start_second && elapsedSeconds < s.start_second + s.duration_seconds) {
      return i;
    }
  }
  return -1;
}

function findCurrentStage(stages: PourStage[], elapsedSeconds: number): PourStage | null {
  const idx = findStageIndex(stages, elapsedSeconds);
  return idx >= 0 ? stages[idx] : null;
}

function findNextStage(stages: PourStage[], elapsedSeconds: number): PourStage | null {
  for (const s of stages) {
    if (s.start_second > elapsedSeconds) return s;
  }
  return null;
}
