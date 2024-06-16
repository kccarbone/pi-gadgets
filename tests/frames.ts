import { RGB } from '../src/utils/color';

const OFF: RGB = [0, 0, 0];
const RED: RGB = [60, 0, 0];
const GRN: RGB = [0, 30, 0];
const BLU: RGB = [0, 0, 50];
const YEL: RGB = [50, 20, 0];
const MAG: RGB = [60, 0, 20];
const WHT: RGB = [50, 40, 50];

/* -- Some basic test frames for a 4x4 grid of neopixels
   -- Used in seesaw-neopxl.ts  */

export const colorTest = [
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    RED, GRN, BLU, OFF,
    YEL, MAG, WHT, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ]
];

export const demoReel = [
  [ // RED horizontal
    RED, OFF, OFF, OFF,
    RED, OFF, OFF, OFF, 
    RED, OFF, OFF, OFF, 
    RED, OFF, OFF, OFF
  ],
  [
    OFF, RED, OFF, OFF,
    OFF, RED, OFF, OFF, 
    OFF, RED, OFF, OFF, 
    OFF, RED, OFF, OFF
  ],
  [
    OFF, OFF, RED, OFF,
    OFF, OFF, RED, OFF, 
    OFF, OFF, RED, OFF, 
    OFF, OFF, RED, OFF
  ],
  [
    OFF, OFF, OFF, RED,
    OFF, OFF, OFF, RED, 
    OFF, OFF, OFF, RED, 
    OFF, OFF, OFF, RED
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ // Red vertical
    RED, RED, RED, RED,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    RED, RED, RED, RED,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    RED, RED, RED, RED,
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    RED, RED, RED, RED
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ // Green stagger
    GRN, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, GRN, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    GRN, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, GRN, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    GRN, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, GRN, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    GRN, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, GRN
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ // 4-color
    OFF, OFF, OFF, OFF,
    OFF, RED, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, RED, BLU, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, RED, BLU, OFF, 
    OFF, OFF, YEL, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, RED, BLU, OFF, 
    OFF, GRN, YEL, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    RED, OFF, OFF, BLU,
    OFF, RED, BLU, OFF, 
    OFF, GRN, YEL, OFF, 
    GRN, OFF, OFF, YEL
  ],
  [
    RED, RED, OFF, BLU,
    OFF, OFF, OFF, BLU, 
    GRN, OFF, OFF, OFF, 
    GRN, OFF, YEL, YEL
  ],
  [
    RED, RED, RED, BLU,
    GRN, OFF, OFF, BLU, 
    GRN, OFF, OFF, BLU, 
    GRN, YEL, YEL, YEL
  ],
  [ // Snake loop 1
    GRN, RED, RED, RED,
    GRN, OFF, OFF, BLU, 
    GRN, OFF, OFF, BLU, 
    YEL, YEL, YEL, BLU
  ],
  [
    GRN, GRN, RED, RED,
    GRN, OFF, OFF, RED, 
    YEL, OFF, OFF, BLU, 
    YEL, YEL, BLU, BLU
  ],
  [
    GRN, GRN, GRN, RED,
    YEL, OFF, OFF, RED, 
    YEL, OFF, OFF, RED, 
    YEL, BLU, BLU, BLU
  ],
  [
    YEL, GRN, GRN, GRN,
    YEL, OFF, OFF, RED, 
    YEL, OFF, OFF, RED, 
    BLU, BLU, BLU, RED
  ],
  [
    YEL, YEL, GRN, GRN,
    YEL, OFF, OFF, GRN, 
    BLU, OFF, OFF, RED, 
    BLU, BLU, RED, RED
  ],
  [
    YEL, YEL, YEL, GRN,
    BLU, OFF, OFF, GRN, 
    BLU, OFF, OFF, GRN, 
    BLU, RED, RED, RED
  ],
  [
    BLU, YEL, YEL, YEL,
    BLU, OFF, OFF, GRN, 
    BLU, OFF, OFF, GRN, 
    RED, RED, RED, GRN
  ],
  [
    BLU, BLU, YEL, YEL,
    BLU, OFF, OFF, YEL, 
    RED, OFF, OFF, GRN, 
    RED, RED, GRN, GRN
  ],
  [
    BLU, BLU, BLU, YEL,
    RED, OFF, OFF, YEL, 
    RED, OFF, OFF, YEL, 
    RED, GRN, GRN, GRN
  ],
  [
    RED, BLU, BLU, BLU,
    RED, OFF, OFF, YEL, 
    RED, OFF, OFF, YEL, 
    GRN, GRN, GRN, YEL
  ],
  [
    RED, RED, BLU, BLU,
    RED, OFF, OFF, BLU, 
    GRN, OFF, OFF, YEL, 
    GRN, GRN, YEL, YEL
  ],
  [
    RED, RED, RED, BLU,
    GRN, OFF, OFF, BLU, 
    GRN, OFF, OFF, BLU, 
    GRN, YEL, YEL, YEL
  ],
  [ // Snake loop 2
    GRN, RED, RED, RED,
    GRN, OFF, OFF, BLU, 
    GRN, OFF, OFF, BLU, 
    YEL, YEL, YEL, BLU
  ],
  [
    GRN, GRN, RED, RED,
    GRN, OFF, OFF, RED, 
    YEL, OFF, OFF, BLU, 
    YEL, YEL, BLU, BLU
  ],
  [
    GRN, GRN, GRN, RED,
    YEL, OFF, OFF, RED, 
    YEL, OFF, OFF, RED, 
    YEL, BLU, BLU, BLU
  ],
  [
    YEL, GRN, GRN, GRN,
    YEL, OFF, OFF, RED, 
    YEL, OFF, OFF, RED, 
    BLU, BLU, BLU, RED
  ],
  [
    YEL, YEL, GRN, GRN,
    YEL, OFF, OFF, GRN, 
    BLU, OFF, OFF, RED, 
    BLU, BLU, RED, RED
  ],
  [
    YEL, YEL, YEL, GRN,
    BLU, OFF, OFF, GRN, 
    BLU, OFF, OFF, GRN, 
    BLU, RED, RED, RED
  ],
  [
    BLU, YEL, YEL, YEL,
    BLU, OFF, OFF, GRN, 
    BLU, OFF, OFF, GRN, 
    RED, RED, RED, GRN
  ],
  [
    BLU, BLU, YEL, YEL,
    BLU, OFF, OFF, YEL, 
    RED, OFF, OFF, GRN, 
    RED, RED, GRN, GRN
  ],
  [
    BLU, BLU, BLU, YEL,
    RED, OFF, OFF, YEL, 
    RED, OFF, OFF, YEL, 
    RED, GRN, GRN, GRN
  ],
  [
    RED, BLU, BLU, BLU,
    RED, OFF, OFF, YEL, 
    RED, OFF, OFF, YEL, 
    GRN, GRN, GRN, YEL
  ],
  [
    RED, RED, BLU, BLU,
    RED, OFF, OFF, BLU, 
    GRN, OFF, OFF, YEL, 
    GRN, GRN, YEL, YEL
  ],
  [
    RED, RED, RED, BLU,
    GRN, OFF, OFF, BLU, 
    GRN, OFF, OFF, BLU, 
    GRN, YEL, YEL, YEL
  ],
  [ // Collapse to white
    OFF, RED, RED, MAG,
    GRN, OFF, OFF, BLU, 
    GRN, OFF, OFF, BLU, 
    WHT, YEL, YEL, OFF
  ],
  [ 
    OFF, OFF, RED, MAG,
    OFF, OFF, OFF, BLU, 
    GRN, OFF, OFF, OFF, 
    WHT, YEL, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, MAG,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    WHT, OFF, OFF, OFF
  ],
  [ // White loop 1
    OFF, OFF, OFF, MAG,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    WHT, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, MAG, 
    WHT, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    WHT, OFF, OFF, OFF, 
    OFF, OFF, OFF, MAG, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    WHT, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, MAG
  ],
  [ 
    OFF, WHT, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, MAG, OFF
  ],
  [ 
    OFF, OFF, WHT, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, MAG, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, WHT,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    MAG, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, WHT, 
    MAG, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    MAG, OFF, OFF, OFF, 
    OFF, OFF, OFF, WHT, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    MAG, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, WHT
  ],
  [ 
    OFF, MAG, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, WHT, OFF
  ],
  [ 
    OFF, OFF, MAG, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, WHT, OFF, OFF
  ],
  [ // White loop 2
    OFF, OFF, OFF, MAG,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    WHT, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, MAG, 
    WHT, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    WHT, OFF, OFF, OFF, 
    OFF, OFF, OFF, MAG, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    WHT, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, MAG
  ],
  [ 
    OFF, WHT, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, MAG, OFF
  ],
  [ 
    OFF, OFF, WHT, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, MAG, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, WHT,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    MAG, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, WHT, 
    MAG, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    MAG, OFF, OFF, OFF, 
    OFF, OFF, OFF, WHT, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    MAG, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, WHT
  ],
  [ 
    OFF, MAG, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, WHT, OFF
  ],
  [ 
    OFF, OFF, MAG, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, WHT, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, MAG,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    WHT, OFF, OFF, OFF
  ],
  [ // Fall in
    OFF, OFF, OFF, MAG,
    OFF, OFF, MAG, OFF, 
    OFF, WHT, OFF, OFF, 
    WHT, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, WHT, MAG, OFF, 
    OFF, WHT, MAG, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, OFF, OFF, OFF,
    OFF, WHT, WHT, OFF, 
    OFF, MAG, MAG, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [ 
    OFF, WHT, WHT, OFF,
    OFF, WHT, WHT, OFF, 
    OFF, MAG, MAG, OFF, 
    OFF, MAG, MAG, OFF
  ],
  [ 
    WHT, WHT, WHT, WHT,
    OFF, YEL, YEL, OFF, 
    OFF, RED, RED, OFF, 
    MAG, MAG, MAG, MAG
  ],
  [ 
    WHT, YEL, YEL, WHT,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    MAG, RED, RED, MAG
  ],
  [ 
    YEL, OFF, OFF, YEL,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    RED, OFF, OFF, RED
  ],
  [ // Break
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ],
  [
    OFF, OFF, OFF, OFF,
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF, 
    OFF, OFF, OFF, OFF
  ]
];