import { PetData } from "../pet/PetData";
import { CommonUtils } from "../../utils/CommonUtils";
import TradingSceenPetTypeItem from "./TradingSceenPetTypeItem";
import { PetDetail } from "../../net/Protocol";
import TradeLinePanel from "./TradeLinePanel";
import { NetUtils } from "../../net/NetUtils";
import TradingSceenPetTips from "./TradingSceenPetTips";

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
export default class TradingSceenPetTypeTips extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    items: TradingSceenPetTypeItem[] = [];

    from: TradingSceenPetTips = null;
    petDetails: number[] = [];

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }

    start() {
        this.petDetails.forEach((definitionId) => {
            let prf = cc.instantiate(this.prefab);
            prf.parent = this.scrollView.content;
            let item = prf.getComponent(TradingSceenPetTypeItem);
            item.init(definitionId);
            this.items.push(item);
            if (this.from.from.screenPet.petDefinitionId != (NetUtils.NONE_VALUE as any)) {
                if (definitionId == this.from.from.screenPet.petDefinitionId) {
                    item.isChecked();
                } else {
                    item.notChecked();
                }
            }
        });
        this.initEvents();
    }

    initEvents() {
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
    }

    async init(from: TradingSceenPetTips, petDetails: number[]) {
        this.from = from;
        this.petDetails = petDetails;
    }

    async onConfirmBtn() {
        for (let item of this.items) {
            if (item.getChecked()) {
                if (this.from != null) {
                    this.from.updateShowPet(item.definitionId);
                }
                break;
            }
        }
        this.closePanel();
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    // update (dt) {}
}
