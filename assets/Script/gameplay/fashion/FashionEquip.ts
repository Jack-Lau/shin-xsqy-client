import { FashionDye, Fashion } from "../../net/Protocol";
import ColorTranslate from "../../cocosExtend/shader/ColorTranslate";
import Optional from "../../cocosExtend/Optional";
import { FashionConfig } from "./FashionConfig";
import FashionModel from "./FashionModel";
import { CommonUtils } from "../../utils/CommonUtils";
import FashionSwitchDyePanel from "./FashionSwitchDyePanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class FashionEquip extends cc.Component {
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;

    @property(cc.Label)
    currentThemeNameLabel: cc.Label = null;
    @property(cc.Button)
    switchDyeBtn: cc.Button = null;
    
    @property([cc.Sprite])
    parts: Array<cc.Sprite> = [];

    @property(cc.Button)
    armBtn: cc.Button = null;
    @property(cc.Button)
    disArmBtn: cc.Button = null;

    fashionModel: FashionModel = null;
    definitionId: number = 0;
    fashion: Fashion = null;

    start () {
        this.switchDyeBtn.node.on(cc.Node.EventType.TOUCH_END, this.switchDye, this);
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.toNormal, this);
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.toBattle, this);
    }

    async init(fashionDye: Optional<FashionDye>, fashion: Fashion, fashionModel: FashionModel) {
        this.fashionModel = fashionModel;
        this.definitionId = fashion.definitionId;
        this.fashion = fashion;
        this.fashionModel.setDye(fashionDye, fashion.definitionId);

        let defaultColor = await FashionConfig.getDefaultColor2(fashion.definitionId)
        if (fashionDye.valid) {
            this.currentThemeNameLabel.string = '当前染色  ' + fashionDye.val.dyeName;
            this.parts.forEach((part, index) => {
                let h = R.prop(`part_${index+1}_color`, fashionDye.val);
                let s = R.prop(`part_${index+1}_saturation`, fashionDye.val);
                let b = R.prop(`part_${index+1}_brightness`, fashionDye.val);

                let colorTrans = part.getComponent(ColorTranslate);
                colorTrans.setColor(
                    h == -1 ? defaultColor[index].color : h,
                    (s == -1 ? defaultColor[index].saturation : s) / 100,
                    FashionConfig.pToB((b == -1 ? defaultColor[index].brightness: b) / 100),
                );
            });
        } else {
            this.currentThemeNameLabel.string = '当前染色  默认';
            
            this.parts.forEach((part, index) => {
                let colorTrans = part.getComponent(ColorTranslate);
                colorTrans.setColor(
                    defaultColor[index].color,
                    defaultColor[index].saturation / 100,
                    FashionConfig.pToB(defaultColor[index].brightness  / 100),
                );
            });
            
        }
    }

    async switchDye () {
        if (!this.definitionId) {
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/fashion/fashionDyeSwitchPanel', FashionSwitchDyePanel) as FashionSwitchDyePanel;
        let dyes = await FashionConfig.getDyes(this.definitionId);
        panel.init(dyes, this.fashion);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    toNormal () {
        this.fashionModel && this.fashionModel.switchToNormal();
    }

    toBattle () {
        this.fashionModel && this.fashionModel.switchToBattle();
    }

}