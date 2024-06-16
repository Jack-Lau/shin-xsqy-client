import EquipmentTipBase from "./EquipmentTipBase";
import EquipmentTipMoreInfo from "./EquipmentTipMoreInfo";
import CommonPanel from "../../../base/CommonPanel";
import { ItemCategory } from "../../../bag/ItemConfig";
import BagItem from "../../../bag/BagItem";
import { CommonUtils } from "../../../utils/CommonUtils";
import PlayerData from "../../../data/PlayerData";
import { TipsManager } from "../../../base/TipsManager";
import ExchangeEquipmentPanel from "../exchange/ExchangeEquipmentPanel";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import { NetUtils } from "../../../net/NetUtils";
import { Equipment } from "../../../net/Protocol";
import Optional from "../../../cocosExtend/Optional";
import BagData from "../../../bag/BagData";
import BagToTreasurePanel from "../../bag/BagToTreasurePanel";
import { BroadcastHandler } from "../../../mainui/BroadcastHandler";

const {ccclass, property} = cc._decorator;

enum EquipmentTipsState {
    Normal,
    MoreInfo,
    Versus,
}

@ccclass
export default class EquipmentTips extends CommonPanel {
	
    @property(EquipmentTipBase)
    leftBase: EquipmentTipBase = null;
    @property(EquipmentTipBase)
    rightBase: EquipmentTipBase = null;
    @property(EquipmentTipMoreInfo)
    moreInfo: EquipmentTipMoreInfo = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    readonly VS_LEFT_X = -190;
    readonly VS_RIGHT_X = 190;
    readonly MORE_LEFT_X = -171;
    readonly MORE_RIGHT_X = 194;

    partIsEquiped = false;
    bagItem: BagItem = null;

    start () {
        this.initEvents();
    }

    initEvents() {
        this.leftBase.vsBtn.node.on(cc.Node.EventType.TOUCH_END, this.switchToState(EquipmentTipsState.Versus).bind(this));
        this.leftBase.moreInfoBtn.node.on(cc.Node.EventType.TOUCH_END, this.switchToState(EquipmentTipsState.MoreInfo).bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.close.bind(this));

        if (this.leftBase.exchangeBtn) {
            this.leftBase.exchangeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openExchange.bind(this)));
        }
        if (this.leftBase.armBtn) {
            this.leftBase.armBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.arm.bind(this)));
        }
        if (this.leftBase.lianhuaBtn) {
            this.leftBase.lianhuaBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toTreasurePanel.bind(this)));
        }
        if (this.leftBase.enhanceBtn) {
            this.leftBase.enhanceBtn.node.on(cc.Node.EventType.TOUCH_END, this.openEnhancePanel.bind(this));
        }
    }

    removeButtons() {
        if (this.leftBase.moreBtn && this.leftBase.moreBtn.node.parent) {
            CommonUtils.safeRemove(this.leftBase.moreBtn.node.parent)
        }
    }

    init(data: BagItem, prefabId = null) {
        if (data.category !== ItemCategory.Equipment) { console.error('不可以传入其他数据'); return; }
        this.bagItem = data;
        this._data.value = data;
        this.leftBase.init(data, prefabId);
        let equipment = data.getPrototype().fmap(x => x.part).monadBind(part => PlayerData.getInstance().equipments[part]);
        this.partIsEquiped = equipment.isValid();
        if (equipment.isValid()) {
            let bagItem = new BagItem();
            bagItem.category = ItemCategory.Equipment;
            bagItem.data = equipment.getValue();
            this.rightBase.init(bagItem);
        } 
        this.moreInfo.init(data);
        let _this = this;
        setTimeout( () => {
            _this.moreInfo.getComponent(cc.Widget).top = (CommonUtils.getViewHeight() - _this.leftBase.node.height) / 2;
            _this.rightBase.getComponent(cc.Widget).top = (CommonUtils.getViewHeight() - _this.leftBase.node.height) / 2;
        }, 300);
         
        this.switchToState(EquipmentTipsState.Normal)();
    }

    // events
    switchToState(state: EquipmentTipsState) {
        return function() {
            if (this._state.value === state) {
                this._state.value = EquipmentTipsState.Normal;
            } else if (state === EquipmentTipsState.Versus && !this.partIsEquiped) {
                TipsManager.showMessage('该部位尚未装备');
            } else {
                this._state.value = state;
            }
        }.bind(this);
    }

    refreshData() {
        super.refreshData();
    }

    refreshState() {
        let state = this._state.value;
        switch (state) {
            case EquipmentTipsState.Normal: {
                this.leftBase.node.x = 0;
                this.leftBase.node.active = true;
                this.rightBase.node.active = this.moreInfo.node.active = false;
                break;
            }
            case EquipmentTipsState.Versus: {
                this.leftBase.node.x = this.VS_LEFT_X;
                this.rightBase.node.x = this.VS_RIGHT_X;
                this.leftBase.node.active = this.rightBase.node.active = true;
                this.moreInfo.node.active = false;
                break;
            }
            case EquipmentTipsState.MoreInfo: {
                this.leftBase.node.x = this.MORE_LEFT_X;
                this.moreInfo.node.x = this.MORE_RIGHT_X;
                this.leftBase.node.active = this.moreInfo.node.active = true;
                this.rightBase.node.active = false;
                break;
            }
        }
        super.refreshState();
    }

    close() {
        CommonUtils.safeRemove(this.node);
    }

    async openExchange() {
        if (!this.bagItem) { return ; }
        let part = this.bagItem.getPrototype().fmap(x => x.part);
        if (part.isValid()) {
            let panel = await CommonUtils.getPanel('gameplay/equipment/exchangeEquipmentPanel', ExchangeEquipmentPanel) as ExchangeEquipmentPanel;
            panel.init(part.getValue());
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            this.close();
        }
    }

    async arm () {
        await CommonUtils.exchangeEquipment(this.bagItem.data as Equipment);
        this.close();
    }

    async toTreasurePanel() {
        let panel = await CommonUtils.getPanel('gameplay/bag/BagToTreasurePanel', BagToTreasurePanel) as BagToTreasurePanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        this.close();
        return panel;
    }

    async openEnhancePanel () {
        this.close();
        BroadcastHandler.handle(7);
    }

}