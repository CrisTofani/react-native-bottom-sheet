import React, { memo, useCallback, useMemo } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import BottomSheetHandle from '../bottomSheetHandle';
import {
  useBottomSheetGestureHandlers,
  useBottomSheetInternal,
} from '../../hooks';
import { print } from '../../utilities';
import type { BottomSheetHandleContainerProps } from './types';
import {
  DEFAULT_ACCESSIBILITY_LABEL,
  DEFAULT_ACCESSIBILITY_ROLE,
  DEFAULT_ACCESSIBLE,
  DEFAULT_ACCESSIBILITY_HINT,
} from './constants';

function BottomSheetHandleContainerComponent({
  animatedIndex,
  animatedPosition,
  simultaneousHandlers: _internalSimultaneousHandlers,
  enableHandlePanningGesture,
  handleHeight,
  handleComponent: _providedHandleComponent,
  handleStyle: _providedHandleStyle,
  handleIndicatorStyle: _providedIndicatorStyle,
  accessible: _providedAccessible = DEFAULT_ACCESSIBLE,
  accessibilityLabel: _providedAccessibilityLabel = DEFAULT_ACCESSIBILITY_LABEL,
  accessibilityRole: _providedAccessibilityRole = DEFAULT_ACCESSIBILITY_ROLE,
  accessibilityHint: _providedAccessibilityHint = DEFAULT_ACCESSIBILITY_HINT,
}: BottomSheetHandleContainerProps) {
  //#region hooks
  const {
    activeOffsetX,
    activeOffsetY,
    failOffsetX,
    failOffsetY,
    waitFor,
    simultaneousHandlers: _providedSimultaneousHandlers,
  } = useBottomSheetInternal();
  const { handlePanGestureHandler } = useBottomSheetGestureHandlers();
  //#endregion

  //#region variables
  const simultaneousHandlers = useMemo<any>(() => {
    const refs = [];

    if (_internalSimultaneousHandlers) {
      refs.push(_internalSimultaneousHandlers);
    }

    if (_providedSimultaneousHandlers) {
      if (Array.isArray(_providedSimultaneousHandlers)) {
        refs.push(..._providedSimultaneousHandlers);
      } else {
        refs.push(_providedSimultaneousHandlers);
      }
    }

    return refs;
  }, [_providedSimultaneousHandlers, _internalSimultaneousHandlers]);
  //#endregion

  //#region callbacks
  const handleContainerLayout = useCallback(
    function handleContainerLayout({
      nativeEvent: {
        layout: { height },
      },
    }: LayoutChangeEvent) {
      handleHeight.value = height;

      print({
        component: BottomSheetHandleContainer.displayName,
        method: 'handleContainerLayout',
        params: {
          height,
        },
      });
    },
    [handleHeight]
  );
  //#endregion

  //#region renders
  const HandleComponent =
    _providedHandleComponent === undefined
      ? BottomSheetHandle
      : _providedHandleComponent;
  return HandleComponent !== null ? (
    <PanGestureHandler
      enabled={enableHandlePanningGesture}
      waitFor={waitFor}
      simultaneousHandlers={simultaneousHandlers}
      shouldCancelWhenOutside={false}
      activeOffsetX={activeOffsetX}
      activeOffsetY={activeOffsetY}
      failOffsetX={failOffsetX}
      failOffsetY={failOffsetY}
      onGestureEvent={handlePanGestureHandler}
    >
      <Animated.View
        key="BottomSheetHandleContainer"
        accessible={_providedAccessible ?? undefined}
        accessibilityRole={_providedAccessibilityRole ?? undefined}
        accessibilityLabel={_providedAccessibilityLabel ?? undefined}
        accessibilityHint={_providedAccessibilityHint ?? undefined}
        onLayout={handleContainerLayout}
      >
        <HandleComponent
          animatedIndex={animatedIndex}
          animatedPosition={animatedPosition}
          style={_providedHandleStyle}
          indicatorStyle={_providedIndicatorStyle}
        />
      </Animated.View>
    </PanGestureHandler>
  ) : null;
  //#endregion
}

const BottomSheetHandleContainer = memo(BottomSheetHandleContainerComponent);
BottomSheetHandleContainer.displayName = 'BottomSheetHandleContainer';

export default BottomSheetHandleContainer;
