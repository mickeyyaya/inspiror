import { useState, useEffect } from "react";
import { APP_THEMES } from "../constants/themes";

const THEME_STORAGE_KEY = "inspiror-theme-id";

export function useTheme() {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && APP_THEMES.some((t) => t.id === stored)) {
        return stored;
      }
    } catch {
      // ignore
    }
    return "default";
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // ignore
    }

    const theme = APP_THEMES.find((t) => t.id === themeId) || APP_THEMES[0];
    const root = document.body;

    root.style.backgroundColor = theme.backgroundColor;
    
    if (theme.backgroundImage) {
      root.style.backgroundImage = theme.backgroundImage;
    } else {
      root.style.backgroundImage = "none";
    }

    if (theme.backgroundSize) {
      root.style.backgroundSize = theme.backgroundSize;
    } else {
      root.style.backgroundSize = "auto";
    }

    if (theme.backgroundPosition) {
      root.style.backgroundPosition = theme.backgroundPosition;
    } else {
      root.style.backgroundPosition = "0 0";
    }

    // Default to repeat if not specified
    root.style.backgroundRepeat = "repeat";

  }, [themeId]);

  return { themeId, setThemeId, themes: APP_THEMES };
}
