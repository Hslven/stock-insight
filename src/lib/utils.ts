import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 将对象序列化为查询字符串
 * @param params 要序列化的对象
 * @param options 配置选项
 * @returns 序列化后的查询字符串
 */
export const stringify = (
  params: object | undefined,
  options: {
    arrayFormat?: "repeat" | "indices" | "brackets" | "comma";
    skipNulls?: boolean;
  } = {},
): string => {
  const { arrayFormat = "repeat", skipNulls = false } = options;

  const encode = (key: string, value: any) =>
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

  return Object.entries(params || {})
    .reduce<string[]>((acc, [key, value]) => {
      if (value === null || value === undefined) {
        if (skipNulls) return acc; // 跳过 null 或 undefined

        return acc.concat(encode(key, ""));
      }

      if (Array.isArray(value)) {
        // 处理数组
        switch (arrayFormat) {
          case "repeat":
            acc = acc.concat(value.map((v) => encode(key, v)));
            break;
          case "indices":
            acc = acc.concat(value.map((v, i) => encode(`${key}[${i}]`, v)));
            break;
          case "brackets":
            acc = acc.concat(value.map((v) => encode(`${key}[]`, v)));
            break;
          case "comma":
            acc.push(encode(key, value.join(",")));
            break;
          default:
            throw new Error(`Unsupported arrayFormat: ${arrayFormat}`);
        }
      } else {
        // 处理普通键值对
        acc.push(encode(key, value));
      }

      return acc;
    }, [])
    .join("&");
};

/**
 * 获取多少个月前的时间戳（基于当前日期）
 * @param monthsAgo 多少个月前（例如 1 表示上个月，2 表示两个月前）
 * @returns 时间戳（毫秒）
 */
export const getMonthsAgoTimestamp = (monthsAgo: number): number => {
  const now = new Date();
  const targetDate = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    now.getDate(),
  );

  return targetDate.getTime();
};

/**
 * 获取指定日期字符串对应的星期几
 * @param dateString 日期字符串（格式：YYYY-MM-DD）
 * @returns 星期几（中文）
 */
export const getWeekday = (dateString: string | number) => {
  const date = new Date(dateString);
  const days = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];

  return days[date.getDay()];
};

/**
 * 转时间戳为 yyyy-MM-dd
 * @param timestamp 时间戳（毫秒）
 * @returns '2023-10-01'
 */
export const formatTimestampToDate = (timestamp: number | string) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * 转时间戳为 HH:mm:ss
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
export const formatTimestampToTime = (timestamp: number | string) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

/**
 * 获取 CSS 变量的颜色值
 * @description tailwindcss 没办法拿到 css 变量的值，只能从元素拿
 * @returns 'hsl(0, 0%, 0%)'
 */
export function getCssColor(varName: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    varName,
  );

  return `hsl(${value.trim()})`;
}

/**
 * 获取 CSS 变量的颜色值，并添加透明度
 * @returns 'rgba(0, 0, 0, alpha)'
 */
export const getCssColorWithAlpha = (
  cssVar: string,
  alpha: number | string,
): string => {
  const color = getCssColor(cssVar);

  // 匹配 HSL 格式的颜色值，例如 "hsl(210, 50%, 50%)"
  const hslMatch = color.match(/^hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)$/);

  if (hslMatch) {
    const h = hslMatch[1]; // 色相 (Hue)
    const s = hslMatch[2]; // 饱和度 (Saturation)
    const l = hslMatch[3]; // 亮度 (Lightness)

    // 返回带透明度的 HSLA 格式
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }

  return color;
};
