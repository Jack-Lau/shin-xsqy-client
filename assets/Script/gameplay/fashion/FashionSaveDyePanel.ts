import { FashionConfig } from "./FashionConfig";
import { CommonUtils } from "../../utils/CommonUtils";
import { CurrencyId } from "../../config/CurrencyId";
import PlayerData from "../../data/PlayerData";
import { NetUtils } from "../../net/NetUtils";
import { Fashion } from "../../net/Protocol";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import Optional from "../../cocosExtend/Optional";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class FashionSaveDyePanel extends cc.Component {
    @property(cc.Sprite)
    blockSp: cc.Sprite = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.EditBox)
    nameEditBox: cc.EditBox = null;
    @property(cc.Button)
    foldBtn: cc.Button = null;
    @property(cc.Button)
    unfoldBtn: cc.Button = null;
    @property(cc.Node)
    foldNode: cc.Node = null;
    @property(cc.Node)
    unfoldNode: cc.Node = null;

    @property(cc.Label)
    part1Label: cc.Label = null;
    @property(cc.Label)
    part2Label: cc.Label = null;
    @property(cc.Label)
    part3Label: cc.Label = null;

    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Label)
    ownLabel: cc.Label = null;

    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Node)
    baseNode: cc.Node = null;
    @property(cc.Node)
    contentNo: cc.Node = null;
    hs = [-1, -1, -1];
    ss = [-1, -1, -1];
    bs = [-1, -1, -1];
    fashion: Fashion = null;

    own: number = 0;
    cost : number = 0;

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirm.bind(this));
        this.blockSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.foldBtn.node.on(cc.Node.EventType.TOUCH_END, this.fold.bind(this));
        this.unfoldBtn.node.on(cc.Node.EventType.TOUCH_END, this.unfold.bind(this));
    }
    
    async init (fashion: Fashion, hs: Array<number>, ss: Array<number>, bs: Array<number>) {
        this.fashion = fashion;
        this.hs = hs;
        this.ss = ss;
        this.bs = bs;
        let model = await FashionConfig.getCostModel(fashion.definitionId);
        let myOwn = await CommonUtils.getCurrencyAmount(CurrencyId.染色剂);
        this.own = myOwn;
        if (model.valid) {
            let cost = 0;
            for (let i = 0; i < 3; ++i) {
                const hc = hs[i] == -1 ? 0 : model.val.dyeCost[i].colorCost;
                const sc = ss[i] == -1 ? 0 : model.val.dyeCost[i].saturationCost;
                const bc = bs[i] == -1 ? 0 : model.val.dyeCost[i].brightnessCost;
                this[`part${i+1}Label`].string = `${hc}+${sc}+${bc}`;
                cost += (hc + sc + bc);
            }
            this.cost = cost;
            this.costLabel.string = String(cost);
            this.ownLabel.string = String(myOwn);
        }
        this.centerEditBox();
    }

    centerEditBox() {
        CommonUtils.editBoxCenter(this.nameEditBox);
    }
    
    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    async confirm() {
        if (this.own < this.cost) {
            TipsManager.showMsgFromConfig(1184);
            return;
        }
        if (this.fashion == undefined) {
            return;
        }
        let json = {
            accountId: PlayerData.getInstance().accountId,
            definitionId: this.fashion.definitionId,
            dyeName: this.nameEditBox.string == "" ?  '默认名称' : this.nameEditBox.string ,
            part_1_color: this.hs[0],
            part_1_saturation: this.ss[0],
            part_1_brightness:  this.bs[0],
            part_2_color:  this.hs[1],
            part_2_saturation:  this.ss[1],
            part_2_brightness:  this.bs[1],
            part_3_color:  this.hs[2],
            part_3_saturation:  this.ss[2],
            part_3_brightness:  this.bs[2]
        };
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST_JSON, '/fashion/addDye/{fashionId}', [this.fashion.id], json) as any;
        if (response.status == 0) {
            let fashion = response.content as Fashion;
            TipsManager.showMessage('添加并穿戴成功');
            this.closePanel();
            FashionConfig.updateFashionDyeId(this.fashion, fashion.dyeId);

            EventDispatcher.dispatch(Notify.FASHION_REFRESH_DYE, {});
            if (PlayerData.getInstance().fashion.fmap(x => x.id == this.fashion.id).getOrElse(false)) {
                let dye = await FashionConfig.getDye(fashion.dyeId);
                PlayerData.getInstance().fashion = Optional.Just(R.clone(this.fashion));
                PlayerData.getInstance().fashionDye = dye;
                EventDispatcher.dispatch(Notify.PLAYER_FASHION_REFRESH_DYE, {dye: dye});
            }
        }
    }

    async fold() {
        this.unfoldNode.active = false;
        this.foldNode.active = true;
        await CommonUtils.wait(0.05);
        this.contentNo.height = this.baseNode.height;
    }

    async unfold () {
        this.unfoldNode.active = true;
        this.foldNode.active = false;
        await CommonUtils.wait(0.05);
        this.contentNo.height = this.baseNode.height;
    }
}