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
import { Tabs, Tab } from "@heroui/react";
import { useDebounceFn, useMount, useRequest } from "ahooks";

import { getTradingHistoryData } from "@/api/modules/trading-data";
import { transformAkShareDataToTradingChart } from "@/lib/transformData";
import { getCssColor, getMonthsAgoTimestamp, getWeekday } from "@/lib/utils";
import PolarityDiv from "@/components/polarity-div";
import { useTradingStore } from "@/store/useTradingStore";

export default function TradingView({ symbol }: { symbol: string }) {
  const chartElementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const candlestickSeries = useRef<ISeriesApi<"Candlestick">>();
  const histogramSeries = useRef<ISeriesApi<"Histogram">>();
  const [fq, setFq] = useState<"" | "qfq" | "hfq">("qfq");

  const [activeChart, setActiveChart] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
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
  const [tradingHistory, setTradingHistory] = useState<BaseTradingData[]>();
  // const tradingHistoryRef = useRef<BaseTradingData[]>();

  const [monthAgo, setMonthAgo] = useState(3);
  const tradingStore = useTradingStore();

  const params = useMemo(() => {
    return {
      start_time: getMonthsAgoTimestamp(monthAgo),
      period: activeChart,
      symbol: symbol,
      adjust: fq || undefined,
    };
  }, [monthAgo, activeChart, symbol, fq]);

  const { run: setMonthAgoDebounce } = useDebounceFn(
    (month: number) => {
      setMonthAgo((prev) => prev + month);
    },
    { wait: 500 },
  );

  useRequest(() => getTradingHistoryData(params), {
    refreshDeps: [monthAgo, activeChart, symbol, fq],
    debounceWait: 300,
    onSuccess: ({ data }) => {
      const akData = transformAkShareDataToTradingChart(data);

      setTradingHistory(akData);
      candlestickSeries.current?.setData(akData);
      // chartRef.current?.timeScale().fitContent();
      // chartRef.current?.timeScale().setVisibleLogicalRange(vr);
    },
  });
  const chartOptions = {
    layout: {
      textColor: "black",
      background: {
        type: ColorType.Solid,
        color: getCssColor("--background"),
      },
    },
    autoSize: true,
    localization: {
      dateFormat: "yyyy-MM-dd",
    },
  };

  const candlestickSeriesOptions = useMemo(
    () => tradingStore.seriesOptions.Candlestick,
    [tradingStore.seriesOptions.Candlestick],
  );

  useMount(() => {
    if (chartRef.current || !chartElementRef.current) {
      return;
    }

    chartRef.current = createChart(chartElementRef.current, chartOptions);
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
      // console.log(logicalRange);
      if (!logicalRange || logicalRange.from >= 0) return;
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

    chartRef.current?.timeScale().fitContent();

    return () => {
      chartRef.current
        ?.timeScale()
        ?.unsubscribeVisibleLogicalRangeChange(handleRangeChange);
    };
  });

  // 日内价差
  const dailySpread = useMemo(
    () => (targetTradingData.close - targetTradingData.open).toFixed(2),
    [targetTradingData.close, targetTradingData.open],
  );

  // 日内收益率
  const dailyReturn = useMemo(() => {
    // 绝对差价
    const absolute = targetTradingData.close - targetTradingData.open;
    const percentage = (absolute / targetTradingData.open) * 100;

    if (isNaN(percentage)) {
      return "0.00%";
    }

    return percentage.toFixed(2) + "%";
  }, [targetTradingData?.open, targetTradingData?.close]);

  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <PolarityDiv signed={dailySpread}>
            <span className="text-3xl">
              {targetTradingData.close.toFixed(2)}
            </span>
            <div className="flex">
              <span className="min-w-[55px]">{dailySpread}</span>
              <span className="min-w-[60px]">{dailyReturn}</span>
              <span>至今涨幅</span>
            </div>
          </PolarityDiv>
        </div>
        <Tabs
          aria-label="Options"
          radius="none"
          selectedKey={activeChart}
          variant="solid"
          onSelectionChange={(key) =>
            setActiveChart(key as "daily" | "weekly" | "monthly")
          }
        >
          <Tab key="realTime" title="分时图" />
          <Tab key="daily" title="日K线" />
          <Tab key="weekly" title="周K线" />
          <Tab key="monthly" title="月K线" />
        </Tabs>
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
        <div ref={chartElementRef} className="w-full max-h-[900px]" />
      </div>
    </>
  );
}

/* 
function DropdownContent({
  fq,
  setFq,
}: {
  fq: "" | "qfq" | "hfq";
  setFq: (key: typeof fq) => void;
  fqLabel: string;
}) {
  const fqLabel = useMemo(() => {
    switch (fq) {
      case "qfq":
        return "前复权";
      case "hfq":
        return "后复权";
      case "":
        return "不复权";
      default:
        return "";
    }
  }, [fq]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button radius="none" variant="flat">
          {fqLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu onAction={(key) => setFq(key as "" | "qfq" | "hfq")}>
        <DropdownItem key="qfq">前复权</DropdownItem>
        <DropdownItem key="hfq">后复权</DropdownItem>
        <DropdownItem key="">不复权</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
  

*/
