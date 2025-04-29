let randomFactor = 25 + Math.random() * 25;
const samplePoint = (i: number) =>
  i *
    (0.5 +
      Math.sin(i / 10) * 0.2 +
      Math.sin(i / 20) * 0.4 +
      Math.sin(i / randomFactor) * 0.8 +
      Math.sin(i / 500) * 0.5) +
  200;

function generateLineData(numberOfPoints = 500, endDate: Date) {
  randomFactor = 25 + Math.random() * 25;
  const res = [];
  const date = endDate || new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));

  date.setUTCDate(date.getUTCDate() - numberOfPoints - 1);
  for (let i = 0; i < numberOfPoints; ++i) {
    const time = date.getTime() / 1000;
    const value = samplePoint(i);

    res.push({
      time,
      value,
    });

    date.setUTCDate(date.getUTCDate() + 1);
  }

  return res;
}

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getTime(d: number) {
  const date = new Date(d * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}

function randomBar(lastClose: number) {
  const open = +randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
  const close = +randomNumber(open * 0.95, open * 1.05).toFixed(2);
  const high = +randomNumber(
    Math.max(open, close),
    Math.max(open, close) * 1.1,
  ).toFixed(2);
  const low = +randomNumber(
    Math.min(open, close) * 0.9,
    Math.min(open, close),
  ).toFixed(2);

  return {
    open,
    high,
    low,
    close,
  };
}

function generateCandleData(numberOfPoints = 250, endDate: Date) {
  const lineData = generateLineData(numberOfPoints, endDate);
  let lastClose = lineData[0].value;

  return lineData.map((d) => {
    const candle = randomBar(lastClose);
    const time = getTime(d.time);

    lastClose = candle.close;

    return {
      time: time,
      low: candle.low,
      high: candle.high,
      open: candle.open,
      close: candle.close,
      value: d.value / 10,
    };
  });
}

export class Datafeed {
  private _earliestDate: Date;
  private _data: any[];
  private _volume: any[];
  constructor() {
    this._earliestDate = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));
    this._data = [];
    this._volume = [];
  }

  getBars(numberOfExtraBars: number | undefined) {
    const historicalData = generateCandleData(
      numberOfExtraBars,
      this._earliestDate,
    );

    this._data = [...historicalData, ...this._data];
    this._earliestDate = new Date(historicalData[0].time);

    return this._data;
  }

  getVolumeBars(numberOfExtraBars: number | undefined) {
    const historicalData = generateCandleData(
      numberOfExtraBars,
      this._earliestDate,
    );

    this._volume = [...historicalData, ...this._volume];
    this._earliestDate = new Date(historicalData[0].time);

    return this._volume;
  }
}
