import TradingIcon from "./TradingIcon";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import { CommonUtils } from "../../utils/CommonUtils";
import { Consignment, Equipment, PetDetail, Title } from "../../net/Protocol";
import { fromJS } from "immutable";
import ItemConfig, { ItemCategory } from "../../bag/ItemConfig";
import { TitleConfig } from "../../player/title/TitleConfig";
import { PetData } from "../pet/PetData";
import BagData from "../../bag/BagData";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";

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
export default class TradingShelvesTips extends TradingIcon {


    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    
    @property(cc.Label)
    priceTextLabel: cc.Label = null;
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.EditBox)
    priceEditBox: cc.EditBox = null;
    @property(cc.Label)
    obtainLabel: cc.Label = null;
    from = null;
    isTheir = true;
    type = 0;
    data: Consignment = null;
    theirId = 0;
    start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onConfirmBtn.bind(this)));
        super.start();
    }
    
    async init(data: Consignment = null, detail, type: ItemCategory) {
        this.type = type;
        this.data = data;
        if (data == null) {
            this.isTheir = true;
        } else {
            this.isTheir = false;
        }
        let recommendedPrice = 0;
        if (type == ItemCategory.Equipment) {
            let equipment: Equipment = null;
            if (detail != null) {
                equipment = detail as Equipment;
            } else {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/equipment/view/{id}', [data.goodsObjectId]) as any;
                if (response.status === 0) {
                    equipment = response.content as Equipment;
                }
            }
            if (equipment != null) {
                this.setIcon(type, equipment.definitionId, equipment, equipment.enhanceLevel);
                let config = ItemConfig.getInstance().getItemDisplayById(equipment.definitionId, PlayerData.getInstance().prefabId);
                this.nameLabel.string = config.fmap(x => x.name).getOrElse('装备');
                this.theirId = equipment.id;
                recommendedPrice = CommonUtils.toCKb(await this.suggestionsPrice(type, equipment));
            }
        } else if (type == 2) {
            let petDetail: PetDetail = null;
            if (detail != null) {
                petDetail = detail as PetDetail;
            } else {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [data.goodsObjectId]) as any;
                if (response.status === 0) {
                    petDetail = response.content[0] as PetDetail;
                }
            }
            if (petDetail != null) {
                this.setIcon(0, petDetail.pet.definitionId, petDetail, petDetail.pet.rank);
                this.nameLabel.string = petDetail.pet.petName;
                this.theirId = petDetail.pet.id;
                recommendedPrice = CommonUtils.toCKb(await this.suggestionsPrice(type, petDetail));
            }
        } else if (type == ItemCategory.Title) {
            let title: Title = null;
            if (detail != null) {
                title = detail as Title;
            } else {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/view/{id}', [data.goodsObjectId]) as any;
                if (response.status === 0) {
                    title = response.content as Title;
                }
            }
            if (title != null) {
                this.setIcon(type, title.definitionId, title);
                this.nameLabel.string = (await TitleConfig.getConfigById(title.definitionId)).name;
                this.theirId = title.id;
                recommendedPrice = CommonUtils.toCKb(await this.suggestionsPrice(type, title));
            }
        }
        if (this.isTheir) {
            this.priceTextLabel.string = '建议售价 ';
            this.priceLabel.string = '？？';
        } else {
            this.priceTextLabel.string = '上次售价 ';
            this.priceLabel.string = CommonUtils.toCKb(data.previousPrice).toString();
        }
    
        this.obtainLabel.string = '？？仙石';
    }
    
    async suggestionsPrice(type: number, data) {
        let price = 0;
        if (type == ItemCategory.Equipment) {
            let equipment = data as Equipment;
            let priceA1 = (ItemConfig.getInstance().getEquipmentPrototypeById(equipment.definitionId)).fmap(x => x.recommendedPrice).getOrElse(0);
            let priceA2 = 0;
            let priceA4 = 0;
            equipment.effectsText.split(',').forEach((ids) => {
                if (ids == '') {
                    return;
                }
                let id = parseInt(ids);
                if (id < 600) {
                    priceA4 += R.prop('recommendedPrice', EquipUtils.getEnhanceSkill(id));;
                } else {
                    priceA2 += R.prop('recommendedPrice', EquipUtils.getSpSkill(id));
                }
            });
            let priceA3 = EquipUtils.getRecommendedPrice(equipment.enhanceLevel);
            price = priceA1 + priceA2 + priceA3 + priceA4;
        } else if (type == 2) {
            let petDetail = data as PetDetail;
            let priceA1 = (await PetData.getConfigById(petDetail.pet.definitionId)).fmap(x => x.recommendedPrice).getOrElse(0);
            let config = await ConfigUtils.getConfigJson('PetAddStar');
            let priceA2 = 0;
            for (let star in config) {
                if (R.prop('starLevel', star) == petDetail.pet.rank) {
                    priceA2 = R.prop('recommendedPrice', star);
                    break;
                }
            }
    
            let priceA3 = 0;
            for (let id of petDetail.pet.abilities) {
                priceA3 += (await PetData.getPetSkillInfoById(id)).fmap(x => x.recommendedPrice).getOrElse(0);
            }
            price = priceA1 + priceA2 + priceA3;
        } else if (type == ItemCategory.Title) {
            let title = data as Title;
            price = (await TitleConfig.getConfigById(title.definitionId)).recommendedPrice;
        }
        return price;
    }
    
    async onConfirmBtn() {
        if (this.priceEditBox.string == '' || parseInt(this.priceEditBox.string) <= 0) {
            TipsManager.showMsgFromConfig(1181);
            return;
        }
        let myCurrency = 0;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${150}`, []) as any;
        if (response.status === 0) {
            myCurrency = R.prop('amount', response.content);
        }
        if (myCurrency < 5000) {
            TipsManager.showMessage('元宝不足！');
            return;
        }
        //服务器上架
        if (this.isTheir) {
            let goodsType = '';
            if (this.type == ItemCategory.Equipment) {
                goodsType = 'EQUIPMENT';
            } else if (this.type == 2 || this.type == 0) {
                goodsType = 'PET';
            } else if (this.type == ItemCategory.Title) {
                goodsType = 'TITLE';
            }
            let result = await CommonUtils.getCaptchaResponse();
            let response = await NetUtils.sendHttpRequest(
                NetUtils.RequestType.POST, 
                '/market/consignment/create', 
                [goodsType, this.theirId, CommonUtils.toSKb(parseInt(this.priceEditBox.string))],
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
                if (this.type == 2 || this.type == 0) {
                    PetData.updatePetIds();
                } else {
                    BagData.getInstance().initData();
                }
                this.closePanel();
                TipsManager.showMsgFromConfig(1175);
            }
        } else {
            let result = await CommonUtils.getCaptchaResponse();
            let response = await NetUtils.sendHttpRequest(
                NetUtils.RequestType.POST, 
                '/market/consignment/{id}/resume', 
                [this.data.id, CommonUtils.toSKb(parseInt(this.priceEditBox.string))],
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
                TipsManager.showMsgFromConfig(1175);
            }
        }
    }
    
    editStart() {
        CommonUtils.editBoxRight(this.priceEditBox);
    }
    
    editComplete() {
        if (R.equals(this.priceEditBox.string)("")) {
            this.obtainLabel.string = '';
        } else {
            this.obtainLabel.string = Math.floor(parseInt(this.priceEditBox.string) * 0.9).toString();
        }
    }
    
    // update (dt) {}
    
    closePanel() {
    
        CommonUtils.safeRemove(this.node);
    }
}
