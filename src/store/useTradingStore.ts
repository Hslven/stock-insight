import {
  ColorType,
  DeepPartial,
  ChartOptions,
  SeriesPartialOptionsMap,
} from "lightweight-charts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getCssColor, getCssColorWithAlpha } from "@/lib/utils";

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
        Baseline: {
          baseValue: { type: "price", price: 12.9 },
          topLineColor: getCssColor("--hight"),
          /** 渐变起始填充颜色 */
          topFillColor1: getCssColorWithAlpha("--hight", "50%"),
          /** 渐变结束填充颜色 */
          topFillColor2: getCssColorWithAlpha("--hight", "10%"),
          bottomLineColor: getCssColor("--low"),
          bottomFillColor1: getCssColorWithAlpha("--low", "10%"),
          bottomFillColor2: getCssColorWithAlpha("--low", "50%"),
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
