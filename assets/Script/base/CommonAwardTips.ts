import { CommonUtils } from "../utils/CommonUtils";
import ItemWithEffect from "./ItemWithEffect";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

/**
 * ExhibitAward 所配置的AwardId, 必须要在ItemDisplay中配置
 */
export interface ExhibitAward {
    awardId: number,
    amount: number,
}

export interface AwardTipsData {
    title: string;
    description: string;
    awards: Array<ExhibitAward>;
}

const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonAwardTips extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Node)
    tipsNode: cc.Node = null;
    @property(cc.Node)
    rootNode: cc.Node = null;

    @property(cc.Sprite)
    bgSp: cc.Sprite = null;

    @property(cc.Layout)
    contentGroup: cc.Layout = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    descriptionLabel: cc.Label = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    @property(cc.Node)
    arrowNode: cc.Node = null;

    start () {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.tipsNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    init (data: AwardTipsData) {
        this.initAwards(data.awards);
        this.titleLabel.string = data.title;
        this.descriptionLabel.string = data.description;
    }

    initAwards (awards: Array<ExhibitAward>) {
        if (awards.length == 0) {
            return;
        }
        awards.forEach(award => {
            let item = cc.instantiate(this.itemPrefab).getComponent(ItemWithEffect);
            item.initWithExhibitAward(award);
            item.node.y = 0;
            item.node.parent = this.contentGroup.node;
            item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showCurrencyTips({currencyId: award.awardId, amount: award.amount}, false));
        });
        let length = awards.length;
        this.bgSp.node.width = (92 * length + 12 * (length - 1)) + 46;
    }

    setPosition (position: cc.Vec2) {
        this.rootNode.x = position.x;
        this.rootNode.y = position.y;
    }

    setTipsX(x: number) {
        this.tipsNode.x = x;
    }

    closePanel () {
        CommonUtils.safeRemove(this.node)
    }
}
