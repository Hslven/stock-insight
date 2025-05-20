import { useEffect, useState } from "react";

export default function PolarityDiv({
  signed,
  children,
}: {
  signed?: number | string;
  children?: React.ReactNode;
}) {
  const [isNegativeState, setIsNegativeState] = useState(false);

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
    <div className={`${isNegativeState ? "text-low" : "text-hight"} font-bold`}>
      <div>{children}</div>
    </div>
  );
}
