import { CommonUtils } from "../utils/CommonUtils";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import MapScene from "../map/MapScene";
import { Notify } from "../config/Notify";
import NpcPanel from "./NpcPanel";
import NpcConfig from "../config/NpcConfig";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import JgtManager from "../gameplay/jinguangta/JgtManager";
import { ResUtils } from "../utils/ResUtils";
import PlayerData from "../data/PlayerData";
import { TipsManager } from "../base/TipsManager";
import CasinoPanel from "../gameplay/casino/CasinoPanel";
import YbwlPanel from "../gameplay/ybwl/YbwlPanel";
import DigOrePanel from "../gameplay/digOre/DigOrePanel";
import AntiquePanel from "../gameplay/antique/AntiquePanel";
import TigerMachinePanel from "../gameplay/tigerMachine/TigerMachinePanel";
import HlttPanel from "../gameplay/hltt/HlttPanel";
import RedPacketPanel from "../gameplay/redPacket/RedPacketPanel";
import TreasureBowlPanel from "../gameplay/treasureBowl/TreasureBowlPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NpcPrefab extends cc.Component {

    @property(cc.RichText)
    nameRT: cc.RichText = null;

    @property(cc.RichText)
    titleRT: cc.RichText = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    @property(cc.Sprite)
    npcSprite: cc.Sprite = null;

    @property(cc.Sprite)
    flagSprite: cc.Sprite = null;

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;

    private npcId: number = 1;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // let animation = this.flagSprite.getComponent(cc.Animation);
        // animation.play();
    }

    openGambling(index: number) {
        switch (index) {
            case 0: // 长乐坊 
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/casino/casinoPanel', CasinoPanel);
                break;
            case 1: // 一本万利
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/ybwl/ybwlPanel', YbwlPanel);
                break;
            case 4: // 挖矿
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1195);
                    return;
                }
                this.openPanel('gameplay/digOre/DigOrePanel', DigOrePanel);
                break;
            case 2: // 古董
                if (PlayerData.getInstance().playerLevel < 50) {
                    TipsManager.showMessage('50级以上才能鉴宝，先去完成主线任务吧');
                    return;
                }
                this.openPanel('gameplay/antique/AntiquePanel', AntiquePanel);
                break;
            case 3: // 老虎机
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/tigerMachine/TigerMachinePanel', TigerMachinePanel);
                break;
            case 5: // 欢乐筒筒
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/hltt/hlttPanel', HlttPanel);
                break;
            case 6: // 红包六六六
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/redPacket/RedPacketPanel', RedPacketPanel);
                break;
            case 7: // 长乐聚宝盆
                if (PlayerData.getInstance().playerLevel < 50) {           
                    TipsManager.showMsgFromConfig(1191);
                    return;
                }
                this.openPanel('gameplay/treasureBowl/TreasureBowlPanel', TreasureBowlPanel);
                break;
        }
    }

    async openPanel (url, klass) {
        let panel = await CommonUtils.getPanel(url, klass);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async nodeOnClick () {
        if (this.npcId >= 725 && this.npcId <= 732) {
            this.openGambling(this.npcId - 725);
        }
    }

    async onClick() {
        if (this.npcId >= 725 && this.npcId <= 732) {
            return;
        }
        let npc = NpcConfig.getInstance().npcs[this.npcId];
        if (!npc) {
            return;
        }
        let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
        let prefab = await CommonUtils.getPanelPrefab('npcPanelPrefab') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(NpcPanel);
        panel.node.height = CommonUtils.getViewHeight();
        panel.initWithSelection(this.npcId);
        event.detail = {
            panel: panel
        }
        this.node.dispatchEvent(event);

        EventDispatcher.dispatch(Notify.HIDE_MAIN_UI, {});
    }

    init(npcConfig) {
        this.npcId = npcConfig.id;
        let npc = NpcConfig.getInstance().npcs[this.npcId];
        if (this.npcId >= 725 && this.npcId <= 732) {
            this.nameRT.string = "";
            this.npcSprite.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.nodeOnClick.bind(this)));
        } else {
            this.initName(npcConfig.name);
            this.bgSprite.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onClick.bind(this)));
        }
        
        
        this.initTitle(npcConfig.title, npcConfig.titleType);
        this.initMovieclip(npc.prefabId, 'stand_' + npcConfig.direction);
    }

    initName(name: string) {
        this.nameRT.string = CommonUtils.mkRichText(name, {
            'b': null,
            'size': {
                value: '22'
            },
            'color': {
                value: '#FAFF74'
            },
            'outline': {
                attributes: {
                    'color': '#000000',
                    'width': '1'
                }
            }
        });
    }


    initTitle (title: string, type: number) {
        this.titleRT.node.active = false
        this.titleSp.node.active = false;
        if (title && title != '') {
            if (type == 0) {
                this.initTextTitle(title);
            } else {
                this.initPicTitle(title);
            }
        }
    }

    private async initPicTitle(title) {
        this.titleSp.node.active = true;
        this.titleRT.node.active = false;
        this.titleSp.spriteFrame = await ResUtils.getTitleIconById(title);
    }

    private initTextTitle(title: string) {
        this.titleSp.node.active = false;
        const showTitle = title?.length > 0
        this.titleRT.node.active = showTitle;
        if (showTitle) {
            this.titleRT.string = "<color=#52A2FF><b><outline color=#131313 width=1>" + title + "<outline></b></color>";
        }
    }

    async initMovieclip(prefabId: number, direction: string) {
        let transport = [9010, 9011, 9012, 9013];
        if (transport.indexOf(this.npcId) != -1) {
            this.initTransport();
            return;
        }
        let wipeOutTransports = [9036, 9037];
        if (wipeOutTransports.indexOf(this.npcId) != -1) {
            this.initWipeoutTransport();
            return;
        }
        let scaleX = 1;
        if (direction.indexOf('l') != -1) {
            scaleX = -1;
            direction = direction.replace('l', 'r');
        }
        let moveclip = await MovieclipUtils.getMovieclip(prefabId, direction, 10) as cc.AnimationClip;
        let animation = this.npcSprite.getComponent(cc.Animation);
        animation.addClip(moveclip, moveclip.name);
        animation.play(moveclip.name);
        let anchor = MovieclipUtils.getOffset(moveclip.name);
        this.npcSprite.node.anchorX = anchor.x;
        this.npcSprite.node.anchorY = anchor.y;
        this.npcSprite.node.scaleX = scaleX;
    }

    async initTransport() {
        let color = JgtManager.getInstance().wayPointColors[this.npcId - 9010];
        if (color.isValid()) {
            let moveclip = await MovieclipUtils.getEffectClipData('ui/gameplay/jinguangta/transport_' + color.getValue(), 16) as cc.AnimationClip;
            let animation = this.npcSprite.getComponent(cc.Animation);
            animation.addClip(moveclip, 'transport');
            animation.play('transport');
            this.npcSprite.node.anchorX = 0.49057;
            this.npcSprite.node.anchorY = 0.12712;
        }
    }

    async initWipeoutTransport() {
        let color = JgtManager.getInstance().wipeoutPointColor;
        let moveclip = await MovieclipUtils.getEffectClipData('ui/gameplay/jinguangta/transport_' + color, 16) as cc.AnimationClip;
        let animation = this.npcSprite.getComponent(cc.Animation);
        animation.addClip(moveclip, 'transport');
        animation.play('transport');
        this.npcSprite.node.anchorX = 0.49057;
        this.npcSprite.node.anchorY = 0.12712;
    }

    // update (dt) {}
}
