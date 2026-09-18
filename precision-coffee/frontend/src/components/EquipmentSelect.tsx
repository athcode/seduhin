import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import type { Equipment, Preset } from "../types";
import { METHODS, EST_TIMES } from "../constants";
import { MethodIcon } from "./MethodIcon";

const ONBOARD_KEY = "precision-coffee:onboarded";

export function EquipmentSelect() {
  const { dispatch, history, clearHistory } = useApp();
  const [tasteQuery, setTasteQuery] = useState("");
  const [matches, setMatches] = useState<Preset[]>([]);
  const [showOnboard, setShowOnboard] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARD_KEY)) setShowOnboard(true);
    } catch {
      /* storage diblokir — lewati onboarding */
    }
  }, []);

  const dismissOnboard = () => {
    setShowOnboard(false);
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch {
      /* no-op */
    }
  };

  useEffect(() => {
    if (!tasteQuery.trim()) {
      setMatches([]);
      return;
    }
    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      fetch(`/api/taste-match?q=${encodeURIComponent(tasteQuery)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setMatches(d.results || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [tasteQuery]);

  const selectEquipment = (eq: Equipment) => {
    dispatch({ type: "SET_EQUIPMENT", equipment: eq });
    dispatch({ type: "SET_PHASE", phase: "presets" });
  };

  const selectPreset = (p: Preset) => {
    dispatch({ type: "SET_EQUIPMENT", equipment: p.equipment });
    dispatch({
      type: "SET_PROFILE",
      profile: {
        origin: "",
        process: "Washed",
        roast_level: "Medium",
        equipment: p.equipment,
        grinder: "Generic (Tanpa Referensi)",
        custom_dose: p.dose,
        custom_ratio: p.ratio,
      },
    });
    dispatch({ type: "SET_PHASE", phase: "input" });
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-in">
      <div className="text-center mb-8">
        <button
          onClick={() => dispatch({ type: "SET_PHASE", phase: "home" })}
          className="btn-ghost mb-2"
        >
          ← Beranda
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-brown tracking-tight">
          Pilih Metode Seduh
        </h1>
        <p className="mt-2 text-muted font-medium text-sm sm:text-base text-balance">
          Klik alat yang kamu punya, atau ketik rasa yang lagi dicari.
        </p>
      </div>

      {showOnboard && (
        <div className="alert-info mb-6 flex items-start gap-3 animate-pop">
          <span className="text-xl shrink-0" role="img" aria-label="Tip">&#128161;</span>
          <div className="flex-1">
            <p className="font-bold mb-0.5">Baru ngopi-ngopi?</p>
            <p className="text-sm text-deep-brown/80">
              Klik alat di bawah, isi asal kopi, terus pilih grinder. Nanti muncul resepnya: berapa gram, air panas berapa derajat, gilingan di angka berapa. Waktu seduh, timer nunjukin kapan harus tuang air. Abis itu kabari asem atau paitnya, biar resepnya dibenerin.
            </p>
          </div>
          <button onClick={dismissOnboard} className="btn-ghost shrink-0" aria-label="Tutup tips">
            ✕
          </button>
        </div>
      )}

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            className="input-field pr-10"
            placeholder="Mau rasa kayak apa? fruity, bold, clean, floral..."
            value={tasteQuery}
            onChange={(e) => setTasteQuery(e.target.value)}
            aria-label="Cari resep berdasarkan rasa"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm" aria-hidden>&#128269;</span>
        </div>

        {matches.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Paling Cocok ({matches.length})
            </p>
            {matches.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                className="card card-hover p-4 w-full text-left no-tap-highlight"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MethodIcon equipment={p.equipment} className="w-6 h-6 shrink-0 text-deep-brown" />
                    <div className="min-w-0">
                      <div className="font-extrabold text-deep-brown text-sm truncate">{p.name}</div>
                      <div className="text-xs text-muted truncate">
                        {p.barista} · {p.equipment} · {p.dose}g 1:{p.ratio} · {EST_TIMES[p.equipment]}
                      </div>
                    </div>
                  </div>
                  <span className="chip bg-deep-brown text-soft-yellow shrink-0">Match</span>
                </div>
                <p className="mt-1 text-xs text-deep-brown/70 line-clamp-2">{p.taste_notes}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {METHODS.map((m) => (
          <button
            key={m.value}
            onClick={() => selectEquipment(m.value)}
            className="card card-hover p-4 sm:p-5 text-center no-tap-highlight"
          >
            <MethodIcon
              equipment={m.value}
              className="w-9 h-9 sm:w-11 sm:h-11 mx-auto mb-2 sm:mb-3 text-deep-brown"
            />
            <div className="font-extrabold text-deep-brown text-sm mb-1">{m.label}</div>
            <div className="text-xs text-muted font-medium leading-relaxed">{m.desc}</div>
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="card p-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-deep-brown">Riwayat Seduh ({history.length})</h2>
            <button onClick={clearHistory} className="btn-ghost text-xs">Bersihkan</button>
          </div>
          <div className="space-y-2">
            {history.slice(0, 6).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-semibold text-deep-brown">{h.equipment}</span>
                  <span className="text-muted"> · {h.origin || "—"}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs text-muted">
                  <span>{h.dose_g}g 1:{h.ratio}</span>
                  {h.feedback && (
                    <span className="chip bg-soft-yellow/30 text-deep-brown">{h.feedback}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
