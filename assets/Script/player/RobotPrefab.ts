import { CommonUtils } from "../utils/CommonUtils";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import { StepDirectionString } from "../map/PathStep";
import MapConfig from "../config/MapConfig";
import MapManager from "../map/MapManager";
import { Notify } from "../config/Notify";
import PlayerPopup from "./PlayerPopup";
import Optional from "../cocosExtend/Optional";
import { ResUtils } from "../utils/ResUtils";
import { TitleConfig } from "./title/TitleConfig";
import { PlayerOnlineStatus, Fashion, FashionDye, PlayerBaseInfo } from "../net/Protocol";
import FashionModel from "../gameplay/fashion/FashionModel";
import { GameConfig } from "../config/GameConfig";
import { Setting } from "../base/Global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RobotPrefab extends cc.Component {
    @property(cc.RichText)
    nameRichText: cc.RichText = null;

    @property(cc.Sprite)
    mcSprite: cc.Sprite = null;

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;  // 用来事件点击响应

    @property(cc.Sprite)
    weapon: cc.Sprite = null;

    @property(cc.Sprite)
    fightingFlag: cc.Sprite = null;
    @property(cc.Sprite)
    gamblingFlag: cc.Sprite = null;

    // 称号
    @property(cc.RichText)
    titleRT: cc.RichText = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    @property(FashionModel)
    fashionModel: FashionModel = null;
    
    fashion: Optional<Fashion> = Optional.Nothing(); 

    isFashion: boolean = false;

    public id: number = 0;
    public weaponSerialId: number = 0;
    public prefabId: number = 4000001;
    public weaponId: number = 0;
    public path = [];
    public timeRange = 4000;
    player = null;
    private sumStep = 0;
    private moveStatus: string = 'stand_d';

    mapSize: cc.Vec2 = cc.Vec2.ZERO;
    removed: boolean = false;


    start() {

    }

    initAsFashion (prefabId: number, weaponProtoId: Optional<number>, definitionId: number, dye: Optional<FashionDye>, onlineStatus) {
        this.fashionModel.initAsNormal(prefabId, weaponProtoId, definitionId, dye);
        let mapConfig = MapConfig.getInstance().mapInfo[MapManager.getInstance().currentMapId];
        let mw = mapConfig.width;
        let mh = mapConfig.height;

        this.node.x = onlineStatus.playerLocation.xpos - mw / 2;
        this.node.y = mh / 2 - onlineStatus.playerLocation.ypos;

        this.mapSize.x = mw;
        this.mapSize.y = mh;

        this.bgSprite.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
    }

    init (player) {
        this.player = player;
        this.weaponSerialId = player.weaponSerialId;
        this.initNameLabel(player.schoolId, player.name);
        this.initTitle(player.titleDefinitionId);

        if (Setting.robotMcVisible.value) {
            this.initMcOrFashion()
        } else {
            this.initPosition(player.onlineStatus)
        }
    }

    public initMcOrFashion() {
        const player = this.player
        this.mcSprite.node.active = true
        this.weapon.node.active = true
        if (this.player.fashionDefinitionId.valid) {
            this.isFashion = true;
            this.fashionModel.node.active = true;
            this.initAsFashion(player.prefabId, new Optional<number>(player.weaponSerialId), player.fashionDefinitionId.val, player.fashionDye, player.onlineStatus);
        } else {
            this.isFashion = false;
            this.fashionModel.node.active = false;
            this.initMc(player.prefabId, new Optional<number>(player.weaponSerialId), player.onlineStatus);
        }
    }

    cleanMcOrFashion() {
        const mcAni = this.mcSprite.getComponent(cc.Animation)
        mcAni.clear()
        mcAni.stop()
        mcAni.getClips().forEach(clip => mcAni.removeClip(clip))

        const weaponAni = this.weapon.getComponent(cc.Animation)
        weaponAni.clear()
        weaponAni.stop()
        weaponAni.getClips().forEach(clip => weaponAni.removeClip(clip))

        this.bgSprite.node.off(cc.Node.EventType.TOUCH_END)

        this.mcSprite.node.active = false
        this.weapon.node.active = false
        this.fashionModel.node.active = false
    }

    async initMc(prefabId, weaponProtoId: Optional<number>, onlineStatus: PlayerOnlineStatus) {
        let weaponId = CommonUtils.getWeaponId(prefabId, weaponProtoId);
        this.prefabId = prefabId;
        this.weaponId = weaponId;
        let startDirection = `stand_${onlineStatus.playerLocation.direction.toLowerCase()}`;
        
        let playerMCArray = await Promise.all([
            MovieclipUtils.getMovieclip(prefabId, 'stand_d', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_u', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_r', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_rd', 10),
            MovieclipUtils.getMovieclip(prefabId, 'stand_ru', 10),
            MovieclipUtils.getMovieclip(prefabId, 'run_d', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_u', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_r', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_rd', 15),
            MovieclipUtils.getMovieclip(prefabId, 'run_ru', 15)
        ]);
        let _this = this;
        playerMCArray.forEach((movieclip: cc.AnimationClip) => {
            let animation = _this.mcSprite.getComponent(cc.Animation);
            animation.addClip(movieclip, movieclip.name);
        });

        let weaponMCArray = await Promise.all([
            MovieclipUtils.getMovieclip(weaponId, 'stand_d', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_u', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_r', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_rd', 10),
            MovieclipUtils.getMovieclip(weaponId, 'stand_ru', 10),
            MovieclipUtils.getMovieclip(weaponId, 'run_d', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_u', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_r', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_rd', 15),
            MovieclipUtils.getMovieclip(weaponId, 'run_ru', 15)
        ]);
        weaponMCArray.forEach((movieclip: cc.AnimationClip) => {
            let animation = _this.weapon.getComponent(cc.Animation);
            animation.addClip(movieclip, movieclip.name);
        });

        this.moveStatus = null;
        this.changeMoveStatus(startDirection);

        let anchor = MovieclipUtils.getOffset(this.player.prefabId + "_" + startDirection);
        this.mcSprite.node.anchorX = anchor.x;
        this.mcSprite.node.anchorY = anchor.y;
        this.weapon.node.anchorX = anchor.x;
        this.weapon.node.anchorY = anchor.y;

        this.bgSprite.node.on(cc.Node.EventType.TOUCH_END, this.onClick.bind(this));
        
        this.initPosition(onlineStatus)
    }

    initPosition(onlineStatus: PlayerOnlineStatus) {
        let mapConfig = MapConfig.getInstance().mapInfo[MapManager.getInstance().currentMapId];
        let mw = mapConfig.width;
        let mh = mapConfig.height;

        this.node.x = onlineStatus.playerLocation.xpos - mw / 2;
        this.node.y = mh / 2 - onlineStatus.playerLocation.ypos;

        this.mapSize.x = mw;
        this.mapSize.y = mh;
    }

    initNameLabel(schoolId: number, name: string) {
        this.nameRichText.string = "<img src=" + "'school_icon_" + schoolId + "'/><color=#3FBC36><b><outline color=#131313 width=1>" + name + "<outline></b></color>";
    }

    async initTitle(titleId: Optional<number>) {
        if (!titleId.valid) {
            this.titleSp.node.active = this.titleRT.node.active = false;
            this.fightingFlag.node.y -= 50;
        } else {
            let config = await TitleConfig.getConfigById(titleId.val);
            if (config.type == 1) { // 图片
                this.initPicTitle(config.picId);
            } else {
                this.fightingFlag.node.y -= 50;
                this.initTextTitle(config.name);
            }
        }
    }

    private async initPicTitle(picId: number) {
        this.titleSp.node.active = true;
        this.titleRT.node.active = false;
        this.titleSp.spriteFrame = await ResUtils.getTitleIconById(picId);
    }

    private initTextTitle(title: string) {
        this.titleSp.node.active = false;
        this.titleRT.node.active = true;
        this.titleRT.string = "<color=#52A2FF><b><outline color=#131313 width=1>" + title + "<outline></b></color>";
    }

    async onClick() {
		/*
        let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
        let prefab = await CommonUtils.getPanelPrefab('playerPopup') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(PlayerPopup);
        panel.init(this.player);
        event.detail = {
            panel: panel
        }
        this.node.dispatchEvent(event);
		*/

		CommonUtils.showViewPlayerBox(this.player.baseInfo);
    }

    stateChange() {
        if (this.removed) {
            return;
        }
        if (Math.random() < 0.4) {
            let movingTargetArray = MapConfig.getInstance().mapInfo[MapManager.getInstance().currentMapId]["movingTargetArray"];
            if (!movingTargetArray) {
                return;
            }
            let point = CommonUtils.randomOne(movingTargetArray);
            let mw = this.mapSize.x;
            let mh = this.mapSize.y;

            let speed = GameConfig.RUN_SPEED;
            if (R.path(['baseInfo', 'shenxing'], this.player)) {
                speed *= 1.2;
            }
            this.path = MapConfig.getInstance().autoFindPath(MapManager.getInstance().currentMapId, new cc.Vec2(mw / 2 + this.node.x, mh / 2 - this.node.y), point, speed);
            this.startWalk();
            // AppFacade.getInstance().sendNotification(Notify.MAP_GET_PATH, { id: this.id, sx: this.heroMc.x, sy: this.heroMc.y, ex: point.x, ey: point.y });
        } else {
            setTimeout(this.stateChange.bind(this), 8000);
        }
    }

    refreshState(info: PlayerOnlineStatus) {
        if (info == undefined) {
            return;
        }
        this.gamblingFlag.node.active = info.status === "MINIGAME";
        this.fightingFlag.node.active = info.status === "BATTLE";
        this.player.onlineStatus = info;
        let point: cc.Vec2 = new cc.Vec2(info.playerLocation.xpos, info.playerLocation.ypos);
        let mw = this.mapSize.x;
        let mh = this.mapSize.y;
        let speed = GameConfig.RUN_SPEED;
            if (R.path(['baseInfo', 'shenxing'], this.player)) {
                speed *= 1.2;
            }
        this.path = MapConfig.getInstance().autoFindPath(MapManager.getInstance().currentMapId, new cc.Vec2(mw / 2 + this.node.x, mh / 2 - this.node.y), point, speed);
        this.startWalk();
    }

    async removeFromMap() {
        this.removed = true;
        this.node.runAction(cc.fadeTo(1, 0));
        await CommonUtils.wait(1);
        CommonUtils.safeRemove(this.node);
    }

    startWalk() {
        this.schedule(this.move, 0.025);
        setTimeout(function () {
            if (this.path.length > 0) {
                this.path.length == 1;
            }
        }.bind(this), 10000);
    }

    move() {
        if (this.removed) {
            return;
        }
        if (this.path.length == 0) {
            this.changeToStand();
            this.unschedule(this.move);
            // setTimeout(this.stateChange.bind(this), 3000);
            return;
        }
        let deltaX = this.path[0].stepDeltaX;
        let deltaY = this.path[0].stepDeltaY;
        let direction = this.path[0].stepDirection;
        this.path.shift();

        this.changeMoveStatus('run_' + StepDirectionString[direction]);

        this.node.x -= deltaX;
        this.node.y += deltaY;

        if (this.isMasked()) {
            this.node.opacity = 255 * 0.7;
            if (this.isFashion) {
                this.fashionModel.node.opacity = 255 * 0.7;
            }
        } else {
            this.node.opacity = 255;
            if (this.isFashion) {
                this.fashionModel.node.opacity = 255;
            }
        }
    }

    isMasked() {
        let x = this.mapSize.x / 2 + (this.node.x - 50);
        let y = this.mapSize.y / 2 - (this.node.y + 150);
        let w = 100;
        let h = 150;

        let r1 = MapConfig.getInstance().checkMask(x, y);
        let r2 = MapConfig.getInstance().checkMask(x + w, y);
        let r3 = MapConfig.getInstance().checkMask(x, y + h);
        let r4 = MapConfig.getInstance().checkMask(x + w, y + h);

        return r1 || r2 || r3 || r4;
    }

    changeToStand() {
        let status = this.moveStatus.replace('run', 'stand');
        this.changeMoveStatus(status);
    }

    changeMoveStatus(status: string) {
        if (status == this.moveStatus) {
            return;
        }
        this.moveStatus = status;
        if (this.isFashion) {
            this.fashionModel.playAnimation(status);
            return;
        }
        let scaleX = 1;
        if (status.indexOf('l') != -1) {
            status = status.replace('l', 'r');
            scaleX = -1;
        }

        let anchor = MovieclipUtils.getOffset(this.player.prefabId + "_" + status);
        let animation = this.mcSprite.getComponent(cc.Animation);
        animation.pause();
        let onPlay = function () {
            this.mcSprite.node.anchorX = anchor.x;
            this.mcSprite.node.anchorY = anchor.y;
            this.mcSprite.node.scaleX = scaleX;
            animation.off('play', onPlay);
        }.bind(this);
        animation.on('play', onPlay);
        animation.play(this.player.prefabId + "_" + status);

        let animation2 = this.weapon.getComponent(cc.Animation);
        animation2.pause();
        let onPlay2 = function () {
            this.weapon.node.anchorX = anchor.x;
            this.weapon.node.anchorY = anchor.y;
            this.weapon.node.scaleX = scaleX;
            animation2.off('play', onPlay2);
        }.bind(this);
        animation2.on('play', onPlay2);
        animation2.play(this.weaponId + "_" + status);
    }
}
