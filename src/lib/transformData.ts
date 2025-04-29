export const transformAkShareDataToTradingChart = (
  data: BaseAkShareData[],
): BaseTradingData[] => {
  return data.map((item) => ({
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
