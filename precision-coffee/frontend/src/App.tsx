import { useApp } from "./context/AppContext";
import { Home } from "./components/Home";
import { EquipmentSelect } from "./components/EquipmentSelect";
import { PresetModal } from "./components/PresetModal";
import { BeanInput } from "./components/BeanInput";
import { RecipeDisplay } from "./components/RecipeDisplay";
import { BrewTimer } from "./components/BrewTimer";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { BrandIcon } from "./components/MethodIcon";
import type { AppPhase } from "./types";

const BREW_PHASES: { key: AppPhase; label: string; n: number }[] = [
  { key: "input", label: "Kopi", n: 1 },
  { key: "recipe", label: "Resep", n: 2 },
  { key: "brewing", label: "Seduh", n: 3 },
  { key: "feedback", label: "Rasa", n: 4 },
];

export function App() {
  const { state, dispatch } = useApp();
  const phase = state.phase;
  const isBrewPhase = BREW_PHASES.some((p) => p.key === phase);
  const phaseIdx = BREW_PHASES.findIndex((p) => p.key === phase);

  const canGoTo = (target: AppPhase): boolean =>
    target === "input" ? true : !!state.recipe;

  const goToPhase = (target: AppPhase) => {
    if (target === phase || !canGoTo(target)) return;
    dispatch({ type: "SET_PHASE", phase: target });
  };

  return (
    <div className="flex flex-col flex-1">
      {isBrewPhase && (
        <header className="sticky top-0 z-20 border-b border-light-brown/40 bg-cream/85 backdrop-blur-md">
          <div className="max-w-4xl w-full mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrandIcon className="w-7 h-7 text-deep-brown" />
              <button
                onClick={() => dispatch({ type: "SET_PHASE", phase: "home" })}
                className="text-lg font-extrabold text-deep-brown tracking-tight hover:text-mocha transition-colors"
              >
                Seduhin
              </button>
            </div>
            <span className="chip bg-soft-yellow/25 text-deep-brown">
              {state.equipment}
            </span>
          </div>
          <div className="max-w-2xl w-full mx-auto px-4 pb-3">
            <div className="phase-rail">
              {BREW_PHASES.map((p, i) => {
                const isActive = i === phaseIdx;
                const isDone = i < phaseIdx;
                const reachable = canGoTo(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => goToPhase(p.key)}
                    disabled={!reachable}
                    aria-current={isActive ? "step" : undefined}
                    className="phase-step flex-1 min-w-0 cursor-pointer disabled:cursor-default disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-soft-yellow rounded-lg"
                  >
                    <div
                      className={`phase-dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                    >
                      {isDone ? "✓" : p.n}
                    </div>
                    <span className="hidden sm:inline truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-10 safe-bottom">
        {phase === "home" && <Home />}
        {phase === "method" && <EquipmentSelect />}
        {phase === "presets" && <PresetModal />}
        {phase === "input" && <BeanInput />}
        {phase === "recipe" && <RecipeDisplay />}
        {phase === "brewing" && <BrewTimer />}
        {phase === "feedback" && <FeedbackPanel />}
      </main>

      <footer className="border-t border-light-brown/40 py-6 text-center text-xs text-muted font-medium">
        Seduhin &middot; biji bagus, sayang ditebak. Seduhin aja. &middot; v2.11
      </footer>
    </div>
  );
}
