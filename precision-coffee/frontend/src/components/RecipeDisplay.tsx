import { useApp } from "../context/AppContext";
import type { Recipe } from "../types";
import { formatTimeLabel } from "../constants";

function RecipeCard({ recipe, isAdjusted }: { recipe: Recipe; isAdjusted?: boolean }) {
  return (
    <div className={`card p-6 space-y-4 ${isAdjusted ? "ring-2 ring-soft-yellow" : ""}`}>
      {isAdjusted && (
        <span className="chip bg-soft-yellow/25 text-deep-brown">✓ Sudah Disesuaikan</span>
      )}
      {recipe.is_custom && !isAdjusted && (
        <span className="chip bg-cream-2 text-muted border border-light-brown/40">Dose Sendiri</span>
      )}
      {(recipe.adjustments?.reason as string | undefined) && (
        <div className="alert-info" role="status" aria-live="polite">
          <span className="font-bold">Adjustment:</span>{" "}
          {String(recipe.adjustments?.reason)}
        </div>
      )}

      {recipe.grinder_info && recipe.grinder_info.grinder !== "Generic (Tanpa Referensi)" && (
        <div className="bg-deep-brown/5 border border-deep-brown/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Setting Grinder</span>
            <span className="text-xs text-muted">· {recipe.grinder_info.grinder}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-deep-brown font-mono">
              {recipe.grinder_info.setting}
            </span>
            <span className="text-sm text-muted font-medium">{recipe.grinder_info.unit}</span>
          </div>
          <div className="mt-2 text-sm font-medium text-deep-brown/70">
            Tekstur: {recipe.grinder_info.texture}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Dose" value={`${recipe.dose_g}g`} />
        <StatBox label="Suhu Air" value={`${recipe.water_temp_c}°C`} />
        <StatBox label="Grind (0-100)" value={`${Math.max(0, Math.min(100, recipe.grind_size))}`} />
        <StatBox label="Total Air" value={`${recipe.total_water_g}g`} />
        <StatBox label="Rasio" value={`1:${recipe.ratio}`} />
        <StatBox label="Alat" value={recipe.equipment} />
        <StatBox label="Roast" value={recipe.roast_level} />
        <StatBox label="Total Waktu" value={formatTimeLabel(recipe.total_time_s)} />
      </div>

      <div className="mt-2">
        <h3 className="font-bold text-deep-brown mb-3">Kapan Tuang Air</h3>
        <div className="space-y-2.5">
          {recipe.stages.map((stage, i) => (
            <div key={i} className="bg-cream-2 rounded-xl p-4 border border-light-brown/30">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-bold text-deep-brown">{stage.label}</span>
                <span className="text-xs text-muted font-medium whitespace-nowrap tabular-nums">
                  {stage.start_second}s — {stage.start_second + stage.duration_seconds}s
                </span>
              </div>
              <p className="text-sm text-deep-brown/80 mb-2">{stage.instruction}</p>
              {stage.target_water_g > 0 && (
                <span className="chip bg-deep-brown text-soft-yellow">
                  Target: {stage.target_water_g}g
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-2 rounded-xl p-3 text-center">
      <div className="text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
      <div className="text-base sm:text-lg font-extrabold text-deep-brown mt-0.5 truncate">
        {value}
      </div>
    </div>
  );
}

export function RecipeDisplay() {
  const { state, dispatch } = useApp();
  const recipe = state.adjustedRecipe || state.recipe;

  if (!recipe) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-in">
      {state.error && (
        <div className="alert-error" role="alert" aria-live="polite">{state.error}</div>
      )}
      {state.isLoading && (
        <div
          className="flex items-center justify-center gap-2 py-4 text-muted font-medium"
          role="status"
          aria-live="polite"
        >
          <span className="w-5 h-5 border-2 border-light-brown/40 border-t-deep-brown rounded-full animate-spin" />
          Menyesuaikan resep...
        </div>
      )}
      <RecipeCard recipe={recipe} isAdjusted={!!state.adjustedRecipe} />

      {state.adjustmentHistory.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-deep-brown mb-2">Riwayat Perubahan</h3>
          <div className="space-y-1">
            {state.adjustmentHistory.map((h, i) => (
              <div key={i} className="text-sm text-deep-brown/70">
                #{i + 1}: <span className="font-semibold">{h.feedback}</span>, {h.delta}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => dispatch({ type: "SET_PHASE", phase: "input" })}
          className="btn-ghost self-start"
        >
          ← Ubah Kopi
        </button>
        <button
          onClick={() => dispatch({ type: "SET_PHASE", phase: "brewing" })}
          className="btn-primary flex-1 text-lg"
        >
          Mulai Timer
        </button>
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="btn-secondary sm:w-auto"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
