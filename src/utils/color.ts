/* Helpful functions for dealing with color elements */

/** Simple type representing a tri-chromatic (RGB) pixel */
export type RGB = [number, number, number];

/** Simple type representing a tri-chromatic (GRB) pixel */
export type GRB = [number, number, number];

/** Simple type representing a quad-chromatic (RGBW) pixel */
export type RGBW = [number, number, number, number];

/** Simple type representing a pent-chromatic (RGBWC) pixel */
export type RGBWC = [number, number, number, number, number];

/**
 * Return closest integer within specified range
 * @param value input value
 * @param maxVal highest allowed value (inclusive)
 * @param minVal lowest allowed value (inclusive)
 */
export function clamp(value: number, maxVal = 100, minVal = 0) {
  return Math.min(Math.max(Math.round(value), minVal), maxVal);
}

/**
 * Apply a gamma curve for LED brightness values
 * @param input initial value
 * @param gValue the gamma correction factor to apply to the input
 * @param scale the maximum value for input range
 */
export function gamma(input: number, gValue: number, scale = 100) {
  return ((input / scale) ** gValue) * scale;
}

/**
 * Apply a gamma curve, round to integer, and clamp brightness on all color channels
 * @param color initial color
 * @param gValue the gamma correction factor
 * @param max the maximum allowed brightness
 */
export function normalize(color: RGB, gValue: number, max = 255): RGB {
  return [
    clamp(gamma(color[0], gValue, max) * 1.0, max),
    clamp(gamma(color[1], gValue, max) * 0.9, max),
    clamp(gamma(color[2], gValue, max) * 0.7, max)
  ];
}

/** Add two RGB colors */
export function add(c1: RGB, c2: RGB, scale = 100): RGB {
  return [
    clamp(c1[0] + c2[0], scale),
    clamp(c1[1] + c2[1], scale),
    clamp(c1[2] + c2[2], scale)
  ];
}

/** Multiply two RGB colors */
export function mult(c1: RGB, c2: RGB, scale = 100): RGB {
  return [
    clamp(c1[0] * c2[0], scale),
    clamp(c1[1] * c2[1], scale),
    clamp(c1[2] * c2[2], scale)
  ];
}