import { CommonUtils } from "../utils/CommonUtils";
import { PlayerDetail, PlayerBaseInfo, Title } from "../net/Protocol";
import PlayerPanel from "../player/PlayerPanel";
import PKWaitReceivePanel from "../gameplay/pk/PKWaitReceivePanel";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { ResUtils } from "../utils/ResUtils";
import { TitleConfig } from "../player/title/TitleConfig";
import Optional from "../cocosExtend/Optional";
import FriendsData from "../gameplay/friends/FriendsData";
import ApplyFriendsPanel from "../gameplay/friends/ApplyFriendsPanel";
import AddFriendsPanel from "../gameplay/friends/AddFriendsPanel";
import SecondConfirmBox from "./SecondConfirmBox";
import { NetUtils } from "../net/NetUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class ViewPlayerBox extends cc.Component {
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    serialLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    schoolLabel: cc.Label = null;
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    @property(cc.Sprite)
    headSp: cc.Sprite = null;

    @property(cc.Button)
    showDetailBtn: cc.Button = null;
    @property(cc.Button)
    addFriendBtn: cc.Button = null;
    @property(cc.Button)
    jubaoBtn: cc.Button = null;

    @property(cc.Sprite)
    blockSp: cc.Sprite = null;
    @property(cc.Sprite)
    blackSp: cc.Sprite = null;

    @property(cc.Node)
    addNode: cc.Node = null;
    @property(cc.Node)
    delNode: cc.Node = null;

	playerBaseInfo: PlayerBaseInfo = null;
    accountId: number = null;

    isMyFriend = false;
	
    start() {
        this.blockSp.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.blackSp.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.showDetailBtn.node.on(cc.Node.EventType.TOUCH_END, this.showDetail.bind(this));
        this.addFriendBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onFriend.bind(this)));
        this.jubaoBtn.node.on(cc.Node.EventType.TOUCH_END, this.showPKConfirm.bind(this));
    }

    init(playerBaseInfo: PlayerBaseInfo) {
		this.playerBaseInfo = playerBaseInfo;
        if (FriendsData.getInstance().getMyFriendsByID(playerBaseInfo.player.accountId).isValid()) {
            this.isMyFriend = true;
            this.delNode.active = true;
            this.addNode.active = false;
        } else {
            this.isMyFriend = false;
            this.delNode.active = false;
            this.addNode.active = true;
        }
		//
        this.accountId = playerBaseInfo.player.accountId;
        this.nameLabel.string = playerBaseInfo.player.playerName;
        this.levelLabel.string = playerBaseInfo.player.playerLevel + '级';
        this.serialLabel.string = playerBaseInfo.player.accountId + '';
        this.schoolLabel.string = this.getSchoolName(playerBaseInfo.schoolId);
        this.fcLabel.string = playerBaseInfo.player.fc + '';
        this.initHead(playerBaseInfo.player.prefabId);
        let titleId = new Optional<number>(playerBaseInfo.titleDefinitionId);
        this.initTitle(titleId);
    }

    async onFriend() {
        this.closePanel();
        if (this.isMyFriend) {
            let panel = await CommonUtils.getPanel('base/secondConfirmBox', SecondConfirmBox) as SecondConfirmBox;
            panel.init(`确定要将 <color=#900404>${this.nameLabel.string}</color> 从您的好友列表中删除吗？删除后将无法进行私聊。`, () => {
                FriendsData.getInstance().delMyFriendsByID(this.accountId);
            });
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else {
            let panel = await CommonUtils.getPanel('gameplay/friends/AddFriendsPanel', AddFriendsPanel) as AddFriendsPanel;
            panel.init(this.nameLabel.string);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

    async initHead(prefabId: number) {
        this.headSp.spriteFrame = await ResUtils.getPlayerRectIconById(prefabId);
    }

    async initTitle(definitionId: Optional<number>) {
        if (!definitionId.valid) {
            this.titleLabel.node.active = true;
            this.titleLabel.string = '无';
            this.titleSp.node.active = false;
        } else {
            let title = await TitleConfig.getConfigById(definitionId.val);
            let isPic = title.type == 1;
            this.titleLabel.node.active = !isPic;
            this.titleSp.node.active = isPic;
            if (isPic) {
                this.titleSp.spriteFrame = await ResUtils.getTitleIconById(title.picId);
            } else {
                this.titleLabel.string = title.name;
            }
        }
    }

    async showDetail() {
        if (this.accountId == undefined) return;
        let panel = await CommonUtils.getPanel('player/playerPanel', PlayerPanel) as PlayerPanel;
        panel.initAsOthers(this.accountId);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.closePanel();
    }
	
	async showPKConfirm() {
		let callback = async () => {
			let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pk/send', [this.playerBaseInfo.player.accountId]) as any;
			if (response.status == 0) {
				let panel = await CommonUtils.getPanel('gameplay/pk/PKWaitReceivePanel', PKWaitReceivePanel) as PKWaitReceivePanel;
				panel.init(this.playerBaseInfo);
				EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
				this.closePanel();
			} else {
				let callback2 = async () => {
					let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pk/async', [this.playerBaseInfo.player.accountId]) as any;
					if (response2.status == 0) {
						this.closePanel();
					}
				}.bind(this);
				CommonUtils.showRichSCBox(
					`此位少侠现在不便切磋，是否与其幻影进行切磋练习？`,
					`切磋练习为非实时对战`,
					null,
					callback2
				);
			}
		}.bind(this);
		CommonUtils.showRichSCBox(
			`确认向 <color=#900404>${this.nameLabel.string}</color> 发起切磋邀请吗？`,
            `切磋为实时对战`,
            `等级 ` + this.playerBaseInfo.player.playerLevel + '   ' + '门派 ' + this.schoolLabel.string,
            callback
		);
	}

    getSchoolName(id: number) {
        switch (id) {
            case 101: return '凌霄殿';
            case 102: return '普陀山';
            case 103: return '盘丝洞';
            case 104: return '五庄观';
            default: return '无门派';
        }
    }

    closePanel() {
        CommonUtils.safeRemove(this.node)
    }
}
