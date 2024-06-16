import { CommonUtils } from "../../utils/CommonUtils";
import FashionMainPanel from "./FashionMainPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import MysteryStorePanel from "../mysteryStore/MysteryStorePanel";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionExhibitePanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;

    @property(cc.Button)
    leftBtn: cc.Button = null;
    @property(cc.Button)
    rightBtn: cc.Button = null;

    @property(cc.Button)
    gotoBtn: cc.Button = null;

    @property(cc.Node)
    blockNode: cc.Node = null;

    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.leftBtn.node.on(cc.Node.EventType.TOUCH_END, this.leftBtnOnClick.bind(this));
        this.rightBtn.node.on(cc.Node.EventType.TOUCH_END, this.rightBtnOnClick.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 29));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.gotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.goto.bind(this));
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    leftBtnOnClick () {
        let index = CommonUtils.getCheckedIndex(this.container);
        let newIndex = (index - 1 + 4) % 4;
        this.container.toggleItems[newIndex].check();
    }

    rightBtnOnClick () {
        let index = CommonUtils.getCheckedIndex(this.container);
        let newIndex = (index + 1 + 4) % 4;
        this.container.toggleItems[newIndex].check();
    }

    async goto () {
        this.closePanel();
        let panel = await CommonUtils.getPanel('gameplay/mysteryStore/mysteryStorePanel', MysteryStorePanel) as MysteryStorePanel;
        await CommonUtils.wait(0.2);
        panel.container.toggleItems[1].check();
        panel.drawNode.active = true;
        panel.exchangeNode.active = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
}