import RivalItem from "./RivalItem";
import { CommonUtils } from "../../utils/CommonUtils";
import Optional from "../../cocosExtend/Optional";
import ActivityBoxTips, { JustShow } from "../activity/ActivityBoxTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import RivalConfirmBox from "./RivalConfirmBox";
import StartRivalAnimPanel from "./StartRivalAnimPanel";
import { BrawlOverall, BrawlStatus, PlayerDetail, PlayerBaseInfo } from "../../net/Protocol";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import RivalRewardPanel from "./RivalRewardPanel";
import PlayerData from "../../data/PlayerData";
import FriendsData from "../friends/FriendsData";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { ShowAward } from "../activity/ActivityData";
import ItemConfig, { ItemDisplay } from "../../bag/ItemConfig";
import { ShopUtils } from "../../shop/ShopUtils";
import RivalDate from "./RivalDate";
import { BattleConfig } from "../../battle/BattleConfig";

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

enum RivalState { Waiting = 0, Open, Team, War, Award }

interface BrawlStageInfo {
    id: number;
    awardPartition: number;
    showAwardOne: number;
    showAwardTwo: number;
    showAwardThree: number;
    showAwardFour: number;
}

@ccclass
export default class RivalPanel extends cc.Component {

    @property(cc.Node)
    contentBoxNode: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    storeBtn: cc.Button = null;
    @property(cc.Button)
    matchBtn: cc.Button = null;
    @property(cc.Button)
    rewardBtn: cc.Button = null;
    @property(cc.Button)
    stateBtn: cc.Button = null;
    @property(cc.Sprite)
    stateBtnText: cc.Sprite = null;
    @property(cc.SpriteFrame)
    stateBtnTextSps: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    rewardBox: cc.Sprite = null;
    @property(cc.SpriteFrame)
    rewardBoxSps: cc.SpriteFrame[] = [];

    @property(RivalItem)
    rivalItemList: RivalItem[] = [];

    @property(cc.Label)
    sloganLabel: cc.Label = null;
    @property(cc.Label)
    victoryLabel: cc.Label = null;

    @property(cc.Node)
    opportunity: cc.Node[] = [];

    rivalState: RivalState = RivalState.Waiting;

    rivalData: BrawlOverall = null

    playerTeam: any[] = [];
    enemyTeam: any[] = [];

    rewardConfig: BrawlStageInfo[] = [];

    onLoad() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        if (cc.winSize.height / cc.winSize.width < 16 / 9) {
            this.contentBoxNode.scale = cc.winSize.height / 1366;
        }

    }

    async start() {
        let config = await ConfigUtils.getConfigJson('BrawlStageInfo');
        for (let key in config) {
            let value = config[key];
            this.rewardConfig.push(value);
        }
        await this.init();
        this.initEvents();
    }

    async init() {
        //查询自己的乱斗信息
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/brawl/get', []) as any;
        if (response.status === 0) {
            this.rivalData = response.content;
            if (this.rivalData.brawlRecord.currentBattleSessionId != 0) {
                this.onBattle();
                return;
            }
            this.sloganLabel.string = '你可以上天了！';
            this.victoryLabel.string = this.rivalData.brawlRecord.currentStage.toString();
            this.opportunity.forEach((node, index) => {
                if (index < this.rivalData.brawlRecord.brawlCount) {
                    node.opacity = 255;
                } else {
                    node.opacity = 0;
                }
            });
            let awardPartition = this.rewardConfig[this.rivalData.brawlRecord.currentStage].awardPartition;
            this.rewardBox.spriteFrame = this.rewardBoxSps[awardPartition - 2];

            this.setState();
            this.playerTeam.length = 3;
            this.playerTeam[0] = this.getPlayerItemData();
            this.rivalItemList[0].init(null, new Optional<any>(this.playerTeam[0]));
            this.setPlayerTeam();
        }

    }

    setPlayerTeam() {
        if (this.rivalData.teamMembers != null && this.rivalData.teamMembers.length > 0) {
            this.playerTeam[1] = this.getItemData(this.rivalData.teamMembers[0]);
            this.playerTeam[2] = this.getItemData(this.rivalData.teamMembers[1]);

            this.rivalItemList[1].init(this.rivalData.teamMembers[0], new Optional<any>(this.playerTeam[1]));
            this.rivalItemList[2].init(this.rivalData.teamMembers[1], new Optional<any>(this.playerTeam[2]));
        } else {
            this.rivalItemList[1].init(this.rivalData.teamMembers[0], new Optional<any>(null));
            this.rivalItemList[2].init(this.rivalData.teamMembers[1], new Optional<any>(null));
        }
    }

    getPlayerItemData() {
        let data = {} as { accountId: number, schoolId: number, definitionId: number, prefabId: number, weaponId: number, name: string, level: number, fc: number };
        data.accountId = PlayerData.getInstance().accountId;
        data.schoolId = PlayerData.getInstance().schoolId;
        data.definitionId = PlayerData.getInstance().title.fmap(x => x.definitionId).getOrElse(null);
        data.prefabId = PlayerData.getInstance().prefabId;
        data.weaponId = PlayerData.getInstance().equipments.weapon.fmap(x => x.definitionId).getOrElse(null);
        data.name = PlayerData.getInstance().playerName;
        data.level = PlayerData.getInstance().playerLevel;
        data.fc = PlayerData.getInstance().fc;
        return data;
    }


    getItemData(player: PlayerBaseInfo) {
        let data = {} as { accountId: number, schoolId: number, definitionId: number, prefabId: number, weaponId: number, name: string, level: number, fc: number };
        data.accountId = player.player.accountId;
        data.schoolId = player.schoolId;
        data.definitionId = player.titleDefinitionId;
        data.prefabId = player.player.prefabId;
        data.weaponId = player.weaponId
        data.name = player.player.playerName;
        data.level = player.player.playerLevel;
        data.fc = player.player.fc;
        return data;
    }


    initEvents() {
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 22));
        this.storeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onStoreBtn.bind(this)));
        this.matchBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onMatchBtn.bind(this)));
        this.rewardBtn.node.on(cc.Node.EventType.TOUCH_END, this.onRewardBtn.bind(this));
        this.stateBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onStateBtn.bind(this)));
    }

    setState() {
        switch (this.rivalData.brawlRecord.status) {
            case "NOT_START":
                if (this.rivalData.brawlRecord.resetCount == 0) {
                    this.rivalState = RivalState.Waiting;
                    this.sloganLabel.string = '今天乱斗已完成，明天再来吧！';
                } else {
                    this.rivalState = RivalState.Open;
                    this.sloganLabel.string = '今天挑战已开启！点击“开启”乱斗！';
                }
                break;
            case "CREATE_TEAM":
                this.rivalState = RivalState.Team;
                if (this.rivalData.teamMembers != null && this.rivalData.teamMembers.length > 0) {
                    this.sloganLabel.string = '点击“确认队伍”开始乱斗！';
                } else {
                    this.sloganLabel.string = '点击“匹配队友”组队吧！';
                }
                break;
            case "IN_CHALLENGE":
                this.rivalState = RivalState.War;
                this.sloganLabel.string = '点击“开战”继续战斗吧！';
                break;
            case "END":
                this.rivalState = RivalState.Award;
                if (this.rivalData.brawlRecord.currentStage == 12) {
                    this.sloganLabel.string = '恭喜达到斗战巅峰！成功通关！快领奖吧！';
                } else {
                    this.sloganLabel.string = '今日发挥不错！明天再接再厉！快领奖吧！';
                }
                break;
        }
        this.stateBtnText.spriteFrame = this.stateBtnTextSps[this.rivalState];
    }

    async onStateBtn() {
        switch (this.rivalState) {
            case RivalState.Waiting:
                TipsManager.showMsgFromConfig(1110);
                break;
            case RivalState.Open:
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/brawl/reset', []) as any;
                if (response.status === 0) {
                    this.init();
                    TipsManager.showMsgFromConfig(1111);
                }
                break;
            case RivalState.Team:
                if (this.rivalData.teamMembers != null && this.rivalData.teamMembers.length > 0) {
                    let isBox = cc.sys.localStorage.getItem('RivalConfirmBox');
                    if (isBox == null || !isBox) {
                        let panel = await CommonUtils.getPanel('gameplay/rival/RivalConfirmBox', RivalConfirmBox) as RivalConfirmBox;
                        panel.init(this.toTeamRival.bind(this));
                        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                    } else {
                        await this.toTeamRival();
                    }
                } else {
                    TipsManager.showMessage('点击“匹配队友”组队吧！');
                }

                break;
            case RivalState.War:
                await this.toTeamRival();
                return;
            case RivalState.Award:
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/brawl/award', []) as any;
                if (response2.status === 0) {
                    this.rivalData = response2.content;
                    let panel2 = await CommonUtils.getPanel('gameplay/rival/RivalRewardPanel', RivalRewardPanel) as RivalRewardPanel;
                    let awardPartition = this.rewardConfig[this.rivalData.brawlRecord.currentStage].awardPartition;
                    panel2.init(awardPartition, 164, this.rivalData.awardAmount);
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel2 });
                    this.init();
					//
					if (this.rewardConfig[this.rivalData.brawlRecord.currentStage].extraEnergyAward > 0) {
						TipsManager.showMessage("获得累积" + this.rivalData.brawlRecord.currentStage + "场能量奖励 " + this.rewardConfig[this.rivalData.brawlRecord.currentStage].extraEnergyAward + "<img src='icon_nengliang'/>！")
					}
                }
                break;
        }
    }

    async toTeamRival() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/brawl/start', []) as any;
        if (response.status === 0) {
            let data = response.content as BrawlOverall;
            if (data.enemies != null) {
                this.enemyTeam = [];
                data.enemies.forEach((ele) => {
                    this.enemyTeam.push(this.getItemData(ele));
                });
                RivalDate.getInstance().playerTeam = this.playerTeam;
                RivalDate.getInstance().enemyTeam = this.enemyTeam;
                BattleConfig.getInstance().setAsRIVALBattle();
                CommonUtils.startBattleBySessionId(data.brawlRecord.currentBattleSessionId, this.onBattle.bind(this));
                this.node.active = false;
            }
        }
    }

    async onBattle() {
        this.node.active = true;
        BattleConfig.getInstance().reset();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/brawl/finish', []) as any;
        if (response.status === 0) {
            let data = response.content as BrawlOverall;
            if (data.battleWin) {
                TipsManager.showMessage('恭喜战斗获胜');
            } else {
                TipsManager.showMessage('战斗失败，剩余机会-1');
            }
        }
        this.init();
    }

    async onMatchBtn() {
        if (this.rivalState == RivalState.Team) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/brawl/team', []) as any;
            if (response.status === 0) {
                this.rivalData = response.content;
                this.setPlayerTeam();
            }
        } else {
            TipsManager.showMsgFromConfig(1122);
        }

    }

    async onStoreBtn() {
        ShopUtils.openShopPanel(4489001);
        //this.closePanel();
    }

    async onRewardBtn(event: cc.Event.EventTouch) {
        let id = this.rivalData.brawlRecord.currentStage;

        //生成奖励
        let rewards: JustShow[] = [];
        let awardPartition = this.rewardConfig[id].awardPartition;
        for (let i = 0; i < awardPartition; i++) {
            let award = {} as JustShow;
            let display = {} as Optional<ItemDisplay>;
            if (i == 0) {
                display = await ItemConfig.getInstance().getItemDisplayById(this.rewardConfig[id].showAwardOne, PlayerData.getInstance().prefabId);

            } else if (i == 1) {
                display = await ItemConfig.getInstance().getItemDisplayById(this.rewardConfig[id].showAwardTwo, PlayerData.getInstance().prefabId);

            } else if (i == 2) {
                display = await ItemConfig.getInstance().getItemDisplayById(this.rewardConfig[id].showAwardThree, PlayerData.getInstance().prefabId);

            } else if (i == 3) {
                display = await ItemConfig.getInstance().getItemDisplayById(this.rewardConfig[id].showAwardFour, PlayerData.getInstance().prefabId);

            }
            award.iconId = display.fmap(x => x.iconId).getOrElse(150);
            award.modelId = display.fmap(x => x.prototypeId).getOrElse(150);
            award.amount = 1;
            award.name = display.fmap(x => x.name).getOrElse('元宝');
            rewards.push(award);

        }

        let panel = await CommonUtils.getPanel('gameplay/rival/RivalRwardTips', ActivityBoxTips) as ActivityBoxTips;
        panel.initJustShow(rewards, event, id + '胜预估奖励');
        panel.isRight = false;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    // update (dt) {}
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
