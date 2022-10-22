import { TColorAlphaSource, TColorArg } from '../../color/color.class';

/**
 * Callback called every frame
 * @param {number | number[]} value current value of the animation.
 * @param valueRatio ratio of current value to animation max value. [0, 1]
 * @param timeRatio ratio of current ms to animation duration. [0, 1]
 */
export type TOnAnimationChangeCallback<T, R = void> = (
  value: T,
  valueRatio: number,
  timeRatio: number
) => R;

/**
 * Called on each step to determine if animation should abort
 * @returns truthy if animation should abort
 */
export type TAbortCallback<T> = TOnAnimationChangeCallback<T, boolean>;

/**
 * An easing function
 * @param currentTime ms elapsed
 * @param startValue
 * @param byValue
 * @param duration in ms
 * @returns next value
 */
export type TEasingFunction<T> = T extends any[]
  ? (
      currentTime: number,
      startValue: number,
      byValue: number,
      duration: number,
      index: number
    ) => number
  : (
      currentTime: number,
      startValue: number,
      byValue: number,
      duration: number
    ) => number;

/**
 * A color easing function
 * @param currentTime ms elapsed
 * @param duration in ms
 * @returns timeRate ∈ [0, 1]
 */
export type TColorEasingRateFunction = (
  currentTime: number,
  duration: number
) => number;

export type TAnimationBaseOptions<T> = {
  /**
   * Duration of the animation in ms
   * @default 500
   */
  duration: number;

  /**
   * Delay to start the animation in ms
   * @default 0
   */
  delay: number;

  /**
   * Easing function
   * @default {defaultEasing}
   */
  easing: TEasingFunction<T>;

  /**
   * The object this animation is being performed on
   */
  target: unknown;
};

export type TAnimationCallbacks<T> = {
  /**
   * Called when the animation starts
   */
  onStart: VoidFunction;

  /**
   * Called at each frame of the animation
   */
  onChange: TOnAnimationChangeCallback<T>;

  /**
   * Called after the last frame of the animation
   */
  onComplete: TOnAnimationChangeCallback<T>;

  /**
   * Function called at each frame.
   * If it returns true, abort
   */
  abort: TAbortCallback<T>;
};

export type TAnimationValues<T> = {
  /**
   * Starting value(s)
   * @default 0
   */
  startValue: T;

  /**
   * Ending value(s)
   * @default 100
   */
  endValue: T;

  /**
   * Value(s) to increment/decrement the value(s) by
   * @default [endValue - startValue]
   */
  byValue: T;
};

export type TAnimationOptions<T, C = T, E = T> = Partial<
  TAnimationBaseOptions<E> & TAnimationValues<T> & TAnimationCallbacks<C>
>;

export type AnimationOptions = TAnimationOptions<number>;

export type ArrayAnimationOptions = TAnimationOptions<number[]>;

export type ColorAnimationOptions = TAnimationOptions<
  TColorArg,
  string,
  number[]
> & {
  colorEasing?: TColorEasingRateFunction;
};