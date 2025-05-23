import { useEffect, useMemo, useState } from "react";

import { useBaseConfig } from "@/store/useBaseConfig";

export default function PolarityDiv({
  signed,
  children,
}: {
  signed?: number | string;
  children?: React.ReactNode;
}) {
  const [isNegativeState, setIsNegativeState] = useState(false);
  const { theme } = useBaseConfig();
  const isHideTheme = useMemo(() => theme === "hide", [theme]);

  useEffect(() => {
    if (signed) {
      const isLowZero =
        typeof signed === "string" ? parseFloat(signed) < 0 : signed < 0;

      setIsNegativeState(isLowZero);
    } else if (typeof children === "string" && parseFloat(children) < 0) {
      setIsNegativeState(true);
    }
  }, [signed, children]);

  return (
    <div
      className={`${isNegativeState ? "text-low" : "text-hight"} font-bold ${isHideTheme && "opacity-20"}`}
    >
      <div>{children}</div>
    </div>
  );
}
