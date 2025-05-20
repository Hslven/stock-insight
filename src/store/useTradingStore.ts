import {
  ColorType,
  DeepPartial,
  ChartOptions,
  SeriesPartialOptionsMap,
} from "lightweight-charts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getCssColor } from "@/lib/utils";

interface TradingState {
  chartOptions: DeepPartial<ChartOptions>;
  seriesOptions: DeepPartial<SeriesPartialOptionsMap>;
}

/**
 * 管理 Trading 配置选项
 */
export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      chartOptions: {
        layout: {
          background: {
            type: ColorType.Solid,
            color: getCssColor("--background"),
          },
          textColor: "black",
        },
        autoSize: true,
        localization: {
          dateFormat: "yyyy-MM-dd",
        },
      },
      seriesOptions: {
        Candlestick: {
          borderVisible: false,
          borderUpColor: "#000",
          borderDownColor: "#000",
          upColor: getCssColor("--hight"),
          downColor: getCssColor("--low"),
          wickUpColor: getCssColor("--hight"),
          wickDownColor: getCssColor("--low"),
        },
      },

      setChartOptions: (options: DeepPartial<ChartOptions>) =>
        set({ chartOptions: options }),
    }),
    {
      name: "trading-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
