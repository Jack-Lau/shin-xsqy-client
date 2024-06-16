import { CommonUtils } from "../../utils/CommonUtils";
import { RankingElement, SimpleRankingRecord, PetDetail, CurrencyStack } from "../../net/Protocol";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import ItemWithEffect from "../../base/ItemWithEffect";
import {RankUtils} from "./RankUtils"
import ViewPlayerBox from "../../base/ViewPlayerBox";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { PetData } from "../pet/PetData";
import PetTips from "../pet/PetTips";
import { Currency } from "../../bag/ItemConfig";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class RankPanelItem extends cc.Component {
    @property(cc.Label)
    rankLabel: cc.Label = null;
    @property(cc.Sprite)
    rankSp: cc.Sprite = null;
    @property(cc.Sprite)
    bgItem: cc.Sprite = null;
    @property(cc.Sprite)
    infoBg: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;
    @property(ItemWithEffect)
    item: ItemWithEffect = null;
    // 奖励
    @property(cc.Node)
    type1Node: cc.Node = null;
    @property(cc.Node)
    type2Node: cc.Node = null;
    @property(cc.Node)
    nothingNode: cc.Node = null;
    @property(cc.Node)
    awardNode: cc.Node = null;

    // type1
    @property(cc.Sprite)
    currencyIconSp: cc.Sprite = null;
    @property(cc.Label)
    percentLabel: cc.Label = null;
    @property(cc.Label)
    totalLabel: cc.Label = null;

    // type2
    @property(ItemWithEffect)
    awardItem1: ItemWithEffect = null;
    @property(ItemWithEffect)
    awardItem2: ItemWithEffect = null;
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    rankData: RankingElement = null;
    petDetail: PetDetail = null;
    isPet: boolean = false;

    stack1: CurrencyStack = null;
    stack2: CurrencyStack = null;

    start () {
       this.node.on(cc.Node.EventType.TOUCH_END, this.viewPlayer.bind(this)); 
       let _this = this;
       this.awardItem1.node.on(cc.Node.EventType.TOUCH_END, function (e) {
           if (!_this.stack1) {
               return;
           }
           CommonUtils.showCurrencyTips(_this.stack1)(e);
           e.stopPropagation();
       });
       this.awardItem2.node.on(cc.Node.EventType.TOUCH_END, function (e) {
        if (!_this.stack2) {
            return;
        }
        CommonUtils.showCurrencyTips(_this.stack2)(e);
        e.stopPropagation();
    });
    }

    async init(data: RankingElement, rankId: number) {
        if (!data) return;
        this.isPet = false;
        this.setRankBg(data.currentRank);
        this.nameLabel.string = data.playerBaseInfo.player.playerName;
        this.scoreLabel.string = data.rankValue.toString();
        this.levelLabel.string = data.playerBaseInfo.player.playerLevel + '级';
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(data.playerBaseInfo.schoolId));
        let iconSf = await ResUtils.getPlayerRectIconById(data.playerBaseInfo.player.prefabId);
        this.rankData = data;
        this.levelLabel.node.x = -75;
        this.item.init({
            "iconSf": iconSf,
            "desc": "",
            "color": null,
            "showEffect": false,
            "cb": null
        });
        this.initRight(rankId, data.currentRank);
    }

    initWithPet(petDetail: PetDetail, rank, score, playerName, rankId) {
        if (!petDetail) return;
        this.isPet = true;
        this.petDetail = petDetail;
        this.setRankBg(rank);
        this.nameLabel.string = petDetail.pet.petName;
        this.scoreLabel.string = score.toString();
        this.levelLabel.string = '归属 ' + playerName;
        this.levelLabel.node.x = -119;
        this.item.initWithPet(petDetail.pet);
        this.initRight(rankId, rank);
        this.schoolIcon.spriteFrame = null;
    }

    async initRight(rankId: number, rank: number) {
        if (rank > 100) {
            this.type1Node.active = false;
            this.type2Node.active = false
            this.nothingNode.active = true;
            return;
        }
        let model = await RankUtils.getAwardModel(rankId, rank);
        this.type1Node.active = model.way == 1;
        this.type2Node.active = model.way == 2;
        if (model.way == 1) {
            if (!model.parameter1) {
                this.nothingNode.active = true;
                this.type1Node.active = true;
            } else {
                let percent = R.take(5, (model.parameter1 * 1000).toString().replace('.', '-'));
                this.percentLabel.string = `x${percent}@`;
                this.totalLabel.string = '=' + Math.floor(RankUtils.totalKb * model.parameter1 / 1000);
            }
        } else if (model.way == 2) {
            if (model.parameter1 && model.currency1) {
                this.stack1 = {currencyId: model.currency1, amount: model.parameter1}
                this.awardItem1.initWithCurrency(this.stack1);
            }
            if (model.parameter2 && model.currency2) {
                this.stack2 = {currencyId: model.currency2, amount: model.parameter2}
                this.awardItem2.initWithCurrency(this.stack2);
            }
            this.awardItem1.node.active = model.parameter1 != undefined && model.currency1 != undefined;
            this.awardItem2.node.active = model.parameter2 != undefined && model.currency2 != undefined;
            this.nothingNode.active = !this.awardItem1.node.active && !this.awardItem2.node.active;
        }
    }

    showAward () {
        this.awardNode.active = true;
        this.scoreLabel.node.active = false;
    }

    showRank () {
        this.awardNode.active = false;
        this.scoreLabel.node.active = true;
    }

    async setRankBg(rank: number) {
        let lessThan4 = rank < 4;
        this.bgItem.spriteFrame = this.getSf(lessThan4 ? `bg_paihangbangdi${rank}` : 'bg_paihangbangdi');
        this.infoBg.spriteFrame = this.getSf(lessThan4 ? `bg_paihangbangmingzidi${rank}` : 'bg_paihangbangmingzidi');
        this.rankSp.node.active = lessThan4;
        this.rankLabel.node.active = !lessThan4;
        if (lessThan4) {
            this.rankSp.spriteFrame = this.getSf(`icon_paihang${rank}`)
        } else {
            this.rankLabel.string = rank.toString();
        }
    }

    getSf (name: string): cc.SpriteFrame {
        return this.atlas.getSpriteFrame(name);
    }


    closePanel () {
        CommonUtils.safeRemove(this.node)
    }

    async viewPlayer () {
        if (this.isPet) {
            await this.viewPet();
            return;
        }
        if (this.rankData == undefined) {
            return;
        }
        let panel = await CommonUtils.getPanel('base/viewPlayerBox', ViewPlayerBox) as ViewPlayerBox;
        panel.init(this.rankData.playerBaseInfo);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async viewPet () {
        if (!this.petDetail) { return; }
        let panel = await CommonUtils.getPanel('gameplay/pet/petTips', PetTips) as PetTips;
        panel.init(this.petDetail);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
}
