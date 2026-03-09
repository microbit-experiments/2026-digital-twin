// For manipulating microbit-drawing.svg.
export class MicrobitDrawing {
  private cachedButtonA: HTMLElement | null;
  private cachedButtonB: HTMLElement | null;
  constructor() {
    this.cachedButtonA = document.querySelector("#ButtonA");
    this.cachedButtonB = document.querySelector("#ButtonB");
  }
  private buttonA() {
    if (this.cachedButtonA) {
      return this.cachedButtonA;
    }
    const buttonAEl = document.querySelector("#ButtonA");
    if (!buttonAEl) {
      throw new Error("Button A does not exist!");
    }
    return buttonAEl;
  }
  private buttonB() {
    if (this.cachedButtonB) {
      return this.cachedButtonB;
    }
    const buttonBEl = document.querySelector("#ButtonB");
    if (!buttonBEl) {
      throw new Error("Button B does not exist!");
    }
    return buttonBEl;
  }
  private fillButtonA(color: string) {
    const buttonACircle = this.buttonA().querySelector("circle");
    if (buttonACircle) {
      buttonACircle.style.fill = color;
    }
  }
  private fillButtonB(color: string) {
    const buttonBCircle = this.buttonB().querySelector("circle");
    if (buttonBCircle) {
      buttonBCircle.style.fill = color;
    }
  }
  highlightButtonA() {
    this.fillButtonA("#00c800");
  }
  highlightButtonB() {
    this.fillButtonB("#00c800");
  }
  // Resets the colours of anything that might change colour.
  reset() {
    this.fillButtonA("#000000");
    this.fillButtonB("#000000");
  }
}
