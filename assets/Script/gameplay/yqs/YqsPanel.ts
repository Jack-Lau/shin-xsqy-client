import YqsPlayerItem from "./YqsPlayerItem";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import YqsRankPanel from "./YqsRankPanel";
import YqsRecordPanel from "./YqsRecordPanel";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { NetUtils } from "../../net/NetUtils";
import { Pit, PitDetail, MineArenaComplex, MineArenaRecord } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { YqsData } from "./YqsData";
import { TipsManager } from "../../base/TipsManager";
import SingleDirectionMc from "../../base/SingleDirectionMc";
import AntiqueRewardTips from "../antique/AntiqueRewardTips";

const { ccclass, property } = cc._decorator;

@ccclass
export default class YqsPanel extends cc.Component {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;

    @property(cc.Sprite)
    totalBenefitIcon: cc.Sprite = null;
    @property(cc.Label)
    totalBenefitLabel: cc.Label = null;
    @property(cc.Label)
    rateLabel: cc.Label = null;
    @property(cc.SpriteFrame)
    rateYb: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    rateKb: cc.SpriteFrame = null;

    @property(cc.Button)
    switchBtn: cc.Button = null;
    @property(cc.Button)
    recordBtn: cc.Button = null;
    @property(cc.Button)
    rankBtn: cc.Button = null;
    @property(cc.Button)
    getAwardBtn: cc.Button = null;

    // player mc
    @property(cc.Sprite)
    mySchoolIcon: cc.Sprite = null;
    @property(SingleDirectionMc)
    mc: SingleDirectionMc = null;
    @property(cc.Label)
    myNameLabel: cc.Label = null;
    
    // 3棵树
    @property([cc.Sprite])
    treeArr: Array<cc.Sprite> = []; 
    @property([YqsPlayerItem])
    players: Array<YqsPlayerItem> = [];
    @property(cc.SpriteFrame)
    ybTree: cc.SpriteFrame = null;

    // 底部信息
    @property(cc.Sprite)
    myIconSprite: cc.Sprite = null;
    @property(cc.Label)
    myRankLabel: cc.Label = null;
    @property(cc.Label)
    myCurrencyAmountLabel: cc.Label = null;
    @property(cc.Label)
    yestedayKbAmountLabel: cc.Label = null;
    @property(cc.Button)
    obtainAwardBtn: cc.Button = null;

    @property(cc.SpriteAtlas)
    currencyIconAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    currencyIconBigAtlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Node)
    contentNode: cc.Node = null;

    initial: boolean = false;

    start () {
        this.initWAndH();
        this.init();
        this.initEvents();
    }

    initWAndH () {
        let viewHeight = CommonUtils.getViewHeight();
        let viewWidth = CommonUtils.getViewWidth();
        
        if (viewHeight / viewWidth > 16 / 9) {
            this.blockBg.node.height = viewHeight;
            this.blockBg.node.width = viewHeight / 16 * 9;
            // this.contentNode.scale = (viewWidth * 16 / 9) / viewHeight;
        } else {
            
            this.blockBg.node.width = viewWidth;
            this.blockBg.node.height = viewWidth / 9 * 16;
            this.contentNode.scale = (viewHeight / 16 * 9) / viewWidth;
        }
    }

    async init () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/arena/view/myself', []);
        if (response.status === 0) {
            YqsData.myInfo = response.content;
            let time = response.content.mineArenaRecord.lastRewardResolveTime;
            let timeInfo = CommonUtils.getTimeInfo(time);
            let serverTime = CommonUtils.getServerTimeInfo();
            if (!(timeInfo.year == serverTime.year 
                && timeInfo.month == serverTime.month 
                && timeInfo.day == serverTime.day)) {
                let res1 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/arena/resolveReward', []);
                if (res1.status === 0) {
                    YqsData.resovleTime = res1.content.lastRewardResolveTime;
                    YqsData.myInfo.mineArenaRecord = res1.content;
                }
            }
        } else {
            let res3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/arena/createRecord', []);
            if (res3.status === 0) {
                YqsData.myInfo = res3.content;
            }
        }
		//
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/arena/randomCandidates', []);
        if (response2.status === 0) {
            YqsData.candidates = response2.content;        
        }
        let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/arena/currentReward', []);
        if (response3.status === 0) {
            YqsData.currentReward = response3.content;        
        }
        this.switchBtnOnClick();
        this.initTodayBenefit();
        this.initMyself();
        this.initBottom();
        this.initial = true;
        this.schedule(this.refreshTotalBenefit, 5);
    }

    initEvents () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 9));
        this.recordBtn.node.on(cc.Node.EventType.TOUCH_END, this.openRecordPanel.bind(this));
        this.rankBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.openRankPanel.bind(this)));
        this.obtainAwardBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.obtainAwardBtnOnClick.bind(this)));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.switchBtn.node.on(cc.Node.EventType.TOUCH_END, this.switchBtnOnClick.bind(this));
        EventDispatcher.on(Notify.YQS_BATTLE_END, this.refresh);
    }

    initTodayBenefit () {
        let position = YqsData.myInfo.pit.pit.position;        
		let rate = 0.000071 * Math.pow(PlayerData.getInstance().fc / 100.0, 2.0) * YqsData.myInfo.pit.factor;
        let benefit = YqsData.getRewardById(150);
		//
        this.totalBenefitLabel.string = R.take(7, String(benefit).replace('.', '-'));
        this.rateLabel.string = R.take(6, String(rate).replace('.', '-'));
    }

    async refreshTotalBenefit () {
        let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/arena/currentReward', []);
        if (response3.status === 0) {
            YqsData.currentReward = response3.content;  
            this.initTodayBenefit();      
        }
    }

    async initPlayers (pits: Array<PitDetail>) {
        if (pits.length != 3) {
            return;
        }
        let accountIds = R.map(R.path(['pit', 'accountId']), pits).join(',')
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [accountIds]);
        if (response.status === 0) {
            this.players.forEach((ele, index) => {
                ele.init(pits[index],  response.content[index]);
            });
        }
    }

    async initMyself () {
        // initMyself
        this.myNameLabel.string = PlayerData.getInstance().playerName;
        this.mc.initMyself('u');
        this.mySchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(PlayerData.getInstance().schoolId));
    }

    async initBottom () {
        this.myIconSprite.spriteFrame = await ResUtils.getPlayerRectIconById(PlayerData.getInstance().prefabId);
        this.myRankLabel.string = '' + YqsData.myInfo.pit.pit.position;
        this.myCurrencyAmountLabel.string = '' + YqsData.myInfo.mineArenaRecord.challengePoint;
        this.yestedayKbAmountLabel.string = '' + Math.floor(YqsData.getYestedayYb());
    }

    // evnets 

    switchBtnOnClick () {
        let arr = R.sort(R.ascend(R.path(['pit', 'position'])), CommonUtils.sample(3, YqsData.candidates));
        this.initPlayers(arr);
        this.treeArr.forEach((ele, index) => {
            ele.spriteFrame = this.ybTree;
        }) 
        if (this.initial) {
            TipsManager.showMessage('可抢占对手已刷新！');
        }
    }

    async obtainAwardBtnOnClick () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/arena/obtainReward', []);
        if (response.status === 0) {
            TipsManager.showMessage('领取成功！');
            let record: MineArenaRecord = response.content;
			let data = {
				awardResult: {
					currencyStacks : record.resolvedRewardStacks
				}
			}
			let panel = await CommonUtils.getPanel('gameplay/antique/AntiqueRewardTips', AntiqueRewardTips) as AntiqueRewardTips;
			panel.init(data as any, false, '昨天的摇钱树奖励，拿来吧你！！！');
			EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
			//
            YqsData.myInfo.mineArenaRecord = response.content;
        }
    }

    closePanel () {
        this.unschedule(this.refreshTotalBenefit);
        EventDispatcher.off(Notify.YQS_BATTLE_END, this.refresh);
        CommonUtils.safeRemove(this.node);
    }

    async openRecordPanel () {
        let panel = await CommonUtils.getPanel('gameplay/yqs/yqsRecordPanel', YqsRecordPanel) as YqsRecordPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async openRankPanel () {
        let panel = await CommonUtils.getPanel('gameplay/yqs/yqsRankPanel', YqsRankPanel) as YqsRankPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    refresh = async function () {
        this.init();
    }.bind(this);

}
