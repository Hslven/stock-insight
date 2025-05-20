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
export const getWeekday = (dateString: string) => {
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
 * 获取 CSS 变量的颜色值
 * @description tailwindcss 没办法拿到 css 变量的值，只能从元素拿
 */
export function getCssColor(varName: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    varName,
  );

  return `hsl(${value.trim()})`;
}
