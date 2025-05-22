/**
 * 股市 Hook
 * @returns {boolean} 是否在股市交易时间内
 */
export const useMarket = () => {
  const isMarketOpen = () => {
    const now = new Date();
    const day = now.getDay();

    // 节假日或周末
    if (day === 0 || day === 6) return false;

    const marketActingTime = [
      {
        open: "09:30",
        close: "11:30",
      },
      {
        open: "13:00",
        close: "15:00",
      },
    ];

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return marketActingTime.some(({ open, close }) => {
      const [openHour, openMinute] = open.split(":").map(Number);
      const [closeHour, closeMinute] = close.split(":").map(Number);

      const openMinutes = openHour * 60 + openMinute; // 开盘时间转为分钟数
      const closeMinutes = closeHour * 60 + closeMinute; // 收盘时间转为分钟数

      // 判断当前时间是否在开盘和收盘时间之间
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    });
  };

  return {
    /**
     * 当前时间是否在股市交易时间内
     * @returns {boolean}
     */
    isMarketOpen,
  };
};
