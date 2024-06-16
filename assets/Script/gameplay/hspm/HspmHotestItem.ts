import ItemWithEffect from "../../base/ItemWithEffect";
import { CommonUtils } from "../../utils/CommonUtils";
import { CurrencyStack, Equipment, Pet, Commodity, CommodityDetail, CommodityPlayerRecord } from "../../net/Protocol";
import { HspmConfig } from "./HspmConfig";
import { PetData } from "../pet/PetData";
import { NetUtils } from "../../net/NetUtils";
import { ResUtils } from "../../utils/ResUtils";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import Optional from "../../cocosExtend/Optional";
import ItemConfig from "../../bag/ItemConfig";
import { TitleConfig } from "../../player/title/TitleConfig";
import { PetUtils } from "../pet/PetUtils";
import PlayerData from "../../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

enum Type {Pet, Equipment, Title, Currency}

const { ccclass, property } = cc._decorator;
@ccclass
export default class HspmHotestItem extends cc.Component {
	
    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Sprite)
    iconSp: cc.Sprite = null;
    @property(cc.Sprite)
    petMcSp: cc.Sprite = null;
    
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Label)
    playerNameLabel: cc.Label = null;
    @property(cc.Label)
    noneAuctionLabel: cc.Label = null;
    @property(cc.Label)
    zanNumLabel: cc.Label = null;
    @property(cc.Button)
    auctionBtn: cc.Button = null;
    
    @property(cc.Button)
    zanBtn: cc.Button = null;
    @property(cc.Node)
    zanTipsNode: cc.Node = null;
    
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    
    endTime: number = 0;
    data = null;
    equipment: Equipment = null;
    pet: Pet = null;
    titleId: number = null;
    currencyId: number = null;
    type: Type = Type.Currency
    
    start () {
        this.endTime = Date.now() + 8 * 3600 * 1000;
        this.schedule(this.countDown, 60);
        this.initEvents();
    }
    
    initEvents () {
        let _this = this;
        this.petMcSp.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (_this.type == Type.Pet) {
                PetUtils.showPetTips({pet: _this.pet, parameters: null})
            }
        });
        this.iconSp.node.on(cc.Node.EventType.TOUCH_END, async (e) => {
            if (_this.type == Type.Currency) {
                CommonUtils.showCurrencyTips({currencyId: _this.currencyId, amount: 1})(e);
            } else if (_this.type == Type.Equipment) {
                EquipUtils.showEquipmentTips(_this.equipment)()
            } else if (_this.type == Type.Title) {
                let titleInfo = await TitleConfig.getGodConfigById(_this.titleId)
                CommonUtils.showTitleTips(titleInfo.titleInfo.id, titleInfo.serialNum + '');
            }
        });
    }
    
    async init (detail: CommodityDetail, playerRecord: Optional<CommodityPlayerRecord>) {
        let data = detail.commodity;
        this.endTime = R.prop('deadline', data);
        this.priceLabel.string = R.prop('lastBid', data) +'';
        
        let lastPlayerAccoutId = R.prop('lastBidderAccountId', data)
        if (undefined != lastPlayerAccoutId) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewName', [lastPlayerAccoutId]);
            if (response.status === 0) {
                if (lastPlayerAccoutId == PlayerData.getInstance().accountId) {
                    this.playerNameLabel.string = '★' + response.content;
                } else {
                    this.playerNameLabel.string = response.content;
                }
                this.noneAuctionLabel.string = '即将拍得'
            }
        } else {
            this.playerNameLabel.string = '无人竞拍';
            this.noneAuctionLabel.string = '底价开抢！';
        }
        if (playerRecord.valid && playerRecord.val.likeCount > 0) {
            this.zanNumLabel.string = (detail.likeCount -  playerRecord.val.likeCount) + '+' + playerRecord.val.likeCount
        } else {
            this.zanNumLabel.string = detail.likeCount + '';
        }
    
        let config = await HspmConfig.getConfigById(R.prop('definitionId', data));
        this.nameLabel.string = config.name;
        
        //
        this.iconSp.node.active = true;
        this.petMcSp.node.active = false;
        this.currencyId = config.auctionId;
        this.type = Type.Currency;
        /*
        this.iconSp.node.active = config.type != Type.Pet;
        this.petMcSp.node.active = config.type == Type.Pet;
        if (config.type == 1) { // 神装
            let equipment : Equipment = null; 
            let iconId = EquipUtils.getDisplay(equipment).fmap(x => x.iconId).getOrElse(0);
            this.iconSp.spriteFrame = await ResUtils.getEquipmentBigIcon(iconId);
            this.iconSp.node.scale = 1
            this.equipment = equipment;
            this.type = Type.Equipment
        } else if (config.type == 2) { // 神宠
            let pet: Pet = null;
            this.pet = pet;
            let petConfig = await PetData.getConfigById(pet.definitionId);
            this.initMc(petConfig.fmap(x => x.prefabId));
            this.pet = pet;
            this.type = Type.Pet
        } else if (config.type == 3) { // 称号
            let titleId = config.auctionId
            this.titleId = titleId
            let titleInfo = await TitleConfig.getGodConfigById(titleId)
            this.iconSp.spriteFrame = await ResUtils.getTitleIconById(titleInfo.titleInfo.picId)
            this.iconSp.node.scale = 1.2
            this.type = Type.Title
        } else if (config.type == 4) { // 货币
            let currencyId = config.auctionId
            this.iconSp.spriteFrame = this.atlas.getSpriteFrame(config.hotShow + '');
            this.currencyId = currencyId;
            this.type = Type.Currency
        }
    	*/
    
        this.countDown();
    }
    
    async initMc (prefabId: Optional<number>) {
        if (!prefabId.valid) {
            return;
        }
        let animationClip = await MovieclipUtils.getMovieclip(prefabId.val, 'idle_ld', 16);
        let animation = this.petMcSp.getComponent(cc.Animation);
        animation.addClip(animationClip, 'idle_ld');
        animation.play('idle_ld');
        let offset = MovieclipUtils.getOffset(prefabId.val + '_idle_ld');
        this.petMcSp.node.anchorX = offset.x;
        this.petMcSp.node.anchorY = offset.y;
    }
    
    countDown () {
        let delta = this.endTime - CommonUtils.getServerTime();
        let timeInfo = CommonUtils.getHMS(delta);
        this.timeLabel.string = `${timeInfo.hour}时${timeInfo.minute}分结束`;
    }
    
    async zanOnClick () {
        // 播放一个tween 动画
        this.zanTipsNode.active = true;
        let x = this.zanTipsNode.x;
        let y = this.zanTipsNode.y;
        let action = cc.spawn(
            [
                cc.moveTo(0.3, x, y + 35)
                , cc.fadeTo(0.3, 80)
            ]);
        this.zanTipsNode.runAction(action);
        await CommonUtils.wait(0.32);
        this.zanTipsNode.active = false;
        this.zanTipsNode.y = y;
        this.zanTipsNode.opacity = 255;
    }
    
    async auctionBtnOnClick () {
        // let response = await NetUtils.sendHttpRequest(NetUtils.RequestType., '', []) as any;
        // if (response.status == 0) {
    
        // }
    }
}

