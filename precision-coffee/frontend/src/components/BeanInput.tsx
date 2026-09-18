import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { BeanProfile } from "../types";
import {
  PROCESSES,
  ROASTS,
  GRINDERS,
  DEFAULT_DOSES,
  DEFAULT_RATIOS,
  RATIO_SUGGESTIONS,
} from "../constants";
import { MethodIcon } from "./MethodIcon";

export function BeanInput() {
  const { generateRecipe, state, dispatch } = useApp();
  const profile = state.profile;
  const equipment = state.equipment || "V60";

  const [origin, setOrigin] = useState(profile?.origin || "");
  const [process, setProcess] = useState(profile?.process || "Washed");
  const [roastLevel, setRoastLevel] = useState(profile?.roast_level || "Medium");
  const [grinder, setGrinder] = useState(profile?.grinder || "Timemore C2/C3");
  const [customDose, setCustomDose] = useState(profile?.custom_dose ? String(profile.custom_dose) : "");
  const [customRatio, setCustomRatio] = useState(profile?.custom_ratio ? String(profile.custom_ratio) : "");

  useEffect(() => {
    if (profile?.custom_dose) setCustomDose(String(profile.custom_dose));
    if (profile?.custom_ratio) setCustomRatio(String(profile.custom_ratio));
  }, [profile]);

  const defDose = DEFAULT_DOSES[equipment] ?? 18;
  const defRatio = DEFAULT_RATIOS[equipment] ?? 16;

  const effDose = customDose ? parseInt(customDose) : defDose;
  const effRatio = customRatio ? parseFloat(customRatio) : defRatio;
  const previewWater = Math.round(effDose * effRatio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim()) return;
    const p: BeanProfile = {
      origin: origin.trim(),
      process,
      roast_level: roastLevel,
      equipment,
      grinder,
    };
    const d = parseInt(customDose);
    const r = parseFloat(customRatio);
    if (!isNaN(d) && d >= 5 && d <= 200) p.custom_dose = d;
    if (!isNaN(r) && r >= 1 && r <= 30) p.custom_ratio = r;
    await generateRecipe(p);
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-in">
      <div className="text-center mb-8">
        <button
          onClick={() => dispatch({ type: "SET_PHASE", phase: "presets" })}
          className="btn-ghost mb-2"
        >
          ← Alat lain
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-brown tracking-tight">
          <span className="inline-flex items-center gap-2.5">
            <MethodIcon equipment={equipment} className="w-8 h-8 text-deep-brown" />
            {equipment}
          </span>
        </h1>
        <p className="mt-2 text-muted font-medium text-sm sm:text-base">
          Masukkan detail biji kopi untuk resep {equipment}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label htmlFor="origin" className="block text-sm font-semibold text-deep-brown mb-1">
            Asal Kopi
          </label>
          <p className="text-xs text-muted mb-2">
            Negara atau daerahnya. Contoh: Ethiopia Yirgacheffe, Sumatra Gayo, Toraja.
          </p>
          <input
            id="origin"
            type="text"
            className="input-field"
            placeholder="Contoh: Ethiopia Yirgacheffe"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="process" className="block text-sm font-semibold text-deep-brown mb-1">
            Proses
          </label>
          <p className="text-xs text-muted mb-2">
            Cara biji dilepas dari buahnya. Soal rasa, ini noh yang paling ngaruh.
          </p>
          <select
            id="process"
            className="select-field"
            value={process}
            onChange={(e) => setProcess(e.target.value as typeof process)}
          >
            {PROCESSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label} · {p.hint}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="roast" className="block text-sm font-semibold text-deep-brown mb-1">
            Roast Level
          </label>
          <p className="text-xs text-muted mb-2">
            Light = asam buah. Dark = coklat pait. Medium = aman.
          </p>
          <select
            id="roast"
            className="select-field"
            value={roastLevel}
            onChange={(e) => setRoastLevel(e.target.value as typeof roastLevel)}
          >
            {ROASTS.map((r) => (
              <option key={r.value} value={r.value}>{r.label} · {r.hint}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="grinder" className="block text-sm font-semibold text-deep-brown mb-1">
            Grinder
          </label>
          <p className="text-xs text-muted mb-2">
            Pilih yang ada di rumah. Nanti resep kasih angka spesifik untuk grinder itu.
          </p>
          <select
            id="grinder"
            className="select-field"
            value={grinder}
            onChange={(e) => setGrinder(e.target.value as typeof grinder)}
          >
            {GRINDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label} · {g.type}</option>
            ))}
          </select>
        </div>

        <details className="group">
          <summary className="text-sm font-semibold text-muted cursor-pointer hover:text-deep-brown transition-colors select-none">
            Dose &amp; Rasio Sendiri (opsional)
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dose" className="block text-xs font-semibold text-deep-brown mb-1">
                Dose Kopi (gram)
              </label>
              <input
                id="dose"
                type="number"
                inputMode="numeric"
                className="input-field text-sm"
                placeholder={`Default: ${defDose}g`}
                min={5}
                max={200}
                step={1}
                value={customDose}
                onChange={(e) => setCustomDose(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="ratio" className="block text-xs font-semibold text-deep-brown mb-1">
                Rasio Seduh (1:X)
              </label>
              <input
                id="ratio"
                type="text"
                inputMode="decimal"
                className="input-field text-sm"
                placeholder={`Default: 1:${defRatio}`}
                list="ratio-suggestions"
                value={customRatio}
                onChange={(e) => setCustomRatio(e.target.value)}
              />
              <datalist id="ratio-suggestions">
                {RATIO_SUGGESTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </datalist>
            </div>
          </div>
          <div className="mt-3 bg-cream-2 rounded-xl p-3 text-center">
            <span className="text-xs font-medium text-muted">Air otomatis: </span>
            <span className="text-base font-extrabold text-deep-brown">
              {effDose}g × 1:{effRatio || 0} ={" "}
            </span>
            <span className="text-base font-extrabold text-deep-brown">
              {isNaN(previewWater) ? 0 : previewWater}g
            </span>
          </div>
        </details>

        {state.error && (
          <div className="alert-error" role="alert" aria-live="polite">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={state.isLoading || !origin.trim()}
          className="btn-primary w-full text-lg"
        >
          {state.isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              Menganalisa...
            </>
          ) : (
            "Generate Resep"
          )}
        </button>
      </form>
    </div>
  );
}
