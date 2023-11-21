import { fade, slide }  from '#svelte/transition';
import { linear }       from '#svelte/easing';

/**
 * Combines slide & fade transitions into a single transition. For options `easing` this is applied to both transitions,
 * however if provided `easingSlide` and / or `easingFade` will take precedence. The default easing is linear.
 *
 * @param {HTMLElement} node - The transition node.
 *
 * @param {object}      [options] - Optional parameters.
 *
 * @param {'x' | 'y'}   [options.axis] - The sliding axis.
 *
 * @param {number}      [options.delay] - Delay in ms before start of transition.
 *
 * @param {number}      [options.duration] - Total transition length in ms.
 *
 * @param {import('svelte/transition').EasingFunction}   [options.easing=linear] - The easing function to apply to both
 *        slide & fade transitions.
 *
 * @param {import('svelte/transition').EasingFunction}   [options.easingFade=linear] - The easing function to apply to
 *        the fade transition.
 *
 * @param {import('svelte/transition').EasingFunction}   [options.easingSlide=linear] - The easing function to apply to
 *        the slide transition.
 *
 * @returns {import('svelte/transition').TransitionConfig} Transition config.
 */
export function slideFade(node, options)
{
   const fadeEasing = options.easingFade ?? options.easing ?? linear;
   const slideEasing = options.easingSlide ?? options.easing ?? linear;

   const fadeTransition = fade(node);
   const slideTransition = slide(node, { axis: options.axis });

   return {
      delay: options.delay ?? 0,
      duration: options.duration ?? 500,
      easing: linear,
      css: (t) =>
      {
         const fadeT = fadeEasing(t);
         const slideT = slideEasing(t);
         return `${slideTransition.css(slideT, 1 - slideT)}; ${fadeTransition.css(fadeT, 1 - fadeT)}`;
      }
   };
}
