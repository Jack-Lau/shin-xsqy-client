import { CommonUtils } from "../../utils/CommonUtils";
import { ItemDisplay } from "../../bag/ItemConfig";
import Optional from "../../cocosExtend/Optional";
import ItemWithEffect from "../../base/ItemWithEffect";
import { Notify } from "../../config/Notify";
import SsjpDisposeConfirmBox from "./SsjpDisposeConfirmBox";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { NetUtils } from "../../net/NetUtils";
import { AwardResult } from "../../net/Protocol";
import { CurrencyId } from "../../config/CurrencyId";
import { TipsManager } from "../../base/TipsManager";
import PetPanel from "../pet/PetPanel";
import GodBeastExchangePanel from "../pet/godBeast/GodBeastExchangePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GodPetJPTips extends cc.Component {
    @property(cc.Node)
    tipNode: cc.Node = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    category: cc.Label = null;
    @property(cc.RichText)
    description: cc.RichText = null;
    @property(cc.Button)
    exchangeBtn: cc.Button = null;
    @property(cc.Button)
    disposeBtn: cc.Button = null;
    @property(cc.Node)
    btnNode: cc.Node = null;
    
    dataId: number = 0;
    start() {
        this.exchangeBtn.node.on(cc.Node.EventType.TOUCH_END, this.exchange.bind(this));
        this.disposeBtn.node.on(cc.Node.EventType.TOUCH_END, this.dispose.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }
    
    async init(display: Optional<ItemDisplay>, amount: number, isUse = true) {
        this.btnNode.active = isUse;
        if (display.isValid()) {
            this.category.string = '数量 ' + amount;
            this.nameLabel.string = display.getValue().name;
            // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getTipColorByQuality(display.val.quality));
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(display.val.quality));
            this.description.string = display.getValue().description;
            this.dataId = display.getValue().prototypeId;
            this.item.initWithCurrency({ currencyId: this.dataId, amount: amount });
        }
    }
    
    async initJustShow(display: Optional<ItemDisplay>, amount: number, isBig = true) {
        this.btnNode.active = false;
        if (display.isValid()) {
            this.category.string = '数量 ' + amount;
            this.nameLabel.string = display.getValue().name;
            // this.nameLabel.node.color = cc.hexToColor(CommonUtils.getTipColorByQuality(display.val.quality));
            this.nameLabel.node.color = cc.Color.fromHEX(this.nameLabel.node.color, CommonUtils.getTipColorByQuality(display.val.quality))
            this.description.string = display.getValue().description;
            this.dataId = display.getValue().prototypeId;
            this.item.initWithJustShow({ currencyId: this.dataId, amount: amount }, isBig);
        }
    }
    
    async exchange() {
        this.closePanel();
        EventDispatcher.dispatch(Notify.MAIN_UI_REMOVE_ALL_PANELS, {});
        let panel = await CommonUtils.getPanel('gameplay/pet/dogBeast/GodBeastExchangePanel', GodBeastExchangePanel) as GodBeastExchangePanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    async dispose() {
        let showConfrimBox = cc.sys.localStorage.getItem(Notify.SHOW_SSJP_DISPOSE_CONFIRM_BOX);
        if (showConfrimBox != 'false') {
            let confirmBox = await CommonUtils.getPanel('gameplay/bag/ssjpDisposeConfirmBox', SsjpDisposeConfirmBox) as SsjpDisposeConfirmBox;
            confirmBox.init(this.doDispose.bind(this));
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: confirmBox});
        } else {
            await this.doDispose();
        }
    }
    
    async doDispose () {
        let result = await NetUtils.post<AwardResult>('/award/redeem', [CurrencyId.神兽精魄]);
        if (result.isRight) {
            // result.right.currencyStacks.forEach(ele => ele.amount > 0 && TipsManager.showGainCurrency(ele));
        }
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

}
