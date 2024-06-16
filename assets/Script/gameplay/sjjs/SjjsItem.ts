import { CommonUtils } from "../../utils/CommonUtils";
import MapConfig from "../../config/MapConfig";
import { GameConfig } from "../../config/GameConfig";
import { NetUtils } from "../../net/NetUtils";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import SjjsSelectPanel from "./SjjsSelectPanel";
import ItemConfig from "../../bag/ItemConfig";
import { TipsManager } from "../../base/TipsManager";
import PlayerData from "../../data/PlayerData";

const {ccclass, property} = cc._decorator; 

interface SjjsTeamInfo {
    endTime: number, 
    balanceTime: number, 
    mapId: number, 
    teamId: number,
    index: number
}

@ccclass
export default class SjjsItem extends cc.Component {
    // 经商中
    @property(cc.Sprite)
    picSp: cc.Sprite = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;
    @property(cc.Node)
    jsNode: cc.Node = null;
    @property(cc.Label)
    backTimeLabel: cc.Label = null;
    @property(cc.RichText)
    contentRT: cc.RichText = null;
    @property(cc.Button)
    backBtn: cc.Button = null;

    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.Button)
    startJsBtn: cc.Button = null;
    @property(cc.Button)
    addPositionBtn: cc.Button = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    info: SjjsTeamInfo = null;

    start () {
        // this.init(f);
        this.startJsBtn.node.on(cc.Node.EventType.TOUCH_END, this.startJs.bind(this));
        this.addPositionBtn.node.on(cc.Node.EventType.TOUCH_END, this.addPosition.bind(this));
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, this.forceCallback.bind(this));
    }

    init (empty: boolean, locked: boolean, info: SjjsTeamInfo) {
        this.jsNode.active = !empty;
        this.emptyNode.active = empty;
        this.addPositionBtn.node.active = locked;
        this.startJsBtn.node.active = !locked;
        this.info = info;

        if (!empty) {
            let config = MapConfig.getInstance().idleMineInfo[info.mapId];
            let mapName = MapConfig.getInstance().getMapName(info.mapId);
            let cuurencyId = config.produceCurrencyId;
            let cuurencyName = ItemConfig.getInstance().getCurrencyInfo(cuurencyId).fmap(x => x.name).getOrElse('');
            this.picSp.spriteFrame = this.getSf(`pic_${info.teamId}`)
            this.initTitleSp(`title_${info.teamId}`);
            this.initTime(info.endTime - CommonUtils.getServerTime());
            this.initContent(mapName, cuurencyName);
        }
        
    }

    initTitleSp (cate) {
        this.titleSp.spriteFrame = this.getSf(String(cate));
    }

    initTime (time: number) {
        let hour = Math.floor((time % 86400000) / 3600000);
        let minute = Math.floor((time % 3600000) / 60000);
        this.backTimeLabel.string = `(${hour}时${minute}分后归来)`;
    }

    initContent (where, what) {
        this.contentRT.string = `正在<color=#53ff3c> ${where} </c>大量置办<color=#fffec1> ${what}</c>`
    }

    async startJs () {
        let panel = await CommonUtils.getPanel('gameplay/sjjs/sjjsSelectPanel', SjjsSelectPanel) as SjjsSelectPanel;
        panel.init();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async addPosition () {
        let callback = async () => {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/expand', []);
            if (response.status === 0) {
                EventDispatcher.dispatch(Notify.SJJS_PANEL_UPDATE, {data: response.content});
            }
        }
        let price = 1000
        if (this.info.index == 3) {
            price = 3000;
        }
        let own = PlayerData.getInstance().kbAmount;
        CommonUtils.showRichSCBox(
            `是否花费 <img src='currency_icon_151'/><color=#900404>${price}</color> 增加1个经商位置？`,
            `(当前拥有<img src='currency_icon_151'/>${own})`,
            null,
            callback
        );
    }

    async forceCallback () {
        if (!this.info) { return; }
        let _this = this;
        let callback = async () => {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/shutdown', [_this.info.index]);
            if (response.status === 0) {
                TipsManager.showMessage('召回成功');
                EventDispatcher.dispatch(Notify.SJJS_PANEL_UPDATE, {data: response.content});
            }
        }
        CommonUtils.showRichSCBox(
            '是否立刻召回正在经商的商人？',
            '(支付的雇佣费用不会返还)',
            null,
            callback
        );
    }

    getSf (name: string) {
        return this.atlas.getSpriteFrame(name);
    }
}