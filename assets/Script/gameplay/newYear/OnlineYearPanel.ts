import OnlineYearItem from "./OnlineYearItem";
import { CommonUtils } from "../../utils/CommonUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { NetUtils } from "../../net/NetUtils";
import { ZxjlRecord } from "../../net/Protocol";
import PlayerData from "../../data/PlayerData";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class OnlineYearPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Sprite)
    progress: cc.Sprite = null;
    @property(cc.Node)
    progressLight: cc.Node = null;
    @property(cc.Label)
    showTime: cc.Label = null;

    @property(OnlineYearItem)
    items: OnlineYearItem[] = [];

    config = [];
    async start() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        let fig = await ConfigUtils.getConfigJson('GameOnlineTime');
        for (let key in fig) {
            let value = fig[key];
            this.config.push(value);
        }
        this.init();
    }

    async init() {
        //请求数据
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/view/myself/detail', []) as any;
        if (response2.status === 0) {
            PlayerData.getInstance().onlineTimeCount = response2.content.player.onlineTimeCount;
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/zxjl/myself', []) as any;
        if (response.status === 0) {
            let data = (response.content as ZxjlRecord).awardsDelivered;
            this.items.forEach((item, index) => {
                item.init(this.config[index], (PlayerData.getInstance().onlineTimeCount / 1000) >= R.prop('time', this.config[index]), data[index]);
                item.index = index;
            });
        }
        let m = (PlayerData.getInstance().onlineTimeCount / 1000) / R.prop('time', this.config[4]);
        if (m > 1) {
            m = 1;
        }
        this.progress.fillRange = m;
        this.progressLight.y = this.progress.node.height * m + 30;
        this.showTime.string = Math.floor(PlayerData.getInstance().onlineTimeCount / 1000 / 60) + '分钟';
    }

    // update (dt) {}
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
