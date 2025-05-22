import { useMemo, useRef, useState } from "react";
import {
  CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
} from "lightweight-charts";
import { useDebounceFn, useMount, useRequest } from "ahooks";
import { Spinner } from "@heroui/react";

import { getTradingHistoryData } from "@/api/modules/trading-data";
import { transformAkShareDataToTradingChart } from "@/lib/transformData";
import { getMonthsAgoTimestamp, getWeekday } from "@/lib/utils";
import PolarityDiv from "@/components/polarity-div";
import { useTradingStore } from "@/store/useTradingStore";

export default function TradingView({
  symbol,
  period,
}: {
  symbol: string;
  period: "daily" | "weekly" | "monthly";
}) {
  const tradingStore = useTradingStore();
  const chartElementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const candlestickSeries = useRef<ISeriesApi<"Candlestick">>();
  const histogramSeries = useRef<ISeriesApi<"Histogram">>();

  const [targetTradingData, setTargetTradingData] = useState<{
    close: number;
    high: number;
    low: number;
    open: number;
    time: string;
  }>({
    close: 0,
    high: 0,
    low: 0,
    open: 0,
    time: "",
  });
  // const [tradingHistory, setTradingHistory] = useState<BaseTradingData[]>();
  // const tradingHistoryRef = useRef<BaseTradingData[]>();

  const [monthAgo, setMonthAgo] = useState(15);
  const { run: setMonthAgoDebounce } = useDebounceFn(
    (month: number) => {
      const monthlyMap = {
        daily: 1,
        weekly: 4,
        monthly: 12,
      };

      setMonthAgo((prev) => prev + month * monthlyMap[period]);
    },
    { wait: 500 },
  );

  const params = useMemo(() => {
    const periodMap = {
      daily: 1,
      weekly: 4,
      monthly: 8,
    };
    const ago = monthAgo * periodMap[period];

    return {
      start_time: getMonthsAgoTimestamp(ago),
      period: period,
      symbol: symbol,
    };
  }, [monthAgo, period, symbol]);

  /**
   * 两者的时间相同，不发起新的请求（周期变化除外）
   */
  const isFirstRender = useRef(true);
  const preDataRef = useRef<Date>();
  const currentDataRef = useRef<Date>();
  const preActivePeriodRef = useRef<typeof period>();
  const tradingHistoryRef = useRef<BaseTradingData[]>();

  useRequest(
    async () => {
      if (
        preDataRef.current &&
        currentDataRef.current &&
        preDataRef.current.getTime() === currentDataRef.current.getTime() &&
        preActivePeriodRef.current === period
      ) {
        return Promise.resolve();
      }
      setLoading(true);

      return await getTradingHistoryData(params);
    },
    {
      refreshDeps: [monthAgo, period, symbol],
      debounceWait: 300,
      onSuccess: (response) => {
        if (!response?.data) return;
        const { data } = response;

        tradingHistoryRef.current = transformAkShareDataToTradingChart(data);

        candlestickSeries.current?.setData(tradingHistoryRef.current);

        if (tradingHistoryRef.current.length > 0) {
          const latestTime = new Date(tradingHistoryRef.current[0].time);

          preDataRef.current = currentDataRef.current;
          currentDataRef.current = latestTime;
          preActivePeriodRef.current = period;
        }

        if (isFirstRender.current) {
          isFirstRender.current = false;

          chartRef.current?.timeScale().setVisibleLogicalRange({
            from: tradingHistoryRef.current.length - 50,
            to: tradingHistoryRef.current.length + 10,
          });
        }
        // chartRef.current?.timeScale().fitContent();
        // chartRef.current?.timeScale().setVisibleLogicalRange(vr);
      },
      onFinally: () => setLoading(false),
    },
  );

  const candlestickSeriesOptions = useMemo(
    () => tradingStore.seriesOptions.Candlestick,
    [tradingStore.seriesOptions.Candlestick],
  );

  useMount(() => {
    if (chartRef.current || !chartElementRef.current) {
      return;
    }

    chartRef.current = createChart(
      chartElementRef.current,
      tradingStore.chartOptions,
    );
    histogramSeries.current = chartRef.current.addSeries(HistogramSeries, {
      color: "#26a69a",
    });
    candlestickSeries.current = chartRef.current.addSeries(
      CandlestickSeries,
      candlestickSeriesOptions,
    );

    const handleRangeChange = (
      logicalRange: { from: number; to: number } | null,
    ) => {
      if (!logicalRange || logicalRange.from >= -10) return;
      const month = Math.ceil((logicalRange?.from ?? 1) / 10);

      setMonthAgoDebounce(Math.abs(month));
    };

    const handleCrosshairMove = (param: MouseEventParams) => {
      if (!param || !param.seriesData || !candlestickSeries.current) return;

      const candlestickData = param.seriesData.get(candlestickSeries.current);

      if (candlestickData) {
        // console.log("当前数据点：", seriesData);
        setTargetTradingData(candlestickData as CandlestickData<string>);
      }
    };

    chartRef.current
      ?.timeScale()
      .subscribeVisibleLogicalRangeChange(handleRangeChange);
    chartRef.current?.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chartRef.current
        ?.timeScale()
        ?.unsubscribeVisibleLogicalRangeChange(handleRangeChange);

      chartRef.current?.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  });

  // 日内价差
  const dailySpread = useMemo(
    () => (targetTradingData.close - targetTradingData.open).toFixed(2),
    [targetTradingData.close, targetTradingData.open],
  );

  // 日内收益率
  const dayAmplitude = useMemo(() => {
    // 绝对差价
    const absolute = targetTradingData.close - targetTradingData.open;
    const percentage = (absolute / targetTradingData.open) * 100;

    if (isNaN(percentage)) {
      return "0.00%";
    }

    return percentage.toFixed(2) + "%";
  }, [targetTradingData?.open, targetTradingData?.close]);

  const [loading, setLoading] = useState<boolean>(true);

  return (
    <>
      <div className="flex items-end justify-between whitespace-nowrap">
        <div>
          <PolarityDiv signed={dailySpread}>
            <span className="text-3xl">
              {targetTradingData.close.toFixed(2)}
            </span>
            <div className="flex">
              <span className="min-w-[55px]">{dailySpread}</span>
              <span className="min-w-[60px]">{dayAmplitude}</span>
              {/* <span>至今涨幅</span> */}
            </div>
          </PolarityDiv>
        </div>
      </div>
      <div className="flex h-full relative">
        <div className="absolute z-10 text-black flex">
          <div className="flex gap-2">
            {targetTradingData.time && (
              <span className="min-w-[150px]">{`${targetTradingData.time}-${getWeekday(targetTradingData.time)}`}</span>
            )}
            <span className="min-w-[60px]">{`O:${targetTradingData.open}`}</span>
            <span className="min-w-[60px]">{`H:${targetTradingData.high}`}</span>
            <span className="min-w-[60px]">{`L:${targetTradingData.low}`}</span>
            <span className="min-w-[60px]">{`C:${targetTradingData.close}`}</span>
          </div>
        </div>

        <div className="w-full h-full relative">
          <div ref={chartElementRef} className="w-full h-full" />
          {loading && preActivePeriodRef.current !== period && (
            <>
              <div className="bg-white/50 absolute left-0 top-0 w-full h-full z-10" />
              <Spinner
                className="absolute right-[50%] top-[40%] z-20"
                color="success"
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
