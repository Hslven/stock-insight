declare interface ResultData<T> {
  code: number;
  data: T;
  msg: string;
}

declare interface BaseTradingData {
  /** 日期 */
  time: string;
  /** 股票代码 */
  symbol: string;
  /** 开盘 */
  open: number;
  /** 收盘 */
  close: number;
  /** 最高 */
  high: number;
  /** 最低 */
  low: number;
  /** 成交量 */
  volume: number;
  /** 成交额 */
  turnover: number;
  /** 振幅 */
  amplitude: number;
  /** 涨跌幅 */
  changePercent: number;
  /** 涨跌额 */
  changeAmount: number;
  /** 换手率 */
  turnoverRate: number;
}
declare interface BaseAkShareData {
  日期: string;
  股票代码: string;
  开盘: number;
  收盘: number;
  最高: number;
  最低: number;
  成交量: number;
  成交额: number;
  振幅: number;
  涨跌幅: number;
  涨跌额: number;
  换手率: number;
}
