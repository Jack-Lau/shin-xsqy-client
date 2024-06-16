import { CommonUtils } from "../../../utils/CommonUtils";
import { NetUtils } from "../../../net/NetUtils";
import PlayerData from "../../../data/PlayerData";
import { TipsManager } from "../../../base/TipsManager";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import SecondConfirmBox from "../../../base/SecondConfirmBox";
import { LegendaryPetGenerationRecord } from "../../../net/Protocol";
import { PetData } from "../PetData";

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
export default class GodBeastExchangePanel extends cc.Component {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Node)
    monkeyNode: cc.Node = null;
    @property(cc.Node)
    cowNode: cc.Node = null;
    @property(cc.Node)
    monkeyShowNode: cc.Node = null;
    @property(cc.Node)
    cowShowNode: cc.Node = null;
    @property(cc.Node)
    btnNode: cc.Node = null;
    @property(cc.Node)
    monkeyLabelNode: cc.Node = null;
    @property(cc.Node)
    cowLabelNode: cc.Node = null;
    @property(cc.Label)
    remainingLabel: cc.Label = null;
    @property(cc.Label)
    consumptionLabel: cc.Label = null;
    @property(cc.Button)
    consumptionBtn: cc.Button = null;

    @property(cc.Label)
    playCurrencyionLabel: cc.Label = null;

    currentType = 0;//1:猴子

    isRuning = false;

    price = 100;
    max_number = 30;

    async start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.consumptionLabel.string = this.price.toString();
        let playCurrency = 0;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${172}`, []) as any;
        if (response.status === 0) {
            playCurrency = R.prop('amount', response.content);
        }
        this.playCurrencyionLabel.string = playCurrency.toString();
        this.initEvents();
        this.onToggle(null);
    }


    initEvents() {
        this.consumptionBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConsumptionBtn.bind(this)));
    }

    async onConsumptionBtn() {
        if (this.isRuning) {
            return;
        }

        if (parseInt(this.playCurrencyionLabel.string) < this.price) {
            TipsManager.showMessage('神兽精魄不足！');
            return;
        }
        let name = '';
        if (this.currentType == 1) {
            name = '六耳猕猴(法术)';
        } else {
            name = '穷奇(物理)';
        }
        let panel = await CommonUtils.getPanel('base/secondConfirmBox', SecondConfirmBox) as SecondConfirmBox;
        panel.init(`是否花费 <img src='currency_icon_172'/><color=#bb4033>${this.price}</color> 兑换 <color=#bb4033>${name}</color>`, this.onConfirm.bind(this));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });

    }

    async onConfirm() {
        this.isRuning = true;
        this.bg.off(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/legendaryPet/redeem', [this.currentType == 1 ? 300023 : 300018]) as any;
        if (response.status === 0) {
            PetData.updatePetIds();
            if (this.currentType == 1) {
                this.btnNode.active = false;
                this.monkeyShowNode.active = true;
            } else {
                this.btnNode.active = false;
                this.cowShowNode.active = true;
            }
            this.bg.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        }
        this.isRuning = false;
    }

    onToggle(toggle, index = '') {
        this.remainingLabel.string = `剩${this.max_number}只`;

        if (index == '1') {
            this.currentType = 1;
            this.monkeyNode.active = true;
            this.cowNode.active = false;
            this.monkeyLabelNode.active = true;
            this.cowLabelNode.active = false;
        } else {
            this.currentType = 0;
            this.monkeyNode.active = false;
            this.cowNode.active = true;
            this.monkeyLabelNode.active = false;
            this.cowLabelNode.active = true;
        }
        this.updateLabel();
    }

    async updateLabel() {
        let type = this.currentType;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/legendaryPet/generation/', []) as any;
        if (type != this.currentType) {
            return;
        }
        if (response.status === 0) {
            let data = response.content as LegendaryPetGenerationRecord[];
            for (let itemData of data) {
                if (itemData.definitionId == (this.currentType == 1 ? 300023 : 300018)) {
                    this.remainingLabel.string = `剩${this.max_number - itemData.redeemedCount}只`;
                    return;
                }
            }
        }
        
    }

    // update (dt) {}

    closePanel() {
        if (this.isRuning) {
            return;
        }
        CommonUtils.safeRemove(this.node);
    }

}
