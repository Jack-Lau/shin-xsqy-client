import TradingIcon from "./TradingIcon";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { Consignment, Equipment, PetDetail, Title } from "../../net/Protocol";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import { TitleConfig } from "../../player/title/TitleConfig";
import TradingMyPanel from "./TradingMyPanel";
import { TipsManager } from "../../base/TipsManager";

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
export default class TradingNotShelvesTips extends TradingIcon {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    cancelBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;

    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    data: Consignment = null;
    from: TradingMyPanel = null;
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.cancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        super.start();
    }

    async init(data: Consignment) {
        this.data = data;
        let type = ItemCategory.Equipment;
        if (data.goodsType == "EQUIPMENT") {
            type = ItemCategory.Equipment;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [data.goodsObjectId]) as any;
            if (response.status === 0) {
                let equipment = response.content as Equipment;
                this.setIcon(type, equipment.definitionId, equipment, equipment.enhanceLevel);
                let config = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
                this.nameLabel.string = config.fmap(x => x.name).getOrElse('装备');
            }

        } else if (data.goodsType == "PET") {
            type = 0;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [data.goodsObjectId]) as any;
            if (response.status === 0) {
                let petDetail = response.content[0] as PetDetail;
                this.setIcon(type, petDetail.pet.definitionId, petDetail, petDetail.pet.rank);
                this.nameLabel.string = petDetail.pet.petName;
            }

        } else if (data.goodsType == "TITLE") {
            type = ItemCategory.Title;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/view/{id}', [data.goodsObjectId]) as any;
            if (response.status === 0) {
                let title = response.content as Title;
                this.setIcon(type, title.definitionId, title);
                this.nameLabel.string = (await TitleConfig.getConfigById(title.definitionId)).name;
            }
        }
        this.priceLabel.string = CommonUtils.toCKb(data.price).toString();
    }

    async onConfirmBtn() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/market/consignment/{id}/suspend', [this.data.id]) as any;
        if (response.status === 0) {
            if (this.from != null) {
                this.from.adjustPage();
            }
            this.closePanel();
            TipsManager.showMsgFromConfig(1179);
        }
    }

    // update (dt) {}

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
