import { useEffect, useMemo, useRef, useState } from "react";
import {
  BaselineSeries,
  CandlestickData,
  ChartOptions,
  ColorType,
  createChart,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  SeriesPartialOptionsMap,
} from "lightweight-charts";
import { useMount, useRequest } from "ahooks";
import { Spinner } from "@heroui/react";

import { getTradingRealTimeData } from "@/api/modules/trading-data";
import { transformTradingChartToRealtime } from "@/lib/transformData";
import {
  formatTimestampToDate,
  formatTimestampToTime,
  getCssColor,
  getCssColorWithAlpha,
  getWeekday,
} from "@/lib/utils";
import PolarityDiv from "@/components/polarity-div";
import { useTradingStore } from "@/store/useTradingStore";
import Clock from "@/components/clock";
import { useBaseConfig } from "@/store/useBaseConfig";

export default function TradingView({ symbol }: { symbol: string }) {
  const chartElementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const baselineSeries = useRef<ISeriesApi<"Baseline">>();
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
  // const tradingData = useRef<BaseTradingData[]>();

  const { chartOptions } = useTradingStore();
  const { theme } = useBaseConfig();

  const tradingData = useRef<any[]>([]);
  const tradingMap = useRef<Map<string, Record<string, any> | string>>(
    new Map<string, BaseTradingData | string>(),
  );
  const tradingMaxMinMap = useRef<Map<string, number>>(
    new Map<string, number>([
      ["high", 0.0],
      ["low", 0.0],
      ["open", 0.0],
      ["close", 0.0],
    ]),
  );

  const initBaseLineSeriesConfig = (): SeriesPartialOptionsMap["Baseline"] => ({
    baseValue: { type: "price", price: 0 },
    // topLineColor: getCssColor("--hight"),
    // topFillColor1: getCssColorWithAlpha("--hight", "50%"),
    // topFillColor2: getCssColorWithAlpha("--hight", "10%"),
    // bottomLineColor: getCssColor("--low"),
    // bottomFillColor1: getCssColorWithAlpha("--low", "10%"),
    // bottomFillColor2: getCssColorWithAlpha("--low", "50%"),
    topLineColor: getCssColorWithAlpha("--foreground", "30%"),
    topFillColor1: getCssColorWithAlpha("--hight", "0%"),
    topFillColor2: getCssColorWithAlpha("--hight", "0%"),
    bottomLineColor: getCssColorWithAlpha("--foreground", "30%"),
    bottomFillColor1: getCssColorWithAlpha("--low", "0%"),
    bottomFillColor2: getCssColorWithAlpha("--low", "0%"),
  });
  const [baselineSeriesOptions, setBaselineSeriesOptions] = useState<
    SeriesPartialOptionsMap["Baseline"]
  >(initBaseLineSeriesConfig());

  const initChartConfig = (): DeepPartial<ChartOptions> => ({
    layout: {
      background: {
        type: ColorType.Solid,
        color: getCssColor("--background"),
      },
      textColor: "black",
    },
    autoSize: true,
    // grid: {
    //   vertLines: { color: "#D6DCDE", visible: true },
    //   horzLines: { color: "#D6DCDE", visible: true },
    // },
    grid: {
      vertLines: {
        color: "transparent", // 垂直网格线颜色设置为透明
        visible: false, // 隐藏垂直网格线
      },
      horzLines: {
        color: "transparent", // 水平网格线颜色设置为透明
        visible: false, // 隐藏水平网格线
      },
    },
    timeScale: {
      visible: true, // 隐藏 X 轴
    },
    rightPriceScale: {
      visible: true, // 隐藏右侧 Y 轴
    },
    leftPriceScale: {
      visible: false, // 隐藏左侧 Y 轴
    },
    localization: {
      timeFormatter: (timestamp: number) => {
        const date = new Date(timestamp); // 转换为毫秒
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
      },
    },
    // timeScale: {
    //   tickMarkFormatter: (timestamp: number) => {
    //     const date = new Date(timestamp); // 转换为毫秒
    //     const hours = date.getHours().toString().padStart(2, "0");
    //     const minutes = date.getMinutes().toString().padStart(2, "0");

    //     // 返回精确到分钟的格式
    //     return `${hours}:${minutes}`;
    //   },
    // },
  });
  const [chartConfigState, setChartConfigState] = useState(initChartConfig());

  const isHideTheme = useMemo(() => theme === "hide", [theme]);

  useEffect(() => {
    if (isHideTheme) {
      setChartConfigState({
        ...initChartConfig(),
        grid: {
          vertLines: {
            color: "transparent", // 垂直网格线颜色设置为透明
            visible: false, // 隐藏垂直网格线
          },
          horzLines: {
            color: "transparent", // 水平网格线颜色设置为透明
            visible: false, // 隐藏水平网格线
          },
        },
        timeScale: {
          visible: false, // 隐藏 X 轴
        },
        rightPriceScale: {
          visible: false, // 隐藏右侧 Y 轴
        },
        leftPriceScale: {
          visible: false, // 隐藏左侧 Y 轴
        },
      });

      setBaselineSeriesOptions((prev) => ({
        topLineColor: getCssColorWithAlpha("--hight", "10%"),
        topFillColor1: getCssColorWithAlpha("--hight", "0%"),
        topFillColor2: getCssColorWithAlpha("--hight", "0%"),
        bottomLineColor: getCssColorWithAlpha("--low", "10%"),
        bottomFillColor1: getCssColorWithAlpha("--low", "0%"),
        bottomFillColor2: getCssColorWithAlpha("--low", "0%"),
        baseValue: prev.baseValue,
      }));

      return;
    }
    console.log(initBaseLineSeriesConfig());
    setChartConfigState(initChartConfig());
    setBaselineSeriesOptions((prev) => ({
      ...initBaseLineSeriesConfig(),
      baseValue: prev.baseValue,
    }));
  }, [theme]);
  useEffect(() => {
    baselineSeries.current?.applyOptions(baselineSeriesOptions);
  }, [baselineSeriesOptions]);
  useEffect(() => {
    chartRef.current?.applyOptions(chartConfigState);
  }, [chartConfigState]);

  const errorCount = useRef(0);
  const firstRenderRef = useRef(true);
  const { run, cancel } = useRequest(
    async () => {
      return await getTradingRealTimeData(symbol);
    },
    {
      manual: true, // 手动触发
      // pollingInterval: 20000, // 轮询间隔
      // pollingErrorRetryCount: 1, // 轮询错误重试次数
      // pollingWhenHidden: true, // 页面隐藏时暂停轮询
      onSuccess: (response) => {
        if (!response?.data) return;
        errorCount.current = 0; // 重置错误计数

        const { data } = response;

        tradingData.current = transformTradingChartToRealtime(data);

        // 更新交易数据映射
        tradingMap.current.clear();

        tradingMaxMinMap.current.set("low", tradingData.current[0]?.low);
        tradingMaxMinMap.current.set("high", tradingData.current[0]?.high);
        tradingMaxMinMap.current.set("open", tradingData.current[0]?.open);
        tradingMaxMinMap.current.set(
          "close",
          tradingData.current[tradingData.current.length - 1]?.close,
        );

        for (const item of tradingData.current) {
          tradingMap.current.set(String(item.time), item);
          if (item.high > tradingMaxMinMap.current.get("high")!) {
            tradingMaxMinMap.current.set("high", item.high);
          }
          if (item.low < tradingMaxMinMap.current.get("low")!) {
            tradingMaxMinMap.current.set("low", item.low);
          }
        }

        // 设置图表数据
        baselineSeries.current?.setData(
          tradingData.current.map((item) => ({
            time: item.time,
            value: item.close,
            originalTime: { ...item },
          })),
        );

        if (firstRenderRef) {
          setBaselineSeriesOptions((prev) => ({
            ...prev,
            baseValue: {
              type: "price",
              price: tradingData.current[0]?.open || 0,
            },
          }));

          setTargetTradingData({
            close:
              tradingData.current[tradingData.current.length - 1]?.close || 0,
            high: tradingMaxMinMap.current.get("high") ?? 0,
            low: tradingMaxMinMap.current.get("low") ?? 0,
            open: tradingData.current[0]?.open || 0,
            time: "",
          });

          setLoading(false);
        }

        chartRef.current?.timeScale().fitContent();
        firstRenderRef.current = false;
      },
      onError: (error) => {
        console.log(error);
      },
    },
  );

  useEffect(() => {
    run();
  }, [symbol]);

  useMount(() => {
    if (chartRef.current || !chartElementRef.current) {
      return;
    }

    chartRef.current = createChart(chartElementRef.current, chartConfigState);
    // histogramSeries.current = chartRef.current.addSeries(HistogramSeries, {
    //   color: "#26a69a",
    // });
    baselineSeries.current = chartRef.current.addSeries(
      BaselineSeries,
      baselineSeriesOptions,
    );

    const handleCrosshairMove = (param: MouseEventParams) => {
      if (!param || !param.seriesData || !baselineSeries.current) return;

      // 图表外
      if (!param.point) {
        setTargetTradingData({
          close: tradingMaxMinMap.current.get("close") ?? 0.0,
          high: tradingMaxMinMap.current.get("high") ?? 0.0,
          low: tradingMaxMinMap.current.get("low") ?? 0.0,
          open: tradingMaxMinMap.current.get("open") || 0.0,
          time: "",
        });

        return;
      }

      const candlestickData = param.time
        ? tradingMap.current.get(String(param.time))
        : undefined;

      if (candlestickData) {
        // console.log("当前数据点：", candlestickData);
        setTargetTradingData(candlestickData as CandlestickData<string>);
      }
    };

    chartRef.current?.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chartRef.current?.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  });

  // 日内价差
  const dailySpread = useMemo(
    () =>
      (
        tradingMaxMinMap.current.get("open") ?? 0 - targetTradingData.open
      ).toFixed(2),
    [targetTradingData.close],
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

  const [loading, setLoading] = useState<boolean>(true);

  const handleMinuteChange = () => {
    cancel();
    run();
  };

  return (
    <>
      <div className="flex items-center justify-between whitespace-nowrap w-[73%]">
        {/* <PolarityDiv signed={dailySpread}>
          <span className="text-3xl">{targetTradingData.close.toFixed(2)}</span>
          <div className="flex">
            <span className="min-w-[55px]">{dailySpread}</span>
            <span className="min-w-[60px]">{dailyReturn}</span>
          </div>
        </PolarityDiv> */}
        <Clock onMinuteChange={handleMinuteChange} />
      </div>
      <div className="flex h-full relative">
        {/* <div className="absolute z-10 text-black flex">
          <div className="flex gap-2">
            <div
              className={`${targetTradingData.time ? "min-w-[230px]" : "min-w-[130px]"}`}
            >
              <span className="mr-2">{`${formatTimestampToDate(Date.now())}-${getWeekday(Date.now())}`}</span>
              {targetTradingData.time && (
                <span className="font-bold">
                  {formatTimestampToTime(targetTradingData.time)}
                </span>
              )}
            </div>
            <span className="min-w-[60px]">{`O:${targetTradingData.open}`}</span>
            <span className="min-w-[60px]">{`H:${targetTradingData.high}`}</span>
            <span className="min-w-[60px]">{`L:${targetTradingData.low}`}</span>
            <span className="min-w-[60px]">{`C:${targetTradingData.close}`}</span>
          </div> */}
        {/* </div> */}
        <div className="w-full h-full relative">
          <div ref={chartElementRef} className="w-full h-full opacity-10" />
          {loading && (
            <>
              <div className="bg-white/50 absolute left-0 top-0 w-full h-full z-10 " />
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
