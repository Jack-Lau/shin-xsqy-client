import { CommonUtils } from "../utils/CommonUtils";
import { Notify } from "../config/Notify";
import Item from "../base/Item";
import { NetUtils } from "../net/NetUtils";
import { TipsManager } from "../base/TipsManager";
import ItemWithEffect from "../base/ItemWithEffect";
import { CurrencyId } from "../config/CurrencyId";
import ItemConfig, { ItemQuality } from "../bag/ItemConfig";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MailItem extends cc.Component {
    @property(cc.Sprite)
    topBgSprite: cc.Sprite = null;

    @property(cc.Sprite)
    expandImage: cc.Sprite = null;

    @property(cc.Sprite)
    detailGroup: cc.Sprite = null;

    @property(cc.Sprite)
    iconItem: cc.Sprite = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Label)
    contentTitle: cc.Label = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Label)
    descriptionLabel: cc.Label = null;

    @property(cc.Label)
    noteLabel: cc.Label = null;

    @property(cc.ScrollView)
    attachScroll: cc.ScrollView = null;

    @property(cc.Sprite)
    redDot: cc.Sprite = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    btnImage: cc.Sprite = null;

    @property(cc.SpriteFrame)
    deleteSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    deliverSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    openBgSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    closeBgSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    emptySf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    attachSf: cc.SpriteFrame = null;

    @property(cc.Sprite)
    attach: cc.Sprite = null;

    expand: boolean = true;
    rotation: number = 0;
    tweenIsOn: boolean = false;
    index = 3;
    data = null;

    start () {
        this.topBgSprite.node.on(cc.Node.EventType.TOUCH_END, this.expandTween.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmBtnOnClick.bind(this));
    }

    init (index: number, data) {
        this.data = data;
        let date = new Date(data.createTime);
        this.timeLabel.string = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        this.titleLabel.string = data.title;
        this.contentTitle.string = data.title;
        this.descriptionLabel.string = data.content;

        this.attachScroll.content.removeAllChildren();
        if (!data.attachmentDelivered) {
            for (let attach of data.attachmentAsCurrencyStacks) {
                let id = attach.currencyId;
                let amount = attach.amount;
                if (id === 151) amount = Math.floor(amount / 1000);
                let item = cc.instantiate(this.itemPrefab).getComponent(ItemWithEffect);
                item.node.y = 0;
                item.initWithCurrency({currencyId: id, amount: amount});
                item.node.parent = this.attachScroll.content;
            }
            this.btnImage.spriteFrame = this.deliverSf;
            this.iconItem.spriteFrame = this.attachSf;
        } else {
            this.btnImage.spriteFrame = this.deleteSf;
            this.iconItem.spriteFrame = this.emptySf;
        }
        this.attach.node.active = !data.attachmentDelivered;

        let deleteDate = new Date(data.createTime + 14 * 86400 * 1000);
        this.noteLabel.string = "邮件将于" + (deleteDate.getMonth() + 1) + "月" + deleteDate.getDate() + "日自动删除"

        this.redDot.node.active = !data.alreadyRead;
        this.index = index;
    }

    shrinkDetail() {
        this.expand = false;
        this.node.height = 110;
        this.detailGroup.node.active = false;
        this.expandImage.node.rotation = -90;
        this.rotation = -90;
        this.topBgSprite.spriteFrame = this.closeBgSf;
    }

    expandDetail() {
        if (this.expand) {
            this.node.height = 110;
            this.detailGroup.node.active = false;
            this.topBgSprite.spriteFrame = this.closeBgSf;
        } else {
            this.node.height = 575;
            this.detailGroup.node.active = true;
            this.topBgSprite.spriteFrame = this.openBgSf;
        }
        this.expand = !this.expand;
    }

    async confirmBtnOnClick() {
        if (this.data && this.data.attachmentDelivered) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mail/action/{mailId}/delete', [this.data.id]) as any;
            if (response.status == 0) {
                let event = new cc.Event.EventCustom(Notify.MAIL_PANEL_DELETE_MAIL, true);
                event.detail = {
                    index: this.index
                }
                this.node.dispatchEvent(event);
                CommonUtils.safeRemove(this.node);
            }
        } else if (this.data && !this.data.attachmentDelivered) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mail/action/{mailId}/obtainAttachment', [this.data.id]) as any;
            if (response.status == 0) {
                TipsManager.showMessage('附件领取成功！');
				//
                for (let attach of this.data.attachmentAsCurrencyStacks) {
                    if (attach.currencyId == CurrencyId.仙石) {
                        TipsManager.showMessage("获得 " + Math.floor(attach.amount / 1000) + "<img src='currency_icon_151'/>");
                    } else {
						let display = ItemConfig.getInstance().getItemDisplayById(attach.currencyId, null);
						let color = CommonUtils.getTipColorByQuality(display.fmap(x => x.quality).getOrElse(ItemQuality.Blue));
						let name = display.fmap(x => x.name).getOrElse('未知领域');
						let icon = display.fmap(x => x.iconId).getOrElse(20028);
                        TipsManager.showMessage(`获得 ${attach.amount}<img src='currency_icon_${icon}'/><color=${color}>${name}</c>`);
                    }
                }
                this.init(this.index, response.content);
            }
        }
    }

    async expandTween() {
        if (this.tweenIsOn) {
            return;
        }
        this.tweenIsOn = true;
        if (this.rotation == 0) {
            let action = cc.rotateTo(0.12, -90);
            this.expandImage.node.runAction(action);
            await CommonUtils.wait(0.12);
            this.expandDetail();
            this.rotation = -90;
        } else {
            let action = cc.rotateTo(0.12, 0);
            this.expandImage.node.runAction(action);
            await CommonUtils.wait(0.12);
            this.expandDetail();
            this.rotation = 0;
        

            let event = new cc.Event.EventCustom(Notify.MAIL_PANEL_OPEN_DETAIL, true);
            event.detail = {
                index: this.index
            }
            this.node.dispatchEvent(event);

            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/mail/action/{mailId}/markAlreadyRead', [this.data.id]) as any;
            if (response.status == 0) {
                this.redDot.node.active = false;   
            }
        }
        this.tweenIsOn = false;
    }

    // update (dt) {}
}
