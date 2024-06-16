import { CommonUtils } from "../../utils/CommonUtils";
import { Equipment } from "../../net/Protocol";
import { EquipUtils } from "./utils/EquipmentUtils";
import PlayerData from "../../data/PlayerData";
import { ItemQuality } from "../../bag/ItemConfig";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import BagData from "../../bag/BagData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipmentExhibitPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Sprite)
    iconSp: cc.Sprite = null;
	@property(cc.Sprite)
    colorSprite: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Layout)
    starsLayout: cc.Layout = null;

    @property([cc.Label])
    attrLabels: Array<cc.Label> = [];
    @property(cc.Label)
    attrRangeLabels: Array<cc.Label> = [];

    @property(cc.Button)
    confirmBtn: cc.Button = null;
	
	@property(cc.SpriteAtlas)
    qualityAtlas: cc.SpriteAtlas = null;
	@property(cc.Sprite)
	bgLighting: cc.Sprite;

    equipment: Optional<Equipment> = Optional.Nothing();

    start () {
		const action = cc.repeatForever(cc.rotateTo(0.5, 360))
		this.bgLighting.node.runAction(action)
		//
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.iconSp.node.on(cc.Node.EventType.TOUCH_END, this.showTips.bind(this));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    init (e: Equipment) {
        BagData.getInstance().pushEquipmentToBag(e, false);
        this.equipment = Optional.Just(e);
        let display = EquipUtils.getDisplay(e, PlayerData.getInstance().prefabId);
        let proto = EquipUtils.getProto(e);
        if (!display.valid && !proto.valid) {
            return;
        }
		this.colorSprite.spriteFrame = this.qualityAtlas.getSpriteFrame(this.getQuality(proto.val.quality));
        this.nameLabel.string = display.val.name;
		this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(proto.val.quality));
        this.starsLayout.node.children.forEach((node, index) => {
            node.active = index < e.maxEnhanceLevel;
        });
        let baseAttr1 = R.path(['baseParameters', 0, 'value'], e);
        let baseAttr2 = R.path(['baseParameters', 1, 'value'], e);
        this.attrLabels[0].string = R.path(['baseParameters', 0, 'name'], e).replace('最大生命', '气血').replace("物伤", "外伤").replace("物防", "外防").replace("法伤", "内伤").replace("法防", "内防") + ' +' + String(baseAttr1);
        this.attrRangeLabels[0].string = `(${proto.val.attr1.min}~${proto.val.attr1.max})`;
        this.attrLabels[1].string = R.path(['baseParameters', 1, 'name'], e).replace('最大生命', '气血').replace("物伤", "外伤").replace("物防", "外防").replace("法伤", "内伤").replace("法防", "内防") + ' +' + String(baseAttr2);
        this.attrRangeLabels[1].string = `(${proto.val.attr2.min}~${proto.val.attr2.max})`;
        this.attrLabels[2].string = '最大强化等级 ' + R.prop('maxEnhanceLevel', e);
        this.attrRangeLabels[2].string = '(' + this.getRange(proto.val.quality) + ')';
        this.initIcon(display.val);
    }

    async initIcon (display) {
        this.iconSp.spriteFrame = await ResUtils.getEquipmentBigIcon(display.iconId);
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    showTips () {
        if (this.equipment.valid) {
            EquipUtils.showEquipmentTips(this.equipment.val)();
        }
    }

    getRange(quality: ItemQuality) {
        let getMin = _ => (_ - 2) * 3 + 1;
        let getMax = _ => (_ - 1) * 3;
        switch (quality) {
            case ItemQuality.Green: { return getMin(2) + '~' + getMax(2); }
            case ItemQuality.Blue: { return getMin(3) + '~' + getMax(3); }
            case ItemQuality.Purple: { return getMin(4) + '~' + getMax(4); }
            case ItemQuality.Orange: { return getMin(5) + '~' + getMax(5); }
            default: { return getMin(2) + '~' + getMax(2); }
        }
    }
	
	getQuality(q: ItemQuality) {
        switch (q) {
            case ItemQuality.Green: { return 'color_2'; }
            case ItemQuality.Blue: { return 'color_3'; }
            case ItemQuality.Purple: { return 'color_4'; }
            case ItemQuality.Orange: { return 'color_5'; }
            case ItemQuality.Gold: { return 'color_6'; }
            default:  { return 'color_2'; }
        }
    }

}