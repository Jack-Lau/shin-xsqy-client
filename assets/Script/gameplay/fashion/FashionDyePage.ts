import FashionModel from "./FashionModel";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";
import ColorTranslate from "../../cocosExtend/shader/ColorTranslate";
import { Fashion } from "../../net/Protocol";
import { FashionConfig } from "./FashionConfig";
import FashionSaveDyePanel from "./FashionSaveDyePanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CurrencyId } from "../../config/CurrencyId";
import { TipsManager } from "../../base/TipsManager";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionDyePage extends cc.Component {
    @property(cc.ToggleContainer)
    statusContianer: cc.ToggleContainer = null;

    @property(cc.Button)
    theme1: cc.Button = null;
    @property(cc.Button)
    theme2: cc.Button = null;

    @property(cc.ToggleContainer)
    partContianer: cc.ToggleContainer = null;
    @property([cc.Sprite])
    partSps: Array<cc.Sprite> = [];

    @property(cc.Slider)
    hue: cc.Slider = null;
    @property(cc.Slider)
    saturation: cc.Slider = null;
    @property(cc.Slider)
    brightness: cc.Slider = null;

    @property(cc.Button)
    hueResetBtn: cc.Button = null;
    @property(cc.Button)
    saturationResetBtn: cc.Button = null;
    @property(cc.Button)
    brightnessResetBtn: cc.Button = null;

    @property(cc.Button)
    dyeBtn: cc.Button = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Label)
    ownLabel: cc.Label = null;

    fashionModel: Optional<FashionModel> = Optional.Nothing();
    fashion: Fashion = null;
    defaultColor: Array<any> = [];

    myOwn: number = 0;

    start () {
        this.initEvents();
    }

    async init(fashion: Fashion, model: FashionModel) {
        this.fashionModel = new Optional<FashionModel>(model);
        await this.initColor(fashion);
        this.myOwn = await CommonUtils.getCurrencyAmount(CurrencyId.染色剂);
        this.ownLabel.string = String(this.myOwn);
        this.costLabel.string = '/0'
    }

    async initColor (fashion: Fashion) {
        this.fashion = fashion;
        let color = await FashionConfig.getDefaultColor(FashionConfig.getPrefabId(fashion.definitionId));
        this.defaultColor = color;
        color.forEach((c, index) => {
            this.fashionModel.val.setHue(index, c.color);
            this.partSps[index].getComponent(ColorTranslate).setHue(c.color);
            this.fashionModel.val.setSaturation(index, c.saturation / 100);
            this.partSps[index].getComponent(ColorTranslate).setSaturation(c.saturation / 100);
            this.fashionModel.val.setBrightness(index, FashionConfig.pToB(c.brightness / 100));
            this.partSps[index].getComponent(ColorTranslate).setBrightness(FashionConfig.pToB(c.brightness / 100));
        })
        this.refreshHSB(0)();
    }

    initEvents () {
        this.hue.node.on('slide', this.onHSlide, this);
        this.saturation.node.on('slide', this.onSSlide, this);
        this.brightness.node.on('slide', this.onBSlide, this);
        this.hueResetBtn.node.on(cc.Node.EventType.TOUCH_END, this.resetHue.bind(this));
        this.saturationResetBtn.node.on(cc.Node.EventType.TOUCH_END, this.resetSaturation.bind(this));
        this.brightnessResetBtn.node.on(cc.Node.EventType.TOUCH_END, this.resetBrightness.bind(this));
        this.partSps.forEach((sp, index) => {
            sp.node.on(cc.Node.EventType.TOUCH_END, this.choosePart(index), this);
        });
        this.partContianer.toggleItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.refreshHSB(index), this);
        });
        this.dyeBtn.node.on(cc.Node.EventType.TOUCH_END, this.addDye.bind(this));

        this.statusContianer.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.toNormal, this);
        this.statusContianer.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.toBattle, this);
        this.theme1.node.on(cc.Node.EventType.TOUCH_END, this.changeToTheme1, this);
        this.theme2.node.on(cc.Node.EventType.TOUCH_END, this.changeToTheme2, this);
    }

    /******* start Events *******/
    toNormal () {
        if (this.fashionModel.valid) {
            this.fashionModel.val.switchToNormal();
        }
    }

    toBattle () {
        if (this.fashionModel.valid) {
            this.fashionModel.val.switchToBattle();
        }
    }

    onHSlide() {
        if (this.fashionModel.valid) {
            let index = CommonUtils.getCheckedIndex(this.partContianer);
            let hue = this.hue.progress * 360;
            this.fashionModel.val.setHue(index, hue);
            this.partSps[index].getComponent(ColorTranslate).setHue(hue)
            this.refreshCost();
        }
    }

    onSSlide() {
        if (this.fashionModel.valid) {
            let index = CommonUtils.getCheckedIndex(this.partContianer);
            let saturation = this.saturation.progress;
            this.fashionModel.val.setSaturation(index, saturation);
            this.partSps[index].getComponent(ColorTranslate).setSaturation(saturation)
            this.refreshCost();
        }
    }

    onBSlide() {
        if (this.fashionModel.valid) {
            let index = CommonUtils.getCheckedIndex(this.partContianer);
            let brightness = FashionConfig.pToB(this.brightness.progress);
            this.fashionModel.val.setBrightness(index, brightness);
            this.partSps[index].getComponent(ColorTranslate).setBrightness(brightness)
            this.refreshCost();
        }
    }

    resetHue() {
        let index = CommonUtils.getCheckedIndex(this.partContianer);
        this.hue.progress = this.defaultColor[index] ? this.defaultColor[index].color / 360 : 0.5;
        this.onHSlide();
    }

    resetSaturation() {
        let index = CommonUtils.getCheckedIndex(this.partContianer);
        this.saturation.progress = this.defaultColor[index] ? this.defaultColor[index].saturation / 100 : 0.5;
        this.onSSlide();
    }

    resetBrightness() {
        let index = CommonUtils.getCheckedIndex(this.partContianer);
        this.brightness.progress = this.defaultColor[index] ? this.defaultColor[index].brightness / 100 : 0.5;
        this.onBSlide();
    }

    choosePart(index: number) {
        let _this = this;
        return function () {
            let item = _this.partContianer.toggleItems[index];
            if (item) {
                item.check();
            }
            _this.refreshHSB(index)();
        }
    }

    refreshHSB(index: number) {
        let _this = this;
        return function () {
            let ct = _this.partSps[index].getComponent(ColorTranslate);
            _this.hue.progress = ct.hue / 360;
            _this.saturation.progress = ct.saturation;
            _this.brightness.progress = FashionConfig.bToP(ct.brightness);
        }
    }

    async changeToTheme1() {
        let color = await FashionConfig.getPresetColor(this.fashion.definitionId, 1);
        if (color) {
            color.forEach((c, index) => {
                this.fashionModel.val.setHue(index, c.color);
                this.partSps[index].getComponent(ColorTranslate).setHue(c.color);
                this.fashionModel.val.setSaturation(index, c.saturation / 100);
                this.partSps[index].getComponent(ColorTranslate).setSaturation(c.saturation / 100);
                this.fashionModel.val.setBrightness(index, FashionConfig.pToB(c.brightness / 100));
                this.partSps[index].getComponent(ColorTranslate).setBrightness(FashionConfig.pToB(c.brightness / 100));
            })
        }
        this.refreshCost();
    }

    async changeToTheme2() {
        let color = await FashionConfig.getPresetColor(this.fashion.definitionId, 2);
        if (color) {
            color.forEach((c, index) => {
                this.fashionModel.val.setHue(index, c.color);
                this.partSps[index].getComponent(ColorTranslate).setHue(c.color);
                this.fashionModel.val.setSaturation(index, c.saturation / 100);
                this.partSps[index].getComponent(ColorTranslate).setSaturation(c.saturation / 100);
                this.fashionModel.val.setBrightness(index, FashionConfig.pToB(c.brightness / 100));
                this.partSps[index].getComponent(ColorTranslate).setBrightness(FashionConfig.pToB(c.brightness / 100));
            })
        }
        this.refreshCost();
    }

    async addDye () {
        if (this.fashion == undefined) {
            return;
        }
        let check = (x, y) => { 
            if (Math.round(x) == y) {
                return -1;
            } else {
                return Math.round(x);
            }
        }
        if (this.defaultColor) {
            let cts = this.partSps.map(x => x.getComponent(ColorTranslate));
            let hs = R.zipWith(check, cts.map(x => Math.round(x.hue)), this.defaultColor.map(x => x.color));
            let ss = R.zipWith(check, cts.map(x => Math.round(x.saturation * 100)), this.defaultColor.map(x => x.saturation));
            let bs = R.zipWith(check, cts.map(x => Math.round(FashionConfig.bToP(x.brightness) * 100)), this.defaultColor.map(x => x.brightness));
            if ((await this.getCost() == 0)) {
                TipsManager.showMessage('还未进行染色修改');
                return;
            } else {
                let panel = await CommonUtils.getPanel('gameplay/fashion/fashionSaveDyePanel', FashionSaveDyePanel) as FashionSaveDyePanel;
                panel.init(this.fashion, hs, ss, bs);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            }
        }
    }

    async refreshCost() {
        let cost = await this.getCost();
        this.costLabel.string = `/${cost}`;
    }

    async getCost () {
        let check = (x, y) => { 
            if (Math.round(x) == y) {
                return -1;
            } else {
                return Math.round(x);
            }
        }
        
        if (this.fashion == undefined) {
            return;
        }
        let model = await FashionConfig.getCostModel(this.fashion.definitionId);
        if (this.defaultColor && model.valid ) {
            let cts = this.partSps.map(x => x.getComponent(ColorTranslate));
            let hs = R.zipWith(check, cts.map(x => Math.round(x.hue)), this.defaultColor.map(x => x.color));
            let ss = R.zipWith(check, cts.map(x => Math.round(x.saturation * 100)), this.defaultColor.map(x => x.saturation));
            let bs = R.zipWith(check, cts.map(x => Math.round(FashionConfig.bToP(x.brightness) * 100)), this.defaultColor.map(x => x.brightness));

            let cost = 0;
            for (let i = 0; i < 3; ++i) {
                const hc = hs[i] == -1 ? 0 : model.val.dyeCost[0].colorCost;
                const sc = ss[i] == -1 ? 0 : model.val.dyeCost[0].saturationCost;
                const bc = bs[i] == -1 ? 0 : model.val.dyeCost[0].brightnessCost;
                cost += (hc + sc + bc);
            }
            return cost;
        }
        return 0;
    }

     /******** end Events ********/
    
}