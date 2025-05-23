import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type customTheme = string;
type Theme = "hidden" | "light" | "dark" | customTheme;

/**
 * 管理项目基础配置
 */
export const useBaseConfig = create<{
  theme: Theme;
  setTheme: (newTheme: Theme) => void;
}>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (newTheme: Theme) => set({ theme: newTheme }),
    }),
    {
      name: "base-config",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
