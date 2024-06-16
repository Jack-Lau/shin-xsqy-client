import { Consignment, PlayerBaseInfo, Title, PetDetail, Equipment } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { TitleConfig } from "../../player/title/TitleConfig";
import ItemConfig from "../../bag/ItemConfig";

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
export default class TradingRecordItem extends cc.Component {

    @property(cc.Sprite)
    buy: cc.Sprite = null;
    @property(cc.Sprite)
    sell: cc.Sprite = null;

    @property(cc.RichText)
    richText: cc.RichText = null;

    // onLoad () {}

    async init(data: Consignment) {
        let buyPlayer = '';
        let sellPlayer = '';
        this.richText.string = '';
        let date = CommonUtils.getTimeInfo(data.dealTime as any);
        let goodsName = await this.getGoodsName(data);
        if (data.buyerAccountId == PlayerData.getInstance().accountId) {
            this.buy.node.active = true;
            this.sell.node.active = false;
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [data.sellerAccountId]) as any;
            if (response2.status === 0) {
                sellPlayer = (response2.content[0] as PlayerBaseInfo).player.playerName;
            }
            this.richText.string = `${date.month}月${date.day}日${date.hour}时${date.minute}分，您大手一挥，`
                + `花费了<color=#237f10>${CommonUtils.toCKb(data.price)}</color>仙石从<color=#d84c35>${sellPlayer}</color>处购得了一个<color=#d84c35>${goodsName}</color>`;
        } else if (data.sellerAccountId == PlayerData.getInstance().accountId) {
            this.buy.node.active = false;
            this.sell.node.active = true;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [data.buyerAccountId]) as any;
            if (response.status === 0) {
                buyPlayer = (response.content[0] as PlayerBaseInfo).player.playerName;
            }
            this.richText.string = `${date.month}月${date.day}日${date.hour}时${date.minute}分，您上架的商品`
                + `<color=#d84c35>${goodsName}</color>被<color=#d84c35>${buyPlayer}</color>一眼相中，爽快买下，秒赚了<color=#237f10>${CommonUtils.toCKb(data.price*0.9)}</color>仙石！`;
        }
    }

    async getGoodsName(data: Consignment) {
        let name = '';
        try {
            if (data.goodsType == "EQUIPMENT") {
                name = '装备';
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [data.goodsObjectId]) as any;
                if (response.status === 0) {
                    let equipment = response.content as Equipment;
                    let config = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
                    name = config.fmap(x => x.name).getOrElse('装备');
                }

            } else if (data.goodsType == "PET") {
                name = '宠物';
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [data.goodsObjectId]) as any;
                if (response.status === 0) {
                    let petDetail = response.content[0] as PetDetail;
                    name = petDetail.pet.petName;
                }
            } else if (data.goodsType == "TITLE") {
                name = '称号';
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/view/{id}', [data.goodsObjectId]) as any;
                if (response.status === 0) {
                    let title = response.content as Title;
                    name = (await TitleConfig.getConfigById(title.definitionId)).name;
                }
            }
        } catch (e) {
            CommonUtils.reportError('view info', [data.goodsObjectId], "getGoodsName Error")
        } finally {
            return name;
        }
    }

    // update (dt) {}
}
