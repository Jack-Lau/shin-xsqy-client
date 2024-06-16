import { Notify } from "../config/Notify";
import { CommonUtils } from "../utils/CommonUtils";
import WorldMap from "../map/WorldMap";
import SharePanel from "../gameplay/share/SharePanel";
import { Chat } from "../chat/Chat";
import { ConfigUtils } from "../utils/ConfigUtil";
import { TipsManager } from "../base/TipsManager";
import { NetUtils } from "../net/NetUtils";
import PlayerData from "../data/PlayerData";
import MapManager from "../map/MapManager";
import KbWheel from "../gameplay/kbwheel/KbWheel";
import ActivityEntryPanel from "../gameplay/activity/ActivityEntryPanel";
import GainEnergyPanel from "../gameplay/kbwheel/GainEnergyPanel";
import MailPanel from "../mail/MailPanel";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { GameInit } from "../map/GameInit";
import QuestConfig, { Quest } from "../quest/QuestConfig";
import { QuestManager } from "../quest/QuestManager";
import { QuestProxy } from "../quest/QuestProxy";
import WorldChatPanel from "../chat/WorldChatPanel";
import MainUIQuestComp from "./MainUIQuestComp";
import SchoolEnrollment from "../school/SchoolEnrollment";
import PlayerPanel from "../player/PlayerPanel";
import SettingPanel from "../setting/SettingPanel";
import { BattleConfig } from "../battle/BattleConfig";
import { GameConfig } from "../config/GameConfig";
import YbwlPanel from "../gameplay/ybwl/YbwlPanel";
import MapConfig from "../config/MapConfig";
import SchoolSkillPanel from "../gameplay/school/SchoolSkillPanel";
import EquipmentForgePanel from "../gameplay/equipment/forge/EquipmentForgePanel";
import BagPanel from "../gameplay/bag/BagPanel";
import ItemConfig from "../bag/ItemConfig";
import TeamPanel from "../gameplay/team/TeamPanel";
import JinGuangTaPanel from "../gameplay/jinguangta/JinGuangTaPanel";
import PetGainPanel from "../gameplay/pet/PetGainPanel";
import { PetData } from "../gameplay/pet/PetData";
import YqsPanel from "../gameplay/yqs/YqsPanel";
import SecondConfirmBox from "../base/SecondConfirmBox";
import { ChatMessage, ChatMessageComplex } from "../net/Protocol";
import SjjsPanel from "../gameplay/sjjs/SjjsPanel";
import RightDownComponent from "../gameplay/rightdown/RightDownComponent";
import RankPanel from "../gameplay/rank/RankPanel";
import BuriedPanel from "../gameplay/treasure/BuriedPanel";
import ActivityData from "../gameplay/activity/ActivityData";
import AntiquePanel from "../gameplay/antique/AntiquePanel";
import { ReddotUtils } from "../utils/ReddotUtils";
import ActivityPanel from "../gameplay/activity/ActivityPanel";
import PetPanel from "../gameplay/pet/PetPanel";
import HspmPanel from "../gameplay/hspm/HspmPanel";
import { BroadcastHandler } from "./BroadcastHandler";
import FriendsPanel from "../gameplay/friends/FriendsPanel";
import MentorPanel from "../gameplay/mentor/MentorPanel";
import Optional from "../cocosExtend/Optional";
import { TitleConfig } from "../player/title/TitleConfig";
import { ResUtils } from "../utils/ResUtils";
import { MentorUtils } from "../gameplay/mentor/MentorUtils";
import MysteryStorePanel from "../gameplay/mysteryStore/MysteryStorePanel";
import RivalPanel from "../gameplay/rival/RivalPanel";
import TigerMachinePanel from "../gameplay/tigerMachine/TigerMachinePanel";
import KingsFightPanel from "../gameplay/kingsFight/KingsFightPanel";
import KingFightSelectPanel from "../gameplay/kingsFight/KingsFightSelectPanel";
import TradingShelvesPanel from "../gameplay/trading/TradingShelvesPanel";
import TradingPanel from "../gameplay/trading/TradingPanel";
import FashionExhibitePanel from "../gameplay/fashion/FashionExhibitPanel";
import CasinoPanel from "../gameplay/casino/CasinoPanel";
import NewYearPanel from "../gameplay/newYear/NewYearPanel";
import YxjyPanel from "../gameplay/yxjy/YxjyPanel";
import { precondition } from "../utils/BaseFunction";
import HlttPanel from "../gameplay/hltt/HlttPanel";
import { showVideoAd, loadVideoAd } from "../utils/NativeUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainUI extends cc.Component {
    @property(cc.Label)
    nameLabel: cc.Label = null;

    // left 
    /****+********************************/
    /*******       活动类按钮        *******/
    /****+********************************/
    @property(cc.Button)
    activityBtn: cc.Button = null;
    @property(cc.Button)
    kbWheelBtn: cc.Button = null;
    @property(cc.Button)
    shareBtn: cc.Button = null;
    
    // @property(cc.Button)
    // ybwlBtn: cc.Button = null;
    @property(cc.Button)
    jgtBtn: cc.Button = null;
    @property(cc.Button)
    ndBtn: cc.Button = null;
    @property(cc.Button)
    yqsBtn: cc.Button = null;
    @property(cc.Button)
    trasureBtn: cc.Button = null;
    @property(cc.Button)
    xysrBtn: cc.Button = null;
    @property(cc.Button)
    arenaBtn: cc.Button = null;
    @property(cc.Button)
    tigerMachineBtn: cc.Button = null;
    @property(cc.Button)
    kingsFightBtn: cc.Button = null;
    @property(cc.Button)
    fashionBtn: cc.Button = null;
    @property(cc.Button)
    casinoBtn: cc.Button = null;
    @property(cc.Button)
    newYearBtn: cc.Button = null;
    @property(cc.Button)
    yxjyBtn: cc.Button = null;
    @property(cc.Button)
    hlttBtn: cc.Button = null;
    
    @property([cc.Button])
    activityBtns: Array<cc.Button>  = [];
    targetVecs: Array<cc.Vec2> = [];
    originalVecs: Array<cc.Vec2> = [];
    @property(cc.Button)
    leftFoldBtn: cc.Button = null;
    @property(cc.SpriteFrame)
    foldSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    unfoldSf: cc.SpriteFrame = null;
    
    @property(cc.Button)
    mapIconBtn: cc.Button = null;
    @property(cc.Sprite)
    mapFontSp: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    mapAltas: cc.SpriteAtlas = null;
    
    @property(cc.Button)
    foldBtn: cc.Button = null;
    
    // foldGroup
    @property(cc.Button)
    awardBtn: cc.Button = null;
    
    @property(cc.Button)
    mailBtn: cc.Button = null;
    
    @property(cc.Button)
    rankBtn: cc.Button = null;
    
    @property(cc.Button)
    hbBtn: cc.Button = null;
    
    @property(cc.Button)
    settingBtn: cc.Button = null;
    
    /** bottom group **/
    @property(cc.Button)
    switchBtn: cc.Button = null;
    
    @property(cc.Layout)
    firstGroup: cc.Layout = null;
    @property(cc.Button)
    forgeBtn: cc.Button = null;
    @property(cc.Button)
    equipBtn: cc.Button = null;
    @property(cc.Button)
    schoolBtn: cc.Button = null;
    @property(cc.Button)
    friendBtn: cc.Button = null;
    @property(cc.Button)
    gangBtn: cc.Button = null;
    
    @property(cc.Layout)
    secondGroup: cc.Layout = null;
    @property(cc.Button)
    marketBtn: cc.Button = null;
    @property(cc.Button)
    bagBtn: cc.Button = null;
    @property(cc.Button)
    petBtn: cc.Button = null;
    @property(cc.Button)
    sjjsBtn: cc.Button = null;
    @property(cc.Button)
    teamBtn: cc.Button = null;
    @property(cc.Button)
    tradeBtn: cc.Button = null;
    
    // top group
    @property(cc.Label)
    playerNameLabel: cc.Label = null;
    
    @property(cc.Sprite)
    playerHeadIcon: cc.Sprite = null;
    
    @property([cc.SpriteFrame])
    headIcons: Array<cc.SpriteFrame> = [];
    
    @property(cc.Label)
    ybLabel: cc.Label = null;
    
    @property(cc.Label)
    kbLabel: cc.Label = null;
    
    @property(cc.Sprite)
    kbBgImage: cc.Sprite = null;
    
    @property(cc.Sprite)
    ybBgImage: cc.Sprite = null;
    
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    expLabel: cc.Label = null;
    @property(cc.Sprite)
    expSp: cc.Sprite = null;
    
    @property(cc.Label)
    fcLabel: cc.Label = null;
    
    // chat
    @property(cc.RichText)
    chatMsg: cc.RichText = null;
    
    @property(cc.Layout)
    chatMsgGroup: cc.Layout = null;
    
    @property(cc.Button)
    chatBtn: cc.Button = null;
    
    @property(cc.Label)
    speakerLabel: cc.Label = null;
    
    @property(cc.Mask)
    msgContentGroup: cc.Mask = null;
    
    @property([cc.AnimationClip])
    aniArr: Array<cc.AnimationClip> = [];
    
    @property(cc.Sprite)
    chatTitleSp: cc.Sprite = null;
    
    // 广播
    @property(cc.Sprite)
    broadcastBg: cc.Sprite = null;
    @property(cc.RichText)
    bcContent: cc.RichText = null;
    @property(cc.Button)
    bcGotoBtn: cc.Button = null;
    currentBCId: number = 0;
    extraParams = {};
    
    // 任务
    @property(cc.Sprite)
    questChaser: cc.Sprite = null;
    
    @property(cc.Label)
    questTitle: cc.Label = null;
    
    @property(cc.RichText)
    questDescription: cc.RichText = null;
    
    @property(cc.Button)
    powerUpBtn: cc.Button = null;
    
    @property(cc.Label)
    questNumLabel: cc.Label = null;
    
    @property(cc.Prefab)
    questCompPrefab: cc.Prefab = null;
    
    @property(cc.ScrollView)
    questScroll: cc.ScrollView = null;
    
    @property(cc.Sprite)
    questExtendSp: cc.Sprite = null;
    
    extendTweenIsOn: boolean = false;
    
    @property(cc.Button)
    backKxqBtn: cc.Button = null;
    
    @property(cc.SpriteAtlas)
    mainuiSA: cc.SpriteAtlas = null;
    
    @property(RightDownComponent)
    rdGroup: RightDownComponent = null;
	
    @property(cc.Layout)
    drugLayout: cc.Layout = null;
	
    @property([cc.Sprite])
    playerDrugs: Array<cc.Sprite> = [];
	
    @property([cc.Sprite])
    petDrugs: Array<cc.Sprite> = [];
	
	drugs = [];
    
    onLoad() {
        this.questDescription.maxWidth = 286;
    }
    
    start() {
        EventDispatcher.on(Notify.MAIN_UI_SET_REDDOT_VISIBLE, this.setRedDotVisible.bind(this));
        this.mapIconBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('worldMap', WorldMap).bind(this));
		
        // 初始化活动按钮
        let length = this.activityBtns.length;
        this.targetVecs = R.repeat(new cc.Vec2(-145.5, 0), length - 1);
        this.targetVecs.push(new cc.Vec2(-42.5, 0));
        this.originalVecs = this.activityBtns.map(x => new cc.Vec2(x.node.position.x, x.node.position.y));
        this.leftFoldBtn.node.on(cc.Node.EventType.TOUCH_END, this.foldActivityBtns.bind(this));
		
        // 左侧上 第一行
        this.kbWheelBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('kbWheel', KbWheel).bind(this));
        this.shareBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('share/sharePanel', SharePanel).bind(this));
        this.foldBtn.node.on(cc.Node.EventType.TOUCH_END, this.foldBtnOnClick.bind(this));
        this.switchBtn.node.on(cc.Node.EventType.TOUCH_END, this.switchBtnOnClick.bind(this));
        this.activityBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/activity/ActivityPanel', ActivityPanel).bind(this));
		
        // 左侧上第二行
        // this.ybwlBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/ybwl/ybwlPanel', YbwlPanel).bind(this));
        // this.updateYbwlIcon();
        // setInterval(this.updateYbwlIcon.bind(this), 300000); // 每5分钟更新一次主界面ICON
    
        this.jgtBtn.node.on(cc.Node.EventType.TOUCH_END, function () { 
            this.jgtBtn.node.getComponentInChildren(cc.Sprite).node.active = false;
            this.openPanel('gameplay/jinguangta/JinGuangTaPanel', JinGuangTaPanel)();
        }.bind(this));
        this.ndBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/pet/petGainPanel', PetGainPanel).bind(this));
        this.yqsBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 45) {
                TipsManager.showMessage('提升至45级即可抢夺摇钱树');
                return;
            }
            this.yqsBtn.node.getComponentInChildren(cc.Sprite).node.active = false;
            this.openPanel('gameplay/yqs/yqsPanel', YqsPanel)();
        }.bind(this));
        this.trasureBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 25) {
                TipsManager.showMsgFromConfig(1083);
                return;
            }
            this.trasureBtn.node.getComponentInChildren(cc.Sprite).node.active = false;
            this.openPanel('gameplay/treasure/BuriedPanel', BuriedPanel)();
        }.bind(this));
        this.xysrBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 35) {
                TipsManager.showMessage('35级以上才能鉴宝，先去完成主线任务吧');
                return;
            }
            this.openPanel('gameplay/antique/AntiquePanel', AntiquePanel)();
        }.bind(this));
        this.arenaBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 50) {           
                TipsManager.showMsgFromConfig(1116);
                return;
            }
            this.openPanel('gameplay/rival/RivalPanel', RivalPanel)();
        }.bind(this));
        this.tigerMachineBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 35) {           
                TipsManager.showMsgFromConfig(1191);
                return;
            }
            this.openPanel('gameplay/tigerMachine/TigerMachinePanel', TigerMachinePanel)();
        }.bind(this));
        this.kingsFightBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 50) {           
                TipsManager.showMessage('提升至50级即可参加王者决战');
                return;
            }
            this.openPanel('gameplay/kingsFight/kingsFightSelectPanel', KingFightSelectPanel)();
        }.bind(this));
        this.fashionBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/fashion/fashionExhibitPanel', FashionExhibitePanel).bind(this));
        // this.digBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
        //     if (PlayerData.getInstance().playerLevel < 35) {           
        //         TipsManager.showMsgFromConfig(1195);
        //         return;
        //     }
        //     this.openPanel('gameplay/digOre/DigOrePanel', DigOrePanel)();
        // }.bind(this));
        this.casinoBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, {mapId: 11});
        });
        this.newYearBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/newYear/NewYearPanel', NewYearPanel).bind(this));
        this.yxjyBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/yxjy/yxjyPanel', YxjyPanel).bind(this));
        this.hlttBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (precondition(PlayerData.getInstance().playerLevel >= 35, 1191)) {
                this.openPanel('gameplay/hltt/hlttPanel', HlttPanel)();
            }  
        }.bind(this));
        if (GameConfig.isFromKXQ) {
            this.backKxqBtn.node.active = true;
            this.backKxqBtn.node.on(cc.Node.EventType.TOUCH_END, async () => { 
                let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
                let confirmBox = cc.instantiate(prefab).getComponent(SecondConfirmBox);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: confirmBox})
                confirmBox.init('少侠真的要返回氪星球吗？', () => { window['kr'] && window['kr'].close(); });
            });
        }
    
        // top
        this.ybBgImage.node.on(cc.Node.EventType.TOUCH_END, function () {
            TipsManager.showMessage("元宝<img src='currency_icon_150'/> 仙石世界的主要流通货币，用途极其广泛");
        }.bind(this));
        this.kbBgImage.node.on(cc.Node.EventType.TOUCH_END, function () {
            TipsManager.showMessage("仙石<img src='currency_icon_151'/> 仙石世界中最为珍稀的货币，数量有限");
        }.bind(this));
        this.playerHeadIcon.node.on(cc.Node.EventType.TOUCH_END, async function() {
            let panel = await CommonUtils.getPanel('player/playerPanel', PlayerPanel) as PlayerPanel;
            panel.initAsMyself();
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        }.bind(this));
        QuestProxy.currentQuest.addListener((val) => {
            if (!val) {
                this.questTitle.string = '暂无任务';
                this.questDescription.string = "去看看活动界面或四处逛逛吧~";
            } else {
                if (val.randomBacId) {
                    let behavior = QuestConfig.getInstance().objective[val.randomBacId];
                    this.questTitle.string = behavior.name;
                    this.questDescription.string = CommonUtils.textToRichText(behavior.description);
                } else {
                    let quest = QuestConfig.getInstance().getQuestConfig(val.questId);
                    this.questTitle.string = quest.name;
                    this.questDescription.string = CommonUtils.textToRichText(quest.description);
                }
            }
        });
        QuestProxy.questAmount.addListener((val) => {
            this.questNumLabel.string = val.toString();
        });
		this.drugLayout.node.on(cc.Node.EventType.TOUCH_END, this.showDrugInfo.bind(this));
		EventDispatcher.on(Notify.MAIN_UI_REFRESH_DRUG, this.refreshDrug.bind(this));

        // 底部一栏
        // this.marketBtn.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.sjjsBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 40) {
                TipsManager.showMessage('提升至40级即可开放三界经商');
                return;
            }
            let sprite = (this.sjjsBtn as cc.Button).getComponentInChildren(cc.Sprite);
            if (sprite.node.active) {
                sprite.node.active = false;
            }
            this.openPanel('gameplay/sjjs/sjjsPanel', SjjsPanel)();
    
        }.bind(this));
        this.bagBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/bag/bagPanel', BagPanel).bind(this));
        this.petBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (PetData.getPetNum() == 0) {
                TipsManager.showMsgFromConfig(1047);
                this.openPanel('gameplay/pet/petGainPanel', PetGainPanel)();
                return;
            }
            this.openPanel('gameplay/pet/petPanel', PetPanel)();
        }.bind(this));
        // this.questBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo);
        this.teamBtn.node.on(cc.Node.EventType.TOUCH_END, function() {
            if (PlayerData.getInstance().playerLevel < 35) {
                TipsManager.showMessage('提升至35级即可开放助战功能');
                return;
            }
            this.openPanel('gameplay/team/teamPanel', TeamPanel)();
        }.bind(this));
    
        // // 底部二栏
        this.marketBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (PlayerData.getInstance().playerLevel < 50) {
                TipsManager.showMessage('您的等级不足50，还不能参与拍卖');
                return;
            }
            this.openPanel('gameplay/hspm/hspmPanel', HspmPanel)()
        }.bind(this));
        this.equipBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/equipment/equipmentForgePanel', EquipmentForgePanel).bind(this));
        this.schoolBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (PlayerData.getInstance().schoolId) {
                this.openPanel('gameplay/school/schoolSkillPanel', SchoolSkillPanel).bind(this)();
            } else {
                TipsManager.showMessage('你还没拜入门派哦~');
            }
        }.bind(this));
        this.forgeBtn.node.on(cc.Node.EventType.TOUCH_END, MentorUtils.openMentorPanel);
        this.tradeBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('gameplay/trading/TradingPanel', TradingPanel).bind(this));
    
        // 现在是排行
        this.gangBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel("gameplay/rank/rankPanel", RankPanel).bind(this));
    
        // 右侧下拉
        this.awardBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel("gameplay/mysteryStore/mysteryStorePanel", MysteryStorePanel).bind(this));
        this.mailBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel("mail/mailPanel", MailPanel).bind(this));
        this.rankBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel("gameplay/rank/rankPanel", RankPanel).bind(this));
        this.friendBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel("gameplay/friends/FriendsPanel", FriendsPanel).bind(this));
        this.settingBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('setting/settingPanel', SettingPanel).bind(this));
    
        // chat
        this.chatMsgGroup.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('chat/worldChatPanel', WorldChatPanel).bind(this));
        this.chatBtn.node.on(cc.Node.EventType.TOUCH_END, this.openPanel('chat/worldChatPanel', WorldChatPanel).bind(this));
    
        // this.powerUpBtn.node.on(cc.Node.EventType.TOUCH_END, this.showToDo);
        this.questChaser.node.on(cc.Node.EventType.TOUCH_END, QuestManager.questCompOnClick);
    
        EventDispatcher.on(Notify.MAIN_UI_FOLD_QUEST_CHASER, this.questChaserArrowBtnOnClick.bind(this))
        this.questExtendSp.node.on(cc.Node.EventType.TOUCH_END, this.questChaserArrowBtnOnClick.bind(this));
    
        this.showSystemSafeMsg();
        this.bcGotoBtn.node.on(cc.Node.EventType.TOUCH_END, this.broadcastGoto.bind(this));
        setTimeout(this.init.bind(this), 1000);
        let _this = this;
        EventDispatcher.on(Notify.MAIN_UI_SHOW_NEW_MESSAGE, this.showUserChatMessage.bind(this));
        EventDispatcher.on(Notify.MAIN_UI_ADD_RIGHT_DOWN_PANEL, this.rdGroup.addPanel.bind(this.rdGroup));
        EventDispatcher.on(Notify.MAIN_UI_REMOVE_RIGHT_DOWN_PANEL, this.rdGroup.removeByName.bind(this.rdGroup));
        EventDispatcher.on(Notify.PLAYER_REFRESH_NAME, () => {
            _this.playerNameLabel.string = PlayerData.getInstance().playerName;
        });
        console.log("main ui started");
    }
    
    async init() {
        this.playerNameLabel.string = PlayerData.getInstance().playerName;
        this.playerHeadIcon.spriteFrame = this.headIcons[PlayerData.getInstance().prefabId - 4000001];
        let ybRes = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [PlayerData.getInstance().accountId, 150]) as any;
        if (ybRes.content) {
            PlayerData.getInstance().ybAmount = ybRes.content.amount;
            this.ybLabel.string = ybRes.content.amount + '';
        }
        let kbRes = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [PlayerData.getInstance().accountId, 151]) as any;
        if (ybRes.content) {
            PlayerData.getInstance().kbAmount = kbRes.content.amount;
            this.kbLabel.string = PlayerData.getInstance().kbAmount + '';
        }
        this.initExp();
        this.levelLabel.string = PlayerData.getInstance().playerLevel + '级';
        PlayerData.getInstance().bind('_ybAmount', function (value) { if (!this || !this.ybLabel) return; this.ybLabel.string = value + ''; }.bind(this));
        PlayerData.getInstance().bind('_kbAmount', function (value) { if (!this || !this.kbLabel) return; this.kbLabel.string = Math.floor(value / 1000) + ''; }.bind(this));
        PlayerData.getInstance().newBind('_fc', function (value) { if (!this || !this.fcLabel) return; this.fcLabel.string = value.toString(); }.bind(this));
        this.fcLabel.string = PlayerData.getInstance().fc.toString();
        this.refreshMapIcon();
		this.refreshDrug();
    }
    
    async initExp() {
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [
            PlayerData.getInstance().accountId,
            153
        ]) as any;
        if (response2.status == 0) {
            let exp = response2.content.amount;
            let config = await ConfigUtils.getConfigJson('PlayerLevelupExp');
            let levelUpExp = config[PlayerData.getInstance().playerLevel] === undefined ? 191981000 : config[PlayerData.getInstance().playerLevel].exp;
            this.expLabel.string = exp + '/' + levelUpExp;
            this.expSp.node.width = Math.min(384, 384 * exp / levelUpExp);
        }
    }
    
    async checkSjjs() {
        let result = await ReddotUtils.checkSjjs();
        if (result) {
            let sp = this.sjjsBtn.getComponentInChildren(cc.Sprite)
            sp.node.active = true;
            sp.node.getComponent(cc.Animation).play();
        }
    }
    
    async refreshMapIcon() {
        let mapId = MapManager.getInstance().currentMapId;
        let iconId = MapConfig.getInstance().mapInfo[mapId].iconId;
        let nameId = MapConfig.getInstance().mapInfo[mapId].nameId;
        this.mapIconBtn.getComponent(cc.Sprite).spriteFrame = this.mapAltas.getSpriteFrame('icon_mapIcon_' + iconId);
        this.mapFontSp.spriteFrame = this.mapAltas.getSpriteFrame('font2_map_' + nameId)
    }
	
	async refreshDrug() {
        this.playerDrugs.forEach((drug) => {
			drug.node.active = false;
        });
        this.petDrugs.forEach((drug) => {
			drug.node.active = false;
        });
		let drugRes = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/drug/get', []) as any;
		if (drugRes.content) {
			this.drugs = drugRes.content;
			this.drugs.map(drug => {
				switch (drug.drugId) {
					case 1:{
						this.playerDrugs[0].node.active = true;
						break;
					}
					case 2:{
						this.playerDrugs[1].node.active = true;
						break;
					}					
					case 3:{
						this.playerDrugs[2].node.active = true;
						break;
					}
					case 4:{
						this.playerDrugs[4].node.active = true;
						break;
					}
					case 5:{
						this.playerDrugs[5].node.active = true;
						break;
					}
					case 6:{
						this.playerDrugs[6].node.active = true;
						break;
					}
					case 7:{
						this.playerDrugs[7].node.active = true;
						break;
					}
					case 8:{
						this.petDrugs[0].node.active = true;
						break;
					}
					case 9:{
						this.petDrugs[1].node.active = true;
						break;
					}
					case 10:{
						this.petDrugs[2].node.active = true;
						break;
					}
					case 11:{
						this.petDrugs[4].node.active = true;
						break;
					}
					case 12:{
						this.petDrugs[5].node.active = true;
						break;
					}
					case 13:{
						this.petDrugs[6].node.active = true;
						break;
					}
					case 14:{
						this.petDrugs[7].node.active = true;
						break;
					}
					case 15:{
						this.playerDrugs[3].node.active = true;
						break;
					}
					case 16:{
						this.petDrugs[3].node.active = true;
						break;
					}					
				}
            });
		}
	}
    
    openPanelComplete: boolean = true;
    openPanel(prefabName: string, panelType: { prototype: cc.Component }) {
        let _this = this;
        return async function () {
            if (!_this.openPanelComplete) {
                return;
            }
            _this.openPanelComplete = false;
            let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
            let prefab = await CommonUtils.getPanelPrefab(prefabName) as cc.Prefab;
            let panelInstance = cc.instantiate(prefab);
            let panel = panelInstance.getComponent(panelType);
            event.detail = {
                panel: panel
            }
            _this.node.dispatchEvent(event);
            _this.openPanelComplete = true;
        }
    }
    
    showToDo() {
        TipsManager.showMsgFromConfig(1478);
    }
	
	showDrugInfo() {
		let playerDrugName = '<color=#4EFF00>';
		let petDrugName = '<color=#4EFF00>';
		this.drugs.map(drug => {
			switch (drug.drugId) {
				case 1:{
					playerDrugName += ' 打力';
					break;
				}
				case 2:{
					playerDrugName += ' 守力';
					break;
				}					
				case 3:{
					playerDrugName += ' 体力';
					break;
				}
				case 4:{
					playerDrugName += ' 六道';
					break;
				}
				case 5:{
					playerDrugName += ' 妖刃';
					break;
				}
				case 6:{
					playerDrugName += ' 会心';
					break;
				}
				case 7:{
					playerDrugName += ' 奇迹';
					break;
				}
				case 8:{
					petDrugName += ' 打力';
					break;
				}
				case 9:{
					petDrugName += ' 守力';
					break;
				}
				case 10:{
					petDrugName += ' 体力';
					break;
				}
				case 11:{
					petDrugName += ' 六道';
					break;
				}
				case 12:{
					petDrugName += ' 妖刃';
					break;
				}
				case 13:{
					petDrugName += ' 会心';
					break;
				}
				case 14:{
					petDrugName += ' 奇迹';
					break;
				}
				case 15:{
					playerDrugName += ' 运力';
					break;
				}
				case 16:{
					petDrugName += ' 运力';
					break;
				}					
			}
		});
		//
		if (playerDrugName == '<color=#4EFF00>') {
			TipsManager.showMessage('自身当前无药品生效');
		} else {
			TipsManager.showMessage('自身生效' + playerDrugName + '</c>');
		}
		if (petDrugName == '<color=#4EFF00>') {
			TipsManager.showMessage('宠物当前无药品生效');
		} else {
			TipsManager.showMessage('宠物生效' + petDrugName + '</c>');
		}
	}

    isFold: boolean = false;
    tweenIsOn: boolean = false;
    foldBtnOnClick() {
        if (this.tweenIsOn) {
            return;
        }
        this.tweenIsOn = true;
        let duration = 0.25;
        let btnArray = [this.activityBtn, this.mailBtn, this.hbBtn, this.settingBtn];
        if (GameConfig.isFromKXQ) {
            btnArray.push(this.backKxqBtn);
        }
        if (!this.isFold) {
            this.isFold = true;
            btnArray.map(btn => {
                let action1 = cc.moveTo(duration, -1, 250);
                let action2 = cc.fadeTo(duration, 0);
                let action = cc.spawn(action1, action2);
                btn.node.runAction(action);
            });
            let rotateAction = cc.rotateTo(0.25, 180);
            this.foldBtn.node.runAction(rotateAction);
            setTimeout(function () {
                btnArray.map(btn => {
                    btn.node.active = false;
                });
                this.tweenIsOn = false;
            }.bind(this), 250);
        } else {
            this.isFold = false;
            btnArray.map(btn => {
                btn.node.active = true;
            });
            btnArray.map((btn, index) => {
                let action1 = cc.fadeTo(duration, 255);
                let action2 = cc.moveTo(duration, -1, 162 - index * 110);
                let action = cc.spawn(action1, action2);
                btn.node.runAction(action);
            });
            let rotateAction = cc.rotateTo(0.25, 0);
            this.foldBtn.node.runAction(rotateAction);
            setTimeout(function () {
                this.tweenIsOn = false;
            }.bind(this), 250)
        }
    }
    
    activityBtnsIsFolded: boolean = false;
    leftFolding: boolean = false;
    async foldActivityBtns() {
        if (this.leftFolding) {
            return;
        }
        this.leftFolding = true;
        let length = this.activityBtns.length;
        if (!this.activityBtnsIsFolded) {
            this.activityBtns.forEach((btn, index) => {
                if (index == length - 1) {
                    btn.node.runAction(
                        cc.moveTo(0.4, this.targetVecs[index])
                    )
                } else {
                    btn.node.runAction(
                        cc.spawn([
                            cc.moveTo(0.4, this.targetVecs[index]),
                            cc.fadeTo(0.4, 0)
                        ])
                    )
                }
            });
            await CommonUtils.wait(0.41);
            this.activityBtns.forEach((btn, index) => {
                if (index < length - 1) {
                    btn.node.active = false;
                    btn.node.opacity = 255;
                }
            });
        } else {
            this.activityBtns.forEach((btn, index) => {
                if (index < length - 1) {
                    btn.node.opacity = 0;
                    btn.node.active = true;
                }
            });
            this.activityBtns.forEach((btn, index) => {
                if (index == length - 1) {
                    btn.node.runAction(
                        cc.moveTo(0.4, this.originalVecs[index])
                    )
                } else {
                    btn.node.runAction(
                        cc.spawn([
                            cc.moveTo(0.4, this.originalVecs[index]),
                            cc.fadeTo(0.4, 255)
                        ])
                    )
                }
            });
            await CommonUtils.wait(0.41);
        }
        this.leftFolding = false;
        this.activityBtnsIsFolded = !this.activityBtnsIsFolded;
        this.leftFoldBtn.getComponent(cc.Sprite).spriteFrame = this.activityBtnsIsFolded ? this.foldSf : this.unfoldSf;
    }
    
    isFirst: boolean = true;
    onSwitch: boolean = false;
    switchBtnOnClick() {
        if (this.onSwitch) {
            return;
        }
        this.onSwitch = true;
        let action1 = cc.moveTo(0.3, 77, -14);
        let action2 = cc.moveTo(0.3, 700, -14);
    
        if (this.isFirst) {
            this.firstGroup.node.runAction(action2);
            this.secondGroup.node.runAction(action1);
        } else {
            this.firstGroup.node.runAction(action1);
            this.secondGroup.node.runAction(action2);
        }
        setTimeout(function () {
            this.onSwitch = false;
        }.bind(this), 300);
        this.isFirst = !this.isFirst;
    }
    
    async questChaserArrowBtnOnClick() {
        if (this.extendTweenIsOn) {
            return;
        }
    
        this.extendTweenIsOn = true;
        this.questExtendSp.node.scaleY *= -1;
    
        if (this.questScroll.node.active) {
            this.questScroll.node.opacity = 255;
            let action = cc.moveTo(0.2, -228, 215.2);
            let fadeAction = cc.fadeTo(0.2, 0);
            this.questScroll.node.runAction(cc.spawn(action, fadeAction));
            await CommonUtils.wait(0.2);
            this.questScroll.node.active = false;
        } else {
            let quests = QuestProxy.getQuestArray();
            this.questScroll.content.removeAllChildren();
            for (let quest of quests) {
                let comp = cc.instantiate(this.questCompPrefab).getComponent(MainUIQuestComp) as MainUIQuestComp;
                comp.questId = quest.questId;
                if (quest.randomBacId) {
                    let behavior = QuestConfig.getInstance().objective[quest.randomBacId];
                    comp.questName.string = behavior.name;
                    comp.questDesc.string = CommonUtils.textToRichText(behavior.description);
                } else {
                    let config = QuestConfig.getInstance().getQuestConfig(quest.questId);
                    comp.questName.string = config.name;
                    comp.questDesc.string = CommonUtils.textToRichText(config.description);
                }
                comp.node.parent = this.questScroll.content;
            }
    
            for (let i = quests.length; i < 3; ++i) {
                let comp = cc.instantiate(this.questCompPrefab).getComponent(MainUIQuestComp);
                comp.questName.string = i == 0 ? "暂无任务" : "";
                comp.questDesc.string = i == 0 ? "去领取转盘任务或四处逛逛吧" : "";
                comp.node.parent = this.questScroll.content;
            }
    
            this.questScroll.node.y = 215.2
            this.questScroll.node.active = true;
            let action = cc.moveTo(0.2, -228, 432.2);
            let fadeAction = cc.fadeTo(0.2, 255);
            this.questScroll.node.runAction(cc.spawn(action, fadeAction));
            await CommonUtils.wait(0.2);
        }
        this.extendTweenIsOn = false;
    }
    
    // msg
    waitingSetTimout = null;
    async checkNewMsg() {
        await CommonUtils.wait(15);
        this.showSystemSafeMsg();
    }
    
    _msgIndex: number = 1;
    async showSystemSafeMsg() {
        let config = await ConfigUtils.getConfigJson("TalkingInformation");
        if (undefined == config[this._msgIndex]) {
            this._msgIndex = 1;
        }
        let msg = config[this._msgIndex]["description"];
        this._msgIndex++;
    
        let chatData = {
            noblemanLevel: -1,
            who: Chat.Talker.SYSTEM_SAFE,
            msg: msg
        }
        this.showSystemMessage(chatData);
    }
    
    async showChatMessage(chatData: Chat.ChatData) {
        let x = this.chatMsgGroup.node.x;
        let newEndX = 0;
        let timeRange = 0;
        let action1 = cc.spawn(cc.moveTo(0.2, x, 40), cc.fadeTo(0.2, 0));
        this.chatMsgGroup.node.runAction(action1);
        await CommonUtils.wait(0.22);
    
        this.chatMsgGroup.node.y = - 40;
        this.chatMsg.node.x = -300;
        this.chatMsg.string = CommonUtils.textToRichText(chatData.msg);
        if (this.chatMsg.node.width > 600) {
            newEndX = this.chatMsg.node.width - 600;
            timeRange = newEndX / 100;
        }
		
        let action2 = cc.spawn(cc.moveTo(0.2, x, 0), cc.fadeTo(0.2, 255));
        this.chatMsgGroup.node.runAction(action2);
        await CommonUtils.wait(0.22);
    
        let action3 = cc.moveTo(timeRange, -newEndX - 300, 0);
        this.chatMsg.node.runAction(action3);
        await CommonUtils.wait(timeRange + 1);
    
        this.checkNewMsg();
    }
    
    showSystemMessage(chatData: Chat.ChatData) {
        this.chatTitleSp.node.active = false;
        this.chatMsg.node.removeAllChildren();
        this.chatMsg.string = CommonUtils.textToRichText(chatData.msg);
        this.speakerLabel.string = '[系统]  ';
        this.msgContentGroup.node.x = 43.5;
        this.showTween();
        this.waitingSetTimout = setTimeout(this.showSystemSafeMsg.bind(this), 60 * 1000);
    }
    
    showTween() {
        this.chatMsg.node.stopAllActions();
        this.chatMsg.node.x = -300;
        let newEndX = 0;
        let timeRange = 0;
        if (this.chatMsg.node.width > 600) {
            newEndX = this.chatMsg.node.width - 600;
            timeRange = newEndX / 100;
        }
        let action = cc.moveTo(timeRange, -newEndX - 300, 0);
        this.chatMsg.node.runAction(action);
    }
    
    showUserChatMessage(event: EventDispatcher.NotifyEvent) {
        let msg = event.detail.msg as ChatMessageComplex;
    
        if (this.waitingSetTimout) {
            window['clearTimeout'](this.waitingSetTimout);
        }
        let content = '';
        let emojiIdArr = [];
        msg.chatMessage.elements.forEach(item => {
            if (item.type == "TEXT") {
                content += item.content;
            } else if (item.type == "EMOTICON") {
                content += '<img src="emoji_temp"/>';
                emojiIdArr.push(item.content);
            } else if (item.type == "TEMPLATE") {
                if (Chat.ChatManager.getInstance().broadcastConfig) {
                    let config = Chat.ChatManager.getInstance().broadcastConfig[item.content.id];
                    if (config.goto == 1) {
                        this.currentBCId = config.parameter;
                        this.extraParams = R.clone(item.content.args);
                    } else {
                        this.currentBCId = 0;
                    }
                    let description = R.clone(config.description);
                    if (description.indexOf('${equipment:EquipmentName}') == -1) {
                        content += CommonUtils.replaceArr(description, item.content.args);
                    } else {
                        let name = 'equipment';
                        let pid = item.content.args[name + '_definitionId'];
                        let prefabId = item.content.args[name + '_playerPrefabId'];
                        let display = ItemConfig.getInstance().getItemDisplayById(pid, prefabId);
                        let prototype = ItemConfig.getInstance().getEquipmentPrototypeById(pid);
                        description = description.replace('${playerName}', item.content.args['playerName'])
                        if (display.isValid() && prototype.isValid()) {
                            let color = CommonUtils.getForgeColorByQuality(prototype.getValue().quality);
                            content = description.replace('${equipment:EquipmentName}', '<color=' + color + '>' + display.getValue().name + '</color>');
                        }
						content = CommonUtils.replaceArr(content, item.content.args);
                    }
                }
            }
        });
        if (msg.chatMessage.broadcast && msg.chatMessage.systemMessage) {
            this.showBroadcast({msg: content});
            return;
        }
        let x = this.chatMsgGroup.node.x;
        let playerName = '[系统]';
        this.chatTitleSp.node.active = msg.senderPlayer != undefined;
        if (msg.senderPlayer) {
            playerName = msg.senderPlayer.player.playerName;
            this.initTitle(new Optional<number>(msg.senderPlayer.titleDefinitionId))
        }
        this.speakerLabel.string = playerName + '  ';
        //this.msgContentGroup.node.x = 43.5 - 64 + this.speakerLabel.node.width;
        // 生成表情&richtext
        this.chatMsg.node.removeAllChildren();
        this.chatMsg.string = CommonUtils.textToRichText(content);
		
        let arr = (this.chatMsg as any)._labelSegments;
        let extraLine = 0;
        let index = 0;
        arr.forEach((item) => {
            if (item.name === "RICHTEXT_Image_CHILD") {
                let emoji = this.genEmoji(item, emojiIdArr[index], extraLine);
                index++;
                emoji.parent = this.chatMsg.node;
            }
        });
        this.showTween();
        this.waitingSetTimout = setTimeout(this.showSystemSafeMsg.bind(this), 15 * 1000);
    }
    
    async initTitle (titleId: Optional<number>) {
        if (!titleId.valid) {
            this.chatTitleSp.node.active = false;
        } else {
            let config = await TitleConfig.getConfigById(titleId.val);
            this.chatTitleSp.node.active = config.type == 1;
            if (config.type == 1) { // 图片
                this.chatTitleSp.spriteFrame = await ResUtils.getTitleIconById(config.picId);
            }
        }
    }
    
    /**
     * Broadcast 规则
     * 1. 收到广播通知，提示弹出
     * 2. 如果正在播放广播，则保存忽略。
     * 3. 当前播放完毕后，从保存中读取下一个广播
     * 4. 如果没有广播则消失
     */
    isShowingBC: boolean = false;
    bcCache: Array<any> = [];
    async showBroadcast(data) {
        let msg = R.prop('msg', data);
        if (this.isShowingBC) {
            this.bcCache.push(msg);
            return;
        }
        if (undefined == msg && this.bcCache.length === 0) {
            this.broadcastBg.node.active = false;
            return;
        } else if (undefined == msg && this.bcCache.length > 0) {
            this.showBroadcast(this.bcCache.shift());
            return;
        }
        this.isShowingBC = true;
        this.bcContent.string = CommonUtils.textToRichText(msg);
        this.bcGotoBtn.node.active = this.currentBCId && this.currentBCId != 0;
        this.broadcastBg.node.active = true;
        this.bcContent.node.stopAllActions();
        this.bcContent.node.x = 305;
        let newEndX = this.bcContent.node.width + 610;
        let timeRange = newEndX / 150;
        let action = cc.moveTo(timeRange + 1, - newEndX + 305, 0);
        this.bcContent.node.runAction(action);
    
        await CommonUtils.wait(timeRange + 1.2);
        this.isShowingBC = false;
        this.showBroadcast(null);
    }
    
    broadcastGoto() {
        if (this.currentBCId && this.currentBCId != 0) {
            if (this.currentBCId == 17) { // 触发带“前往”的广播3200054
                BroadcastHandler.handle(this.currentBCId, this.extraParams);
            } else {
                BroadcastHandler.handle(this.currentBCId);
            }
        }
    }
    
    genEmoji(img, emojiId: number, extraLine: number = 0) {
        let emoji = new cc.Node('emoji');
        [emoji.anchorX, emoji.anchorY] = [0.5, 0.5];
        emoji.x = img.x - (img.anchorX * 60) + 30 + this.chatMsg.node.width/2;
        emoji.y = img.y - (img.anchorY * 40) + 13;
        let sprite = emoji.addComponent(cc.Sprite);
        sprite.addComponent(cc.Animation);
        let animation = sprite.getComponent(cc.Animation);
        this.aniArr[emojiId - 1].name = "emoji_" + emojiId;
        animation.addClip(this.aniArr[emojiId - 1], "emoji_" + emojiId);
        animation.play("emoji_" + emojiId);
        return emoji;
    }
    // update (dt) {}
    
    // 更新一本万利
    // async updateYbwlIcon() {
    //     let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/yibenwanli/overrall', []) as any;
    //     if (response.status == 0) {
    //         let timeToEnd = R.prop('timeToEnd', R.prop('content', response));
    //         if (timeToEnd) {
    //             if (timeToEnd > 0 && timeToEnd < 10800000) {
    //                 this.ybwlBtn.getComponent(cc.Sprite).spriteFrame = this.mainuiSA.getSpriteFrame('icon_yibenwanli2');
    //             } else {
    //                 this.ybwlBtn.getComponent(cc.Sprite).spriteFrame = this.mainuiSA.getSpriteFrame('icon_yibenwanli');
    //             }
    //         }
    //     }
    // }
    
    setRedDotVisible(event: EventDispatcher.NotifyEvent) {
        let buttonName = event.detail["name"];
        let visible = event.detail["visible"];
        if (this[buttonName]) {
            let button = this[buttonName] as cc.Button;
            if (button.node.children.length > 0) {
                let reddot = button.node.children[0];
                reddot.active = visible;
            }
        }
    }

}
