// For manipulating microbit-drawing.svg.
export class MicrobitDrawing {
  private cachedButtonA: HTMLElement | null;
  constructor() {
    this.cachedButtonA = document.querySelector("#ButtonA");
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
  private fillButtonA(color: string) {
    const buttonACircle = this.buttonA().querySelector("circle");
    if (buttonACircle) {
      buttonACircle.style.fill = color;
    }
  }
  highlightButtonA() {
    this.fillButtonA("#00c800");
  }
  reset() {
    this.fillButtonA("#000000");
  }
}
