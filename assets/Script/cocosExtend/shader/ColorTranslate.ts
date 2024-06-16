import ShaderManager from "./ShaderManager";
import ShaderMaterial from "./ShaderMaterial";
import { Shaders } from "./Shaders";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;


@ccclass
export default class ColorTranslate extends cc.Component {
    hue: number = 180;
    saturation: number = 0.5;
    brightness: number = 0.5;
    program = null;

    orignal = "";

    private _material: ShaderMaterial;
    get material() { return this._material; }
    private _color = cc.color();

    private materialLoaded = false;

    start () {
        const sprite = this.getComponent<cc.Sprite>(cc.Sprite);
        cc.resources.load("material/FashionMaterial",cc.Material, (err, material) => {
            if (err) {
                return;
            }
            sprite.setMaterial(0, material as cc.Material)
            this.materialLoaded = true;
            this.use();
        })
    }

    setColor(hue: number, saturation: number, brightness: number) {
        this.hue = hue;
        this.saturation = saturation;
        this.brightness = brightness;
        this.use();
    }

    setHue (h: number) {
        this.hue = h;
        this.use();
    }

    setSaturation (s: number) {
        this.saturation = s;
        this.use();
    }

    setBrightness (b: number) {
        if (b > 1) {
            console.error('where?')
        }
        this.brightness = b;
        this.use();
    }

    use() {
        if (!this.materialLoaded) {
            return;
        }
        const sprite = this.getComponent<cc.Sprite>(cc.Sprite);
        const material = sprite.getMaterial(0)
        material.setProperty("mHue", this.hue, 0, true)
        material.setProperty("mSaturation", this.saturation, 0, true)
        material.setProperty("mBrightness", this.brightness, 0, true)



        // let realTrans = Shaders._color_translate
        //     .replace('_Hue_', this.toFloatString(this.hue))
        //     .replace('_Saturation_', this.toFloatString(this.saturation))
        //     .replace('_Brightness_', this.toFloatString(this.brightness));
        // this._applyShader(realTrans)
    }

    private _applyShader(frag: string) {
        let sprite = this.getComponent(cc.Sprite);
        let material = ShaderManager.useShader(sprite, frag);
        this._material = material;
        let clr = this._color;
        clr.setR(255), clr.setG(255), clr.setB(255), clr.setA(255);
        if (!material) return;
        this._setShaderColor();
    }

    // protected update() {
    //     if (!this._material) return;
    //     this._setShaderColor();
    // }

    private _setShaderColor() {
        let node = this.node;
        let c0 = node.color;
        let c1 = this._color;
        let r = c0.getR(), g = c0.getG(), b = c0.getB(), a = node.opacity;
        let f = !1;
        if (c1.getR() !== r) { c1.setR(r); f = !0; }
        if (c1.getG() !== g) { c1.setG(g); f = !0; }
        if (c1.getB() !== b) { c1.setB(b); f = !0; }
        if (c1.getA() !== a) { c1.setA(a); f = !0; }
        f && this._material.setColor(r / 255, g / 255, b / 255, a / 255);
    }

    private toFloatString (x: number) {
        let result = String(x);
        if (result.indexOf('.') == -1) {
            result += '.0';
        }
        return result;
    }

}
