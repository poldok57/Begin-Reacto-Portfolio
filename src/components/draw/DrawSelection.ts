import { Area, Surface, Coordinate } from "../../lib/types";
import { getCoordinates } from "../../lib/canvas/canvas-tools";
import {
  DRAWING_MODES,
  paramsAll,
  ShapeDefinition,
} from "../../lib/canvas/canvas-defines";
import { BORDER } from "../../lib/mouse-position";
import { resizingElement, showElement } from "../../lib/canvas/canvas-elements";
import {
  copyInVirtualCanvas,
  calculateSize,
} from "../../lib/canvas/canvas-images";

import {
  DrawingHandler,
  returnMouseDown,
} from "../../lib/canvas/DrawingHandler";
import { alertMessage } from "../../hooks/alertMessage";
import { imageSize, saveCanvas } from "../../lib/canvas/canvas-size";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class DrawSelection extends DrawingHandler {
  private fixed: boolean = false;
  private resizing: string | null = null;
  private offset: Coordinate | null = null;
  protected data: ShapeDefinition;
  private selectedArea: Area | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    if (!canvas) return;

    this.coordinates = { x: 0, y: 0 };

    this.fixed = false;
    this.resizing = null;
    this.offset = null;
    this.data = {
      ...this.data,
      ...{
        withMiddleButtons: false,
        withCornerButton: false,
        type: DRAWING_MODES.SQUARE,
        rotation: 0,
      },
    };
  }

  setCoordinates(event: MouseEvent, canvas: HTMLCanvasElement | null = null) {
    if (!event) return { x: 0, y: 0 };
    if (!canvas) canvas = this.mCanvas;

    this.coordinates = getCoordinates(event, canvas);
    if (this.coordinates && this.offset && !this.fixed) {
      const x = this.coordinates.x + this.offset.x;
      const y = this.coordinates.y + this.offset.y;

      this.data.size.x = x;
      this.data.size.y = y;
    }
    return this.coordinates;
  }

  setResizing(value: string | null) {
    this.resizing = value;
  }

  setFixed(value: boolean) {
    this.fixed = value;
  }
  isFixed() {
    return this.fixed;
  }

  eraseOffset() {
    this.offset = null;
  }
  calculOffset() {
    if (!this.coordinates) return;
    this.offset = {
      x: this.data.size.x - this.coordinates.x,
      y: this.data.size.y - this.coordinates.y,
    };
  }

  addData(data: any) {
    this.data = { ...this.data, ...data };
  }

  initData(initData: paramsAll) {
    this.data = { ...this.data, ...initData };
    this.changeData(initData);
    if (this.mCanvas !== null)
      this.setDataSize({
        x: this.mCanvas.width / 2,
        y: this.mCanvas.height / 2,
        width: SQUARE_WIDTH,
        height: SQUARE_HEIGHT,
      });
    this.data.rotation = 0;
    this.fixed = false;
    this.setWithMiddleButtons(true);
  }
  changeData(data: paramsAll) {
    this.setDataGeneral(data.general);
    // this.data.type = data.mode;
    console.log("changeData: type is:", this.data.type);
    this.data.lockRatio = data.lockRatio;
  }

  getData() {
    return this.data;
  }
  setType(type: string) {
    this.data.type = type;
    if (type === DRAWING_MODES.SELECT) {
      this.setWithMiddleButtons(false);
      this.setWithCornerButton(false);
    } else {
      this.setWithMiddleButtons(true);
      this.setWithCornerButton(true);
    }
  }
  /**
   * Function to resize the square on the canvas
   */
  resizingSquare() {
    this.clearTemporyCanvas();

    if (!this.coordinates || !this.ctxTempory) return;

    const newCoord = resizingElement(
      this.ctxTempory,
      this.data,
      this.coordinates,
      this.resizing
    );

    if (newCoord) {
      this.addData(newCoord);
      this.setDataSize(newCoord);
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing(opacity: number = 0, mouseOnShape: string | null = null) {
    if (!this.ctxTempory) {
      return;
    }
    this.clearTemporyCanvas();
    if (opacity > 0) this.ctxTempory.globalAlpha = opacity;
    showElement(this.ctxTempory, this.data, true, mouseOnShape);
    this.lastMouseOnShape = mouseOnShape;
  }

  /**
   * Function to mémorize the selected zone
   * @param {object} area - {x, y, width, height} of the selected zone
   */
  memorizeSelectedArea(area: Area | null = null) {
    if (area) {
      this.setDataSize(area);

      this.setFixed(true);
      this.setType(DRAWING_MODES.SELECT);
    } else {
      area = { ...this.data.size };
    }
    this.selectedArea = area;
    return area;
  }
  getSelectedArea() {
    return this.selectedArea;
  }
  eraseSelectedArea() {
    this.selectedArea = null;
  }

  /**
   * Function to draw an element on the MAIN canvas
   */
  validDrawedElement() {
    if (this.getType() === DRAWING_MODES.SELECT) {
      return;
    }
    // console.log("validDrawedElement: ", this.getType());
    if (!this.context) {
      console.error("context is null");
      return;
    }
    showElement(this.context, this.data, false);
    this.saveCanvasPicture();
    this.clearTemporyCanvas();
  }

  actionMouseDown(mode: string, event: MouseEvent): returnMouseDown {
    // if (!this.isFixed()) {
    //   return false;
    // }
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(event);

    const mouseOnShape = this.handleMouseOnShape();

    if (mouseOnShape) {
      // console.log("mode", mode, "mouseOnShape: ", mouseOnShape);
      // Clic on the shape --------
      if (mouseOnShape === BORDER.INSIDE) {
        this.calculOffset();
        pointer = "pointer";
        this.setFixed(false);
      } else if (mouseOnShape === BORDER.ON_BUTTON) {
        pointer = "pointer";
        this.validDrawedElement();
        toReset = true;
      } else if (mouseOnShape === BORDER.ON_BUTTON_LEFT) {
        this.changeRotation(-Math.PI / 16);
        this.refreshDrawing(0, mouseOnShape);
      } else if (mouseOnShape === BORDER.ON_BUTTON_RIGHT) {
        this.changeRotation(Math.PI / 16);
        this.refreshDrawing(0, mouseOnShape);
      } else {
        alertMessage("resizing: " + mouseOnShape);
        this.setResizing(mouseOnShape);

        // console.log("resizing element: ", mouseOnShape);
      }
    }
    return { toReset, toContinue: false, pointer } as returnMouseDown;
  }

  actionMouseMove(event: MouseEvent) {
    this.setCoordinates(event);
    if (this.resizing !== null) {
      this.resizingSquare();
      if (this.getType() === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return null;
    }
    if (!this.isFixed()) {
      this.clearTemporyCanvas();
      if (this.ctxTempory) showElement(this.ctxTempory, this.data, true);
      if (this.getType() === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return "pointer";
    }

    return this.followCursorOnElement(this.data.general.opacity);
  }

  actionMouseUp() {
    this.setFixed(true);
    this.setResizing(null);
  }

  actionMouseLeave() {}

  actionKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        this.eraseSelectedArea();
        this.setType(DRAWING_MODES.SELECT);
        this.refreshDrawing(1, BORDER.INSIDE);
        break;
      // ctrl + c
      case "c":
      case "C":
        if (event.ctrlKey) {
          this.copySelection();
        }
        break;
      // ctrl + v
      case "v":
      case "V":
        if (event.ctrlKey) {
          this.pasteSelection();
        }
        break;
      // Ctrl X
      case "x":
      case "X":
        if (event.ctrlKey) {
          this.cutSelection();
        }
        break;
    }
  }

  /**
   * Function to end the action on the canvas
   */
  endAction() {
    this.setFixed(true);
    this.setResizing(null);
    this.clearTemporyCanvas();
  }

  /**
   * Function to copy the selected zone in a virtual canvas
   */
  copySelection(): void {
    const area = this.getSelectedArea();
    if (area === null || this.context === null) return;
    this.data.canvasImage = copyInVirtualCanvas(this.context, area);
    this.setType(DRAWING_MODES.IMAGE);
    this.setRotation(0);
    console.log("copySelection: refreshDrawing");
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  deleteSelection() {
    const area = this.getSelectedArea();
    if (area === null) return;
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.SELECT);
    this.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  cutSelection() {
    const area = this.getSelectedArea();
    if (area === null || this.context === null) return;
    this.data.canvasImage = copyInVirtualCanvas(this.context, area);
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.IMAGE);
    this.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }

  /**
   * Function to paste the selected zone in the MAIN canvas
   */
  pasteSelection(): void {
    this.validDrawedElement();
    this.setType(DRAWING_MODES.IMAGE);
    this.refreshDrawing(1, BORDER.INSIDE);
  }

  startAction(): void {
    const mode = this.getType();
    switch (mode) {
      case DRAWING_MODES.SELECT:
        // Zone selection
        const rect = imageSize(this.mCanvas);
        const area = this.memorizeSelectedArea(rect);

        this.setWithMiddleButtons(false);
        this.setWithCornerButton(false);
        break;
      case DRAWING_MODES.IMAGE:
        this.setWithMiddleButtons(true);
        this.setWithCornerButton(true);
    }
  }
  /**
   * Function to save the canvas in a file
   * @param {string} filename - name of the file to save
   */
  saveCanvas(filename: string) {
    if (!this.mCanvas) return;
    const area = this.getSelectedArea();

    saveCanvas(this.mCanvas, filename, area);
  }

  /**
   * Function to load an image in the canvas
   * @param {string} filename - name of the file to load
   */
  loadCanvas(filename: string, name: string) {
    const virtualCanvas = document.createElement("canvas");
    const ctx = virtualCanvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = filename;
    img.onload = () => {
      const MAX_PC = 0.9;
      const maxSize: Surface = {
        width: MAX_PC * (this.mCanvas?.width || SQUARE_WIDTH),
        height: MAX_PC * (this.mCanvas?.height || SQUARE_HEIGHT),
      };

      virtualCanvas.width = img.width;
      virtualCanvas.height = img.height;
      const ratio = img.width / img.height;
      ctx.drawImage(img, 0, 0);
      this.data.canvasImage = virtualCanvas;

      alertMessage(
        "Image '" + name + "' loaded w:" + img.width + " h:" + img.height
      );

      const area: Area = calculateSize(img as Surface, maxSize);
      area.ratio = ratio;
      this.setDataSize(area);
      this.setRotation(0);

      this.setType(DRAWING_MODES.IMAGE);
      this.refreshDrawing(0, BORDER.INSIDE);
    };
    img.onerror = () => {
      alertMessage("Error loading the file");
    };
  }
}
