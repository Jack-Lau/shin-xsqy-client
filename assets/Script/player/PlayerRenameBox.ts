import { CommonUtils } from "../utils/CommonUtils";
import { CurrencyId } from "../config/CurrencyId";
import { TipsManager } from "../base/TipsManager";
import { NetUtils } from "../net/NetUtils";
import { Player } from "../net/Protocol";
import PlayerData from "../data/PlayerData";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;


@ccclass
export default class PlayerRenameBox extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.EditBox)
    input: cc.EditBox = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    centerEditBpx() {
        if (this.input) {
            CommonUtils.editBoxCenter(this.input);
        }
    }

    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.rename.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);

        this.input && this.centerEditBpx();
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    async rename () {
        if ((await CommonUtils.getCurrencyAmount(CurrencyId.改名卡)) <= 0) {
            TipsManager.showMessage('改名卡数量不足');
            return;
        }
        let newName = this.input.string;
        if (newName == "") {
            TipsManager.showMessage('你还没有输入新名字呢');
            return;
        }
        let result = await NetUtils.post<Player>('/player/action/myself/rename', [newName])
        if (result.isRight) {
            TipsManager.showMessage('名字修改成功');
            this.closePanel();
            PlayerData.getInstance().setName(result.right.playerName);
        }
    }
}