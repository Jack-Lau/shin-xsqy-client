import { ChatMessage } from "../../net/Protocol";
import { BroadcastInfo } from "../treasure/BuriedPanel";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { NetUtils } from "../../net/NetUtils";
import { CommonUtils } from "../../utils/CommonUtils";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class DigOreRadio extends cc.Component {

    
    @property(cc.Node)
    btn: cc.Node = null;

    @property(cc.RichText)
    text: cc.RichText = null;

    burieds: Array<ChatMessage> = [];
    wabaoBuriedConfig: BroadcastInfo = null;

    lastLength = 0;
    time = 4;
    subscript = 0;

    start() {
        this.init();
    }

    async init() {
        this.text.string = '大奖在等你！';

        let config = (await ConfigUtils.getConfigJson('BroadcastInfo'));
        this.wabaoBuriedConfig = R.prop(3290004, config);
        this.schedule(this.toBuried.bind(this), this.time * 10);
        this.schedule(this.updateLabel.bind(this), this.time);
        await this.toBuried();
        this.updateLabel();
    }

    async toBuried() {
        this.lastLength = this.burieds.length;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/chat/latestInterestingMessage/3290004', []) as any;
        if (response.status === 0) {
            this.burieds = response.content as Array<ChatMessage>;
        }
    }

    async updateLabel() {
        if (this.burieds.length <= 0) {
            return;
        }
        this.text.node.y = -30;
        let data1 = this.burieds[this.subscript].elements[0].content;

        let playerName1 = R.path(['args', 'playerName'], data1);
        let search = '${playerName}';
        let start = playerName1.toString().indexOf(search);
        let playerName2 = playerName1.toString().substring(start + search.length, playerName1.toString().indexOf(',', start));
        let currency = '<color=#ffb94c>' + R.path(['args', 'currency'], data1) + '</color> ';
        let amount = ' <color=#ffb94c>' + R.path(['args', 'amount'], data1) + '</color> ';
        let data2 = this.wabaoBuriedConfig.description.toString().replace('${playerName}', '<color=#fff2aa> ' + playerName2 + ' </color>');
        let data3 = data2.toString().replace('${currency}', currency);
        let data4 = data3.toString().replace('${amount}', amount);
        this.text.string = data4;

        let action1 = cc.moveTo(0.2, 0, 0);
        this.text.node.runAction(action1);
        await CommonUtils.wait(this.time - 0.5);
        let action2 = cc.moveTo(0.2, 0, 30);
        this.text.node.runAction(action2);

        this.subscript += 1;
        if (this.subscript >= this.burieds.length) {
            this.subscript = 0;
        }
    }

    update(dt) {

    }

    onDestroy() {
        this.unschedule(this.toBuried.bind(this));
        this.unschedule(this.updateLabel.bind(this));
    }
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
