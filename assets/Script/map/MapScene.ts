import TileMap from "./TileMap";
import { CommonUtils } from "../utils/CommonUtils";
import MapBlockManager from "./MapBlockManager";
import PlayerPrefab from "../player/PlayerPrefab";
import { PathStep, StepDirectionString } from "./PathStep";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import NpcConfig from "../config/NpcConfig";
import NpcPrefab from "../npc/NpcPrefab";
import MapConfig from "../config/MapConfig";
import CameraController from "./CameraController";
import RobotManager from "../player/RobotManager";
import { Notify } from "../config/Notify";
import MapManager from "./MapManager";
import { TipsManager } from "../base/TipsManager";
import MainUI from "../mainui/MainUI";
import NetManager from "../net/NetManager";
import PlayerData from "../data/PlayerData";
import PlayerPopup from "../player/PlayerPopup";
import { NetUtils } from "../net/NetUtils";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { QuestManager } from "../quest/QuestManager";
import NpcPanel from "../npc/NpcPanel";
import QuestConfig from "../quest/QuestConfig";
import { Chat } from "../chat/Chat";
import { BattleConfig } from "../battle/BattleConfig";
import BattleScene from "../battle/BattleScene";
import ItemConfig from "../bag/ItemConfig";
import BagData from "../bag/BagData";
import { Equipment, PlayerDetail, PlayerBaseInfo, PlayerOnlineStatus, FashionDye, BattleResponse } from "../net/Protocol";
import TeamManager from "../player/TeamManager";
import { TestUtils } from "../utils/TestUtils";
import JgtMiniStatus from "../gameplay/jinguangta/JgtMiniStatusPanel";
import { PetData } from "../gameplay/pet/PetData";
import { GameInit } from "./GameInit";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import { GameConfig } from "../config/GameConfig";
import { ResUtils } from "../utils/ResUtils";
import AudioEngine from "./AudioEngine";
import GuidePanel from "../mainui/GuidePanel";
import { QuickUseManager } from "../gameplay/rightdown/QuickUseManager";
import QuestCompleteTween from "../gameplay/quest/QuestCompleteTween";
import ActivityData from "../gameplay/activity/ActivityData";
import Optional from "../cocosExtend/Optional";
import FriendsData from "../gameplay/friends/FriendsData";
import KingsFightStatue from "../gameplay/kingsFight/KingsFightStatue";
import LevelUpNotification from "../gameplay/notification/LevelUpNotification";
import { onAdSuccess } from "../utils/NativeUtils";
import WorkPanel from "../gameplay/work/WorkPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapScene extends cc.Component {
    @property(CameraController)
    ccontroller: CameraController = null;

    @property(cc.Layout)
    mapGroup: cc.Layout = null;

    @property(cc.Prefab)
    mapPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    npcPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    statuePrefab: cc.Prefab = null;

    @property(cc.Layout)
    spriteGroup: cc.Layout = null;

    @property(cc.Layout)
    panelLayer: cc.Layout = null;

    @property(cc.Layout)
    battleLayer: cc.Layout = null;

    @property(cc.Layout)
    tipsLayer: cc.Layout = null;

    @property(PlayerPrefab)
    player: PlayerPrefab = null;
    @property(cc.Sprite)
    levelUpEffect: cc.Sprite = null;

    @property(MainUI)
    mainUI: MainUI = null;

    @property(cc.Canvas)
    root: cc.Canvas = null;

    @property(AudioEngine)
    audioEngine: AudioEngine = null;

    @property(cc.Sprite)
    miniMap: cc.Sprite = null;

    @property([cc.SpriteFrame])
    miniMapSF: Array<cc.SpriteFrame> = [];

    private mapSize: cc.Vec2 = new cc.Vec2(768, 1366);
    private path: Array<PathStep> = [];
    private sumStep = 0;
    private questNpcNodes: cc.Node[] = [];
    private dynamicNpcs: { [key: number]: cc.Node } = {};

    private npcs = {};

    static OPEN_PANEL: string = 'panel_layer_open_panel';

    async start() {
        await this.beforeStart();
        let _this = this;
        let schoolId = PlayerData.getInstance().schoolId;
        schoolId = schoolId ? schoolId : 0;

        this.player.nameLabel.string = "<img src=" + "'school_icon_" + schoolId + "'/><color=#3FBC36><b><outline color=#131313 width=1>" + PlayerData.getInstance().playerName + "<outline></b></color>";

        this.mapGroup.node.on(cc.Node.EventType.TOUCH_END, function (e: cc.Event.EventTouch) {
            let location = e.touch.getLocation();
            let x = location.x;
            let y = location.y;
            let visibleSize = cc.view.getVisibleSize();
            _this.showClickMapTween(e);
            _this.autoFindPath(new cc.Vec2(x - visibleSize.width / 2, y - visibleSize.height / 2));
        });
        this.root.node.on(Notify.OPEN_PANEL, this.openPanel.bind(this));
        EventDispatcher.on(Notify.OPEN_PANEL, this.openPanel.bind(this));
        EventDispatcher.on(Notify.ENTER_BATTLE, this.enterBattle.bind(this));
        EventDispatcher.on(Notify.SHOW_BATTLE_ENTER_EFFECT, this.showBattleEnterEffect.bind(this));
        EventDispatcher.on(Notify.SHOW_BONUS_EFFECT, this.showEffect.bind(this));
        // this.root.node.on(Notify.SWITCH_TO_MAP, this.switchToMap.bind(this));
        EventDispatcher.on(Notify.SWITCH_TO_MAP, this.switchToMap.bind(this));
        EventDispatcher.on(Notify.SWITCH_TO_MAP_AND_FIND_NPC, this.switchToMapAndFindNpc.bind(this))
        EventDispatcher.on(Notify.AUTO_FIND_NPC, this.autoFindNpc.bind(this));
        EventDispatcher.on(Notify.ADD_NPC_BY_ID, this.addNpcById.bind(this));
        EventDispatcher.on(Notify.REMOVE_NPC_BY_ID, this.removeNpcById.bind(this));
        EventDispatcher.on(Notify.REFRESH_QUEST_NPC, this.refeshQuestNpcs.bind(this))
        EventDispatcher.on(Notify.REFRESH_ONLINE_STATUS_MYSELF, this.refreshOnlineStatus.bind(this));
        EventDispatcher.on(Notify.GET_SOME_PLAYER_IN_THIS_MAP, (e) => {
            let detail = e.detail;
            _this.initRobot(MapManager.getInstance().currentMapId, new Optional<number>(detail.amount), new Optional<string>(detail.excludeIds))
        });
        EventDispatcher.on(Notify.PLAYER_REFRESH_NAME, () => {
            this.player.nameLabel.string = "<img src=" + "'school_icon_" + PlayerData.getInstance().schoolId + "'/><color=#3FBC36><b><outline color=#131313 width=1>" + PlayerData.getInstance().playerName + "<outline></b></color>";
        });

        EventDispatcher.on(Notify.HIDE_MAIN_UI, this.hideMainUI.bind(this));
        EventDispatcher.on(Notify.SHOW_MAIN_UI, this.showMainUI.bind(this));
        EventDispatcher.on(Notify.SHOW_AFTER_BATTLE, this.showAfterBattle.bind(this));
        EventDispatcher.on(Notify.MAIN_UI_REMOVE_ALL_PANELS, function () {
            this.panelLayer.node.removeAllChildren();
        }.bind(this));

        EventDispatcher.on(Notify.MUSIC_CHANGE, CommonUtils.aloneFunction(this.musicOnChange.bind(this)));
        EventDispatcher.on(Notify.REFRESH_PLAYER_INFO, function () {
            this.player.nameLabel.string = "<img src=" + "'school_icon_" + PlayerData.getInstance().schoolId + "'/><color=#3FBC36><b><outline color=#131313 width=1>" + PlayerData.getInstance().playerName + "<outline></b></color>";
        }.bind(this));

        EventDispatcher.on(Notify.REFRESH_TEAM_PARTNER, this.refreshTeamPartner.bind(this));
        EventDispatcher.on(Notify.ADD_COMPONENT_TO_MAP, function (event: EventDispatcher.NotifyEvent) {
            let component = R.prop('component', event.detail);
            if (component && component instanceof cc.Node) {
                component.parent = this.spriteGroup.node;
            }
        }.bind(this));


        // await
        EventDispatcher.on(Notify.PLAYER_LEVEL_UP, async function (e: EventDispatcher.NotifyEvent) {
            const level = PlayerData.getInstance().playerLevel;
            if (LevelUpNotification.ListenLevels.indexOf(level) !== -1) {
                CommonUtils.getPanel<LevelUpNotification>("gameplay/notification/LevelUpNotification", LevelUpNotification).then(panel => {
                    panel.init(level)
                    EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel })
                })
            }
            this.mainUI.init();
            this.levelUpEffect.node.active = true;
            this.levelUpEffect.getComponent(cc.Animation).play();
            await CommonUtils.wait(1.2);
            this.levelUpEffect.node.active = false;
        }.bind(this));
        EventDispatcher.on(Notify.PLAYER_UPDATE_EXP, function () {
            this.mainUI.initExp();
        }.bind(this));
        EventDispatcher.on(Notify.PLYAER_WEAPON_CHANGE, function () {
            this.initPlayer();
        }.bind(this));
        EventDispatcher.on(Notify.PLAYER_FASHION_REFRESH_DYE, function (event: EventDispatcher.NotifyEvent) {
            let dye = event.detail.dye;
            this.player.refreshDye(dye);
        }.bind(this));

        this.schedule(this.refreshIndex, 0.5);
        console.log('main scene started');
        await this.afterStart();
    }

    // 游戏相关初始化
    async beforeStart() {
        this.fadeOut();
        // 设置为全局, 方便Android, iOS回调
        window['onAdSuccess'] = onAdSuccess;
        await this.initPlayer();
        TipsManager.startListen();
        await GameInit.cleanBattle();
        await QuickUseManager.init();
        await QuestManager.init();
        await this.initEnterMap();
        this.showGuide();
        await GameInit.initReddot();
    }

    async afterStart() {
        this.fadeIn();
		await this.checkWork();
        //
        FriendsData.getInstance().init();
        await TeamManager.getInstance().init();
        await PetData.updatePetIds();
        this.loopRefresh();
        this.mainUI.checkSjjs();
        TestUtils.init();
        GameInit.tryBackToBattle();
    }

    //欢迎界面
    async showGuide() {
        if (!QuestManager.isFinished(700000)) {
            let panel = await CommonUtils.getPanel('mainui/guidePanel', GuidePanel) as GuidePanel;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }
	
	async checkWork() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/work/update', []);
        if (response.status === 0) {
			if (response.content.working == true) {
				let panel = await CommonUtils.getPanel('gameplay/work/WorkPanel', WorkPanel) as WorkPanel;
				EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
			}
        }
	}

    async initPlayer() {
        let prefabId = PlayerData.getInstance().prefabId;
        let definitionId = PlayerData.getInstance().equipments['weapon'].fmap(CommonUtils.getEPId);
        this.player.initAnimation(prefabId, definitionId, PlayerData.getInstance().fashion, PlayerData.getInstance().fashionDye);
        this.player.initTitle(PlayerData.getInstance().title.fmap(t => t.definitionId));
    }

    hideMainUI() {
        let action = cc.fadeTo(0.2, 1);
        this.mainUI.node.runAction(action.clone());
    }

    showMainUI() {
        let action = cc.fadeTo(0.2, 255);
        this.mainUI.node.runAction(action.clone());
    }

    async hideForBattle() {
        this.beforeBattleFadeOut();
		await CommonUtils.wait(0.5);
        this.mainUI.node.active = false;
        this.spriteGroup.node.active = false;
        this.panelLayer.node.active = false;
        this.path = [];
        //
        this.panelLayer.node.children.forEach(ele => {
            if (ele.getComponent(NpcPanel)) {
                CommonUtils.safeRemove(ele);
            }
        })
    }

    showAfterBattle(event) {
        this.mainUI.node.active = true;
        this.spriteGroup.node.active = true;
        this.panelLayer.node.active = true;
        CommonUtils.wait(0.1).then(() => {
            this.afterBattleFadeIn();
            if (event?.detail?.battleId) {
                NetUtils.sendHttpRequest(NetUtils.RequestType.GET, "/battle/view/{id}", [event.detail.battleId]).then((response) => {
                    if (response.status === 0) {
                        const result = response.content as BattleResponse
                        if (result.result.statistics.winStance === event.detail.playerStance) {
                            TipsManager.showMessage("战斗胜利！！！")
                        } else {
                            TipsManager.showMessage("胜败乃兵家常事 大侠请重新来过")
                        }
                    } else {
                        console.error(response)
                    }
                })
            }
        })
    }

    // events
    openPanel(event) {
        let panel = event.detail.panel as cc.Component;
        for (let child of this.panelLayer.node.children) {
            if (child.name == panel.node.name) {
                return;
            }
        }
        if (panel instanceof QuestCompleteTween) {
            // do nothing
        } else if (!(panel instanceof PlayerPopup)) {
            panel.node.x = 0;
            panel.node.y = 0;
            panel.node.height = CommonUtils.getViewHeight();
        }
        QuestManager.openPanel = false; // 无论任何原因，打开界面均会关闭自动打开面板
        panel.node.parent = this.panelLayer.node;
    }

    enterBattle(event) {
        let panel = event.detail.panel as cc.Component;
        panel.node.x = 0;
        panel.node.y = 0;
        panel.node.height = CommonUtils.getViewHeight();
        QuestManager.openPanel = false; // 无论任何原因，打开界面均会关闭自动打开面板
        this.hideForBattle();
        panel.node.parent = this.battleLayer.node;
    }

    showBattleEnterEffect(event) {
        let panel = event.detail.panel as cc.Component;
        panel.node.x = 0;
        panel.node.y = 0;
        panel.node.height = CommonUtils.getViewHeight();
        panel.node.parent = this.battleLayer.node;
    }

    // 显示点击地面的特效
    clickTweenSprite: cc.Sprite = null;
    showClickMapTween(e: cc.Event.EventTouch) {
        if (this.clickTweenSprite == undefined) {
            // 初始化
            let node = new cc.Node('clickTweenSprite');
            this.clickTweenSprite = node.addComponent(cc.Sprite);
            this.clickTweenSprite.addComponent(cc.Animation);
            let _this = this;
            let callback = (clip: cc.AnimationClip) => {
                let animation = _this.clickTweenSprite.getComponent(cc.Animation);
                animation.addClip(clip, "clickTween");
                animation.on('finished', () => {
                    CommonUtils.safeRemove(_this.clickTweenSprite.node);
                });
            }
            MovieclipUtils.setEffectClipData('ui/effect/map_click_effect', 10, cc.WrapMode.Normal, callback);
        }
        this.clickTweenSprite.node.parent = this.mapGroup.node;
        this.clickTweenSprite.node.zIndex = 999;
        let eventVec2 = e.getLocationInView();  // 实际上这并不是cc.Vec2
        let cameraVec2 = this.getPlayerPoint();
        let w = CommonUtils.getViewWidth();
        let h = CommonUtils.getViewHeight();

        let location = (new cc.Vec2(eventVec2.x - w / 2, h / 2 - eventVec2.y + 1366 - h)).add(cameraVec2)
        this.clickTweenSprite.node.x = location.x;
        this.clickTweenSprite.node.y = location.y;
        this.clickTweenSprite.getComponent(cc.Animation).play('clickTween', 0);
    }

    showEffect(event) {
        let effect = event.detail.effect;
        effect.node.parent = this.tipsLayer.node;
    }

    switchToMap(event) {
        let mapId = event.detail.mapId;
        let beforeMapId = MapManager.getInstance().currentMapId;
        this.doSwitchToMap(mapId);
        EventDispatcher.dispatch(Notify.SWITCH_MAP_EVENT, { from: beforeMapId, to: mapId })
        if (mapId != beforeMapId) {
            this.musicOnChange();
        }
    }

    switchToMapAndFindNpc(event) {
        let mapId = event.detail.mapId;
        let location = event.detail.location;
        this.doSwitchToMap(mapId);
        this.player.autoFindPath.node.active = true;
        this.autoFindPathToNpc(location);
        QuestManager.openPanel = true;
    }

    autoFindNpc(event) {
        let location = event.detail.location;
        this.player.autoFindPath.node.active = true;
        this.autoFindPathToNpc(location);
    }

    addNpcById(event) {
        let npcId = event.detail.npcId;
        let node = this.initNpcUI(npcId);
        this.dynamicNpcs[npcId] = node;
    }

    removeNpcById(event) {
        let npcId = event.detail.npcId;
        let node = this.dynamicNpcs[npcId];
        if (node) {
            CommonUtils.safeRemove(node);
            this.dynamicNpcs[npcId] = null;
            delete this.dynamicNpcs[npcId];
        }
    }

    refreshTeamPartner() {
        let team = TeamManager.getInstance();
        let node1 = team.partner1.monadBind(x => x.getNode());
        let node2 = team.partner2.monadBind(x => x.getNode());
        if (node1.isValid()) {
            node1.getValue().x = this.player.node.x;
            node1.getValue().y = this.player.node.y + 1;     // 防止位置相同
            node1.getValue().parent = this.spriteGroup.node;
        }
        if (node2.isValid()) {
            node2.getValue().x = this.player.node.x;
            node2.getValue().y = this.player.node.y + 2;
            node2.getValue().parent = this.spriteGroup.node;
        }
    }

    refeshQuestNpcs(event) {
        // for (let npcNode of this.questNpcNodes) {
        //     CommonUtils.safeRemove(npcNode);
        // }
        // this.questNpcNodes = [];
        // let npcs = NpcConfig.getInstance().getNpcsByMapId(MapManager.getInstance().currentMapId);
        // for (let npcId of npcs['quest']) {
        //     this.questNpcNodes.push(this.initNpcUI(npcId));
        // }
        this.questNpcNodes = [];
        this.initNpc(MapManager.getInstance().currentMapId);
    }

    showFadeIn = false

    doSwitchToMap(mapId) {
        MapManager.getInstance().currentMapId = mapId;
        QuestManager.openPanel = false;
        this.path = [];
        TeamManager.getInstance().clearRecord();
        this.init(mapId);
        this.initNpc(mapId);
        this.refreshMap();
        this.initRobot(mapId);
        EventDispatcher.dispatch(Notify.REFRESH_ONLINE_STATUS_MYSELF, {});
        this.showFadeIn = true
    }

    async initEnterMap() {
        let onlineStatus = await NetUtils.get<PlayerOnlineStatus>('/player/getOnlineStatus', [])
        if (onlineStatus.isRight) {
            let mapId = onlineStatus.right.playerLocation.mapId;
            let xpos = onlineStatus.right.playerLocation.xpos;
            let ypos = onlineStatus.right.playerLocation.ypos;
            let direction = onlineStatus.right.playerLocation.direction;
            MapManager.getInstance().currentMapId = mapId;
            QuestManager.openPanel = false;
            this.path = [];
            TeamManager.getInstance().clearRecord();
            this.init(mapId, new cc.Vec2(xpos, ypos));
            this.initNpc(mapId);
            this.refreshMap();
            this.initRobot(mapId);
            EventDispatcher.dispatch(Notify.REFRESH_ONLINE_STATUS_MYSELF, {});
            this.player.initialDirection = 'stand_' + direction.toLowerCase();
        } else {
            this.doSwitchToMap(1);
        }
    }

    init(mapId: number, initialPosition: cc.Vec2 = null) {
        let mapConfig = MapConfig.getInstance().mapInfo[mapId];
        const WIDTH = mapConfig.width;
        const HEIGHT = mapConfig.height;
        this.mapGroup.node.width = WIDTH;
        this.mapGroup.node.height = HEIGHT;
        this.spriteGroup.node.width = WIDTH;
        this.spriteGroup.node.height = HEIGHT;
        this.mapSize.x = WIDTH;
        this.mapSize.y = HEIGHT;

        // 设置player位置
        if (initialPosition == undefined) {
            this.player.node.x = mapConfig['initialX'] - WIDTH / 2;
            this.player.node.y = HEIGHT / 2 - mapConfig['initialY'];
        } else {
            this.player.node.x = initialPosition.x - WIDTH / 2;
            this.player.node.y = HEIGHT / 2 - initialPosition.y;
        }

        this.ccontroller.leftBound = -this.mapSize.x / 2;
        this.ccontroller.rightBound = this.mapSize.x / 2;

        this.ccontroller.topBound = this.mapSize.y / 2;
        this.ccontroller.bottomBound = -this.mapSize.y / 2;

        this.clearBeforeInit();
        this.refershMapBlocks(mapId);

        // 更新地图图标
        this.mainUI.refreshMapIcon();

        if (this.miniMapSF[mapId - 1]) {
            this.miniMap.spriteFrame = this.miniMapSF[mapId - 1];
            this.miniMap.node.width = WIDTH;
            this.miniMap.node.height = HEIGHT;
        }
    }

    clearBeforeInit() {
        this.path = [];
        this.mapGroup.node.removeAllChildren();
        MapBlockManager.getInstance().locationFlags = {};
        RobotManager.getInstance().clearRobots();
    }

    refershMapBlocks(mapId: number) {
        let mapConfig = MapConfig.getInstance().mapInfo[mapId];
        let row = mapConfig['cutRow'];
        let col = mapConfig['cutColumn'];
        let width = 256;
        let height = 256;
        let manager = MapBlockManager.getInstance();

        // 生成地图块
        for (let i = row - 1; i >= 0; --i) {
            for (let j = col - 1; j >= 0; --j) {
                let x = this.getX(col, j);
                let y = this.getY(row, i);
                // 全部可见
                if (this.mapBlockVisibleTest(x, y)) {
                    if (manager.locationFlags[x + "_" + y]) {
                        continue;
                    }
                    let mapNode = null;
                    if (manager.mapBlockPoll.size() > 0) {
                        mapNode = manager.mapBlockPoll.get();
                    } else {
                        mapNode = cc.instantiate(this.mapPrefab);
                    }
                    let mapImage = mapNode.getComponent(TileMap) as TileMap;
                    let resource = manager.getMapBlockSource(mapConfig.resId, i, j);
                    mapImage.init(resource);
                    mapImage.node.x = x;
                    mapImage.node.y = y;
                    mapImage.node.parent = this.mapGroup.node;
                    manager.locationFlags[x + "_" + y] = true;
                }
            }
        }
    }

    async initRobot(mapId, currentAmount = Optional.Nothing<number>(), excludeIdsOp = Optional.Nothing<string>()) {
        let mapConfig = MapConfig.getInstance().mapInfo[mapId];
        if (mapConfig.maxPlayerMirror === 0) {
            return;
        }
        let amount = mapConfig.maxPlayerMirror - currentAmount.getOrElse(0);
        let excludeIds = excludeIdsOp.getOrElse('');
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/player/getOnlineStatusByMapId', [mapId, amount, excludeIds]) as any;
        if (response.status == 0) {
            let infoArray = response.content as Array<PlayerOnlineStatus>;
            let ids = infoArray.map(x => x.playerLocation.accountId);
            if (ids.length === 0) return;
            if (MapManager.getInstance().currentMapId != mapId) {
                return;
            }
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/viewBaseInfo', [R.join(',', ids)]) as any;
            if (response2.status === 0) {
                if (MapManager.getInstance().currentMapId != mapId) {
                    return;
                }
                let maxPlayerMirror = R.prop('maxPlayerMirror', MapConfig.getInstance().mapInfo[MapManager.getInstance().currentMapId]);
                response2.content.forEach((ele: PlayerBaseInfo, index) => {
                    if (!ele || index >= maxPlayerMirror) return;
                    let prefabId = ele.player.prefabId;
                    if ([4000001, 4000002, 4000003, 4000004].indexOf(prefabId) === -1) {
                        prefabId = 4000001;
                    }
                    RobotManager.getInstance().addRobot({
                        accountId: ele.player.accountId,
                        schoolId: ele.schoolId ? ele.schoolId : 0,
                        weaponSerialId: ele.weaponId,
                        prefabId: prefabId,
                        name: ele.player.playerName,
                        playerLevel: ele.player.playerLevel,
                        titleDefinitionId: new Optional<number>(ele.titleDefinitionId),
                        onlineStatus: infoArray[index],
                        fashionDefinitionId: new Optional<number>(ele.fashionDefinitionId),
                        fashionDye: new Optional<FashionDye>(ele.fashionDye),
                        baseInfo: ele,
                    }, this.spriteGroup.node);
                    ele.player
                });
            }
        }
    }

    initNpcUI(npcId: number) {
        if (npcId >= 10000 && npcId <= 10999) {
            let npcConfig = NpcConfig.getInstance().npcs[npcId];
            let showFlag = false;
            if (npcConfig.extraSelectionIdArray.length > 0) {
                showFlag = true;
            }
            let npcInstance = cc.instantiate(this.statuePrefab);
            let npc = npcInstance.getComponent(KingsFightStatue);
            npc.init(npcId);
            npc.node.x = npcConfig.location.x - this.mapSize.x / 2;
            npc.node.y = this.mapSize.y / 2 - npcConfig.location.y;
            npc.node.parent = this.spriteGroup.node;
            return npc.node;
        } else {
            let npcConfig = NpcConfig.getInstance().npcs[npcId];
            let showFlag = false;
            if (npcConfig.extraSelectionIdArray.length > 0) {
                showFlag = true;
            }
            let npcInstance = cc.instantiate(this.npcPrefab);
            let npc = npcInstance.getComponent(NpcPrefab);
            npc.init(npcConfig);
            npc.flagSprite.node.active = showFlag;
            npc.node.x = npcConfig.location.x - this.mapSize.x / 2;
            npc.node.y = this.mapSize.y / 2 - npcConfig.location.y;
            npc.node.parent = this.spriteGroup.node;
            return npc.node;
        }
    }

    initNpc(mapId: number) {
        this.spriteGroup.node.removeAllChildren();
        this.player.node.parent = this.spriteGroup.node;
        this.refreshTeamPartner();

        let npcs = NpcConfig.getInstance().getNpcsByMapId(mapId);
        for (let npcId of npcs['normal']) {
            this.initNpcUI(npcId);
        }

        for (let npcId of npcs['quest']) {
            this.questNpcNodes.push(this.initNpcUI(npcId));
        }
    }

    addVec2(point1: cc.Vec2 | cc.Vec3, point2: cc.Vec2 | cc.Vec3) {
        return new cc.Vec2(point1.x + point2.x, point1.y + point2.y);
    }

    negativeY(point: cc.Vec2) {
        return new cc.Vec2(point.x, -point.y);
    }

    negativeX(point: cc.Vec2) {
        return new cc.Vec2(-point.x, point.y);
    }

    scaleVec2(scale: number, point: cc.Vec2) {
        return new cc.Vec2(point.x * scale, point.y * scale);
    }

    localToGlobal(scenePoint: cc.Vec2, point: cc.Vec2) {
        return this.addVec2(this.addVec2(this.scaleVec2(0.5, this.mapSize), this.negativeY(scenePoint)), this.negativeY(point));
    }

    toPicth(x) {
        let pitchSize = 50;
        return Math.floor(x / pitchSize);
    }

    autoFindPath(endPoint: cc.Vec2, func = () => { return false; }) {
        // clear openPanel
        QuestManager.openPanel = false;
        this.player.autoFindPath.node.active = false;
        let playerPoint = this.getPlayerPoint();
        let start = this.localToGlobal(playerPoint, this.addVec2(this.player.node.position, this.scaleVec2(-1, playerPoint)));
        let end = this.localToGlobal(playerPoint, endPoint);

        this.path = MapConfig.getInstance().autoFindPath(MapManager.getInstance().currentMapId, start, end, PlayerData.getInstance().getSpeed());
        if (this.path.length > 0) {
            this.schedule(this.move, 0.025);
        }
    }

    autoFindPathToNpc(npcLocation: cc.Vec2, func = () => { return false; }) {
        let playerPoint = this.getPlayerPoint();
        let start = this.localToGlobal(playerPoint, this.addVec2(this.player.node.position, this.scaleVec2(-1, playerPoint)));
        this.path = MapConfig.getInstance().autoFindPath(MapManager.getInstance().currentMapId, start, npcLocation, PlayerData.getInstance().getSpeed());
        if (this.path.length == 0) {
            this.player.autoFindPath.node.active = false;
            this.autoShowNpcPanel();
        } else {
            this.schedule(this.move, 0.025);
        }
    }

    async autoShowNpcPanel() {
        if (QuestManager.currentFindNpcId >= 725 && QuestManager.currentFindNpcId <= 729) {
            return;
        }
        let prefab = await CommonUtils.getPanelPrefab('npcPanelPrefab') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(NpcPanel);
        panel.node.height = CommonUtils.getViewHeight();
        panel.node.x = 0;
        panel.node.y = 0;
        panel.initWithSelection(QuestManager.currentFindNpcId);
        panel.node.parent = this.panelLayer.node;

        // 自动寻路结束时，使玩家自动面向Npc
        let npc = NpcConfig.getInstance().npcs[QuestManager.currentFindNpcId];
        let direction = npc.direction;
        if (direction.indexOf("r") != -1) {
            direction = direction.replace("r", "l");
        } else {
            direction = direction.replace("l", "r");
        }
        if (direction.indexOf("u") != -1) {
            direction = direction.replace("u", "d");
        } else {
            direction = direction.replace("d", "u");
        }
        this.player.changeMoveStatus('stand_' + direction);
        this.hideMainUI();
    }

    getPlayerPoint() {
        let playerPoint = this.addVec2(this.player.node.position, cc.Vec2.ZERO);
        let maxX = this.mapSize.x / 2 - CommonUtils.getViewWidth() / 2;
        let maxY = this.mapSize.y / 2 - CommonUtils.getViewHeight() / 2;
        if (playerPoint.x < - maxX) {
            playerPoint.x = - maxX;
        } else if (playerPoint.x > maxX) {
            playerPoint.x = maxX;
        }
        if (playerPoint.y < - maxY) {
            playerPoint.y = - maxY;
        } else if (playerPoint.y > maxY) {
            playerPoint.y = maxY;
        }
        return playerPoint;
    }

    move() {
        if (this.path.length == 0) {
            // 自动寻路结束
            this.player.changeToStand();
            TeamManager.getInstance().changeToStand();
            this.unschedule(this.move);
            if (this.player.autoFindPath.node.active) {
                if (!QuestManager.openPanel) {
                    TipsManager.showMessage('已到达目标点');
                }
                this.player.autoFindPath.node.active = false;
            }
            if (QuestManager.openPanel && QuestManager.currentFindNpcId) {
                this.autoShowNpcPanel();
                QuestManager.openPanel = false;
            }
            return;
        }
        let deltaX = this.path[0].stepDeltaX;
        let deltaY = this.path[0].stepDeltaY;
        let direction = this.path[0].stepDirection;
        this.path.shift();
        this.sumStep += Math.abs(deltaX) + Math.abs(deltaY);
        if (this.sumStep >= 150) {
            this.sumStep = 0;
            this.refreshMap();
        }
        this.player.changeMoveStatus('run_' + StepDirectionString[direction]);
        this.player.node.x -= deltaX;
        this.player.node.y += deltaY;
        let isMasked = this.isMasked();
        if (isMasked) {
            this.player.node.opacity = 255 * 0.7;
        } else {
            this.player.node.opacity = 255;
        }

        TeamManager.getInstance().addPathRecord({ deltaX: deltaX, deltaY: deltaY, direction: direction, isMasked: isMasked });
    }

    refreshIndex() {
        let len = this.spriteGroup.node.children.length
        this.quickSortIndex(0, len - 1);
        for (let i = 0; i < len; ++i) {
            this.spriteGroup.node.children[i].zIndex = i
        }
    }

    quickSortIndex(low: number, high: number) {
        if (low >= high) return;
        let children = this.spriteGroup.node.children;
        if (children.length < high + 1) {
            return;
        }
        let lowTemp = low;
        let highTemp = high;
        let povit = children[low].y;
        if (isNaN(povit)) {
            return;
        }

        while (low < high) {
            while (low < high && children[high].y <= povit) --high;
            while (low < high && children[low].y >= povit) ++low;
            this.swapChild(children, low, high);
        }
        this.swapChild(children, lowTemp, low);
        this.quickSortIndex(lowTemp, low - 1);
        this.quickSortIndex(low + 1, highTemp);
    }

    swapChild(children: Array<cc.Node>, index1, index2) {
        let temp = children[index1];
        children[index1] = children[index2];
        children[index2] = temp;
    }

    isValidMoveX(x) {
        return Math.abs(x) <= (this.mapSize.x - CommonUtils.stageWidth) / 2;
    }

    isValidMoveY(y) {
        return Math.abs(y) <= (this.mapSize.y - CommonUtils.stageHeight) / 2;
    }

    getX(col, j) {
        let width = 256;
        return width / 2 + j * width - col * width / 2;
    }

    getY(row, i) {
        let height = 256;
        return height * row / 2 - height / 2 - i * height;
    }

    getI(col, y) {
        let width = 256;
        return Math.round((y + col.width / 2 - width / 2) / width)
    }

    getJ(row, x) {
        let height = 256;
        return Math.round((x + row.height / 2 - height / 2) / height)
    }

    mapBlockVisibleTest(x, y) {
        let playerPoint = this.addVec2(this.player.node.position, cc.Vec2.ZERO);

        let width = CommonUtils.getViewWidth() / 2;
        let height = CommonUtils.getViewHeight() / 2;
        let maxX = this.mapSize.x / 2 - width;
        let maxY = this.mapSize.y / 2 - height;
        if (playerPoint.x < - maxX) {
            playerPoint.x = - maxX;
        } else if (playerPoint.x > maxX) {
            playerPoint.x = maxX;
        }
        if (playerPoint.y < - maxY) {
            playerPoint.y = - maxY;
        } else if (playerPoint.y > maxY) {
            playerPoint.y = maxY;
        }

        let deltaX = Math.abs(x - playerPoint.x);
        let deltaY = Math.abs(y - playerPoint.y);

        if (deltaX > CommonUtils.getViewWidth() / 2 + 256 + 128) {
            return false;
        } else if (deltaY > CommonUtils.getViewHeight() / 2 + 256 + 128) {
            return false;
        }
        return true;
    }

    public visibleTest(i, j): boolean {
        let visibleSize = cc.view.getVisibleSize();
        let playerPoint = this.addVec2(this.player.node.position, cc.Vec2.ZERO);

        let width = CommonUtils.getViewWidth() / 2;
        let height = CommonUtils.getViewHeight() / 2;
        let maxX = this.mapSize.x / 2 - width;
        let maxY = this.mapSize.y / 2 - height;
        if (playerPoint.x < - maxX) {
            playerPoint.x = - maxX;
        } else if (playerPoint.x > maxX) {
            playerPoint.x = maxX;
        }
        if (playerPoint.y < - maxY) {
            playerPoint.y = - maxY;
        } else if (playerPoint.y > maxY) {
            playerPoint.y = maxY;
        }

        let result = CommonUtils.foldl(this.addVec2, new cc.Vec2(0, 0), [
            new cc.Vec2(visibleSize.width / 2, visibleSize.height / 2),
            this.negativeX(playerPoint),
            new cc.Vec2(-this.mapSize.x / 2, -this.mapSize.y / 2),
            new cc.Vec2(256 * j, 256 * i)
        ]);

        let x = result.x;
        let y = result.y;

        let stageHeight = visibleSize.height;
        let stageWidth = visibleSize.width;
        if (x > -256 - 128 && x < stageWidth + 128 &&
            y > -256 - 128 && y < stageHeight + 128) {
            return true;
        } else {
            return false;
        }
    }

    refreshMap() {
        let children = this.mapGroup.node.children;
        let len = children.length;
        for (let i = len - 1; i >= 0; --i) {
            if (!this.mapBlockVisibleTest(children[i].x, children[i].y)) {
                MapBlockManager.getInstance().locationFlags[children[i].x + "_" + children[i].y] = false;
                this.mapGroup.node.removeChild(children[i]);
            }
        }
        this.refershMapBlocks(MapManager.getInstance().currentMapId);
    }

    public isMasked() {
        let x = this.mapSize.x / 2 + (this.player.node.x - 50);
        let y = this.mapSize.y / 2 - (this.player.node.y + 150);
        let w = 100;
        let h = 150;

        let r1 = MapConfig.getInstance().checkMask(x, y);
        let r2 = MapConfig.getInstance().checkMask(x + w, y);
        let r3 = MapConfig.getInstance().checkMask(x, y + h);
        let r4 = MapConfig.getInstance().checkMask(x + w, y + h);

        return r1 || r2 || r3 || r4;
    }

    async musicOnChange() {
        let musicName = ''
        if (GameConfig.isInBattle) { // in battle
            musicName = 'bgm_battle_1';
        } else {
            let mapInfo = MapConfig.getInstance().mapInfo[MapManager.getInstance().currentMapId];
            musicName = R.prop('bgm')(mapInfo);
        }
        //
        if (GameConfig.playMusic) {
            let clip = await ResUtils.loadMusic(musicName);
            this.audioEngine.play(clip);
        } else {
            this.audioEngine.stop();
        }
    }

    // 发送心跳
    async refreshOnlineStatus() {
        let mapId = MapManager.getInstance().currentMapId;
        let mapConfig = MapConfig.getInstance().mapInfo[mapId];
        if (mapConfig.saveMassage == 0) {
            return;
        }
        const WIDTH = mapConfig.width;
        const HEIGHT = mapConfig.height;
        let xpos = Math.floor(this.player.node.x + WIDTH / 2);
        let ypos = Math.floor(HEIGHT / 2 - this.player.node.y);
        let direction = this.player.getMoveStatus();
        let inBattle = GameConfig.isInBattle;
        let status = 1;
        if (inBattle) {
            status = 2;
        } else if (GameConfig.isInGambling) {
            status = 3;
        }
        await NetUtils.post('/player/refreshOnlineStatus', [
            MapManager.getInstance().currentMapId
            , xpos              // xpos
            , ypos              // ypos
            , direction         // direction
            , status
        ])
		//
		MapManager.getInstance().currentXPos = xpos;
		MapManager.getInstance().currentYPos = ypos;
    }

    async loopRefresh() {
        // if (!GameConfig.isInBattle) {
        await this.refreshOnlineStatus();
        // }
        await CommonUtils.wait(3);
        this.loopRefresh();
    }

    fadeIn() {
        this.root.node.opacity = 0;
        let action = cc.fadeTo(0.5, 255);
        this.root.node.runAction(action.clone());
    }

    fadeOut() {
        let action = cc.fadeTo(0.5, 1);
        if (this.root.node) {
            this.root.node.runAction(action.clone());
        }
    }

    afterBattleFadeIn() {
        this.mainUI.node.opacity = 1;
        this.spriteGroup.node.opacity = 1;
        this.panelLayer.node.opacity = 1;
        let action = cc.fadeTo(0.2, 255);
        this.mainUI.node.runAction(action.clone());
        this.spriteGroup.node.runAction(action.clone());
        this.panelLayer.node.runAction(action.clone());
    }

    beforeBattleFadeOut() {
        let action = cc.fadeTo(0.5, 1);
        this.mainUI.node.runAction(action.clone());
        this.spriteGroup.node.runAction(action.clone());
        this.panelLayer.node.runAction(action.clone());
    }

    async mapFadeIn() {
        this.mapGroup.node.opacity = 1;
        this.spriteGroup.node.opacity = 1;
        this.mapGroup.node.active = true;
        this.spriteGroup.node.active = true;
        let action = cc.fadeTo(0.5, 255);
        this.mapGroup.node.runAction(action.clone());
        this.spriteGroup.node.runAction(action.clone());
        // const resId = MapConfig.getInstance().mapInfo[MapManager.getInstance().currentMapId].resId;
        // this.miniMap.node.active = resId != 102;
    }

    mapFadeOut() {
        let action = cc.fadeTo(0.5, 1);
        this.mapGroup.node.runAction(action.clone());
        this.spriteGroup.node.runAction(action.clone());
    }

    nextTick = false
    lateUpdate() {
        if (this.showFadeIn) {
            this.showFadeIn = false
            this.nextTick = true
        }
        if (this.nextTick) {
            this.nextTick = false;
            this.mapFadeIn()
        }
    }

}
