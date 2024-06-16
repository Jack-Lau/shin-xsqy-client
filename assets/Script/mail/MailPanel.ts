import { Notify } from "../config/Notify";
import { NetUtils } from "../net/NetUtils";
import MailItem from "./MailItem";
import { ReddotUtils } from "../utils/ReddotUtils";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class MailPanel extends cc.Component {
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;

    @property(cc.Button)
    deleteBtn: cc.Button = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    blockImage: cc.Sprite = null;

    @property(cc.Sprite)
    emptyImage: cc.Sprite = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;

    page = 0;
    size = 10;

    start() {
        this.node.on(Notify.MAIL_PANEL_OPEN_DETAIL, this.openDetail.bind(this));
        this.node.on(Notify.MAIL_PANEL_DELETE_MAIL, this.onDeleteMail.bind(this));
        this.deleteBtn.node.on(cc.Node.EventType.TOUCH_END, this.oneKeyDelete.bind(this));
        this.scroll.node.on('scroll-to-bottom', this.getNewMail.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockImage.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.init();
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/mail/view/mine', [this.page, this.size]) as any;
        if (response.status == 0) {
            let arr = response.content;
            let length = arr.length;

            for (let i = 0; i < length; ++i) {
                let mailItem = cc.instantiate(this.itemPrefab).getComponent(MailItem);
                mailItem.init(i, arr[i]);
                mailItem.shrinkDetail();
                mailItem.node.x = 0;
                mailItem.node.parent = this.scroll.content;
            }
            this.emptyImage.node.active = length == 0;
        }
    }

    openDetail(event: cc.Event.EventCustom) {
        let index = event.detail.index;
        let realIndex = 0;
        let length = this.scroll.content.children.length;

        for (let i = 0; i < length; ++i) {
            let child = this.scroll.content.children[i];
            let mailItem = child.getComponent(MailItem) as MailItem;
            if (index != mailItem.index) {
                mailItem.shrinkDetail();
            } else {
                realIndex = i;
            }
        }

        let height = 114 * (length - 1) + 575;
        let scrollH = 114 * realIndex;

        if (height < 700) {
            this.scroll.scrollToPercentVertical(1, 0.1);
        } else {
            if (scrollH > height - 700) {
                this.scroll.scrollToPercentVertical(0, 0.1);
            } else {
                let percent = this.getPercent(realIndex);
                this.scroll.scrollToPercentVertical(percent, 0.2);
            }
        }
    }

    getPercent(index) {
        let length = this.scroll.content.children.length;
        let ch = 114 * (length - 1) + 575;
        let vh = 700;
        let ih = 114;
        let sh = ch - vh;
        return (ch - vh - index * ih) / sh;
    }

    async oneKeyDelete() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mail/deleteNeedless', []) as any;
        if (0 == response.status) {
            this.scroll.content.removeAllChildren();
            this.page = 0;
            this.size = 10;
            this.init();
        }
    }

    async getNewMail() {
        let length = this.scroll.content.children.length;
        let size = this.size;
        let page = Math.floor(length / this.size);
        let index = length % this.size;
        if (index != 0) {
            size = this.size * 2;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/mail/view/mine', [page, size]) as any;
        if (response.status == 0) {
            let arr = response.content;
            let length = arr.length;
            for (let i = index; i < length; ++i) {
                let mailItem = cc.instantiate(this.itemPrefab).getComponent(MailItem);
                mailItem.init(i + page * this.size, arr[i]);
                mailItem.shrinkDetail();
                mailItem.node.x = 0;
                mailItem.node.parent = this.scroll.content;
            }
        }
    }

    onDeleteMail(event: cc.Event.EventCustom) {
        let index = event.detail.index;
        let length = this.scroll.content.children.length;
        for (let i = 0; i < length; ++i) {
            let child = this.scroll.content.children[i];
            let mailItem = child.getComponent(MailItem) as MailItem;
            if (index < mailItem.index) {
                mailItem.index -= 1;
            }
        }
    }

    closePanel() {
        if (this.node.parent) {
            this.node.parent.removeChild(this.node);
            ReddotUtils.checkMail();
        }
    }
    // update (dt) {}
}
