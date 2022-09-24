import { fabric } from '../../HEADER';
import { Canvas, TObject } from '../__types__';
import { AnimationContext, TCancelFunction } from './animate';

/**
 * Array holding all running animations
 * @memberof fabric
 * @type {AnimationContext[]}
 */
class RunningAnimations extends Array<AnimationContext> {
  /**
   * cancel all running animations at the next requestAnimFrame
   * @returns {AnimationContext[]}
   */
  cancelAll(): AnimationContext[] {
    const animations = this.splice(0);
    animations.forEach((animation) => animation.cancel());
    return animations;
  }

  /**
   * cancel all running animations attached to canvas at the next requestAnimFrame
   * @param {fabric.Canvas} canvas
   * @returns {AnimationContext[]}
   */
  cancelByCanvas(canvas: Canvas): AnimationContext[] {
    if (!canvas) {
      return [];
    }
    const cancelled = this.filter(
      (animation) =>
        typeof animation.target === 'object' &&
        (animation.target as TObject)?.canvas === canvas
    );
    cancelled.forEach((animation) => animation.cancel());
    return cancelled;
  }

  /**
   * cancel all running animations for target at the next requestAnimFrame
   * @param {*} target
   * @returns {AnimationContext[]}
   */
  cancelByTarget(target: AnimationContext['target']): AnimationContext[] {
    const cancelled = this.findAnimationsByTarget(target);
    cancelled.forEach((animation) => animation.cancel());
    return cancelled;
  }

  /**
   *
   * @param {TCancelFunction} cancelFunc the function returned by animate
   * @returns {number}
   */
  findAnimationIndex(cancelFunc: TCancelFunction): number {
    return this.findIndex((animation) => animation.cancel === cancelFunc);
  }

  /**
   *
   * @param {TCancelFunction} cancelFunc the function returned by animate
   * @returns {AnimationContext | undefined} animation's options object
   */
  findAnimation(cancelFunc: TCancelFunction): AnimationContext | undefined {
    return this.find((animation) => animation.cancel === cancelFunc);
  }

  /**
   *
   * @param {*} target the object that is assigned to the target property of the animation context
   * @returns {AnimationContext[]} array of animation options object associated with target
   */
  findAnimationsByTarget(
    target: AnimationContext['target']
  ): AnimationContext[] {
    if (!target) {
      return [];
    }
    return this.filter((animation) => animation.target === target);
  }
}

export const runningAnimations = new RunningAnimations();

fabric.runningAnimations = runningAnimations;
