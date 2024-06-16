import { CommonUtils } from "../utils/CommonUtils";
import { NetUtils } from "../net/NetUtils";
import { ChatMessage } from "../net/Protocol";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;
@ccclass
export default class PanelBroadcast extends cc.Component {
    @property(cc.RichText)
    contentRT: cc.RichText = null;

    broadcastId: number = null;
    infoArray: Array<ChatMessage> = [];
    _stopTween: boolean = false;
    startY: number = 0;
    startX: number = 0;

    start () {
        this.startY = this.node.y;
        this.startX = this.node.x;
        this.showBroadcast(0);
        this.schedule(this.timerUpdate, 10);
    }

    init (id: number, transformer: (x: ChatMessage) => string) {
        this.broadcastId = id;
        this.transformer = transformer;
    }

    private transformer = (x: ChatMessage): string => { return ''; }

    private async timerUpdate () {
        if (!this.broadcastId) {
            return;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/chat/latestInterestingMessage/{id}', [this.broadcastId]) as any;
        if (response.status == 0) {
	        this.infoArray = response.content;
        }
    }

    private async showBroadcast (index: number) {
        if (this._stopTween) {
            return;
        }
        if (this.infoArray.length == 0) {
            await CommonUtils.wait(5);
            this.showBroadcast(index + 1);
            return;
        }
        if (index >= this.infoArray.length) {
            index = 0;
        }

        let action1 = cc.spawn(cc.moveTo(0.2, this.startX, this.startY + 30), cc.fadeTo(0.2, 0));
        this.contentRT.node.runAction(action1);
        await CommonUtils.wait(0.3);
        this.contentRT.string = this.transformer(this.infoArray[index]);
        this.contentRT.node.y = this.startY - 30;
        let action2 = cc.spawn(cc.moveTo(0.2, 39, this.startY), cc.fadeTo(0.2, 255));
        this.contentRT.node.runAction(action2);
        await CommonUtils.wait(4.22);
        this.showBroadcast(index + 1);
    }

    stopTween () {
        this._stopTween = true;
        this.unschedule(this.timerUpdate)
    }
}
