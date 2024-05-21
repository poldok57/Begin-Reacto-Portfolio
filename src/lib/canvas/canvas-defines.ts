export const SHAPE_TYPE = {
  SQUARE: "square",
  CIRCLE: "circle",
  ONE_RADIUS_T: "radiusTop",
  ONE_RADIUS_B: "radiusBottom",
  TWO_RADIUS: "radiusHalf",
  SELECT: "select-auto",
  IMAGE: "image",
  TEXT: "text",
};

export const DRAWING_MODES = {
  DRAW: "draw",
  LINE: "line",
  ARC: "arc",
  ERASE: "erase",
  UNDO: "undo",
  SAVE: "save",
  INIT: "init",
  COPY: "copy",
  PASTE: "paste",
  CONTROL_PANEL: {
    IN: "in",
    OUT: "out",
  },
  DRAWING_CHANGE: "drawingChange",
  ...SHAPE_TYPE,
};

const LINE_MODES = [DRAWING_MODES.LINE, DRAWING_MODES.ARC];
const FREEHAND_MODES = [DRAWING_MODES.DRAW, DRAWING_MODES.ERASE];
const SHAPE_MODES = [
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.ONE_RADIUS_T,
  DRAWING_MODES.ONE_RADIUS_B,
  DRAWING_MODES.TWO_RADIUS,
];
const SELECT_MODES = [DRAWING_MODES.SELECT, DRAWING_MODES.IMAGE];

const ALL_DRAWING_MODES = [
  ...LINE_MODES,
  ...FREEHAND_MODES,
  ...SHAPE_MODES,
  ...SELECT_MODES,
  DRAWING_MODES.TEXT,
];
export const isDrawingMode = (mode: string) => ALL_DRAWING_MODES.includes(mode);
export const isDrawingShape = (mode: string) => SHAPE_MODES.includes(mode);
export const isDrawingLine = (mode: string) => LINE_MODES.includes(mode);
export const isDrawingFreehand = (mode: string) =>
  FREEHAND_MODES.includes(mode);
export const isDrawingSelect = (mode: string) => SELECT_MODES.includes(mode);

const DEFAULT = { COLOR: "#ff0000", SIZE: 4, OPACITY: 1 };

export const mouseCircle = {
  color: "rgba(255, 255, 0,0.8)",
  width: 80,
  filled: true,
  lineWidth: 25,
};

export type paramsGeneral = {
  color: string;
  lineWidth: number;
  opacity: number;
  interval?: number;
};
export type paramsShape = {
  filled: boolean;
  radius: number;
  withText: boolean;
  withBorder: boolean;
};
export type paramsText = {
  text: string;
  color: string;
  font: string;
  bold: number;
  italic: boolean;
  fontSize: number;
  rotation: number;
};
export type paramsAll = {
  mode: string;
  fixed: boolean;
  general: paramsGeneral;
  shape: paramsShape;
  text: paramsText;
  border: paramsGeneral;
};

export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type shapeDefinition = {
  type: string;
  rotation: number;
  size: Area;
  canvasImage: HTMLCanvasElement;
  general: paramsGeneral;
  shape: paramsShape;
  border: paramsGeneral;
  text: paramsText;
  withMiddleButton: boolean;
};

export const DEFAULT_PARAMS: paramsAll = {
  mode: DRAWING_MODES.INIT,
  fixed: false,
  general: {
    color: DEFAULT.COLOR,
    lineWidth: DEFAULT.SIZE,
    opacity: DEFAULT.OPACITY,
  },
  shape: {
    filled: true,
    radius: 10,
    withText: false,
    withBorder: false,
  },
  text: {
    text: "",
    color: "#404080",
    font: "Arial",
    bold: 100,
    italic: false,
    fontSize: 20,
    rotation: 0,
  },
  border: {
    color: "#a0a0a0",
    lineWidth: 1,
    opacity: 1,
    interval: 0,
  },
};