// For manipulating microbit-drawing.svg.
import { SvgSettings, MicrobitConstants } from './constants';

export class MicrobitDrawing {
  private _cachedButtonA: HTMLElement | null;
  private _cachedButtonB: HTMLElement | null;
  private _cachedSetLEDs: HTMLElement | null;
  private _cachedSetMicrophone: HTMLElement | null;
  private _cachedTemplateSetLed: HTMLElement | null;
  private _cachedTouchLogo: HTMLElement | null;

  private _buttonA: Boolean = false;
  private _buttonB: Boolean = false;
  private _leds: Array<Boolean> = new Array<false>(MicrobitConstants.leds.total);
  private _microphone: Boolean = false;
  private _templateLed: Boolean = false;
  private _touchLogo: Boolean = false;

  constructor() {
    this._cachedButtonA = document.querySelector(SvgSettings.selectors.buttonA);
    this._cachedButtonB = document.querySelector(SvgSettings.selectors.buttonB);
    this._cachedSetLEDs = document.querySelector(SvgSettings.selectors.setLeds);
    this._cachedSetMicrophone = document.querySelector(SvgSettings.selectors.setMicrophone);
    this._cachedTemplateSetLed = document.querySelector(SvgSettings.selectors.setTemplate);
    this._cachedTouchLogo = document.querySelector(SvgSettings.selectors.touchLogo);
  }

  private getButtonAEl(): HTMLElement {
    if (this._cachedButtonA)
      return this._cachedButtonA;

    this._cachedButtonA = document.querySelector(SvgSettings.selectors.buttonA) as HTMLElement;
    if (!this._cachedButtonA)
      throw new Error("Button A does not exist!");
    return this._cachedButtonA;
  }

  private getButtonBEl(): HTMLElement {
    if (this._cachedButtonB)
      return this._cachedButtonB;

    this._cachedButtonB = document.querySelector(SvgSettings.selectors.buttonB) as HTMLElement;
    if (!this._cachedButtonB)
      throw new Error("Button B does not exist!");
    return this._cachedButtonB;
  }

  private getSetLedEl(): HTMLElement {
    if (this._cachedSetLEDs)
      return this._cachedSetLEDs;

    this._cachedSetLEDs = document.querySelector(SvgSettings.selectors.setLeds) as HTMLElement;
    if (!this._cachedSetLEDs)
      throw new Error("LEDs do not exist!");
    return this._cachedSetLEDs;
  }

  private getSetMicrphoneEl(): HTMLElement {
    if (this._cachedSetMicrophone)
      return this._cachedSetMicrophone;

    this._cachedSetMicrophone = document.querySelector(SvgSettings.selectors.setMicrophone) as HTMLElement;
    if (!this._cachedSetMicrophone)
      throw new Error("Mic does not exist!");
    return this._cachedSetMicrophone;
  }

  private getTemplateSetLedEl(): HTMLElement {
    if (this._cachedTemplateSetLed)
      return this._cachedTemplateSetLed;

    this._cachedTemplateSetLed = document.querySelector(SvgSettings.selectors.setTemplate) as HTMLElement;
    if (!this._cachedTemplateSetLed)
      throw new Error("Template Led does not exist!");
    return this._cachedTemplateSetLed;
  }

  private getTouchLogoEl(): HTMLElement {
    if (this._cachedTouchLogo)
      return this._cachedTouchLogo;

    this._cachedTouchLogo = document.querySelector(SvgSettings.selectors.touchLogo) as HTMLElement;
    if (!this._cachedTouchLogo)
      throw new Error("Touch Logo does not exist!");
    return this._cachedTouchLogo;
  }

  private fillButtonA(color: string) {
    const buttonACircle = this.getButtonAEl().querySelector("circle");
    if (!buttonACircle) return;

    buttonACircle.style.fill = color;
  }

  private fillButtonB(color: string) {
    const buttonBCircle = this.getButtonBEl().querySelector("circle");
    if (!buttonBCircle) return;

    buttonBCircle.style.fill = color;
  }

  private setLedTo(id: number, val: Boolean) {
    if (id < 0 || id >= MicrobitConstants.leds.total)
      return;

    const currentLed = this.getSetLedEl().children[id] as HTMLElement;
    if (!currentLed) return;

    this._leds[id] = val;
    if (val) currentLed.style.display = "block";
    else currentLed.style.display = "none";
  }

  private setMicrphoneTo(val: Boolean) {
    this._microphone = val;
    if (val) this.getSetMicrphoneEl().style.display = "block";
    else this.getSetMicrphoneEl().style.display = "none";
  }

  private setTemplateTo(val: Boolean) {
    this._templateLed = val;
    if (val) this.getTemplateSetLedEl().style.display = "block";
    else this.getTemplateSetLedEl().style.display = "none";
  }

  private fillTouchLogo(color: string) {
    const touchLogoInner = this.getTouchLogoEl();
    if (!touchLogoInner) return;

    touchLogoInner.style.fill = color;
  }

  public get buttonA(): Boolean {
    return this._buttonA;
  }

  public set buttonA(val: Boolean) {
    this._buttonA = val;
    this.fillButtonA(val ? SvgSettings.colors.buttonAActive : SvgSettings.colors.buttonAInative);
  }

  public get buttonB(): Boolean {
    return this._buttonB;
  }

  public set buttonB(val: Boolean) {
    this._buttonB = val;
    this.fillButtonB(val ? SvgSettings.colors.buttonBActive : SvgSettings.colors.buttonBInative);
  }

  public setLed(id: number) {
    this.setLedTo(id, true);
  }

  public unsetLed(id: number) {
    this.setLedTo(id, false);
  }

  public toggleLed(id: number) {
    this.setLedTo(id, !this._leds[id]);
  }

  public statusLed(id: number) {
    return this._leds[id];
  }

  public get microphone(): Boolean {
    return this._microphone;
  }

  public set microphone(val: Boolean) {
    this.setMicrphoneTo(val);
  }

  public get templateLed(): Boolean {
    return this._templateLed;
  }

  public set templateLed(val: Boolean) {
    this.setTemplateTo(val);
  }

  public get touchLogo(): Boolean {
    return this._touchLogo;
  }

  public set touchLogo(val: Boolean) {
    this._touchLogo = val;
    this.fillTouchLogo(val ? SvgSettings.colors.touchLogoActive : SvgSettings.colors.touchLogoInactive);
  }

  public reset() {
    this.buttonA = false;
    this.buttonB = false;

    for (let i = 0; i < MicrobitConstants.leds.total; i++)
      this.unsetLed(i);

    this.microphone = false;
    this.templateLed = false;

    this.touchLogo = false;
  }
}
