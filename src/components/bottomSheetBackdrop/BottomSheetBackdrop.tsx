import React, { memo, useCallback, useMemo, useRef } from 'react';
import Animated, {
  interpolate,
  Extrapolate,
  useAnimatedStyle,
  useAnimatedReaction,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useBottomSheet } from '../../hooks';
import {
  DEFAULT_OPACITY,
  DEFAULT_APPEARS_ON_INDEX,
  DEFAULT_DISAPPEARS_ON_INDEX,
  DEFAULT_ENABLE_TOUCH_THROUGH,
  DEFAULT_PRESS_BEHAVIOR,
  DEFAULT_ACCESSIBLE,
  DEFAULT_ACCESSIBILITY_ROLE,
  DEFAULT_ACCESSIBILITY_LABEL,
  DEFAULT_ACCESSIBILITY_HINT,
} from './constants';
import { styles } from './styles';
import type { BottomSheetDefaultBackdropProps } from './types';

const BottomSheetBackdropComponent = ({
  animatedIndex,
  opacity = DEFAULT_OPACITY,
  appearsOnIndex = DEFAULT_APPEARS_ON_INDEX,
  disappearsOnIndex = DEFAULT_DISAPPEARS_ON_INDEX,
  enableTouchThrough = DEFAULT_ENABLE_TOUCH_THROUGH,
  pressBehavior = DEFAULT_PRESS_BEHAVIOR,
  style,
  children,
  accessible: _providedAccessible = DEFAULT_ACCESSIBLE,
  accessibilityRole: _providedAccessibilityRole = DEFAULT_ACCESSIBILITY_ROLE,
  accessibilityLabel: _providedAccessibilityLabel = DEFAULT_ACCESSIBILITY_LABEL,
  accessibilityHint: _providedAccessibilityHint,
}: BottomSheetDefaultBackdropProps) => {
  //#region hooks
  const { snapToIndex, close } = useBottomSheet();
  //#endregion

  //#region variables
  const containerRef = useRef<Animated.View>(null);
  const pointerEvents = enableTouchThrough ? 'none' : 'auto';
  //#endregion

  //#region callbacks
  const handleOnPress = useCallback(() => {
    if (pressBehavior === 'close') {
      close();
    } else if (pressBehavior === 'collapse') {
      snapToIndex(disappearsOnIndex as number);
    } else if (typeof pressBehavior === 'number') {
      snapToIndex(pressBehavior);
    }
  }, [snapToIndex, close, disappearsOnIndex, pressBehavior]);
  const handleContainerTouchability = useCallback(
    (shouldDisableTouchability: boolean) => {
      if (!containerRef.current) {
        return;
      }
      // @ts-ignore
      containerRef.current.setNativeProps({
        pointerEvents: shouldDisableTouchability ? 'none' : 'auto',
      });
    },
    []
  );
  //#endregion

  //#region tap gesture
  const gestureHandler =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>(
      {
        onFinish: () => {
          runOnJS(handleOnPress)();
        },
      },
      [handleOnPress]
    );
  //#endregion

  //#region styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, disappearsOnIndex, appearsOnIndex],
      [0, 0, opacity],
      Extrapolate.CLAMP
    ),
    flex: 1,
  }));
  const containerStyle = useMemo(
    () => [styles.container, style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );
  //#endregion

  //#region effects
  useAnimatedReaction(
    () => animatedIndex.value <= disappearsOnIndex,
    (shouldDisableTouchability, previous) => {
      if (shouldDisableTouchability === previous) {
        return;
      }
      runOnJS(handleContainerTouchability)(shouldDisableTouchability);
    },
    [disappearsOnIndex]
  );
  //#endregion

  return pressBehavior !== 'none' ? (
    <TapGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        ref={containerRef}
        style={containerStyle}
        accessible={_providedAccessible ?? undefined}
        accessibilityRole={_providedAccessibilityRole ?? undefined}
        accessibilityLabel={_providedAccessibilityLabel ?? undefined}
        accessibilityHint={
          _providedAccessibilityHint ??
          DEFAULT_ACCESSIBILITY_HINT(
            typeof pressBehavior === 'string' ? pressBehavior : 'move'
          )
        }
      >
        {children}
      </Animated.View>
    </TapGestureHandler>
  ) : (
    <Animated.View
      ref={containerRef}
      pointerEvents={pointerEvents}
      style={containerStyle}
    >
      {children}
    </Animated.View>
  );
};

const BottomSheetBackdrop = memo(BottomSheetBackdropComponent);
BottomSheetBackdrop.displayName = 'BottomSheetBackdrop';

export default BottomSheetBackdrop;
