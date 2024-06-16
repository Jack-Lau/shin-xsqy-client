import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { PetData } from "./PetData";
import ViewPetPanel from "./ViewPetPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PetPrototypeTips from "./PetPrototypeTips";
import NdRankPanel from "./NdRankPanel";
import { TipsManager } from "../../base/TipsManager";
import { PetDetail } from "../../net/Protocol";
import PetExhibitPanel from "./PetExhibitPanel";
import Optional from "../../cocosExtend/Optional";
import { CurrencyId } from "../../config/CurrencyId";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PetGainPanel extends cc.Component {
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    awardBtn: cc.Button = null;
    @property(cc.Button)
    viewPetBtn: cc.Button = null;
    
    @property(cc.RichText)
    petGainRT: cc.RichText = null;
    
    @property(cc.Label)
    remainLabel: cc.Label = null;
    @property(cc.Sprite)
    awardSp: cc.Sprite = null;
    @property(cc.SpriteFrame)
    ytSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    materialSf: cc.SpriteFrame = null;
    @property(cc.Node)
    ytNode: cc.Node = null;
    @property(cc.Node)
    materialNode: cc.Node = null;
    
    // rank 
    @property(cc.Layout)
    rankLayout: cc.Layout = null;
    @property([cc.RichText])
    rankRTs: Array<cc.RichText> = [];


    @property(cc.Button)
    drawBtn: cc.Button = null;
    
    @property(cc.Label)
    xsPriceLabel: cc.Label = null;
    @property(cc.Label)
    ybPriceLabel: cc.Label = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;
    
    @property(cc.Label)
    serverTimeLabel: cc.Label = null;
    
    @property(cc.Sprite)
    ytSp: cc.Sprite = null;
    
    // 抽取动画
    points = [
        new cc.Vec2(0, 69),
        new cc.Vec2(-280, 176),
        new cc.Vec2(-141, 339),
        new cc.Vec2(141, 339),
        new cc.Vec2(280, 176),
    ];
    
    scales = [
        1,
        0.75,
        0.5,
        0.5,
        0.75
    ]
    
    @property([cc.Node])
    eggs: Array<cc.Node> = [];
    @property(cc.Node)
    tweenNode: cc.Node = null;
    @property(cc.Sprite)
    tweenBlockBg: cc.Sprite = null;
    
    currentPrice: number = 0;
    
    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 7));
        this.awardBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openRankPanel.bind(this)));
        this.viewPetBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.viewPets.bind(this)));
        this.drawBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.drawOnce.bind(this)));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.tweenBlockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.ytSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.showYtTips.bind(this)));
    
        this.initPrice();
        this.initRank();
        this.initYt();
        this.initBroadcast();
    
        this.schedule(this.updateServerTime, 1);
    }
    
    async initPrice () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/gachaPrice', []);
        if (response.status === 0) {
			let xsPrice = 50;
            let ybPrice = response.content;
            let ownXs = PlayerData.getInstance().kbAmount;
			let ownYb = PlayerData.getInstance().ybAmount;
            this.currentPrice = ybPrice;
            this.xsPriceLabel.string = '' + xsPrice;
            this.xsPriceLabel.node.color = cc.Color.fromHEX(this.xsPriceLabel.node.color, xsPrice > ownXs ? '#ff0000' : '#0C6D08');
            this.ybPriceLabel.string = '' + ybPrice;
            this.ybPriceLabel.node.color = cc.Color.fromHEX(this.ybPriceLabel.node.color, ybPrice > ownYb ? '#ff0000' : '#0C6D08');
        }
    }
    
    async initRank () {
        this.rankRTs.forEach(ele => ele.node.active = false);
        let rank = -1;
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/gachaRanking', []);
        let records = new Optional(response2.content).fmap(v => R.take(12, v) as Array<any>);
        let playerNames = await records
                        .fmap(x => x.map(y => y.accountId))
                        .fmap(z => z.join(','))
                        .asyncFmap(async ids => await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewName', [ids]));
        
        if (playerNames.valid) {
            records.val.forEach((ele, index) => {
                if (R.prop('accountId', ele) == PlayerData.getInstance().accountId) {
                    rank = index + 1;
                }
                this.rankRTs[index].node.active = true;
                this.rankRTs[index].string = this.getRankLabel(index + 1, playerNames.val.content[index], ele.point);
            })
        }
    
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [PlayerData.getInstance().accountId, 159]);
        if (response.status === 0) {
            this.scoreLabel.string = response.content.amount.toString() + (rank == -1 ? '(榜外)' : `(第${rank}名)`) 
        }
    }
    
    async initYt() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/gachaRankingShared', []);
        if (response.status === 0) {
            let ytNum = response.content.remainingYingting;
            this.remainLabel.string = '0' //  ytNum + '';
            this.ytNode.active = ytNum > 0;
            //this.materialNode.active = ytNum == 0;
            this.awardSp.spriteFrame = ytNum > 0 ? this.ytSf : this.materialSf;
        }
    }
    
    async drawOnce () {
        if (PlayerData.getInstance().playerLevel < 1) {
            TipsManager.showMsgFromConfig(1050);
            return;
        }
        if (PlayerData.getInstance().kbAmount < 50) {
            TipsManager.showMessage('抽取所需仙石不足');
            return;
        }
        if (PlayerData.getInstance().ybAmount < this.currentPrice) {
            TipsManager.showMessage('抽取所需元宝不足');
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/gacha', [this.currentPrice]);
        if (response.status === 0) {
            console.log(response.content);
            PetData.updatePetInfo(response.content);
			//
            let pid = response.content.pet.definitionId;
            let config = await PetData.getConfigById(pid);
            if (config.val) {
                let max = 11;
                switch (config.val.color) {
                    case 5: { max = 11; break; }
                    case 3: { max = 10; break; }
                    case 6: { max = 14; break; }
                    case 4: { max = 13; break; }
                    case 2: { max = 12; break; }  //
                }
                this.reset();
                this.tweenNode.active = true;
                await this.showTween(1, max);
                await CommonUtils.wait(0.1);
                this.tweenNode.active = false;
                this.showPetExhibit(response.content);
            }
            this.initPrice();
            this.initRank();
            this.refreshAwardInfo();
            PetData.updatePetIds();
        } else {
            this.initPrice();
        }
    }
    
    reset() {
        this.eggs.forEach((node, index) => {
            node.x = this.points[index].x;
            node.y = this.points[index].y;
            node.scaleX = node.scaleY = this.scales[index]
        });
    }
    
    async showTween(count: number, max: number) {
        if (count >= max) {
            return;
        }
        let time = 0.1 + 0.3 * (count / max);
        this.eggs.forEach((node, index) => {
            node.runAction(cc.spawn([
                cc.scaleTo(time, this.scales[(count + index) % 5]),
                cc.moveTo(time, this.points[(count + index) % 5])
            ]));
        });
        await CommonUtils.wait(time);
        await this.showTween(count + 1, max);
    }
    
    async showPetExhibit(petDetail: PetDetail) {
        let panel = await CommonUtils.getPanel('gameplay/pet/petExhibitPanel', PetExhibitPanel) as PetExhibitPanel;
        panel.init(petDetail);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    
    getRankLabel(rank: number, name: string, score: number) {
        if (rank > 10) {
            return `<color=#c69a7d>${rank} ${name}</c>  <color=#7e7e7e>${score}</c>`;
        } else {
            return `${rank} ${name}  <color=#900404>${score}</c>`;
        }
    }
    
    closePanel () {
        this.stopShow = true;
        this.unschedule(this.updateServerTime);
        CommonUtils.safeRemove(this.node);
    }
    
    async openRankPanel () {
        let panel = await CommonUtils.getPanel('gameplay/pet/ndRankPanel', NdRankPanel) as NdRankPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    
    async viewPets () {
        let panel = await CommonUtils.getPanel('gameplay/pet/viewPetPanel', ViewPetPanel) as ViewPetPanel;
        panel.init();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }
    
    async showYtTips () {
        let remain = parseInt(this.remainLabel.string);
        if (remain == 0) {
            TipsManager.showMessage("内含 扭蛋礼盒 一个")
        } else {
            let panel = await CommonUtils.getPanel('gameplay/pet/petPrototypeTips', PetPrototypeTips) as PetPrototypeTips;
            panel.init(300017);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        }
    }
    
    // refresh center award info
    bcArray = [];
    stopShow = false;
    
    async initBroadcast() {
        await this.refreshAwardInfo();
        this.showBroadcast(0);
    }
    
    async refreshAwardInfo () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/latestInterestingGachas', []);
        if (response.status === 0) {
            this.bcArray = response.content;
        }
    }
    
    async showBroadcast (index: number) {
        if (this.stopShow) return;
        if (this.bcArray.length == 0) {
            await CommonUtils.wait(5);
            this.showBroadcast(index + 1);
            return;
        }
        if (index >= this.bcArray.length) {
            index = 0;
        }
        let action1 = cc.spawn(cc.moveTo(0.2, 39, 5.6), cc.fadeTo(0.2, 0));
        this.petGainRT.node.runAction(action1);
        await CommonUtils.wait(0.3);
        let playerName = this.bcArray[index].playerName;
        let config = await PetData.getConfigById(this.bcArray[index].petDefinitionId);
        let petName = config.valid ? config.val.name : '';
        let color = config.valid ? CommonUtils.getPetTipColorByColor(config.val.color) : '#ffffff'
        this.petGainRT.string = `恭喜 <color=#8cf602>${playerName}</c> 获得绝世宠物 <color=${color}>${petName}</c>`;
        this.petGainRT.node.y = -54.4;
        let action2 = cc.spawn(cc.moveTo(0.2, 39, -24.4), cc.fadeTo(0.2, 255));
        this.petGainRT.node.runAction(action2);
        await CommonUtils.wait(4.22);
        this.showBroadcast(index + 1);
    }
    
    updateServerTime() {
        let serverTime = CommonUtils.getServerTimeInfo();
        let hour = this.toStr(serverTime.hour);
        let minute = this.toStr(serverTime.minute);
        let seconds = this.toStr(serverTime.seconds);
        this.serverTimeLabel.string = `当前时间 ${hour}:${minute}:${seconds}`;
    }
    
    toStr = num =>  (num < 10 ? '0' : '') + num;
}
