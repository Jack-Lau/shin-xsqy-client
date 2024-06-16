import { CommonUtils } from "../../utils/CommonUtils";
import { TimerUtils } from "../../utils/TimerUtils";
import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import { YibenwanliRecord, YibenwanliOverrall } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { CurrencyId } from "../../config/CurrencyId";
import { GameConfig } from "../../config/GameConfig";

const {ccclass, property} = cc._decorator;

/**
 * 定时器：
 * 1. 定时更新
 * 2. 购买冷却倒计时
 * 3. 价格变动倒计时
 * 4. 开奖时间倒计时
 */

@ccclass
export default class YbwlPanel extends cc.Component {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Label)
    poolLabel: cc.Label = null;
    @property(cc.RichText)
    lastPlayerName: cc.RichText = null;
    @property(cc.Label)
    hourLabel: cc.Label = null;
    @property(cc.Label)
    minuteLabel: cc.Label = null;
    @property(cc.Label)
    secondLabel: cc.Label = null;
    @property(cc.ToggleContainer)
    toggleContainer: cc.ToggleContainer = null;
    @property(cc.Node)
    principleNode: cc.Node = null;
    @property(cc.Sprite)
    detail: cc.Sprite = null;
    @property(cc.Node)
    dividendNode: cc.Node = null;
    @property(cc.Label)
    totalCountLabel: cc.Label = null;
    @property(cc.Label)
    buyCountLabel: cc.Label = null;
    @property(cc.Label)
    dividendLabel: cc.Label = null;
    @property(cc.Label)
    totalLabel: cc.Label = null;
    @property(cc.Button)
    buyBtn: cc.Button = null;
    @property(cc.Label)
    priceLabel: cc.Label = null;
    @property(cc.Button)
    countDownBtn: cc.Button = null;
    @property(cc.Label)
    countDownLabel: cc.Label = null;
    @property(cc.Label)
    ybAmountLabel: cc.Label = null;
	
    @property(cc.Sprite)
    ybAmountBg: cc.Sprite = null;
    @property(cc.Sprite)
    luckyBg: cc.Sprite = null;
    @property(cc.Label)
    luckyRate: cc.Label = null;
    @property(cc.Label)
    lastShotRate: cc.Label = null;

    @property(cc.Sprite)
    blockBg1: cc.Sprite = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
    
    interval = null;
    countDownInterval = null;
    waiting: boolean = true;
    
	closed: boolean = false;
	currentPool = 0;
    playerTicketCount = 0;
    timeToEnd = 0;
    timeToNextSeason = 0;
    overall: Optional<YibenwanliOverrall> = Optional.Nothing();
    
    @property(cc.SpriteFrame)
    ybSf: cc.SpriteFrame = null;
    @property(cc.Sprite)
    costSp: cc.Sprite = null;
    
    start () {
        GameConfig.startGambling();
        //
        this.countDownOnOpen();
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.detail.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 2));
        this.buyBtn.node.on(cc.Node.EventType.TOUCH_END, this.buyBtnOnClick.bind(this));
        this.toggleContainer.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.showPrincipleNode.bind(this));
        this.toggleContainer.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.showDividendNode.bind(this));
        this.blockBg1.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.luckyBg.node.on(cc.Node.EventType.TOUCH_END, this.showLuckRate.bind(this));
        this.ybAmountBg.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMessage("元宝<img src='currency_icon_150'/> 仙石世界的主要流通货币，用途极其广泛");
        });
        this.poolLabel.node.on(cc.Node.EventType.TOUCH_END, function () {
            TipsManager.showMessage('当前奖池总奖金 ' + this.currentPool + "<img src='currency_icon_150'/>")
        }.bind(this));
		//
		const action = cc.repeatForever(cc.rotateTo(10, 360))
		this.bgLighting.node.runAction(action)
		//
        this.init();
    }
    
    async init () {
        this.initYb();
        this.interval = TimerUtils.startTimer(5000, -1, this.refreshOnTimer.bind(this), null);
        let result = await NetUtils.get<YibenwanliRecord>('/yibenwanli/view/myself', []);
        this.playerTicketCount = result.fmap(x => x.ticketCount).getOrElse(0);
        this.refreshOnTimer();
        this.schedule(this.timeToEndCountDown, 1);
    }  
    
    async initYb() {
        this.ybAmountLabel.string = PlayerData.getInstance().ybAmount.toString();
    }
    
    refreshOnTimer() {
        this.refreshMainOnTimer();
    }
    
    async refreshMainOnTimer() {
        let response = await NetUtils.get<YibenwanliOverrall>('/yibenwanli/overrall', []);
        this.overall = response.toOptional();
        if (response.isRight) {
            let overall = response.right;
            this.closed = overall.closed;
            this.timeToNextSeason = overall.timeToNextSeason;
			//
            this.showPoolTween(overall.pool.toLocaleString());
            this.currentPool = overall.pool;
            //
            this.costSp.spriteFrame = this.ybSf;
            this.priceLabel.string = overall.price.toString();
            //
            this.luckyRate.string = this.playerTicketCount ? ((this.playerTicketCount * 100 / overall.ticketCount).toFixed(2) + '%') : '0%';
            this.totalCountLabel.string = overall.ticketCount.toString();
            let devidend = this.getDividend(overall.pool, overall.ticketCount);
            this.dividendLabel.string = devidend.toString();
            this.buyCountLabel.string = this.playerTicketCount.toString();
            this.totalLabel.string = Math.floor(devidend * this.playerTicketCount).toString();
			this.lastShotRate.string = '绝杀率 ' + (overall.lastShotRate * 100).toFixed(4) + '%';
			//
            if (overall.lastPurchaserPlayerName && this.closed) {
                this.lastPlayerName.string = '<color=#fffa6a>' + overall.lastPurchaserPlayerName  + '</c>赢得<img src="currency_icon_150"/>' + overall.pool * 0.6;
            } else if (overall.lastPurchaserPlayerName && !this.closed) { 
                this.lastPlayerName.string = '<color=#fffa6a>' + overall.lastPurchaserPlayerName  + '</c>即将赢得<img src="currency_icon_150"/>' + overall.pool * 0.6;
            } else {
                this.lastPlayerName.string = '敬请期待';
            }
			//
            this.timeToEnd = overall.timeToEnd;
        }
    }

    showPoolTween(pool: string) {
        if (pool == this.poolLabel.string) {
            return;
        }
        let _this = this;
        let action1 = cc.scaleTo(0.3, 1, 0);
        let center = cc.callFunc(function() { 
            _this.poolLabel.string = pool;
        }, this);
        let action2 = cc.scaleTo(0.3, 1, 1);
        this.poolLabel.node.runAction(cc.sequence([
            action1, 
            center, 
            action2
        ]))
    }
    
    timeToEndCountDown() {
        if (this.closed) {
            this.hourLabel.string = '00';
            this.minuteLabel.string = '00';
            this.secondLabel.string = '00';
        } else if (this.timeToEnd) {
            if (this.timeToEnd < 0) {
                this.hourLabel.string = '00';
                this.minuteLabel.string = '00';
                this.secondLabel.string = '00';
            } else {
                let remain = Math.floor(this.timeToEnd / 1000);
                let obj = CommonUtils.divide(remain, 3600);
                let remainHour = obj.value;
                let obj2 = CommonUtils.divide(obj.remain, 60);
                let remainMinute = obj2.value;
                let remainSeconds = obj2.remain;
                this.hourLabel.string = remainHour >= 10 ? remainHour.toString() : '0' + remainHour;
                this.minuteLabel.string = remainMinute >= 10 ? remainMinute.toString() : '0' + remainMinute;
                this.secondLabel.string = remainSeconds >= 10 ? remainSeconds.toString() : '0' + remainSeconds;
                this.timeToEnd -= 1000;
            }
        } else {
            this.hourLabel.string = '24';
            this.minuteLabel.string = '00';
            this.secondLabel.string = '00';
        }
    }
    
    timerCb (remain) {
        this.countDownLabel.string = remain.toString();
    }
    
    completeCb () {
        this.waiting = false;
        this.buyBtn.node.active = true;
        this.countDownBtn.node.active = false;
    }
    
    countDownOnOpen() {
        let result = TimerUtils.countDownOnOpen('YbwlPanel', 30, 1000, this.timerCb.bind(this), this.completeCb.bind(this));
        if (result) {
            this.waiting = true;
            this.buyBtn.node.active = false;
            this.countDownBtn.node.active = true;
            this.countDownInterval = result;
        }
    }
    
    countDownOnClick() {
        this.waiting = true;
        this.buyBtn.node.active = false;
        this.countDownBtn.node.active = true;
        this.countDownLabel.string = '30';
        this.countDownInterval = TimerUtils.countDownOnClick('YbwlPanel', 30, 1000, this.timerCb.bind(this), this.completeCb.bind(this));;
    }
    
    // events
    closePanel() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.countDownInterval) {
            clearInterval(this.countDownInterval);
        }
        GameConfig.stopGambling();
        CommonUtils.safeRemove(this.node);
        this.unschedule(this.timeToEndCountDown)
    }
    
    showLuckRate() {
        TipsManager.showMessage('活动结束时抽取1名幸运奖得主（奖金<img src="currency_icon_150"/>' + Math.floor(this.currentPool * 0.06) + '）')
    }
    
    buyBtnOnClick() {
        let obj = CommonUtils.divide(this.timeToNextSeason / 1000, 60);
        if (this.closed) {
            TipsManager.showMessage('活动即将于' + obj.value + '分' + obj.remain + '秒后开始');
            return;
        }
        if (!this.overall.valid) {
            TipsManager.showMessage('')
            return;
        }
        let price = this.overall.fmap(x => x.price).getOrElse(0);
        let cid = CurrencyId.元宝;
        let own = PlayerData.getInstance().ybAmount;
        if (own < price) {
            TipsManager.showMessage(`拥有的元宝不足`);
            return;
        }
        let _this = this;
        let callback = async () => {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/yibenwanli/purchase', [price]) as any;
			//
            if (response.status == 0) {
                TipsManager.showMessage('购买本票成功');
                _this.playerTicketCount = response.content.ticketCount;
                _this.countDownOnClick();
                _this.initYb();
                _this.refreshMainOnTimer();
				//
                this.ybAmountLabel.string = await CommonUtils.getCurrencyAmount(CurrencyId.元宝) + '';
            }
        }
        CommonUtils.showRichSCBox(
            `是否花费 <img src='currency_icon_${cid}'/><color=#900404>${price}</c> 购买一张本票？`,
            `(当前拥有<img src='currency_icon_${cid}'/>${own})`,
            "请尽快确认，价格均以确认时为准",
            callback
        );
    }
    
    showPrincipleNode() {
        this.principleNode.active = true;
        this.dividendNode.active = false;
    }
    
    showDividendNode() {
        this.principleNode.active = false;
        this.dividendNode.active = true;
    }
    
    // others
    getDividend(pool, ticketCount) {
		return Math.floor(pool * 34 / 100 / ticketCount);
    }
    
}
