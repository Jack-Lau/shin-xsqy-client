import { PlayerBaseInfo } from "../../net/Protocol";
import { ResUtils } from "../../utils/ResUtils";
import Optional from "../../cocosExtend/Optional";
import { CommonUtils } from "../../utils/CommonUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class DiscipleRecordPrefab extends cc.Component {
    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Sprite)
    schoolIcon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    info: PlayerBaseInfo = null;

    start () {
        let _this = this;
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            if (undefined == _this.info) {
                return;
            } else {
                CommonUtils.showViewPlayerBox(_this.info);
            }
        })
    }

    async init(info: PlayerBaseInfo) {
        this.info = info;
        this.nameLabel.string = info.player.playerName;
        this.schoolIcon.spriteFrame = await ResUtils.getSchoolIconById(new Optional<number>(info.schoolId));
        this.icon.spriteFrame = await ResUtils.getPlayerCircleIconById(info.player.prefabId);
    }


}
