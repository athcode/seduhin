import React, { createContext, useContext, useReducer, useCallback, useRef, type Dispatch } from "react";
import type { BeanProfile, Recipe, FeedbackType, AppPhase, FeedbackResponse, Equipment, BrewHistoryEntry } from "../types";
import { useBrewHistory } from "../hooks/useBrewHistory";

interface AppState {
  phase: AppPhase;
  equipment: Equipment | null;
  profile: BeanProfile | null;
  recipe: Recipe | null;
  adjustedRecipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  feedback: FeedbackType | null;
  adjustmentHistory: Array<{ feedback: FeedbackType; delta: string }>;
}

type Action =
  | { type: "SET_PHASE"; phase: AppPhase }
  | { type: "SET_EQUIPMENT"; equipment: Equipment }
  | { type: "SET_PROFILE"; profile: BeanProfile }
  | { type: "SET_RECIPE"; recipe: Recipe }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_FEEDBACK"; feedback: FeedbackType }
  | { type: "APPLY_ADJUSTMENT"; response: FeedbackResponse }
  | { type: "RESET" };

const initialState: AppState = {
  phase: "home",
  equipment: null,
  profile: null,
  recipe: null,
  adjustedRecipe: null,
  isLoading: false,
  error: null,
  feedback: null,
  adjustmentHistory: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_EQUIPMENT":
      return { ...state, equipment: action.equipment };
    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    case "SET_RECIPE":
      return { ...state, recipe: action.recipe, adjustedRecipe: null, adjustmentHistory: [], phase: "recipe" };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };
    case "SET_FEEDBACK":
      return { ...state, feedback: action.feedback };
    case "APPLY_ADJUSTMENT":
      return {
        ...state,
        adjustedRecipe: action.response.adjusted_recipe,
        recipe: action.response.adjusted_recipe,
        phase: "recipe",
        adjustmentHistory: [
          ...state.adjustmentHistory,
          { feedback: action.response.feedback, delta: action.response.recommendation },
        ],
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  generateRecipe: (profile: BeanProfile) => Promise<void>;
  submitFeedback: (feedback: FeedbackType) => Promise<void>;
  history: BrewHistoryEntry[];
  clearHistory: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isSubmittingRef = useRef(false);
  const { history, addEntry, clearHistory } = useBrewHistory();

  const generateRecipe = useCallback(async (profile: BeanProfile) => {
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      dispatch({ type: "SET_RECIPE", recipe: data.recipe });
      dispatch({ type: "SET_PROFILE", profile: data.profile });
      addEntry({
        origin: data.profile.origin,
        equipment: data.profile.equipment,
        process: data.profile.process,
        roast_level: data.profile.roast_level,
        dose_g: data.recipe.dose_g,
        ratio: data.recipe.ratio,
        grind_size: data.recipe.grind_size,
        water_temp_c: data.recipe.water_temp_c,
        feedback: null,
      });
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  }, []);

  const submitFeedback = useCallback(async (feedback: FeedbackType) => {
    if (!state.recipe || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    dispatch({ type: "SET_LOADING", isLoading: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, current_recipe: state.adjustedRecipe || state.recipe }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data: FeedbackResponse = await res.json();
      dispatch({ type: "APPLY_ADJUSTMENT", response: data });
      addEntry({
        origin: state.profile?.origin ?? "—",
        equipment: data.adjusted_recipe.equipment,
        process: state.profile?.process ?? "Washed",
        roast_level: data.adjusted_recipe.roast_level,
        dose_g: data.adjusted_recipe.dose_g,
        ratio: data.adjusted_recipe.ratio,
        grind_size: data.adjusted_recipe.grind_size,
        water_temp_c: data.adjusted_recipe.water_temp_c,
        feedback: data.feedback,
      });
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      isSubmittingRef.current = false;
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  }, [state.recipe, state.adjustedRecipe]);

  return (
    <AppContext.Provider value={{ state, dispatch, generateRecipe, submitFeedback, history, clearHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}