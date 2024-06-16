import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { DiscipleRecord, ImpartationRecord, PlayerBaseInfo, CurrencyRecord, CurrencyStack } from "../../net/Protocol";
import { MentorUtils } from "./MentorUtils";
import PlayerData from "../../data/PlayerData";
import { ResUtils } from "../../utils/ResUtils";
import CommonPanel from "../../base/CommonPanel";
import Optional from "../../cocosExtend/Optional";
import MentorRequestPanel from "./MentorRequestPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { CurrencyId } from "../../config/CurrencyId";
import MentorRecordPanel from "./MentorRecordPanel";
import MentorDetailPanel from "./MentorDetailPanel";
import { TipsManager } from "../../base/TipsManager";
import MentorEndBox from "./MentorEndBox";
import FriendsData from "../friends/FriendsData";
import ViewDisciplePanel from "./ViewDisciplePanel";
import SecondConfirmBox from "../../base/SecondConfirmBox";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MentorPanel extends CommonPanel {
    @property(cc.Sprite)
    blockBgSp: cc.Sprite = null;

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    viewRequestBtn: cc.Button = null;
    @property(cc.Sprite)
    reqBtnRedDotSp: cc.Sprite = null;
    @property(cc.Button)
    viewRecordBtn: cc.Button = null;

    @property(cc.ToggleContainer)
    container: cc.ToggleContainer = null;
    @property([cc.Sprite])
    discipleIcons: Array<cc.Sprite> = [];
    @property([cc.Label])
    discipleNameLabels: Array<cc.Label> = [];
    @property([cc.Node])
    onlineNodes: Array<cc.Node> = [];
    @property([cc.Node])
    readyNodes: Array<cc.Node> = [];

    // down
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.Node)
    nonemptyNode: cc.Node = null;
    @property(cc.Sprite)
    playerIconSp: cc.Sprite = null;
    @property(cc.Label)
    playerNameLabel: cc.Label = null;
    @property(cc.Sprite)
    playerSchoolIcon: cc.Sprite = null;
    @property(cc.Button)
    chatDiscipleBtn: cc.Button = null;
    @property(cc.Label)
    timeRangeLabel: cc.Label = null;
    @property(cc.Label)
    ybAmountLabel: cc.Label = null;
    @property(cc.Label)
    expAmountLabel: cc.Label = null;
    @property(cc.Label)
    mentorValueLabel: cc.Label = null;
    @property(cc.Label)
    kbAmountLabel: cc.Label = null;
    @property(cc.Node)
    downNode: cc.Node = null;
    @property(cc.Button)
    expellBtn: cc.Button = null;
    @property(cc.Button)
    viewProgressBtn: cc.Button = null;

    // bottom
    @property(cc.Label)
    awardLabel: cc.Label = null;
    @property(cc.Button)
    viewDetailBtn: cc.Button = null;
    @property(cc.Button)
    obtainBtn: cc.Button = null;

    // data
    discipleRecords: Array<DiscipleRecord> = [];

    start () {
        this.init();
        this.initEvents();
    }

    initEvents () {
        this.blockBgSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 20));

        this.container.toggleItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.switchState(index).bind(this));
        });
        let _this = this;
        this.playerIconSp.node.on(cc.Node.EventType.TOUCH_END, () => {
            let data = R.prop(_this._state.value, this._data.value);
            if (undefined == data) {
                return;
            } else {
                CommonUtils.showViewPlayerBox(data.playerBaseInfo);
            }
        });

        this.viewRequestBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.viewRequest.bind(this)));
        this.viewRecordBtn.node.on(cc.Node.EventType.TOUCH_END, this.viewRecord.bind(this));
        this.viewDetailBtn.node.on(cc.Node.EventType.TOUCH_END, this.viewDetail.bind(this));
        this.expellBtn.node.on(cc.Node.EventType.TOUCH_END, async () => {
            let index = _this._state.value;
            let data = R.prop(index, _this._data.value)
            if (data) {
                let panel = await CommonUtils.getPanel('base/secondConfirmBox', SecondConfirmBox) as SecondConfirmBox;
                let name = (await NetUtils.get<Array<string>>('/player/viewName', [String(data.record.accountId)])).fmap(x => x.length > 0 ? x[0] : '').getOrElse('')
                panel.init(`您确定要解除与<color=#2c5e07>${name}</color>的师徒关系吗？解除后师徒值将被清空。`, async () => {
                    let result = await NetUtils.post<any>('/impartation/disciple/myDisciples/{id}/delete', [data.record.accountId])
                    if (result.isRight) {
                        _this.init();
                    }
                });
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
            }
        });
        this.chatDiscipleBtn.node.on(cc.Node.EventType.TOUCH_END, () => { 
            let index = _this._state.value;
            let data = R.prop(index, _this._data.value)
            if (data) {
                _this.closePanel();
                FriendsData.getInstance().openFriendChatByID(data.record.accountId);
            }
         });
         this.viewProgressBtn.node.on(cc.Node.EventType.TOUCH_END, async () => { 
            let index = _this._state.value;
            let data = R.prop(index, _this._data.value)
            if (data) {
                let panel = await CommonUtils.getPanel('gameplay/mentor/viewDisciplePanel', ViewDisciplePanel) as ViewDisciplePanel;
                panel.init(data.record.accountId, data.record);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
            }
         });
        this.obtainBtn.node.on(cc.Node.EventType.TOUCH_END, this.obtainAward.bind(this));
        EventDispatcher.on(Notify.MENTOR_UPDATE_DISCIPLE, this.onUpdateDisciple);
    }

    async init () {
        // 请求徒弟信息
        let route = '/impartation/disciple/myDisciples';
        let discipleRecord = await NetUtils.get<Array<DiscipleRecord>>(route, [])
        this.discipleRecords = discipleRecord.getOrElse([]);
        let accountIdArray = discipleRecord.fmap(x => x.filter(z => z.phase != "END").map(y => y.accountId)).getOrElse([]);
        if (accountIdArray.length > 0) {
            let playerBaseInfoArray = await NetUtils.get<Array<PlayerBaseInfo>>('/player/viewBaseInfo', [accountIdArray.join(',')]);
            if (playerBaseInfoArray.isRight) {
                this._data.value = R.zipWith((a, b) => { return {record: a, playerBaseInfo: b} }, discipleRecord.right.filter(x => x.phase != "END"), playerBaseInfoArray.val);
                let length = playerBaseInfoArray.val.length;
                this.discipleIcons.forEach(async (icon, index) => {
                    if (index < length) {
                        let playerInfo = playerBaseInfoArray.right[index];
                        let discipleInfo = discipleRecord.right[index];
                        this.readyNodes[index].active = discipleInfo.phase == "TO_BE_CONFIRMED" && !discipleInfo.masterConfirmed;
                        this.discipleNameLabels[index].string = playerInfo.player.playerName;
                        icon.spriteFrame = await ResUtils.getPlayerCircleIconById(playerInfo.player.prefabId);
                        let online = await NetUtils.get<boolean>('/player/isThisPlayerOnline/{id}', [discipleInfo.accountId])
                        this.onlineNodes[index].active = online.getOrElse(false);
                    } else {
                        icon.spriteFrame = null;
                        this.discipleNameLabels[index].string = '虚位以待';
                        this.onlineNodes[index].active = false;
                        this.readyNodes[index].active = false;
                    }
                })
            }
        } else {
            this._data.value = [];
            this.discipleNameLabels.forEach(label => label.string = '虚位以待');
            this.onlineNodes.forEach(node => node.active = false);
            this.readyNodes.forEach(node => node.active = false);
        }

        // 请求收到的拜师请求
        let requests = await NetUtils.get<Array<any>>('/impartation/disciplineRequest/toMe/', []);
        this.reqBtnRedDotSp.node.active = requests.fmap(x => x.length > 0).getOrElse(false);

        this._state.value = 0;
        this.initAward();
    }

    refreshState () {
        let index = this._state.value;
        let data = R.prop(index, this._data.value)
        this.emptyNode.active = undefined == data;
        this.nonemptyNode.active = undefined != data;
        if (undefined != data) {
            this.initDown(R.prop('record', data), R.prop('playerBaseInfo', data));
        }
        super.refreshState();
    }

    async initDown (record: DiscipleRecord, info: PlayerBaseInfo) {
        this.playerIconSp.spriteFrame = await ResUtils.getPlayerRectIconById(info.player.prefabId);
        this.playerNameLabel.string = info.player.playerName;
        this.playerSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(info.schoolId));
        let endTime = R.prop('deadline', record);
        let startTime = endTime - 7 * 86400 * 1000;
        let endTimeInfo = CommonUtils.getTimeInfo(endTime);
        let startTimeInfo = CommonUtils.getTimeInfo(startTime);
        this.timeRangeLabel.string = `${startTimeInfo.month}月${startTimeInfo.day}日 ~ ${endTimeInfo.month}月${endTimeInfo.day}日`;
        this.ybAmountLabel.string = record.yesterdayYuanbaoPool + '';
        this.expAmountLabel.string = record.yesterdayExpPool + '';
        let pool = await MentorUtils.getPool(record.accountId);
        this.kbAmountLabel.string = CommonUtils.toCKb(pool * 0.7) + ''
        let result = await NetUtils.get<CurrencyRecord>('/currency/view/{accountId}/{currencyId}', [record.accountId, CurrencyId.师徒值]);
        this.mentorValueLabel.string = result.fmap(x => String(x.amount)).getOrElse('0');
    }

    async initAward() {
        let disciples = this.discipleRecords.filter(x => x.discipleConfirmed && x.masterConfirmed && CommonUtils.getDeltaDay(R.prop('confirmationDate', x)) < 7);
        let ratioConfig = await MentorUtils.getRatioConfig();
        let func = day => R.path([day + 1, 'masterProportion'], ratioConfig);
 
        let sum = 0;
        await CommonUtils.asyncForEach(disciples, async (record) => {
            let pool = await MentorUtils.getPool(record.accountId);
            sum += CommonUtils.toCKb(func(CommonUtils.getDeltaDay(R.prop('confirmationDate', record))) * pool);
        })

        let myAsDisciple = await this.getMyAsDisciple();
        sum += myAsDisciple;
        this.awardLabel.string = String(sum);
    }

    async getMyAsDisciple(): Promise<number> {
        let result = await NetUtils.get<DiscipleRecord>('/impartation/disciple/meAsDisciple', []);
        if (result.isRight
            && result.right.masterConfirmed
            && result.right.discipleConfirmed
            && CommonUtils.getDeltaDay(R.prop('confirmationDate', result.right)) < 7
            && CommonUtils.getDeltaDay(R.prop('discipleLastKuabiDelivery', result.right)) > 0
        ) {
            let day = CommonUtils.getDeltaDay(R.prop('confirmationDate', result.right));
            let ratio = await MentorUtils.getKbRatio(day + 1, true);
            let pool = await MentorUtils.getPool(result.right.accountId);
            return CommonUtils.toCKb(ratio * pool);
        } else {
            return 0;
        }
    }

    async viewRequest() {
        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorRequestPanel', MentorRequestPanel) as MentorRequestPanel;
        await panel.init(R.prop('length', this._data.value));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async viewRecord() {
        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorRecordPanel', MentorRecordPanel) as MentorRecordPanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async viewDetail () {
        let disciples = this.discipleRecords.filter(x => x.discipleConfirmed && x.masterConfirmed && CommonUtils.getDeltaDay(R.prop('confirmationDate', x)) < 7);
        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorDetailPanel', MentorDetailPanel) as MentorDetailPanel;
        panel.init(disciples);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async obtainAward() {
        let myAsDisciple = await this.getMyAsDisciple();
        if (myAsDisciple > 0) {
            await NetUtils.post<CurrencyStack>('/impartation/disciple/meAsDisciple/obtainKuaibiPoolAward', [])
        }
        let disciples = this.discipleRecords.filter(
            x => x.discipleConfirmed 
                && x.masterConfirmed 
                && CommonUtils.getDeltaDay(R.prop('confirmationDate', x)) < 7
                && CommonUtils.getDeltaDay(R.prop('masterLastKuabiDelivery', x)) > 0
        );
        if (disciples.length > 0) {
            try {
                await Promise.all(disciples.map(x => NetUtils.post<CurrencyStack>('/impartation/disciple/myDisciples/{id}/obtainKuaibiPoolAward', [x.accountId])));
                //TipsManager.showGainCurrency({currencyId: 151, amount: parseInt(this.awardLabel.string)})
            } catch (e) {
                TipsManager.showMessage('当前没有可领取的仙石')
            }
        }
        if (myAsDisciple == 0 && disciples.length == 0) {
            TipsManager.showMessage('当前没有可领取的仙石')
        }
    }

    switchState(index) {
        let _this = this;
        return () => {
            let discipleInfo = this.discipleRecords.filter(x => x.phase != "END")[index];
            if (discipleInfo && (discipleInfo.phase == "TO_BE_CONFIRMED" && !discipleInfo.masterConfirmed)) {
                this.openConfirmBox();
            } else if (discipleInfo && (discipleInfo.phase == "TO_BE_CONFIRMED" && discipleInfo.masterConfirmed)) {
                TipsManager.showMessage('等待徒弟确认出师');
            }
            _this._state.value = index;
        }
    }

    async openConfirmBox() {
        let panel = await CommonUtils.getPanel('gameplay/mentor/mentorEndBox', MentorEndBox) as MentorEndBox;
        let index = this._state.value;
        let data = R.prop(index, this._data.value)
        panel.init(R.prop('record', data))
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    onUpdateDisciple = async function () {
        this.init();
    }.bind(this);

    closePanel () {
        EventDispatcher.off(Notify.MENTOR_UPDATE_DISCIPLE, this.onUpdateDisciple);
        CommonUtils.safeRemove(this.node)
    }
}
