import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { YxjyRecord } from "../../net/Protocol";
import { precondition, randomInt } from "../../utils/BaseFunction";
import PlayerData from "../../data/PlayerData";
import { YxjyData } from "./YxjyData";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class YxjyEatPanel extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Sprite)
    textSp: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    readonly textIamgeSourceArray = [
        "font_hongsushouhuangtengjiu",
        "font_meifengjiajie",
        "font_meiyoujieshiyidun",
        "font_shishiwuzhe",
        "font_tianzengsuiyue"
    ]

    start () {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.textSp.spriteFrame = this.atlas.getSpriteFrame(this.textIamgeSourceArray[randomInt(0, 5)]);
    }

    async closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}