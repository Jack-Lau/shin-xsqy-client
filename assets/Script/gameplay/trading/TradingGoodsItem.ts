import ItemFrame from "../../base/ItemFrame";
import ItemConfig, { ItemCategory, PetQuality, ItemQuality } from "../../bag/ItemConfig";
import { ItemType } from "../../setting/wallet/WalletPanelDataStructure";
import { PetData } from "../pet/PetData";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";
import TradingIcon, { TradingGoodsType } from "./TradingIcon";
import { Consignment, Equipment, PetDetail, Title } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { TitleConfig } from "../../player/title/TitleConfig";
import { CommonUtils } from "../../utils/CommonUtils";

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
export default class TradingGoodsItem extends TradingIcon {

    @property(cc.Node)
    shelvesNode: cc.Node = null;
    @property(cc.Node)
    notonNode: cc.Node = null;
    @property(cc.Node)
    addNode: cc.Node = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    shelvesCurrency: cc.Label = null;
    @property(cc.Label)
    fcCurrency: cc.Label = null;
    @property(cc.Label)
    kbCurrency: cc.Label = null;

    @property(cc.Label)
    shelvesLabel: cc.Label = null;
    @property(cc.Label)
    collectionLabel: cc.Label = null;
    @property(cc.Sprite)
    collectionSprite: cc.Sprite = null;
    @property(cc.Sprite)
    notCollectionSprite: cc.Sprite = null;

    @property(cc.Sprite)
    selected: cc.Sprite = null;

    type: TradingGoodsType;

    isFocus = false;

    detail = null;

    onLoad() {
        let addBtn = this.addNode.addComponent(cc.Button);
        addBtn.transition = cc.Button.Transition.SCALE;
        addBtn.zoomScale = 0.9;
    }

    init(data: Consignment, isFocus: boolean) {
        this.nameLabel.string = '加载中';
        this.icon.spriteFrame = null;
        this.selected.node.active = false;
        this.isFocus = isFocus;
        if (data == null) {
            this.type = TradingGoodsType.Add;
        } else if (data.buyerAccountId != null && (data.buyerAccountId == PlayerData.getInstance().accountId || data.sellerAccountId == PlayerData.getInstance().accountId)) {
            this.type = TradingGoodsType.Obtain;
        } else if (data.dealTime == null && (data.deadline as any) > CommonUtils.getServerTime()) {
            this.type = TradingGoodsType.Shelves;
        } else if (data.deadline == null || (data.deadline as any) < CommonUtils.getServerTime()) {
            this.type = TradingGoodsType.Noton;
        }

        this.showData(this.type, data);
    }

    showData(type: TradingGoodsType, data: Consignment) {
        switch (type) {
            case TradingGoodsType.Shelves:
                this.shelvesNode.parent.active = true;
                this.addNode.active = false;
                this.shelvesNode.active = true;
                this.notonNode.active = false;
                this.shelvesCurrency.node.parent.active = true;
                this.fcCurrency.node.parent.active = false;
                this.kbCurrency.node.parent.active = false;

                this.shelvesCurrency.string = CommonUtils.toCKb(data.price).toString();
                this.shelvesLabel.string = this.getTimeText((data.deadline as any) - CommonUtils.getServerTime());

                //如果收藏了
                this.collectionSprite.node.active = this.isFocus;
                this.notCollectionSprite.node.active = !this.isFocus;

                this.toShowData(data);
                break;
            case TradingGoodsType.Noton:
                this.notonNode.parent.active = true;
                this.addNode.active = false;
                this.shelvesNode.active = false;
                this.notonNode.active = true;
                this.shelvesCurrency.node.parent.active = true;
                this.fcCurrency.node.parent.active = false;
                this.kbCurrency.node.parent.active = false;

                this.shelvesCurrency.string = CommonUtils.toCKb(data.previousPrice).toString();

                this.toShowData(data);
                break;
            case TradingGoodsType.Obtain:
                this.shelvesNode.parent.active = true;
                this.addNode.active = false;
                this.shelvesNode.active = false;
                this.notonNode.active = false;
                this.shelvesCurrency.node.parent.active = false;

                // 自己售出的
                if (data.sellerAccountId == PlayerData.getInstance().accountId) {
                    this.fcCurrency.node.parent.active = false;
                    this.kbCurrency.node.parent.active = true;
                    this.kbCurrency.string = CommonUtils.toCKb(data.price * 0.9) + '个';
                    this.nameLabel.string = '仙石';
                    this.setIcon(ItemCategory.Currency, 151, CommonUtils.toCKb(data.price * 0.9), 0);                  
                } else {
                    this.fcCurrency.node.parent.active = true;
                    this.kbCurrency.node.parent.active = false;
                    this.toShowData(data);
                }

                break;
            case TradingGoodsType.Add:
                this.shelvesNode.parent.active = false;
                this.addNode.active = true;
                break;
        }
        
    }

    async toShowData(data: Consignment) {
        let type = ItemCategory.Equipment;
        if (data.goodsType == "EQUIPMENT") {
            type = ItemCategory.Equipment;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [data.goodsObjectId]) as any;
            if (response.status === 0) {
                let equipment = response.content as Equipment;
                this.detail = equipment;
                this.setIcon(type, equipment.definitionId, equipment, equipment.enhanceLevel);
                let config = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
                this.nameLabel.string = config.fmap(x => x.name).getOrElse('装备');
                this.fcCurrency.string = equipment.baseFc.toString();
            }

        } else if (data.goodsType == "PET") {
            type = 0;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [data.goodsObjectId]) as any;
            if (response.status === 0) {
                let petDetail = response.content[0] as PetDetail;
                this.detail = petDetail;
                this.setIcon(type, petDetail.pet.definitionId, petDetail, petDetail.pet.rank);
                this.nameLabel.string = petDetail.pet.petName;
                this.fcCurrency.string = (await PetData.getAttributes(petDetail)).fc.toString();
            }
        } else if (data.goodsType == "TITLE") {
            type = ItemCategory.Title;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/view/{id}', [data.goodsObjectId]) as any;
            if (response.status === 0) {
                let title = response.content as Title;
                this.detail = title;
                this.setIcon(type, title.definitionId, title);
                let config = await TitleConfig.getConfigById(title.definitionId);
                this.nameLabel.string = config.name;
                this.fcCurrency.string = config.fc.toString();
            }
        }      
    }

    setCollectionLabel(number) {
        this.collectionLabel.string = number.toString();
    }

    getTimeText(date: number) {
        let time = date / (1000 * 60 * 60 * 24);
        if (time >= 1) {
            return Math.ceil(time) + '天后下架';
        } else {
            time = date / (1000 * 60 * 60);
            if (time >= 1) {
                return Math.ceil(time) + '小时后下架';
            } else {
                time = date / (1000 * 60);
                return Math.ceil(time) + '分钟后下架';
            }
        }
    }

    showSelected() {
        if (this.type != TradingGoodsType.Add) {
            this.selected.node.active = true;
        }
    }

    cancelSelected() {
        this.selected.node.active = false;
    }

    // update (dt) {}
}
