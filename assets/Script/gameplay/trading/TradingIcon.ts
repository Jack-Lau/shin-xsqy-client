import ItemFrame from "../../base/ItemFrame";
import ItemConfig, { ItemCategory, PetQuality, ItemQuality } from "../../bag/ItemConfig";
import { ItemType } from "../../setting/wallet/WalletPanelDataStructure";
import { PetData } from "../pet/PetData";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";
import { Equipment, PetDetail, Consignment, CurrencyRecord, Title } from "../../net/Protocol";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CommonUtils } from "../../utils/CommonUtils";
import EquipmentTips from "../equipment/tips/EquipmentTips";
import BagItem from "../../bag/BagItem";
import ItemTips from "../bag/ItemTips";
import TitleTips from "../../player/title/TitleTips";
import PetTips from "../pet/PetTips";

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
export enum TradingGoodsType {
    Shelves = 0, Noton, Obtain, Add
}
export enum ConsignmentType {
    Shelves = 0, Noton, Obtain, Add
}
@ccclass
export default class TradingIcon extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(ItemFrame)
    iconBox: ItemFrame = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;

    iconType = 0;
    iconData = null;

    start() {
        this.icon.node.on(cc.Node.EventType.TOUCH_END, this.articleTips.bind(this));
    }

    async setIcon(type, id, data, number = 0) {
        if (!cc.isValid(type)) {
            type = 0;
        }
        this.iconType = type;
        this.iconData = data;
        if (type == ItemCategory.Currency) {
            let display = ItemConfig.getInstance().getItemDisplayById(id, PlayerData.getInstance().prefabId);
            this.icon.spriteFrame = await ResUtils.getCurrencyIconbyId(display.getValue().iconId);
            this.iconBox.init(display.val.quality, display.val.showBorderEffect);
            this.levelLabel.string = '';
        } else if (type == ItemCategory.Equipment) {
            let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(id);
            let display = ItemConfig.getInstance().getItemDisplayById(id, PlayerData.getInstance().prefabId);
            if (prototype.isValid() && display.isValid()) {
                this.icon.spriteFrame = await ResUtils.getEquipmentIconById(display.getValue().iconId);
                this.iconBox.init(prototype.getValue().quality, display.getValue().showBorderEffect || (number >= 10 ? true : false));
            }
            this.levelLabel.string = number > 0 ? `+${number}` : '';
        } else if (type == 0) {//pet
            let config = await PetData.getConfigById(id);
            if (config.isValid()) {
                let iconID = config.getValue().prefabId;
                this.icon.spriteFrame = await ResUtils.getPetHeadIconById(iconID);
                await this.toColor(this.iconBox, config.getValue().color, number);
            }
            this.levelLabel.string = number > 0 ? `+${number}` : '';
        } else if (type == ItemCategory.Title) {
            let display = ItemConfig.getInstance().getItemDisplayById(id, PlayerData.getInstance().prefabId);
            if (display.isValid()) {
                this.icon.spriteFrame = await ResUtils.getBagTitleIcon();
                this.iconBox.init(display.val.quality, display.val.showBorderEffect);
            }
            this.levelLabel.string = '';
        }
    }

    async toColor(effect, color: number, rank: number) {
        switch (color) {
            case PetQuality.Green:
                effect.init(ItemQuality.Green, false);
                break;
            case PetQuality.Blue:
                effect.init(ItemQuality.Blue, false);
                break;
            case PetQuality.Purple:
                effect.init(ItemQuality.Purple, false);
                break;
            case PetQuality.Orange:
            case PetQuality.Shen:
                effect.init(ItemQuality.Orange, rank >= 10 ? true : false);
                break;
            default:
                effect.node.active = false;
                return;
        }
        effect.node.active = true;
    }

    async articleTips(event: cc.Event.EventTouch) {

        if (this.iconType == ItemCategory.Equipment) {
            let article = new BagItem();
            article.category = ItemCategory.Equipment;
            article.data = this.iconData;
            let panel = await CommonUtils.getPanel('gameplay/equipment/equipmentTips', EquipmentTips) as EquipmentTips;
            panel.init(article);
            panel.removeButtons();
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.iconType == ItemCategory.Currency) {
            let article = new BagItem();
            article.category = ItemCategory.Currency;
            article.data = {} as CurrencyRecord;
            article.data.accountId = PlayerData.getInstance().accountId;
            article.data.amount = this.iconData;
            article.data.currencyId = 151;
            let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
            panel.init(article.getItemDisplay(), R.prop('amount', article.data), false);
            let location = event.getLocationInView();
            let func = R.compose(
                R.min(768 / 2 - panel.tipNode.width / 2),
                R.max(panel.tipNode.width / 2 - 768 / 2)
            );
            panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
            panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.iconType === ItemCategory.Title) {
            let tips = await CommonUtils.getPanel('player/title/titleTips', TitleTips) as TitleTips;
            tips.initTitle(this.iconData as Title);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: tips });
        } else if (this.iconType === 0) {
            let panel = await CommonUtils.getPanel('gameplay/pet/petTips', PetTips) as PetTips;
            panel.init(this.iconData);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

}
