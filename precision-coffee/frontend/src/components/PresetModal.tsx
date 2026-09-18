import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type { Preset } from "../types";
import { EST_TIMES } from "../constants";
import { MethodIcon } from "./MethodIcon";

export function PresetModal() {
  const { state, dispatch } = useApp();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const equipment = state.equipment;

  useEffect(() => {
    fetch("/api/presets")
      .then((r) => r.json())
      .then((d) => setPresets(d.presets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = presets.filter((p) => p.equipment === equipment);

  if (!equipment) return null;

  const selectPreset = (preset: Preset) => {
    dispatch({
      type: "SET_PROFILE",
      profile: {
        origin: "",
        process: "Washed",
        roast_level: "Medium",
        equipment: preset.equipment,
        grinder: "Generic (Tanpa Referensi)",
        custom_dose: preset.dose,
        custom_ratio: preset.ratio,
      },
    });
    dispatch({ type: "SET_PHASE", phase: "input" });
  };

  const goCustom = () => dispatch({ type: "SET_PHASE", phase: "input" });
  const goBack = () => dispatch({ type: "SET_PHASE", phase: "method" });

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      <div className="text-center mb-8">
        <button onClick={goBack} className="btn-ghost mb-2">
          ← Alat lain
        </button>
        <div className="flex items-center justify-center gap-2.5">
          <MethodIcon equipment={equipment} className="w-8 h-8 text-deep-brown" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-deep-brown">{equipment}</h2>
        </div>
        <p className="mt-2 text-muted font-medium text-sm sm:text-base">
          {filtered.length > 0
            ? `Ada ${filtered.length} resep barista untuk ${equipment}. Atau pakai sendiri.`
            : `Belum ada resep barista untuk ${equipment}. Pakai sendiri aja.`}
        </p>
      </div>

      {loading && (
        <div className="card p-8 text-center text-muted font-medium">Memuat resep…</div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3 mb-6">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p)}
              className="card card-hover p-5 w-full text-left no-tap-highlight"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-extrabold text-deep-brown">{p.name}</div>
                  <div className="text-sm text-muted font-medium">{p.barista}</div>
                </div>
                <span className="chip bg-soft-yellow/25 text-deep-brown shrink-0">
                  {EST_TIMES[p.equipment]}
                </span>
              </div>

              {/* preview resep ringkas */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <PreviewStat label="Dose" value={`${p.dose}g`} />
                <PreviewStat label="Rasio" value={`1:${p.ratio}`} />
                <PreviewStat label="Total Air" value={`${Math.round(p.dose * p.ratio)}g`} />
              </div>

              <p className="mt-3 text-sm text-deep-brown/75">{p.description}</p>
              <p className="mt-2 text-xs text-muted italic leading-relaxed">
                Rasa: {p.taste_notes}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.tags.map((t) => (
                  <span key={t} className="chip bg-cream-2 text-muted">{t}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      <button onClick={goCustom} className="btn-primary w-full text-lg">
        Custom / Manual
      </button>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-2 rounded-lg p-2 text-center">
      <div className="text-[10px] font-medium text-muted uppercase tracking-wide">{label}</div>
      <div className="text-sm font-extrabold text-deep-brown">{value}</div>
    </div>
  );
}
