import TradingIcon from "./TradingIcon";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { Consignment, Equipment, PetDetail, Title } from "../../net/Protocol";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import { TitleConfig } from "../../player/title/TitleConfig";
import { fromJS } from "immutable";
import TradeLinePanel from "./TradeLinePanel";
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
export default class TradingBuyTips extends TradingIcon {

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
    @property(cc.Label)
    myCurrencyLabel: cc.Label = null;

    data: Consignment = null;

    from: TradeLinePanel = null;
    myCurrency = 0;
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
        let myCurrency = 0;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${151}`, []) as any;
        if (response.status === 0) {
            myCurrency = R.prop('amount', response.content);
        }
        this.myCurrencyLabel.string = CommonUtils.toCKb(myCurrency).toString();
    }

    async onConfirmBtn() {
        if (parseInt(this.myCurrencyLabel.string) < parseInt(this.priceLabel.string)) {
            TipsManager.showMsgFromConfig(1127);
            return;
        }
        let result = await CommonUtils.getCaptchaResponse();
        let response = await NetUtils.sendHttpRequest(
            NetUtils.RequestType.POST, 
            '/market/consignment/{id}/purchase', 
            [this.data.id],
            {},
            {
                ticket: result.ticket,
                randStr: result.randstr
            }
        ) as any;
        if (response.status === 0) {
            if (this.from != null) {
                this.from.adjustPage();
            }
            this.closePanel();
            TipsManager.showMsgFromConfig(1177);
        }
    }

    // update (dt) {}

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
