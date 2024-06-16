import { NetUtils } from "../net/NetUtils";
import { CommonUtils } from "../utils/CommonUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class PlayerUsedNameTips extends cc.Component {
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Sprite)
    contentBg: cc.Sprite = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Label)
    noneLabel: cc.Label = null;

    start () {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.contentBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    async init (accountId: number) {
        let names = (await NetUtils.get<Array<string>>('/player/viewNameUsed/{id}', [accountId])).getOrElse([]);
        if (names.length > 0) {
            this.noneLabel.node.active = false;
            names.forEach(name => {
                let label = cc.instantiate(this.noneLabel.node).getComponent(cc.Label);
                label.string = name;
                label.node.active = true;
                label.node.parent = this.scroll.content;
            })
        }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}