import ItemWithEffect from "../../base/ItemWithEffect";
import { CommonUtils } from "../../utils/CommonUtils";
import { CurrencyStack, Equipment, Pet, CommodityDetail, CommodityPlayerRecord } from "../../net/Protocol";
import { HspmConfig } from "./HspmConfig";
import { PetData } from "../pet/PetData";
import { NetUtils } from "../../net/NetUtils";
import { PetUtils } from "../pet/PetUtils";
import { EquipUtils } from "../equipment/utils/EquipmentUtils";
import Optional from "../../cocosExtend/Optional";
import { TitleConfig } from "../../player/title/TitleConfig";
import PlayerData from "../../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

enum Type {Pet, Equipment, Title, Currency}

const { ccclass, property } = cc._decorator;
@ccclass
export default class HspmPanelItem extends cc.Component {
    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
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

    @property(cc.Node)
    zanGroupNode: cc.Node = null;
    @property(cc.Node)
    zanTipsNode: cc.Node = null;

    endTime: number = 0;
    data = null;
    equipment: Equipment = null;
    pet: Pet = null;
    titleId: number = null;
    currencyId: number = null;
    type: Type = Type.Currency

    start () {
        this.schedule(this.countDown, 60);
        this.initEvents();
    }

    initEvents () {
        let _this = this;

        this.item.node.on(cc.Node.EventType.TOUCH_END, async (e) => {
            if (_this.type == Type.Pet) {
                PetUtils.showPetTips({pet: _this.pet, parameters: null})
            } else if (_this.type == Type.Currency) {
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

        if (playerRecord.valid && playerRecord.val.likeCount > 0) {
            this.zanNumLabel.string = (detail.likeCount - playerRecord.val.likeCount) + '+' + playerRecord.val.likeCount
        } else {
            this.zanNumLabel.string = detail.likeCount + '';
        }

        let config = await HspmConfig.getConfigById(R.prop('definitionId', data));
        this.nameLabel.string = config.name;
        if (config.type == 1) { // 神装
            this.item.initWithEquipment(null);
            this.equipment = null;
            this.type = Type.Equipment
        } else if (config.type == 2) { // 神宠
            let godPet = await PetData.getGodPet()
            this.item.initWithPet(godPet)
            this.pet = godPet
            this.type = Type.Pet
        } else if (config.type == 3) { // 称号
            let titleInfo = await TitleConfig.getGodConfigById(config.auctionId)
            this.item.initWithTitle(titleInfo.titleInfo.id);
            this.titleId = config.auctionId
            this.type = Type.Title
        } else if (config.type == 4) { // 货币
            this.item.initWithCurrency({currencyId: config.auctionId, amount: 1});
            this.currencyId = config.auctionId
            this.type = Type.Currency
        }

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
        this.countDown();
    }

    countDown () {
        let delta = this.endTime - CommonUtils.getServerTime()
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

