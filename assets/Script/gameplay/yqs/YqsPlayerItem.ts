import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { Pit, PitDetail, PlayerBaseInfo } from "../../net/Protocol";
import Optional from "../../cocosExtend/Optional";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import YqsConfirmBox from "./YqsConfirmBox";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { YqsData } from "./YqsData";
import SingleDirectionMc from "../../base/SingleDirectionMc";

const { ccclass, property } = cc._decorator;

@ccclass
export default class YqsPlayerItem extends cc.Component {
	
    @property(SingleDirectionMc)
    mc: SingleDirectionMc = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    rankLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    @property(cc.Button)
    challengeBtn: cc.Button = null;
    @property(cc.Sprite)
    fighting: cc.Sprite = null;

    @property(cc.Sprite)
    block: cc.Sprite = null;

    pitDetail: PitDetail = null;
    baseInfo: PlayerBaseInfo = null;

    start () {
        this.challengeBtn.node.on(cc.Node.EventType.TOUCH_END, this.challenage.bind(this));
        this.block.node.on(cc.Node.EventType.TOUCH_END, this.mcOnClick.bind(this));
    }

    async init (pitDetail: PitDetail, info: PlayerBaseInfo) {
        this.pitDetail = pitDetail;
        this.baseInfo = info;
        this.fighting.node.active = this.pitDetail.locked;
		//
        this.rankLabel.string = `${pitDetail.pit.position}号`;
        this.fcLabel.string = `战力 ${info.player.fc}`;
        this.nameLabel.string = info.player.playerName;
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(info.schoolId));
        this.costLabel.string = String(100 + 100 * pitDetail.pit.challengedCount);
        this.mc.init(info)
    }

    async challenage (e: cc.Event.EventTouch) {
        e.stopPropagation();
        if (!this.pitDetail)  {
            return;
        }
        if (this.pitDetail.pit.position > YqsData.myInfo.pit.pit.position) {
            TipsManager.showMessage('不可挑战更低排名的对手');
            return;
        }
        if (this.pitDetail.locked) {
            TipsManager.showMessage('当前角色正在战斗中');
            return;
        }
        let price = 100 + 100 * this.pitDetail.pit.challengedCount;
        let panel = await CommonUtils.getPanel('gameplay/yqs/yqsConfirmBox', YqsConfirmBox) as YqsConfirmBox;
        YqsData.challenging = {
            "playerName": this.baseInfo.player.playerName,
            "rank": this.pitDetail.pit.position,
            "prefabId": this.baseInfo.player.prefabId,
            "schoolId": new Optional<number>(this.baseInfo.schoolId)
        };
        panel.init(this.pitDetail.pit.position, price, YqsData.myInfo.mineArenaRecord.challengePoint);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel})
    }

    mcOnClick () {
        if (!this.pitDetail) {
            return;
        }
        let rate = Math.floor(this.pitDetail.factor * 100);
        TipsManager.showMessage(`该摇钱树的排号收益率为${rate}%`);
    }

}