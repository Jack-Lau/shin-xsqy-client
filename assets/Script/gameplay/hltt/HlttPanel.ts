import PanelBroadcast from "../../base/PanelBroadcast";
import { CommonUtils } from "../../utils/CommonUtils";
import { HlttData } from "./HlttData";
import { precondition, setDefault } from "../../utils/BaseFunction";
import ChipDisplay from "./ChipDisplay";
import { NetUtils } from "../../net/NetUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { BaccaratBet, BaccaratGame } from "../../net/Protocol";
import HlttRecordBox from "./HlttRecordBox";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import { Chat } from "../../chat/Chat";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

type BetState = "Bet" | "Open" | "Wait"
type MahjongStatus = "SHOW" | "HIDE";

@ccclass
export default class HlttPanel extends cc.Component {
    @property(cc.Node)
    blockNode: cc.Node = null;
    @property(cc.Node)
    contentNode: cc.Node = null;
    // top
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    recordBtn: cc.Button = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Sprite)
    flagSp: cc.Sprite = null;
    @property(cc.Label)
    countdownLabel: cc.Label = null;
    @property([cc.Sprite])
    mahjongCards: Array<cc.Sprite> = [];

    @property(HlttRecordBox)
    recordBox: HlttRecordBox = null;


    // broadcast
    @property(PanelBroadcast)
    broadcast: PanelBroadcast = null;
    
    // bet
    @property([cc.Node])
    myBetNodes: Array<cc.Node> = [];
    @property([cc.Label])
    myBetLabels: Array<cc.Label> = [];
    @property([cc.Label])
    allBetLabels: Array<cc.Label> = [];
    @property([cc.Node])
    frameNodes: Array<cc.Node> = [];
    @property([cc.Node])
    withdrawNodes: Array<cc.Node> = [];
    @property([cc.Label])
    withdrawLabels: Array<cc.Label> = [];
    @property([cc.Button])
    withdrawBtn: Array<cc.Button> = [];
    
    @property([ChipDisplay])
    chipDisplays: Array<ChipDisplay> = [];
    
    // 底部筹码
    @property([cc.Node])
    cmNodes: Array<cc.Node> = [];
    @property([cc.Node])
    selectNodes: Array<cc.Node> = [];
    @property(cc.Sprite)
    betDragSp: cc.Sprite = null;
    
    // own
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Label)
    remainLabel: cc.Label = null;
    
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    mahjongAtlas: cc.SpriteAtlas = null;
    
    @property([cc.Sprite])
    winFlag: Array<cc.Sprite> = [];
    
    touchMove: boolean = false;
    betIndex = 0;
    mahjongStatus: Array<MahjongStatus> = ["HIDE", "HIDE", "HIDE", "HIDE"]
    betState: BetState = "Bet"
    fetchOverallMiddle = false;
    dragRes =
        ["icon_40"
            , "icon_200"
            , "icon_1000"
            , "icon_5000"]
    
    scale = 1;
    start() {
        this.initEvents();
        this.init();
    
        let h = CommonUtils.getViewHeight();
        let w = CommonUtils.getViewWidth();
    
        if (h < w * 16 / 9) {
            this.scale = (h / 16 * 9) / 768
            this.contentNode.scale = this.scale;
        }
    }
    
    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.cmNodes.forEach((node, index) => {
            node.on(cc.Node.EventType.TOUCH_START, this.touchStart(index), this);
            node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
            node.on(cc.Node.EventType.TOUCH_END, this.onTouchCancel, this);
        });
        this.mahjongCards.forEach((card, index) => {
            card.node.on(cc.Node.EventType.TOUCH_END, this.mahjongOnClick(index), this);
            card.getComponent(cc.Animation).on('finished', this.onAniFinished(index), this);
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 37));
        this.schedule(this.countdown, 1);
        this.schedule(this.updateOverall, 2);
        this.recordBtn.node.on(cc.Node.EventType.TOUCH_END, this.showRecord, this);
        this.frameNodes.forEach((node, index) => node.on(cc.Node.EventType.TOUCH_END, this.showWithDraw(index), this));
        this.withdrawNodes.forEach((node, index) => node.on(cc.Node.EventType.TOUCH_END, this.hideWithDraw(index), this));
        this.withdrawBtn.forEach((btn, index) => btn.node.on(cc.Node.EventType.TOUCH_END, this.withdraw(index), this))
    }
    
    async init() {
        HlttData.fetchOverall();
        EventDispatcher.on(Notify.HLTT_OVERALL_UPDATE, this.refresh);
        this.broadcast.init(3290005, c => {
            let description = '恭喜 [ffe066]${playerName}[ffffff] 赢得 [ffe066]${amount}[ffffff] 仙石！'
            let content = '';
            c.elements.forEach(e => {
                content += CommonUtils.replaceArr(description, e.content.args);
            });
            return CommonUtils.textToRichText(content);
        });
    }
    
    refresh = function() {
        let overall = HlttData.getOverall();
        const currentBet = new Array(6);
        for (let i = 0; i < 6; ++i) {
            currentBet[i] = 0;
        }
        overall.currentBet.forEach((bet, index) => {
            if (index == 2) {
                currentBet[1] = CommonUtils.toCKb(bet)
                this.allBetLabels[1].string = CommonUtils.formatCurrencyAmount(CommonUtils.toCKb(bet));
            } else if (index == 1) {
                currentBet[2] = CommonUtils.toCKb(bet)
                this.allBetLabels[2].string = CommonUtils.formatCurrencyAmount(CommonUtils.toCKb(bet));
            } else {
                currentBet[index] = CommonUtils.toCKb(bet)
                this.allBetLabels[index].string = CommonUtils.formatCurrencyAmount(CommonUtils.toCKb(bet));
            }
        });

        this.initBetInfo(overall.baccaratBet, currentBet);

        this.ownLabel.string = PlayerData.getInstance().kbAmount + '';
    }.bind(this);
    
    initBetInfo(data: BaccaratBet, currentBet: number[]) {
        [   R.prop('bet_0', data), R.prop('bet_2', data), R.prop('bet_1', data), 
            R.prop('bet_3', data), R.prop('bet_4', data), R.prop('bet_5', data)
        ].map(x => setDefault(x, 0)).forEach((bet, index) => {
            this.myBetNodes[index].active = bet > 0;
            this.myBetLabels[index].string = String(CommonUtils.toCKb(bet));
            this.withdrawLabels[index].string = String(CommonUtils.toCKb(bet));
            this.chipDisplays[index].init(CommonUtils.toCKb(bet), currentBet[index]);
        });
    
        this.cmNodes.forEach(node => CommonUtils.ungrey(node.getComponent(cc.Sprite)));
        let total = CommonUtils.toCKb(HlttData.getBetAmount());
        if (total > 5000) {
            CommonUtils.grey(this.cmNodes[3].getComponent(cc.Sprite))
        }
        if (total > 9000) {
            CommonUtils.grey(this.cmNodes[2].getComponent(cc.Sprite))
        }
        if (total > 9800) {
            CommonUtils.grey(this.cmNodes[1].getComponent(cc.Sprite))
        }
        if (total > 9960) {
            CommonUtils.grey(this.cmNodes[0].getComponent(cc.Sprite))
        }
    }
    
    countdown() {
        let serverTimeInfo = CommonUtils.getServerTimeInfo();
        let s = serverTimeInfo.seconds;
        if (s < 30) {
            let showNum = 30 - s;
            this.countdownLabel.string = showNum >= 10 ? String(showNum) : '0' + showNum;
        } else if (s < 50) {
            let showNum = 50 - s;
            this.countdownLabel.string = showNum >= 10 ? String(showNum) : '0' + showNum;
        } else {
            let showNum = s - 50;
            this.countdownLabel.string = showNum >= 10 ? String(showNum) : '0' + showNum;
        }
        
        let res = s <= 30 ? "font_huanletongtong3" : (s <= 50 ? "font_qingfanpai" : "font_qingdengdai"); 
        this.flagSp.spriteFrame = this.atlas.getSpriteFrame(res);
        this.betState = s <= 30 ? "Bet" : (s <= 50 ? "Open" : "Wait");
    
        if (s < 30 && this.mahjongStatus.filter(x => x == "HIDE").length < 4) {
            this.mahjongStatus = ["HIDE", "HIDE", "HIDE", "HIDE"]
            this.resetMahjong();
        }
    
        if (s > 30 && !HlttData.getOverall().baccaratGame && !this.fetchOverallMiddle) {
            this.fetchOverallMiddle = true;
            HlttData.fetchOverall();
        }
    
        this.mahjongCards.forEach(c => c.node.opacity = s > 30 ? 255 : 50);
    
        if (s > 50 && this.mahjongStatus.filter(x => x == "SHOW").length < 4) {
            this.mahjongStatus = ["SHOW", "SHOW", "SHOW", "SHOW"];
            [0, 1, 2, 3].forEach(i => this.showMahjong(i));
            this.showWinTween();
        }
    }


    isPlayingTween: boolean = false;
    async showWinTween() {
        if (this.isPlayingTween) {
            return;
        }
        this.isPlayingTween = true;
        let winIndexes = HlttData.getWinIndexes();
        winIndexes.forEach(i => {
            this.winFlag[i].node.active = true;
            this.winFlag[i].getComponent(cc.Animation).play();
        })
        await CommonUtils.wait(1);
        this.showRewardTips();
        this.isPlayingTween = false;
    }
    
    showRewardTips() {
        let winIndexes = HlttData.getWinIndexes();
        let rewards = [2, 9, 2, 18, 18, 108];
        let names = ["红", "平", "蓝", "红方同对筒子", "蓝方同对筒子", "全白板"]
        let data = HlttData.getOverall().baccaratBet;
        [   R.prop('bet_0', data), R.prop('bet_2', data), R.prop('bet_1', data), 
            R.prop('bet_3', data), R.prop('bet_4', data), R.prop('bet_5', data)
        ].map(x => setDefault(x, 0)).forEach((amount, index) => {
            if (amount == 0) {
                return;
            }
            if (winIndexes.indexOf(index) != -1) {
                let winAmount = CommonUtils.toCKb(rewards[index] * amount * 0.95);
                TipsManager.showMessage(`您上轮竞猜${names[index]}，获得${winAmount}<img src='currency_icon_151'/>！`);
            } else {
                TipsManager.showMessage(`您上轮竞猜${names[index]}，获得0<img src='currency_icon_151'/>！`);
            }
        });
        this.ownLabel.string = PlayerData.getInstance().kbAmount + '';
    }
    
    resetMahjong() {
        let sf = this.mahjongAtlas.getSpriteFrame('bg_gaizhe');
        this.mahjongCards.forEach(card => card.spriteFrame = sf);
        this.winFlag.forEach(f => f.node.active = false);
        this.withdrawNodes.forEach(node => node.active = false);
        this.fetchOverallMiddle = false;
        HlttData.fetchOverall();
    }
    
    showMahjong(index) {
        let point = HlttData.getMahjongPoint(index);
        if (point < 10 && point > 0) {
            this.mahjongCards[index].spriteFrame = this.mahjongAtlas.getSpriteFrame('bg_' + point);
        } else {
            this.mahjongCards[index].spriteFrame = this.mahjongAtlas.getSpriteFrame('bg_bai');
        }
    }
    
    mahjongOnClick(index) {
        let _this = this;
        return function () {
            if (precondition(_this.mahjongStatus[index] == "HIDE")
                && precondition(_this.betState == "Open")) {
                _this.mahjongStatus[index] = "SHOW"
                let ani = _this.mahjongCards[index].getComponent(cc.Animation);
                ani.play();
            }
        }
    }
    
    onAniFinished(index: number) {
        let _this = this;
        return function () {
            if (_this.mahjongStatus.filter(x => x == "SHOW").length == 4) {
                _this.showWinTween();
            }
            _this.showMahjong(index);
        }
    }
    
    /******* start event listeners *******/
    closePanel() {
        this.unschedule(this.countdown);
        this.unschedule(this.updateOverall);
        CommonUtils.safeRemove(this.node);
    }
    
    onTouchCancel() {
        if (!this.touchMove) {
            return;
        }
        this.touchMove = false;
        this.betDragSp.node.active = false;
    
        // 隐藏选中效果
        let index = R.findIndex((x: cc.Node) => x.opacity > 0 , this.frameNodes);
        // 确实选中投注点
        if (index != -1) {
            this.frameNodes.forEach(node => node.opacity = 0)
            HlttData.bet(index, this.betIndex);
            this.selectNodes.forEach(node => node.active = false);
        }
    
        this.costLabel.string = '';
        this.remainLabel.string = '';
    
    }
    
    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.touchMove) {
            return;
        }
        let location = event.getLocation();
        let pos = CommonUtils.addVec(location, new cc.Vec2(-384, -CommonUtils.getViewHeight() / 2));
        this.betDragSp.node.x = pos.x / this.scale;
        this.betDragSp.node.y = pos.y / this.scale;
    
        let isShow = false;
        this.frameNodes.forEach(node => {
            node.opacity = 0;
            if (isShow) {
                return;
            } else {
                if (CommonUtils.hitTest(node, pos)) {
                    isShow = true;
                    node.opacity = 255;
                }
            }
        })
    }
    
    touchStart(index: number) {
        let _this = this;
        return function (event) {
            if (precondition(_this.betState == "Bet", "现在不可竞猜") &&
                precondition(CommonUtils.toCKb(HlttData.getBetAmount()) + HlttData.amountInfo[index] <= 10000, 1272) &&
                precondition(PlayerData.getInstance().kbAmount >= HlttData.amountInfo[index], 1127)) {
                _this.touchMove = true;
                _this.betIndex = index;
                _this.selectNodes.forEach(node => node.active = false);
                _this.selectNodes[index].active = true;
                let location = event.getLocation();
                let pos = CommonUtils.addVec(location, new cc.Vec2(-384, -CommonUtils.getViewHeight() / 2));
                _this.betDragSp.spriteFrame = _this.atlas.getSpriteFrame(_this.dragRes[index]);
                _this.betDragSp.node.active = true;
                _this.betDragSp.node.x = pos.x;
                _this.betDragSp.node.y = pos.y;
    
                let cost = HlttData.amountInfo[index];
                this.costLabel.string = '-' + cost;
                this.remainLabel.string = '=' + (PlayerData.getInstance().kbAmount - cost);
            }
        }
    }
    
    async showRecord() {
        let records = await NetUtils.get<Array<BaccaratGame>>('/baccarat/record', []);
        if (records.isRight) {
            this.recordBox.init(R.reverse(records.right));
            this.recordBox.node.active = true;
        }
    }
    
    /******** end event listeners ********/
    
    updateOverall() {
        if (this.betState == "Bet") {
            HlttData.fetchOverall();
        }
    }
    
    showWithDraw(index: number) {
        let _this = this;
        return function () {
            let data = HlttData.getOverall().baccaratBet;
            let betAmounts = [   R.prop('bet_0', data), R.prop('bet_2', data), R.prop('bet_1', data), 
                R.prop('bet_3', data), R.prop('bet_4', data), R.prop('bet_5', data)
            ].map(x => setDefault(x, 0))
            let betAmount = betAmounts[index];
            if (betAmount == 0) {
                TipsManager.showMessage('将仙石拖动至相应区域即可竞猜');
            } else {
                _this.withdrawNodes[index].active = true;
            }
        }
    }
    
    hideWithDraw(index: number) {
        let _this = this;
        return function () {
            _this.withdrawNodes[index].active = false;
        }
    }
    
    withdraw(index: number) {
        let _this = this;
        return function () {
            HlttData.unbet(index);
            _this.hideWithDraw(index)();
        }
    }
	
}