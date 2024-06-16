import { PlayerBaseInfo, DiscipleRecord } from "../../net/Protocol";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class MentorRequestItem extends cc.Component {
    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Button)
    acceptBtn: cc.Button = null;

    info: PlayerBaseInfo = null;

    start () {
        this.acceptBtn.node.on(cc.Node.EventType.TOUCH_END, this.accept.bind(this));

        let _this = this;
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (undefined == _this.info) {
                return;
            } else {
                CommonUtils.showViewPlayerBox(_this.info);
            }
        });
    }

    async init (info: PlayerBaseInfo) {
        this.info = info;
        this.nameLabel.string = info.player.playerName;
        this.fcLabel.string = info.player.fc + '';
        this.playerIcon.spriteFrame = await ResUtils.getPlayerRectIconById(info.player.prefabId);
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(info.schoolId));
    }

    async accept(e) {
        e.stopPropagation();
        if (undefined == this.info) {
            return;
        }
        let result = await NetUtils.post<DiscipleRecord>('/impartation/disciplineRequest/toMe/{discipleAccountId}/accept', [this.info.player.accountId])
        if (result.isRight) {
            TipsManager.showMessage('恭喜您收得一名好徒儿~要好好指导TA哦！');
            EventDispatcher.dispatch(Notify.MENTOR_UPDATE_DISCIPLE, {});
        }
    }

}
