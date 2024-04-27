/* Helpful functions for dealing with RGB elements */

/** Simple type representing a tri-chromatic (RGB) pixel */
export type RGB = [number, number, number];

/** Simple type representing a quad-chromatic (RGBW) pixel */
export type RGBW = [number, number, number, number];

/** Simple type representing a pent-chromatic (RGBWC) pixel */
export type RGBWC = [number, number, number, number, number];

/** Single generic pixel */
export class Pixel {
  /** The red channel for this pixel */
  readonly R: number;
  /** The green channel for this pixel */
  readonly G: number;
  /** The blue channel for this pixel */
  readonly B: number;
  /** The warm white channel for this pixel */
  readonly WW: number;
  /** The cool white channel for this pixel */
  readonly CW: number;

  /** Instantiate a new pixel from raw color intensities */
  constructor(red = 0, green = 0, blue = 0, warmWhite = 0, coolWhite = 0) {
    this.R = red;
    this.G = green;
    this.B = blue;
    this.WW = warmWhite;
    this.CW = coolWhite;
  }

  /** Create a pixel from RGB values */
  static fromRGB(input: RGB) {
    return new Pixel(input[0], input[1], input[2]);
  }

  /** Create a pixel from RGBW values */
  static fromRGBW(input: RGBW) {
    return new Pixel(input[0], input[1], input[2], input[3]);
  }

  /** Create a pixel from RGBWC values */
  static fromRGBWC(input: RGBWC) {
    return new Pixel(input[0], input[1], input[2], input[3], input[4]);
  }

  // TODO: More initializers for eg. Hex, HSB, etc...
}