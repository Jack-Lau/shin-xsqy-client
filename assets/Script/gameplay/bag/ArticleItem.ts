import BagItem from "../../bag/BagItem";
import { ItemCategory, ItemQuality } from "../../bag/ItemConfig";
import { ResUtils } from "../../utils/ResUtils";
import { CurrencyRecord, Equipment, Title } from "../../net/Protocol";
import EquipmentTips from "../equipment/tips/EquipmentTips";
import { CommonUtils } from "../../utils/CommonUtils";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import ItemTips from "./ItemTips";
import ItemFrame from "../../base/ItemFrame";
import TitleTips from "../../player/title/TitleTips";
import { PetData } from "../pet/PetData";
import { FashionConfig } from "../fashion/FashionConfig";
import { CurrencyId } from "../../config/CurrencyId";


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
export default class ArticleItem extends cc.Component {
    @property(ItemFrame)
    frame: ItemFrame = null;
    @property(cc.Sprite)
    articleIcon: cc.Sprite = null;
    @property(cc.Sprite)
    effect: cc.Sprite = null;
    @property(cc.Label)
    number: cc.Label = null;
    article: BagItem = null;

    isFromBag: boolean = false;
    
    private isUse: boolean = true;
    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.articleTips.bind(this));
    }
    
    async init(article: BagItem, isFromBag: boolean = false) {
        this.article = article;
        this.isFromBag = isFromBag;
        let prototype = this.article.getPrototype();
        let display = this.article.getItemDisplay();
    
        if (prototype.isValid() && display.isValid()) {
            this.frame.init(prototype.getValue().quality, display.getValue().showBorderEffect || ((this.article.data as Equipment).enhanceLevel >= 10 ? true : false));
        }
        if (display.isValid()) {
            if (this.article.category === ItemCategory.Currency) {
                this.articleIcon.spriteFrame = await ResUtils.getCurrencyIconbyId(display.getValue().iconId);
                await this.frame.init(display.val.quality, display.val.showBorderEffect);
            } else if (this.article.category === ItemCategory.Equipment) {
                this.articleIcon.spriteFrame = await ResUtils.getEquipmentIconById(display.getValue().iconId);
            } else if (this.article.category === ItemCategory.Title) {
                this.articleIcon.spriteFrame = await ResUtils.getBagTitleIcon();
                this.frame.init(display.val.quality, display.val.showBorderEffect);
            } else if (this.article.category === ItemCategory.JustShow) {
                let iconId = display.getValue().iconId;
                if (iconId == 4410003 || iconId == 4410004) {
                    iconId = 4410002;
                }
                this.articleIcon.spriteFrame = await ResUtils.getExhibitIcon(iconId, !isFromBag);
                this.frame.init(display.val.quality, display.val.showBorderEffect);
            } else if (this.article.category === ItemCategory.Fashion) {
                this.articleIcon.spriteFrame = await ResUtils.getExhibitIcon(display.val.iconId, true);
                this.frame.init(display.val.quality, display.val.showBorderEffect);
            }
        }
        if (this.article.category === ItemCategory.Currency) {
            let currencyRecord: CurrencyRecord = this.article.data as CurrencyRecord;
            let amount = currencyRecord.amount;
            if (currencyRecord.currencyId == 151) {
            	amount = CommonUtils.toCKb(amount);
            }
            this.number.string = (amount > 1) ? CommonUtils.formatCurrencyAmount(amount) + '' : ''
        } else if (this.article.category === ItemCategory.Equipment) {
            let enhanceLevel = (this.article.data as Equipment).enhanceLevel;
            this.number.string = enhanceLevel > 0 ? `+${enhanceLevel}` : '';
        } else if (this.article.category === ItemCategory.Title) {
            this.number.string = ''
        } else if (this.article.category === ItemCategory.Fashion) {
            this.number.string = ''
        }
    }
    
    async articleTips(event: cc.Event.EventTouch) {
        if (!this.article) return;
        if (this.article.category === ItemCategory.Equipment) {
            let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
            panel.init(this.article);
            if (this.isFromBag) {
                panel.leftBase.exchangeBtn.node.active = false;
            } else {
                panel.removeButtons();
            }
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.article.category === ItemCategory.Currency) {
            let currencyId = R.prop('currencyId', this.article.data);
            if (currencyId == CurrencyId.神兽精魄) {
                CommonUtils.showGodPetJPTips({currencyId: currencyId, amount: R.prop('amount', this.article.data)}, this.isUse)(event);
                return;
            }
            let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
			//
			let currencyRecord: CurrencyRecord = this.article.data as CurrencyRecord;
            let amount = currencyRecord.amount;
            if (currencyRecord.currencyId == 151) {
            	amount = CommonUtils.toCKb(amount);
            }
            panel.init(this.article.getItemDisplay(), amount, this.isUse);
            let location = event.getLocationInView();
            let func = R.compose(
                R.min(768 / 2 - panel.tipNode.width / 2),
                R.max(panel.tipNode.width / 2 - 768 / 2)
            );
            panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
            panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.article.category === ItemCategory.Title) {
            let tips = await CommonUtils.getPanel('player/title/titleTips', TitleTips) as TitleTips;
            tips.initTitle(this.article.data as Title);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: tips });
        } else if (this.article.category === ItemCategory.JustShow) {
            let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
            panel.initJustShow(this.article.getItemDisplay(), R.prop('amount', this.article.data));
            let location = event.getLocationInView();
            let func = R.compose(
                R.min(768 / 2 - panel.tipNode.width / 2),
                R.max(panel.tipNode.width / 2 - 768 / 2)
            );
            panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
            panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.article.category === ItemCategory.Fashion) {
            FashionConfig.showFashionTips(this.article.data);
        }
    }
    
    setIsUse(flag: boolean) {
        this.isUse = flag;
    }
    
    showStrengthening(article: BagItem) {
        if (article.category === ItemCategory.Equipment) {
            let equipment: Equipment = article.data as Equipment;
            if (equipment.enhanceLevel == 0) return;
            this.number.string = '+' + equipment.enhanceLevel.toString();
        }
    }
    
    /**清空背包格 */
    recovery() {
        this.article = null;
        this.articleIcon.spriteFrame = null;
        this.frame.itemFrame.spriteFrame = null;
        this.frame.effectSprite.node.active = false;
        this.effect.spriteFrame = null;
        this.number.string = "";
    }

}
