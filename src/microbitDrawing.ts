// For manipulating microbit-drawing.svg.
export class MicrobitDrawing {
  private buttonA: HTMLElement;
  constructor() {
    this.buttonA = document.querySelector("#ButtonA")!;
  }
  private fillButtonA(color: string) {
    const buttonACircle = this.buttonA.querySelector("circle");
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
