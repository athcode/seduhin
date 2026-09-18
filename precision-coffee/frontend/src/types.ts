export type Process = "Washed" | "Natural" | "Anaerobic";
export type RoastLevel = "Light" | "Medium" | "Dark";
export type Equipment = "V60" | "Aeropress" | "Chemex" | "French Press" | "Espresso" | "Moka Pot" | "Tubruk" | "Cold Brew" | "Kalita Wave" | "Turkish" | "Clever Dripper" | "Siphon";
export type FeedbackType = "SOUR" | "BITTER";
export type AppPhase = "home" | "method" | "presets" | "input" | "recipe" | "brewing" | "feedback";
export type Grinder =
  | "Timemore C2/C3" | "Timemore C3 ESP" | "Timemore Chestnut X"
  | "Timemore C5 ESP" | "Comandante C40"
  | "1Zpresso JX/J-Max" | "1Zpresso J-Ultra" | "1Zpresso K-Series"
  | "Baratza Encore" | "Fellow Ode Gen 2" | "Kingrinder K6"
  | "DF64 Gen 2" | "Niche Zero" | "Eureka Mignon"
  | "Option-O Lagom Mini" | "Hario Skerton"
  | "Generic (Tanpa Referensi)";

export interface PourStage {
  label: string;
  start_second: number;
  duration_seconds: number;
  target_water_g: number;
  instruction: string;
}

export interface GrinderInfo {
  grinder: string;
  type: string;
  unit: string;
  setting: number;
  texture: string;
}

export interface Preset {
  id: string;
  name: string;
  barista: string;
  equipment: Equipment;
  dose: number;
  ratio: number;
  description: string;
  tags: string[];
  taste_notes: string;
  taste_keywords: string[];
  match_score?: number;
}

export interface PresetsResponse {
  status: string;
  presets: Preset[];
}

export interface Recipe {
  dose_g: number;
  water_temp_c: number;
  grind_size: number;
  total_water_g: number;
  total_time_s: number;
  ratio: number;
  equipment: Equipment;
  roast_level: RoastLevel;
  stages: PourStage[];
  adjustments: Record<string, unknown>;
  grinder_info: GrinderInfo;
  is_custom: boolean;
}

export interface BeanProfile {
  origin: string;
  process: Process;
  roast_level: RoastLevel;
  equipment: Equipment;
  grinder: Grinder;
  custom_dose?: number;
  custom_water?: number;
  custom_ratio?: number;
}

export interface RecipeResponse {
  status: string;
  profile: BeanProfile;
  recipe: Recipe;
}

export interface FeedbackResponse {
  status: string;
  feedback: FeedbackType;
  original_recipe: Recipe;
  adjusted_recipe: Recipe;
  recommendation: string;
}

export interface BrewHistoryEntry {
  id: string;
  createdAt: number;
  origin: string;
  equipment: Equipment;
  process: Process;
  roast_level: RoastLevel;
  dose_g: number;
  ratio: number;
  grind_size: number;
  water_temp_c: number;
  feedback: FeedbackType | null;
}