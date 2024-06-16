import TextTitleTips from "./TextTitleTips";
import PicTitleTips from "./PicTitleTips";
import { CommonUtils } from "../../utils/CommonUtils";
import Optional from "../../cocosExtend/Optional";
import { TitleConfig } from "./TitleConfig";
import { Title } from "../../net/Protocol";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class TitleTips extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(TextTitleTips)
    textTitle: TextTitleTips = null;
    @property(PicTitleTips)
    picTitle: PicTitleTips = null;

    start() {
        this.initEvents();
    }

    initEvents() {
        this.blockNode.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.textTitle.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.picTitle.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
    }

    async initTitle(title: Title) {
        let config = await TitleConfig.getConfigById(title.definitionId);
        let isPic = config.type == 1;
        this.picTitle.node.active = isPic;
        this.textTitle.node.active = !isPic;
        if (isPic) { // 图片
            this.picTitle.init(config, title.number, title.tradeLockTime)
        } else {
            this.textTitle.init(config, title.number)
        }
    }

    async initTitleById(titleId: number, serialNum: string) {
        let config = await TitleConfig.getConfigById(titleId);
        let isPic = config.type == 1;
        this.picTitle.node.active = isPic;
        this.textTitle.node.active = !isPic;
        if (isPic) { // 图片
            this.picTitle.init(config, serialNum, null)
        } else {
            this.textTitle.init(config, serialNum)
        }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}
