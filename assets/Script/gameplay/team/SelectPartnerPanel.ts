import CommonPanel from "../../base/CommonPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { PlayerDetail, Equipment, PlayerBaseInfo } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { ResUtils } from "../../utils/ResUtils";
import PlayerData from "../../data/PlayerData";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { TitleConfig } from "../../player/title/TitleConfig";
import FriendsData from "../friends/FriendsData";
import SingleDirectionMc from "../../base/SingleDirectionMc";

const { ccclass, property } = cc._decorator;
enum SelectType {
    Random, Friend
}
@ccclass
export default class SelectPartnerPanel extends CommonPanel {
    @property(cc.Node)
    mainNode: cc.Node = null;
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    @property(cc.Sprite)
    highFcFlag: cc.Sprite = null;
    @property(cc.Sprite)
    highFcBg: cc.Sprite = null;
    @property(cc.Button)
    rollBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Label)
    ownYbLabel: cc.Label = null;

    // left
    @property(cc.Label)
    lFcLabel: cc.Label = null;
    @property(SingleDirectionMc)
    rMc: SingleDirectionMc = null;
    @property(cc.Sprite)
    lSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    lCostLabel: cc.Label = null;
    @property(cc.Label)
    lNameLabel: cc.Label = null;
    @property(cc.Sprite)
    lBg: cc.Sprite = null;
    @property(cc.Sprite)
    lTitleSp: cc.Sprite = null;

    // right
    @property(cc.Label)
    rFcLabel: cc.Label = null;
    @property(SingleDirectionMc)
    lMc: SingleDirectionMc = null;
    @property(cc.Sprite)
    rSchoolIcon: cc.Sprite = null;
    @property(cc.Label)
    rCostLabel: cc.Label = null;
    @property(cc.Label)
    rNameLabel: cc.Label = null;
    @property(cc.Sprite)
    rBg: cc.Sprite = null;
    @property(cc.Sprite)
    rTitleSp: cc.Sprite = null;

    // 二次确认
    @property(cc.Button)
    sCloseBtn: cc.Button = null;
    @property(cc.Label)
    sCostLabel: cc.Label = null;
    @property(cc.Label)
    sNameLabel: cc.Label = null;
    @property(cc.Label)
    sOwnLabel: cc.Label = null;
    @property(cc.Label)
    sCostLabel2: cc.Label = null;
    @property(cc.Label)
    sRemainLabel: cc.Label = null;
    @property(cc.Button)
    sConfirmBtn: cc.Button = null;
    @property(cc.Button)
    sCancelBtn: cc.Button = null;
    @property(cc.Node)
    secondConfirmNode: cc.Node = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.SpriteFrame)
    sf1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sf2: cc.SpriteFrame = null;

    playerIds = [];
    friendIds = [];
    selectedInfo = null;
    leftInfo = null;
    rightInfo = null;
    isHighFc: boolean = false;

    selectType = SelectType.Random;

    start() {
        this.rollBtn.node.on(cc.Node.EventType.TOUCH_END, this.roll.bind(this));
        this.lBg.node.on(cc.Node.EventType.TOUCH_END, this.selectLeft.bind(this));
        this.rBg.node.on(cc.Node.EventType.TOUCH_END, this.selectRight.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.invite.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 6));
        this.highFcBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.highFcBgOnClick.bind(this)));

        this.sCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideSBox.bind(this));
        this.sCancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideSBox.bind(this));
        this.sConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.confirmInvite.bind(this)));
    }


    async init() {
        this.ownYbLabel.string = PlayerData.getInstance().ybAmount.toString();
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/requestCandidates', [this.isHighFc]);
        if (response.status === 0) {
            if (response.content.candidateSupporters != '') {
                this.playerIds = response.content.candidateSupporters.split(',');
            } else {
                this.playerIds = [];
            }
            this.roll();
        }
        // this.friendIds = await FriendsData.getInstance().getMyFriendsPartnerIds(this.isHighFc);
    }

    async refreshData() {
        let data = this._data.value;
        let isEmpty = data.length === 0;
        this.emptyNode.active = isEmpty;
        this.lBg.node.active = !isEmpty;
        this.rBg.node.active = !isEmpty;
        super.refreshData();
        if (isEmpty) return;

        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [data.join(',')]);
        if (response2.status === 0) {
            let partnerInfo = response2.content as Array<PlayerBaseInfo>;
            partnerInfo.map(ele => {
                return {
                    'accountId': ele.player.accountId,
                    'playerName': ele.player.playerName,
                    'prefabId': ele.player.prefabId,
                    'schoolId': new Optional<number>(ele.schoolId),
                    'level': ele.player.playerLevel,
                    'fc': ele.player.fc,
                    'titleId': ele.titleDefinitionId,
                    'baseInfo': ele,
                }
            }).forEach(async (ele, index) => {
                if (index == 0) {
                    this.lMc.init(ele.baseInfo);
                    this.lFcLabel.string = ele.fc.toString();
                    this.lNameLabel.string = ele.playerName;
                    this.lSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(ele.schoolId);
                    let extra = this.isHighFc ? 10 : 1;
                    let price = Math.floor(Math.max(0.001 * Math.pow(ele.fc / 100.0, 2.0), 1.0)) * extra;
                    this.lCostLabel.string = price.toString();
                    this.selectedInfo = this.leftInfo = {
                        'accountId': ele.accountId,
                        'playerName': ele.playerName,
                        'price': price
                    };
                    this.lTitleSp.node.active = ele.titleId != undefined;
                    if (ele.titleId) {
                        let title = await TitleConfig.getConfigById(ele.titleId);
                        let isPic = title.type == 1;
                        this.lTitleSp.node.active = isPic;
                        if (isPic) {
                            this.lTitleSp.spriteFrame = await ResUtils.getTitleIconById(title.picId);
                        }
                    }
                } else {
                    this.rMc.init(ele.baseInfo);
                    this.rFcLabel.string = ele.fc.toString();
                    this.rNameLabel.string = ele.playerName;
                    this.rSchoolIcon.spriteFrame = await ResUtils.getSchoolIconById(ele.schoolId);
                    let extra = this.isHighFc ? 10 : 1;
                    let price = Math.floor(Math.max(0.001 * Math.pow(ele.fc / 100.0, 2.0), 1.0)) * extra;
                    this.rCostLabel.string = price.toString();
                    this.rightInfo = {
                        'accountId': ele.accountId,
                        'playerName': ele.playerName,
                        'price': price
                    };
                    this.rTitleSp.node.active = ele.titleId != undefined;
                    if (ele.titleId) {
                        let title = await TitleConfig.getConfigById(ele.titleId);
                        let isPic = title.type == 1;
                        this.rTitleSp.node.active = isPic;
                        if (isPic) {
                            this.rTitleSp.spriteFrame = await ResUtils.getTitleIconById(title.picId);
                        }
                    }
                }
            })
        }
    }

    async initMc(playerMc, weaponMc, prefabId: number, weaponId: number) {
        let playerClip = await MovieclipUtils.getMovieclip(prefabId, 'stand_d', 10) as cc.AnimationClip;
        let weaponClip = await MovieclipUtils.getMovieclip(weaponId, 'stand_d', 10) as cc.AnimationClip;
        playerMc.getComponent(cc.Animation).addClip(playerClip, 'stand_d');
        weaponMc.getComponent(cc.Animation).addClip(weaponClip, 'stand_d');
        let anchor = MovieclipUtils.getOffset(prefabId + "_stand_d");
        playerMc.node.anchorX = anchor.x;
        playerMc.node.anchorY = anchor.y;
        weaponMc.node.anchorX = anchor.x;
        weaponMc.node.anchorY = anchor.y;
        playerMc.getComponent(cc.Animation).play('stand_d');
        weaponMc.getComponent(cc.Animation).play('stand_d');
    }


    roll() {
        if (this.selectType === SelectType.Random) {
            if (this.playerIds.length <= 1) {
                this._data.value = R.clone(this.playerIds)
            } else {
                let r1 = this.rollOne(this.playerIds);
                let r2 = this.rollOne(this.playerIds);
                while (r1 == r2) {
                    r2 = this.rollOne(this.playerIds);
                }
                this._data.value = [r1, r2];
            }
            this.selectLeft();
            this.selectedInfo = null;
        } else {
            if (this.friendIds.length <= 1) {
                this._data.value = R.clone(this.friendIds)
            } else {
                let r1 = this.rollOne(this.friendIds);
                let r2 = this.rollOne(this.friendIds);
                while (r1 == r2) {
                    r2 = this.rollOne(this.friendIds);
                }
                this._data.value = [r1, r2];
            }
            this.selectLeft();
            this.selectedInfo = null;
        }

    }

    rollOne(arr) {
        return arr[CommonUtils.randomInt(0, arr.length - 1)];
    }

    selectLeft() {
        this.lBg.spriteFrame = this.sf1;
        this.rBg.spriteFrame = this.sf2;
        this.selectedInfo = this.leftInfo;
    }

    selectRight() {
        this.lBg.spriteFrame = this.sf2;
        this.rBg.spriteFrame = this.sf1;
        this.selectedInfo = this.rightInfo;
    }

    async invite() {
        if (!this.selectedInfo) {
            TipsManager.showMessage('还没有选中任何队友哦~');
            return;
        }
        this.secondConfirmNode.active = true;
        this.mainNode.active = false;
        let price = this.selectedInfo.price;
        let own = PlayerData.getInstance().ybAmount;
        this.sNameLabel.string = this.selectedInfo.playerName;
        this.sCostLabel.string = price.toString();
        this.sCostLabel2.string = /*"-" + */ String(price);
        this.sOwnLabel.string = own.toString();
        this.sRemainLabel.string = (own - price).toString();
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }

    async highFcBgOnClick() {
        this.isHighFc = !this.isHighFc;
        this.highFcFlag.node.active = !this.highFcFlag.node.active;
        this.initData();
    }

    async initData () {
        if (this.selectType === SelectType.Friend) {
            this.friendIds = await FriendsData.getInstance().getMyFriendsPartnerIds(this.isHighFc);
            this.roll();
        } else {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/requestCandidates', [this.isHighFc]);
            if (response.status === 0) {
                if (response.content.candidateSupporters != '') {
                    this.playerIds = response.content.candidateSupporters.split(',');
                } else {
                    this.playerIds = [];
                }
                this.roll();
            }  
        }
    }

    // second confirm box
    hideSBox() {
        this.secondConfirmNode.active = false;
        this.mainNode.active = true;
    }

    async confirmInvite() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/party/invite', [this.selectedInfo.accountId]);
        if (response.status === 0) {
            TipsManager.showMessage('邀请成功');
            // 发出邀请成功的通知
            EventDispatcher.dispatch(Notify.TEAMMATE_CHANGED, {});
            this.closePanel();
        }
    }

    onToggle(tgl, type) {
        if (type == '0') {
            this.selectType = SelectType.Random;
        } else {
            this.selectType = SelectType.Friend;
        }
        this.initData();
    }
}