import { useCallback, useEffect, useState, useTransition } from "react";

export interface ResumeColors {
  primary: string;
  accent: string;
  heading: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  colors: ResumeColors;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "classic-blue", name: "Classic Blue", colors: { primary: "#1d42e0", accent: "#1d42e0", heading: "#0e1420" } },
  { id: "emerald", name: "Emerald", colors: { primary: "#0f6e56", accent: "#1d9e75", heading: "#04342c" } },
  { id: "rose-gold", name: "Rose Gold", colors: { primary: "#993556", accent: "#d4537e", heading: "#4b1528" } },
  { id: "slate-pro", name: "Slate Pro", colors: { primary: "#185fa5", accent: "#378add", heading: "#042c53" } },
  { id: "charcoal-gold", name: "Charcoal Gold", colors: { primary: "#0e1420", accent: "#c9943a", heading: "#0e1420" } },
];

export const DEFAULT_PRESET_ID = "classic-blue";
export const DEFAULT_COLORS: ResumeColors = COLOR_PRESETS[0].colors;

const STORAGE_KEY = "resume-color-scheme";

interface StoredScheme {
  presetId: string | null;
  colors: ResumeColors;
}

function loadFromStorage(): StoredScheme {
  if (typeof window === "undefined") return { presetId: DEFAULT_PRESET_ID, colors: DEFAULT_COLORS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { presetId: DEFAULT_PRESET_ID, colors: DEFAULT_COLORS };
    const parsed = JSON.parse(raw) as Partial<StoredScheme>;
    if (!parsed.colors) return { presetId: DEFAULT_PRESET_ID, colors: DEFAULT_COLORS };
    return {
      presetId: parsed.presetId ?? null,
      colors: {
        primary: parsed.colors.primary || DEFAULT_COLORS.primary,
        accent: parsed.colors.accent || DEFAULT_COLORS.accent,
        heading: parsed.colors.heading || DEFAULT_COLORS.heading,
      },
    };
  } catch {
    return { presetId: DEFAULT_PRESET_ID, colors: DEFAULT_COLORS };
  }
}

function saveToStorage(scheme: StoredScheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scheme));
  } catch {
    /* ignore quota/availability errors */
  }
}

export function useResumeColors() {
  const initial = typeof window !== "undefined" ? loadFromStorage() : { presetId: DEFAULT_PRESET_ID, colors: DEFAULT_COLORS };
  const [colors, setColors] = useState<ResumeColors>(initial.colors);
  const [activePresetId, setActivePresetId] = useState<string | null>(initial.presetId);
  const [, startTransition] = useTransition();

  // Persist whenever changed
  useEffect(() => {
    saveToStorage({ presetId: activePresetId, colors });
  }, [colors, activePresetId]);

  const applyPreset = useCallback((preset: ColorPreset) => {
    startTransition(() => {
      setColors(preset.colors);
      setActivePresetId(preset.id);
    });
  }, []);

  const setColor = useCallback((key: keyof ResumeColors, value: string) => {
    startTransition(() => {
      setColors((prev) => ({ ...prev, [key]: value }));
      setActivePresetId(null);
    });
  }, []);

  const reset = useCallback(() => {
    startTransition(() => {
      setColors(DEFAULT_COLORS);
      setActivePresetId(DEFAULT_PRESET_ID);
    });
  }, []);

  return { colors, activePresetId, applyPreset, setColor, reset, presets: COLOR_PRESETS };
}
