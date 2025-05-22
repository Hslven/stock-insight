export const transformAkShareDataToTradingChart = (
  data: BaseAkShareData[],
): BaseTradingData[] => {
  return data?.map((item) => ({
    time: item.日期,
    symbol: item.股票代码,
    open: item.开盘,
    close: item.收盘,
    high: item.最高,
    low: item.最低,
    volume: item.成交量,
    turnover: item.成交额,
    amplitude: item.振幅,
    changePercent: item.涨跌幅,
    changeAmount: item.涨跌额,
    turnoverRate: item.换手率,
  }));
};

/* {
    "时间": "2025-05-21 09:31:00",
    "开盘": 12.97,
    "收盘": 12.83,
    "最高": 12.97,
    "最低": 12.81,
    "涨跌幅": -1.08,
    "涨跌额": -0.14,
    "成交量": 3598,
    "成交额": 4635255,
    "振幅": 1.23,
    "换手率": 0.05

        "time": "2025-05-21 09:31:00",
    "open": 12.97,
    "close": 12.83,
    "high": 12.97,
    "low": 12.81,
    "changePercent": -1.08,
    "changeAmount": -0.14,
    "volume": 3598,
    "turnover": 4635255,
    "amplitude": 1.23,
    "turnoverRate": 0.05
} */

export const transformTradingChartToRealtime = (data: any) => {
  return data?.map((item: any) => ({
    time: new Date(item.时间).getTime(),
    value: item.开盘,
    // time: item.时间,
    open: item.开盘,
    close: item.收盘,
    high: item.最高,
    low: item.最低,
    changePercent: item.涨跌幅,
    changeAmount: item.涨跌额,
    volume: item.成交量,
    turnover: item.成交额,
    amplitude: item.振幅,
    turnoverRate: item.换手率,
  }));
};
