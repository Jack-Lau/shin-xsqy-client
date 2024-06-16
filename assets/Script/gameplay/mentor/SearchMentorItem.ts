import { PlayerBaseInfo, DisciplineRequest } from "../../net/Protocol";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class SearchMentorItem extends cc.Component {
    @property(cc.Button)
    sendRequestBtn: cc.Button = null;
    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Label)
    discipleNumLabel: cc.Label = null;
    @property(cc.Node)
    requestedNode: cc.Node = null;

    info: PlayerBaseInfo = null;

    start () {
        let _this = this;
        this.sendRequestBtn.node.on(cc.Node.EventType.TOUCH_END, this.sendRequest.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (undefined == _this.info) {
                return;
            } else {
                CommonUtils.showViewPlayerBox(_this.info);
            }
        });
    }

    async init(info: PlayerBaseInfo, requested: boolean, discipleAmount: number) {
        this.info = info;
        this.nameLabel.string = info.player.playerName;
        this.fcLabel.string = info.player.fc + '';
        this.playerIcon.spriteFrame = await ResUtils.getPlayerRectIconById(info.player.prefabId);
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(info.schoolId));
        this.discipleNumLabel.string = `徒弟数 ${discipleAmount}/6`;
        this.sendRequestBtn.node.active = !requested;
        this.requestedNode.active = requested;
    }

    async sendRequest(e) {
        e.stopPropagation();
        if (undefined == this.info) {
            return;
        }
        let result = await NetUtils.post<DisciplineRequest>('/impartation/disciplineRequest/fromMe/{masterAccountId}/create', [this.info.player.accountId]);
        if (result.isRight) {
            EventDispatcher.dispatch(Notify.MENTOR_SEND_NEW_REQUEST, {request: result.right});
            this.requestedNode.active = true;
            this.sendRequestBtn.node.active = false;
        }
    }
}
