import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, LayoutChangeEvent } from "react-native";

type UseSlidingTabIndicatorParams = {
  activeIndex: number;
  tabCount: number;
  indicatorWidth: number;
};

type UseSlidingTabIndicatorResult = {
  onBarLayout: (event: LayoutChangeEvent) => void;
  indicatorStyle: {
    width: number;
    transform: { translateX: Animated.Value }[];
  };
};

export function useSlidingTabIndicator({
  activeIndex,
  tabCount,
  indicatorWidth,
}: UseSlidingTabIndicatorParams): UseSlidingTabIndicatorResult {
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!barWidth || tabCount <= 0) {
      return;
    }

    const tabWidth = barWidth / tabCount;
    const targetX = tabWidth * activeIndex + (tabWidth - indicatorWidth) / 2;

    Animated.timing(translateX, {
      toValue: targetX,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, barWidth, indicatorWidth, tabCount, translateX]);

  const onBarLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setBarWidth(width);
  };

  const indicatorStyle = useMemo(
    () => ({
      width: indicatorWidth,
      transform: [{ translateX }],
    }),
    [indicatorWidth, translateX],
  );

  return {
    onBarLayout,
    indicatorStyle,
  };
}
