import { CommonUtils } from "../../utils/CommonUtils";
import Optional from "../../cocosExtend/Optional";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import PlayerData from "../../data/PlayerData";
import CommonPanel from "../../base/CommonPanel";
import PartnerRecordPrefab from "./PartnerRecordPrefab";
import { ResUtils } from "../../utils/ResUtils";
import { TipsManager } from "../../base/TipsManager";
import { NetUtils } from "../../net/NetUtils";
import { PartyComplex, PlayerDetail, Equipment, PartyRecord, SupportLog, Title, PlayerBaseInfo } from "../../net/Protocol";
import SelectPartnerPanel from "./SelectPartnerPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import SecondConfirmBox from "../../base/SecondConfirmBox";
import { TitleConfig } from "../../player/title/TitleConfig";
import SingleDirectionMc from "../../base/SingleDirectionMc";

const { ccclass, property } = cc._decorator;

enum TeamPanelState { Partner, Record }

@ccclass
export default class TeamPanel extends CommonPanel {
    // 基础
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Sprite)
    title: cc.Sprite = null;
    @property(cc.ToggleContainer)
    toggleContainer: cc.ToggleContainer = null;

    /**********************
     *      助战分页       *
     **********************/
    @property(cc.Node)
    partnerNode: cc.Node = null;
    @property(cc.Label)
    gotYbAmountLabel: cc.Label = null;
    @property(cc.Button)
    getAwardBtn: cc.Button = null;
    @property(cc.Button)
    gotAwardBtn: cc.Button = null;
    @property(cc.Button)
    findPartnerBtn: cc.Button = null;

    // 队伍上方形象
    @property([cc.Sprite])
    schoolIcons: Array<cc.Sprite> = [];
    @property([cc.Sprite])
    schoolNames: Array<cc.Sprite> = [];
    @property([cc.Sprite])
    cardBgs: Array<cc.Sprite> = [];
    @property([cc.Sprite])
    flags: Array<cc.Sprite> = [];
    @property([cc.Label])
    fcLabels: Array<cc.Label> = [];

    @property(cc.Sprite)
    empty2: cc.Sprite = null;
    @property(cc.Sprite)
    empty3: cc.Sprite = null;

    // 队伍下方形象
    @property(cc.Node)
    bgNode1: cc.Node = null;
    @property(cc.Node)
    bgNode2: cc.Node = null;
    @property([SingleDirectionMc])
    mcs: Array<SingleDirectionMc> = [];
    @property([cc.Sprite])
    emptyFlags: Array<cc.Sprite> = [];
    @property([cc.Button])
    removeBtns: Array<cc.Button> = [];
    @property([cc.Label])
    nameLabels: Array<cc.Label> = [];
    @property([cc.Label])
    timeLabels: Array<cc.Label> = [];
    @property([cc.Sprite])
    titleSps: Array<cc.Sprite> = [];

    /**********************
     *      记录分页       *
     **********************/
    @property(cc.Node)
    recordNode: cc.Node = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    recordPrefab: cc.Prefab = null;
    @property(cc.Sprite)
    emptySprite: cc.Sprite = null;

    // 底部自己信息
    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    playerSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    partnerNumLabel: cc.Label = null;
    @property(cc.Label)
    rewardNumLabel: cc.Label = null;

    @property(cc.SpriteAtlas)
    teamAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    schoolIconAtlas: cc.SpriteAtlas = null;

    yesterdayAwardNum = 0;

    async start() {
        await this.initDetail();
        await this.init();
        this.initEvents();
    }

    async init() {
        this._data.value = [];
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/party/view/myself', []);
        if (response.status === 0) {
            let info = response.content;
            let ids = info.supportRelations.map(x => x.supporterAccountId);
            if (ids.length > 0) {
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewDetail', [ids.join(',')]);
                if (response2.status === 0) {
                    let partnerInfo = response2.content as Array<PlayerDetail>
                    var timeSort = R.sortWith([
                        R.ascend(R.prop('time'))
                    ]);
                    
                    this._data.value = timeSort(partnerInfo.map((ele, index) => {
                        let weaponId = new Optional<Equipment>(R.prop(0, R.filter(x => R.prop('id', x) == ele.playerRelation.handEquipmentId, ele.equipments))).fmap(x => x.definitionId);
                        return {
                            'baseInfo': {
                                player: ele.player,
                                schoolId: ele.schoolId,
                                weaponId: weaponId.getOrElse(10002),
                                titleDefinitionId: ele.title ? ele.title.definitionId : null,
                                fashionDefinitionId: ele.fashion ? ele.fashion.definitionId : null,
                                fashionDye: ele.fashionDye
                            },
                            'accountId': ele.player.accountId,
                            'playerName': ele.player.playerName,
                            'prefabId': ele.player.prefabId,
                            'schoolId': new Optional<number>(ele.schoolId),
                            'weaponId': weaponId,
                            'level': ele.player.playerLevel,
                            'fc': ele.player.fc,
                            'time': (info.supportRelations[index].deadline - Date.now()) / 1000,
                            'title': new Optional<Title>(ele.title)
                        }
                    }));
                }
            }

            let isGot = info.partyRecord.todayRewardDelivered == true;
            this.gotAwardBtn.node.active = isGot;
            this.getAwardBtn.node.active = !isGot;

            this.partnerNumLabel.string = info.supporterForOthersCount.toString();
        }
        this._state.value = TeamPanelState.Partner;
    }

    async initDetail() {
        // 初始化昨日奖励
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/resolveSupportReward', []);
        if (response2.status === 0) {
            let record = response2.content as PartyRecord;
            this.gotYbAmountLabel.string = record.supportReward.toString();
            this.yesterdayAwardNum = record.supportReward;
        }

        let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/party/todaySupportReward', []);
        if (response3.status === 0) {
            this.rewardNumLabel.string = response3.content.toString();
        }

        // init myself
        this.playerIcon.spriteFrame = await ResUtils.getPlayerRectIconById(PlayerData.getInstance().prefabId);
        this.nameLabel.string = PlayerData.getInstance().playerName;
        this.levelLabel.string = PlayerData.getInstance().playerLevel + '';
        this.playerSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(PlayerData.getInstance().schoolId));

        // init records
        this.scroll.content.removeAllChildren();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/party/latestSupportLogs', []);
        if (response.status === 0) {
            let records = response.content as Array<any>;
            let ids = records.map(x => x.inviterAccountId).join(',');
            let response4 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewName', [ids]);
            if (response4.status === 0) {
                response4.content.forEach((name, index) => {
                    let recordItem = cc.instantiate(this.recordPrefab).getComponent(PartnerRecordPrefab);
                    let record = records[index];
                    if (!record) return;
                    recordItem.init(record.type === "START", record.eventTime, name, record.fee);
                    recordItem.node.parent = this.scroll.content;
                })
            }
            this.emptySprite.node.active = records.length === 0;
        }

    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.toggleContainer.toggleItems[0].node.on(cc.Node.EventType.TOUCH_END, this.switchToRecord.bind(this));
        this.toggleContainer.toggleItems[1].node.on(cc.Node.EventType.TOUCH_END, this.switchToPartner.bind(this));
        this.getAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.getAwardBtnOnClick.bind(this));
        this.gotAwardBtn.node.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage('奖励已经领取了，明天再来吧!') });
        this.findPartnerBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.findPartner.bind(this)));
        this.removeBtns[1].node.on(cc.Node.EventType.TOUCH_END, this.removePartner1.bind(this));
        this.removeBtns[2].node.on(cc.Node.EventType.TOUCH_END, this.removePartner2.bind(this));
        let _this = this;
        this.bgNode1.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(async () => {
            let data = _this._data.value;
            let p2 = R.prop(0, data);
            if (!p2) {
                return;
            }
            await CommonUtils.showViewPlayerBox(p2.baseInfo);
        }));
        this.bgNode2.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(async () => {
            let data = _this._data.value;
            let p3 = R.prop(1, data);
            if (!p3) {
                return;
            }
            await CommonUtils.showViewPlayerBox(p3.baseInfo);
        }));
        EventDispatcher.on(Notify.TEAMMATE_CHANGED, this.onTeammateChange)
    }


    async refreshData() {
        let data = this._data.value;
        super.refreshData();

        // 初始化玩家自己
        // 上
        let myFc = PlayerData.getInstance().fc;
        let sid = new Optional<number>(PlayerData.getInstance().schoolId)
        this.cardBgs[0].spriteFrame = this.getSf('card_' + PlayerData.getInstance().prefabId);
        this.schoolIcons[0].spriteFrame = this.getSIcon(sid);
        this.schoolNames[0].spriteFrame = this.getSName(sid);
        this.flags[0].node.active = false;
        this.fcLabels[0].string = myFc.toString();
        // 下
        this.emptyFlags[0].node.active = false;
        this.mcs[0].initMyself();
        this.nameLabels[0].string = PlayerData.getInstance().playerName;
        this.timeLabels[0].string = "";
        this.initTitle(PlayerData.getInstance().title.fmap(x => x.definitionId), 0);

        // 初始化助战1号
        let p1 = R.prop(0, data);
        let show1 = p1 != undefined;
        this.cardBgs[1].node.active = show1;
        this.emptyFlags[1].node.active = !show1;
        this.empty2.node.active = !show1;
        this.mcs[1].node.active = show1;
        this.timeLabels[1].node.active = show1;
        this.nameLabels[1].node.active = show1;
        this.removeBtns[1].node.active = show1;
        this.titleSps[1].node.active = show1;
        if (p1) {
            // 上
            this.cardBgs[1].spriteFrame = this.getSf('card_' + p1.prefabId);
            this.schoolIcons[1].spriteFrame = this.getSIcon(p1.schoolId);
            this.schoolNames[1].spriteFrame = this.getSName(p1.schoolId);
            this.flags[1].node.active = p1.fc < myFc * 0.7;
            this.fcLabels[1].string = p1.fc.toString();
            // 下
            this.mcs[1].init(p1.baseInfo);
            this.nameLabels[1].string = p1.playerName;
            let divide = CommonUtils.divide(p1.time, 3600);
            let hour = divide.value;
            let minute = Math.floor(divide.remain / 60);
            this.timeLabels[1].string = `${hour}时${minute}分后离队`;
            this.initTitle(p1.title.fmap(t => t.definitionId), 1)
        }

        // 初始化助战1号
        let p2 = R.prop(1, data);
        let show2 = p2 != undefined;
        this.cardBgs[2].node.active = show2;
        this.emptyFlags[2].node.active = !show2;
        this.empty3.node.active = !show2;
        this.mcs[2].node.active = show2;
        this.timeLabels[2].node.active = show2;
        this.nameLabels[2].node.active = show2;
        this.removeBtns[2].node.active = show2;
        this.titleSps[2].node.active = show2;
        if (p2) {
            // 上
            this.cardBgs[2].spriteFrame = this.getSf('card_' + p2.prefabId);
            this.schoolIcons[2].spriteFrame = this.getSIcon(p2.schoolId);
            this.schoolNames[2].spriteFrame = this.getSName(p2.schoolId);
            this.flags[2].node.active = p2.fc < myFc * 0.7;
            this.fcLabels[2].string = p2.fc.toString();
            // 下
            this.mcs[2].init(p2.baseInfo);
            this.nameLabels[2].string = p2.playerName;
            let divide = CommonUtils.divide(p2.time, 3600);
            let hour = divide.value;
            let minute = Math.floor(divide.remain / 60);
            this.timeLabels[2].string = `${hour}时${minute}分后离队`;
            this.initTitle(p2.title.fmap(t => t.definitionId), 2)
        }
    }

    async initTitle(definitionId: Optional<number>, index: number) {
        if (!definitionId.valid) {
            this.titleSps[index].node.active = false;
        } else {
            let title = await TitleConfig.getConfigById(definitionId.val);
            let isPic = title.type == 1;
            this.titleSps[index].node.active = isPic;
            if (isPic) {
                this.titleSps[index].spriteFrame = await ResUtils.getTitleIconById(title.picId);
            } 
        }
    }

    refreshState() {
        let state = this._state.value;
        this.recordNode.active = state === TeamPanelState.Record;
        this.partnerNode.active = state === TeamPanelState.Partner;
    }

    // events
    switchToPartner() {
        if (TeamPanelState.Partner !== this._state.value) {
            this._state.value = TeamPanelState.Partner;
        }
    }

    switchToRecord() {
        if (TeamPanelState.Record !== this._state.value) {
            this._state.value = TeamPanelState.Record;
        }
    }

    async getAwardBtnOnClick() {
        // 领取奖励
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/obtainSupportReward', []);
        if (response.status === 0) {
            this.init();
            TipsManager.showMessage(' 领取成功，获得 ' + this.yesterdayAwardNum + "<img src='currency_icon_150'/>")
        }
    }

    async findPartner() {
        let panel = await CommonUtils.getPanel('gameplay/team/selectPartnerPanel', SelectPartnerPanel) as SelectPartnerPanel;
        panel.init();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    async removePartner1(e: cc.Event.EventTouch) {
        e.stopPropagation();
        let _this = this;
        let cb = async () => {
            let p1 = R.prop(0, _this._data.value);
            if (p1) {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/release', [p1.accountId]);
                if (response.status === 0) {
                    EventDispatcher.dispatch(Notify.TEAMMATE_CHANGED, {});
                }
            }
        }
        let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
        let scb = cc.instantiate(prefab).getComponent(SecondConfirmBox);
        let playerName = R.path([0, 'playerName'], _this._data.value);
        scb.init(CommonUtils.textToRichText(`确定要将 [2c5e07]${playerName}[ffffff] 请离您的队伍吗？`), cb);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: scb });
    }

    async removePartner2(e: cc.Event.EventTouch) {
        e.stopPropagation();
        let _this = this;
        let cb = async () => {
            let p2 = R.prop(1, _this._data.value);
            if (p2) {
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/release', [p2.accountId]);
                if (response.status === 0) {
                    EventDispatcher.dispatch(Notify.TEAMMATE_CHANGED, {});
                }
            }
        }
        let prefab = await CommonUtils.getPanelPrefab('base/secondConfirmBox') as cc.Prefab;
        let scb = cc.instantiate(prefab).getComponent(SecondConfirmBox);
        let playerName = R.path([1, 'playerName'], _this._data.value);
        scb.init(CommonUtils.textToRichText(`确定要将 [2c5e07]${playerName}[ffffff] 请离您的队伍吗？`), cb);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: scb });
    }

    closePanel() {
        EventDispatcher.off(Notify.TEAMMATE_CHANGED, this.onTeammateChange)
        CommonUtils.safeRemove(this.node);
    }

    onTeammateChange = function () {
        this.init();
    }.bind(this);

    getSf(name: string) {
        return this.teamAtlas.getSpriteFrame(name);
    }

    getSIcon(schoolId: Optional<number>) {
        if (schoolId.isValid()) {
            return this.schoolIconAtlas.getSpriteFrame('school_icon_' + schoolId.getValue().toString());
        } else {
            return this.schoolIconAtlas.getSpriteFrame('school_icon_0')
        }
    }

    getSName(schoolId: Optional<number>) {
        if (schoolId.isValid()) {
            return this.getSf('school_name_' + schoolId.getValue().toString());
        } else {
            return this.getSf('school_name_0')
        }
    }
}