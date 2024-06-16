import ItemFrame from "./ItemFrame";
import ItemConfig, { ItemQuality } from "../bag/ItemConfig";
import { Equipment, CurrencyStack, Pet, PetDetail } from "../net/Protocol";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import { ResUtils } from "../utils/ResUtils";
import { PetData } from "../gameplay/pet/PetData";
import { CommonUtils } from "../utils/CommonUtils";
import PlayerData from "../data/PlayerData";
import { TitleConfig } from "../player/title/TitleConfig";
import { ExhibitAward } from "./CommonAwardTips";
import { ConfigUtils } from "../utils/ConfigUtil";

const { ccclass, property } = cc._decorator;

interface ItemWithEffectInitInfo {
    iconSf: cc.SpriteFrame,
    desc: string,
    color: ItemQuality,
    showEffect: boolean,
    cb: any
}

@ccclass
export default class ItemWithEffect extends cc.Component {
    @property(cc.Label)
    descLabel: cc.Label = null;
    @property(cc.Sprite)
    iconImage: cc.Sprite = null;
    @property(ItemFrame)
    frame: ItemFrame = null;

    data: Equipment | Pet | CurrencyStack = null;

    start() {

    }

    init(info: ItemWithEffectInitInfo) {
        this.frame.init(info.color, info.showEffect);
        this.iconImage.spriteFrame = info.iconSf;
        this.descLabel.string = info.desc;
        if (info.cb) {
            this.node.on(cc.Node.EventType.TOUCH_END, info.cb);
        }
    }

    async initWithEquipment(e: Equipment) {
        this.data = e;
        let display = EquipUtils.getDisplay(e);
        let prototype = EquipUtils.getProto(e);
        let iconSf = await ResUtils.getEquipmentIconById(display.val.iconId);
        let toStr = x => x == 0 ? '' : '+' + x.toString();
        let desc = toStr(e.enhanceLevel);
        let color = prototype.fmap(x => x.quality)
		let showEffect = display.fmap(x => x.showBorderEffect).getOrElse(false) || e.enhanceLevel >= 10
        let info = {
            iconSf: iconSf,
            desc: desc,
            color: color.getOrElse(null),
            showEffect,
            cb: null
        }
        this.init(info);
    }

    // async initWithCurrency(stack: CurrencyStack) {
    //     let iconSf = await ResUtils.getCurrencyIconbyId(stack.currencyId);
    //     let quality: ItemQuality = ItemQuality.Blue;
    //     this.init({
    //         iconSf: iconSf,
    //         desc: (stack.amount > 0) ? CommonUtils.formatCurrencyAmount(stack.amount) + '' : '',
    //         color: quality,
    //         showEffect: false,
    //         cb: null
    //     })
    // }

    async initWithCurrency(stack: CurrencyStack) {
        this.data = stack;
        let display = ItemConfig.getInstance().getItemDisplayById(stack.currencyId, PlayerData.getInstance().prefabId);
        let iconId = display.fmap(x => x.iconId).getOrElse(0);
        let iconSf = await ResUtils.getCurrencyIconbyId(iconId);
        let quality: ItemQuality = display.fmap(d => d.quality).getOrElse(ItemQuality.Blue);
        let showEffect = display.fmap(d => d.showBorderEffect).getOrElse(false);
        this.init({
            iconSf: iconSf,
            desc: (stack.amount > 1) ? CommonUtils.formatCurrencyAmount(stack.amount) + '' : '',
            color: quality,
            showEffect: showEffect,
            cb: null
        })
    }

    initWithExhibitAward(award: ExhibitAward) {
        this.initWithCurrency({ currencyId: award.awardId, amount: award.amount });
    }

    async initWithJustShow(stack: CurrencyStack, isBig = false) {
        this.data = stack;
        let display = ItemConfig.getInstance().getItemDisplayById(stack.currencyId, PlayerData.getInstance().prefabId);
        let iconId = display.fmap(x => x.iconId).getOrElse(0);
        let iconSf = await ResUtils.getExhibitIcon(iconId, isBig);
        let quality: ItemQuality = display.fmap(d => d.quality).getOrElse(ItemQuality.Blue);
        let showEffect = display.fmap(d => d.showBorderEffect).getOrElse(false);
        this.init({
            iconSf: iconSf,
            desc: (stack.amount > 1) ? CommonUtils.formatCurrencyAmount(stack.amount) + '' : '',
            color: quality,
            showEffect: showEffect,
            cb: null
        })
    }

    async initWithPet(pet: Pet) {
        this.data = pet;
        let config = await PetData.getConfigById(pet.definitionId)
        let prefabId = config.fmap(x => x.prefabId).getOrElse(0);
        let quality = config.fmap(x => x.color).fmap(PetData.getQualityByColor).getOrElse(ItemQuality.Blue);
        let iconSf = await ResUtils.getPetHeadIconById(prefabId);
        this.init({
            iconSf: iconSf,
            desc: '',
            color: quality,
            showEffect: this.data.rank >= 10 ? true : false,
            cb: null
        })
        this.iconImage.node.scaleX = 0.95;
        this.iconImage.node.scaleY = 0.95
    }

    async initWithTitle(titleId: number) {
        let config = await TitleConfig.getConfigById(titleId);
        let iconSf = await ResUtils.getBagTitleIcon();
        let display = ItemConfig.getInstance().getItemDisplayById(config.id, null);
        let quality = PetData.getQualityByColor(config.color)
        let showEffect = display.fmap(x => x.showBorderEffect).getOrElse(false);
        this.init({
            iconSf: iconSf,
            desc: '',
            color: quality,
            showEffect: showEffect,
            cb: null
        })
    }

    async initWithFashion(definitionId: number) {
        let display = ItemConfig.getInstance().getItemDisplayById(definitionId, PlayerData.getInstance().prefabId);
        let iconSf = await ResUtils.getExhibitIcon(display.val.iconId, true);
        let desc = '';
        let color = display.fmap(x => x.quality)
        let showEffect = display.fmap(x => x.showBorderEffect);
        let info = {
            iconSf: iconSf,
            desc: desc,
            color: color.getOrElse(null),
            showEffect: showEffect.getOrElse(false),
            cb: null
        }
        this.init(info);
    }
}
