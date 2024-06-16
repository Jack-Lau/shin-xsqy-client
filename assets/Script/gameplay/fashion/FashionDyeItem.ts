import FashionModel from "./FashionModel";
import { FashionDye, Fashion } from "../../net/Protocol";
import { FashionConfig } from "./FashionConfig";
import Optional from "../../cocosExtend/Optional";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionDyeItem extends cc.Component {
    @property(FashionModel)
    model: FashionModel = null;
    @property(cc.Node)
    useFlagNode: cc.Node = null;
    @property(cc.Node)
    selectedNode: cc.Node = null;
    
    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    
    @property(cc.Button)
    leftRotateBtn: cc.Button = null;
    @property(cc.Button)
    rightRotateBtn: cc.Button = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Sprite)
    bgSp: cc.Sprite = null;

    isPutOff: boolean = false;

    start () {
        this.initEvents();
    }

    init(definitionId: number, dye: FashionDye, using: boolean) {
        this.isPutOff = false;
        let prefabId = FashionConfig.getPrefabId(definitionId);
        this.model.init(prefabId)
        this.model.switchToNormal();
        this.model.setDye(Optional.Just(dye), definitionId);
        this.nameLabel.string = dye.dyeName;
        this.useFlagNode.active = using;
    }

    async initWithDefault (fashion: Fashion) {
        let color = await FashionConfig.getDefaultColor2(fashion.definitionId);
        this.useFlagNode.active = false;
        this.model.init(FashionConfig.getPrefabId(fashion.definitionId));
        this.model.switchToNormal();
        this.nameLabel.string = "默认方案";
        this.isPutOff = true;
        if (color) {
            color.forEach((c, index) => {
                this.model.setHue(index, c.color);
                this.model.setSaturation(index, c.saturation / 100);
                this.model.setBrightness(index, FashionConfig.pToB(c.brightness / 100));
            })
        }
    }

    initEvents () {
        this.leftRotateBtn.node.on(cc.Node.EventType.TOUCH_END, this.leftRotateOnClick, this);
        this.rightRotateBtn.node.on(cc.Node.EventType.TOUCH_END, this.rightRotateOnClick, this);
        this.container.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.toNormal, this);
        this.container.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.toBattle, this);
    }

    leftRotateOnClick () {
        this.model.counterClockwiseRotate();
    }

    rightRotateOnClick () {
        this.model.clockwiseRotate();
    }
    
    toNormal () {
        this.model.switchToNormal();
    }

    toBattle () {
        this.model.switchToBattle();
    }

}