import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { CommonUtils } from "../utils/CommonUtils";
import LoadingPanel from "../loading/LoadingPanel";
import BattleScene from "./BattleScene";
import { ConfigUtils } from "../utils/ConfigUtil";
import { GameConfig } from "../config/GameConfig";
import { TipsManager } from "../base/TipsManager";
import Optional from "../cocosExtend/Optional";
import JjcEnterBattle from "../gameplay/yqs/JjcEnterBattle";
import RivalDate from "../gameplay/rival/RivalDate";
import StartRivalAnimPanel from "../gameplay/rival/StartRivalAnimPanel";
import PlayerData from "../data/PlayerData";
import { BattleResult } from "../net/Protocol";
import { BattleUtils } from "./BattleUitls";
import ItemConfig, { ItemQuality } from "../bag/ItemConfig";
import { FashionConfig } from "../gameplay/fashion/FashionConfig";


// 实时战斗
export enum BattleType { NORMAL, JJC, RIVAL, MUTIL_PLAYER };
export enum UnitStance {
    RED = "STANCE_RED",
    BLUE = "STANCE_BLUE"
}

export class BattleConfig {
    private static _instance: BattleConfig = null;
    public skillDisplay = {};
    public modelShow = {};
    res: { [key: string]: cc.SpriteAtlas } = {};
    cache: { [key: string]: cc.AnimationClip } = {};
    resArray = [];
    battleData = null;
    battleSessionId = null;
    battleType: BattleType = BattleType.NORMAL;
    myselfStance: UnitStance = UnitStance.RED;
    loadingPanel: LoadingPanel = null
    battleScene: BattleScene = null

    constructor() {
        EventDispatcher.on(Notify.BATTLE_OPEN, this.openBattle.bind(this));
        EventDispatcher.on(Notify.BATTLE_OPEN_WITH_PROMISE, this.openBattleWithPromise.bind(this))
    }

    async init() {
        this.modelShow = await ConfigUtils.getConfigJson('ModelActions');
        let skillDisplay = await ConfigUtils.getConfigJson('SkillDisplay');
        let buffInfo = await ConfigUtils.getConfigJson('BuffInfo');
        this.skillDisplay = R.merge(skillDisplay, buffInfo);
    }

    public static getInstance() {
        if (this._instance == null) {
            this._instance = new BattleConfig();
        }
        return this._instance;
    }


    isLoading: boolean = false;
    async openBattle(event: EventDispatcher.NotifyEvent) {
        if (GameConfig.isInBattle) {
            TipsManager.showMessage('战斗中，请稍后操作');
            return;
        }
        if (this.isLoading) return;
        this.isLoading = true;
        let data = event.detail.data;
        let cb = event.detail.cb;
        await this.openBattleScene(data, cb);
        // EventDispatcher.dispatch(Notify.HIDE_FOR_BATTLE, {});
        this.isLoading = false;
    }

    /**
     * 关于进入战斗的新实现
     */

    async getLoadingPanel(): Promise<LoadingPanel> {
        if (!this.loadingPanel) {
            let prefab = await CommonUtils.getPanelPrefab('loading/loadingPanel') as cc.Prefab;
            let panel = cc.instantiate(prefab).getComponent(LoadingPanel) as LoadingPanel;
            [panel.node.x, panel.node.y, panel.node.height] = [0, 0, CommonUtils.getViewHeight()];
            this.loadingPanel = panel
        }
        return this.loadingPanel
    }

    async getBattleScene(): Promise<BattleScene> {
        let battleScenePrefab = await CommonUtils.getPanelPrefab('battle/BattleScene') as cc.Prefab;
        let battleScene = cc.instantiate(battleScenePrefab).getComponent(BattleScene) as BattleScene;
        [battleScene.node.x, battleScene.node.y, battleScene.node.height] = [0, 0, CommonUtils.getViewHeight()];
        return battleScene
    }

    async gotoBattleScene(battleScene: BattleScene, callback) {
        battleScene.cb = callback;
        BattleUtils.battleScene = battleScene;
        EventDispatcher.dispatch(Notify.ENTER_BATTLE, { panel: battleScene })
    }

    async loadRes(data: BattleResult, panel: LoadingPanel) {
        this.resArray = this.initResArray(data.unitInitInfo);
        let resArray = await panel.load(this.resArray) as any[];
        panel.fadeOut().then(() => CommonUtils.safeRemove(panel.node))
        resArray.forEach(element => {
            let key = element._name.split('.')[0];
            BattleConfig.getInstance().res[key] = element;
        });
    }

    async openBattleWithPromise(event: EventDispatcher.NotifyEvent) {
        this.doOpenBattleWithPromise(event.detail)
    }

    async doOpenBattleWithPromise(detail: any) {
        if (GameConfig.isInBattle) {
            TipsManager.showMessage('战斗中，请稍后操作');
            return;
        }
        if (this.isLoading) return
        this.isLoading = true
        const { beforeCb, afterCb } = detail
        const promise = detail.data
        const loadingPanel = await this.getLoadingPanel()
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: loadingPanel });
        const data = await (promise as Promise<any>)
        if (!data) {
            TipsManager.showMessage('战斗信息加载错误');
            return
        }
        beforeCb(data)
        const battleScene = await this.getBattleScene()
        await this.loadRes(data, loadingPanel)
        this.battleData = data
        await this.gotoBattleScene(battleScene, afterCb)
        this.isLoading = false;
    }

    async startLoadingWithPromise(data: Promise<BattleResult>, afterCb, beforeCb = () => { }) {
        if (GameConfig.isInBattle) {
            return;
        }
        await this.doOpenBattleWithPromise({
            data,
            beforeCb,
            afterCb
        })
    }

    async startLoading(data: BattleResult, callback) {
        if (GameConfig.isInBattle) {
            return;
        }
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        await this.openBattleScene(data, callback);
        this.isLoading = false;
    }

    async openBattleScene(data: BattleResult, callback) {
        this.battleData = data;
        let battleScenePrefab = await CommonUtils.getPanelPrefab('battle/BattleScene') as cc.Prefab;
        await this.loadResouce(data);
        let battleScene = cc.instantiate(battleScenePrefab).getComponent(BattleScene) as BattleScene;
        [battleScene.node.x, battleScene.node.y, battleScene.node.height] = [0, 0, CommonUtils.getViewHeight()];
        battleScene.cb = callback;
        BattleUtils.battleScene = battleScene;
        EventDispatcher.dispatch(Notify.ENTER_BATTLE, { panel: battleScene })
    }

    async loadResouce(data: BattleResult) {
        let prefab = await CommonUtils.getPanelPrefab('loading/loadingPanel') as cc.Prefab;
        let panel = cc.instantiate(prefab).getComponent(LoadingPanel) as LoadingPanel;
        [panel.node.x, panel.node.y, panel.node.height] = [0, 0, CommonUtils.getViewHeight()];
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.resArray = this.initResArray(data.unitInitInfo);
        let resArray = await panel.load(this.resArray) as any[];
        CommonUtils.safeRemove(panel.node);
        resArray.forEach(element => {
            let key = element._name.split('.')[0];
            BattleConfig.getInstance().res[key] = element;
        });
    }



    initResArray(battleUnitInitInfo: any) {
        let resArray = [];
        let battleStatus = ["attack", "die", "hit", "idle", "magic"];
        let fashionParts = ["", "_part1", "_part2", "_part3"]



        let pushSkillRes = (skillId) => {
            let skillAnimation = BattleConfig.getInstance().skillDisplay[skillId];
            if (skillAnimation == undefined || skillAnimation["effectId"] == 0) {
                return;
            }
            let effectId = skillAnimation["effectId"];
            let resName = '/effect_skill/' + "effect_skill_" + effectId;

            if (resArray.indexOf(resName) == -1) {
                if (effectId === 101101 || effectId === 102201) { // 四边静
                    resArray.push(resName + '-0');
                    resArray.push(resName + '-1');
                } else {
                    resArray.push(resName);
                }
            }
        }

        let selfUnitInfo = this.getSelfUnitInfo(battleUnitInitInfo);
        this.myselfStance = selfUnitInfo.fmap(x => x.stance).getOrElse(UnitStance.RED);

        for (let unitInfo of battleUnitInitInfo) {
            let type = this.myselfStance == unitInfo.stance ? "ru" : "ld";
            let prefabId = unitInfo.prefabId;

            if (unitInfo.fashionId != undefined && unitInfo.fashionId != 0) { // 拥有某种时装
                let weaponPart = "_weapon1"
                if (unitInfo.weaponPrefabId) {
                    let itemDisplay = ItemConfig.getInstance().getItemDisplayById(unitInfo.weaponPrefabId, unitInfo.prefabId);
                    if (itemDisplay.fmap(x => x.quality == ItemQuality.Orange || x.quality == ItemQuality.Gold).getOrElse(false)) {
                        weaponPart = "_weapon2";
                    }
                }
                let fashionPId = FashionConfig.getPrefabId(unitInfo.fashionId);
                battleStatus.forEach(st => {
                    fashionParts.concat([weaponPart]).forEach(part => {
                        let resNamePng = 'movieclip/' + fashionPId + '/' + fashionPId + "_" + st + "_" + type + part;
                        if (resArray.indexOf(resNamePng) == -1) {
                            resArray.push(resNamePng);
                        }
                    })
                })

            } else {
                let pushRes = (id) => {
                    return function (status) {
                        let resNamePng = 'movieclip/' + id + '/' + id + "_" + status + "_" + type;
                        if (resArray.indexOf(resNamePng) == -1) {
                            resArray.push(resNamePng);
                        }
                    }
                }
                R.forEach(pushRes(prefabId), battleStatus);

                let weaponId = CommonUtils.getWeaponId(prefabId, new Optional<number>(unitInfo.weaponPrefabId == 0 ? null : unitInfo.weaponPrefabId));
                if (weaponId) {
                    R.forEach(pushRes(weaponId), battleStatus);
                }
            }

            // load skill effect res
            R.forEach(pushSkillRes, unitInfo.skillIds)
        }

        let buffIds = [
            3102000, 3102001, 3102002, 3102003, 3102004, 3102005,
            3102007, 3102008, 3102009, 3102010, 3102011, 3102012,
            3102013, 3102014, 3102015
        ];
        R.forEach(pushSkillRes, buffIds);

        return resArray;
    }

    getSelfUnitInfo(battleUnitInitInfo): Optional<any> {
        for (let unitInfo of battleUnitInitInfo) {
            if (unitInfo.sourceId == PlayerData.getInstance().accountId) {
                return Optional.Just(unitInfo);
            }
        }
        return Optional.Nothing<any>();
    }

    getMC(status, prefabId?): cc.AnimationClip {
        let atlas = this.res[status];
        let spriteFrames = atlas.getSpriteFrames();

        let frameRate = 40;
        if (prefabId && prefabId > 4000004) {
            frameRate = 24;
        }
        if (prefabId == 4100014 && (status.indexOf('idle') != -1 || status.indexOf('magic') != -1)) {
            frameRate = 12;
        }
        let movieclip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, frameRate);
        if (status.indexOf('idle') === -1) {
            movieclip.wrapMode = cc.WrapMode.Normal;
        } else {
            movieclip.wrapMode = cc.WrapMode.Loop;
        }
        movieclip.name = status;
        return movieclip;
    }

    getEffectAC(effectId: number, sample: number = 24): cc.AnimationClip {
        let key = 'effect_skill_' + effectId;


        if (this.cache[key]) {
            return this.cache[key];
        }
        if (effectId === 101101 || effectId === 102201) {
            let altas1 = this.res[key + '-0'];
            let altas2 = this.res[key + '-1'];
            if (!altas1 || !altas2) {
                return null;
            }
            let sfs = R.concat(altas1.getSpriteFrames(), altas2.getSpriteFrames());
            let sfs2 = R.sortWith([R.ascend(R.prop('_name'))], sfs);

            let ac_101101 = cc.AnimationClip.createWithSpriteFrames(
                sfs2,
                sample
            );
            ac_101101.wrapMode = cc.WrapMode.Normal;
            this.cache[key] = ac_101101;
            return ac_101101;
        }
        let atlas = this.res[key];
        if (!atlas) {
            return null;
        }
        let skillInfo = this.skillDisplay[effectId];
        sample = skillInfo ? skillInfo.effectFrameRate : 24;

        let spriteFrames = atlas.getSpriteFrames();
        let ac = cc.AnimationClip.createWithSpriteFrames(spriteFrames, sample);

        if (effectId.toString().indexOf('3102') !== -1) {
            ac.wrapMode = cc.WrapMode.Loop;
        } else {
            ac.wrapMode = cc.WrapMode.Normal;
        }
        this.cache[key] = ac;
        return ac;
    }

    getDieLastFrame(status): cc.SpriteFrame {
        let atlas = this.res[status];
        let arr = atlas.getSpriteFrames();
        return arr[arr.length - 1];
    }

    clear() {
        this.res = R.empty(this.res);
        this.resArray.forEach(path => {
            cc.resources.release(path)
        })
        this.resArray = R.empty(this.resArray);
    }

    setAsJJCBattle() {
        this.battleType = BattleType.JJC;
    }

    setAsRIVALBattle() {
        this.battleType = BattleType.RIVAL;
    }

    reset() {
        this.battleType = BattleType.NORMAL;
    }

    // 在战斗之前播放特定动画
    async playTweenBeforeBattle() {
        if (this.battleType === BattleType.JJC) {
            let panel = await CommonUtils.getPanel('gameplay/yqs/jjcEnterBattle', JjcEnterBattle) as JjcEnterBattle;
            await panel.init();
            EventDispatcher.dispatch(Notify.SHOW_BATTLE_ENTER_EFFECT, { panel: panel });
            await panel.playTween();
            CommonUtils.safeRemove(panel.node);
        } else if (this.battleType === BattleType.RIVAL) {
            let panel = await CommonUtils.getPanel('gameplay/rival/StartRivalAnimPanel', StartRivalAnimPanel) as StartRivalAnimPanel;
            await panel.init(RivalDate.getInstance().playerTeam, RivalDate.getInstance().enemyTeam);
            EventDispatcher.dispatch(Notify.SHOW_BATTLE_ENTER_EFFECT, { panel: panel });
            await panel.playTween();
            CommonUtils.safeRemove(panel.node);
        }
    }

    isSync() {
        return this.battleType == BattleType.MUTIL_PLAYER;
    }


    skillEffectOffset = {
        // 通用
        '3101210': { x: 0.5, y: 0.286 },

        // 普陀山
        '102201': { x: 0.482, y: 0.302 },
        '102301': { x: 0.473, y: 0.331 },
        '102401': { x: 0.517, y: 0.333 },
        '102601': { x: 0.504, y: 0.547 },
        '102701': { x: 0.515, y: 0.275 },

        // 凌霄殿
        '101101': { x: 0.545, y: 0.459 },
        '101201': { x: 0.506, y: 0.475 },
        '101301': { x: 0.523, y: 0.5 },
        '101401': { x: 0.573, y: 0.65 },
        '101501': { x: 0.508, y: 0.613 },

        // 五庄观
        '104101': { x: 0.527, y: 0.31 },
        '104201': { x: 0.547, y: 0.221 },
        '104501': { x: 0.5, y: 0.355 },
        '104601': { x: 0.64309, y: 0.40307 },
        '104701': { x: 0.605, y: 0.373 },

        // 盘丝洞
        '103101': { x: 0.5, y: 0.464 },
        '103201': { x: 0.5, y: 0.5 },
        '103301': { x: 0.5, y: 0.373 },
        '103501': { x: 0.5, y: 0.428 },
        '103701': { x: 0.591, y: 0.677 },

        // 宠物技能
        '3100161': { x: 0.5, y: 0.5 },
        '3100220': { x: 0.51, y: 0.454 },
        '3100230': { x: 0.505, y: 0.459 },
        '3100240': { x: 0.51, y: 0.407 },
        '3101190': { x: 0.495, y: 0.455 },
        '3101180': { x: 0.47667, y: 0.46498 },
        '3100270': { x: 0.50400, y: 0.49600 },
        '3101200': { x: 0.50487, y: 0.53546 },
        '3101220': { x: 0.55733, y: 0.48533 },
        '3100260': { x: 0.52, y: 0.32 },
        '3100280': { x: 0.5, y: 0.37333 },

        // 神兽技能
        '3101230': { x: 0.55698, y: 0.37195 },
        '3101240': { x: 0.50769, y: 0.36154 },

        // buff
        '3102000': { x: 0.5, y: 0.872 },
        '3102001': { x: 0.508, y: 0.65 },
        '3102002': { x: 0.5, y: 0.594 },
        '3102003': { x: 0.489, y: 0.494 },
        '3102004': { x: 0.48, y: 0.76667 },
        '3102005': { x: 0.51172, y: 0.55 },

        '3102007': { x: 0.48, y: 0.76667 },             // 减速
        '3102008': { x: 0.5, y: 1.06329 },              // 神速
        '3102009': { x: 0.5, y: 0.5 },
        '3102010': { x: 0.5, y: 0.5 },
        '3102011': { x: 0.51172, y: 0.55 },               // 光渡
        '3102012': { x: 0.5, y: 0.5 },                  // 光灭
        '3102013': { x: 0.5, y: 0.5 },
        '3102014': { x: 0.5, y: 0.5 },
        '3102015': { x: 0.5, y: 0.5 },                  // 妙手
    }
}


export const skillFonts = {
    // 无门派
    /*"火刃"*/ 100101: "font_zhandou13",
    //凌霄殿
    /*"凌霄剑"*/ 101301: "font_zhandou9",
    /*"千钧击"*/ 101501: "font_zhandou10",
    /*"凝血刃"*/ 101201: "font_zhandou8",

    // 普陀山
    /*"云海潮生"*/ 102401: "font_zhandou6",
    /*"回风饮露"*/ 102301: "font_zhandou7",
    /*"涤凡仙露"*/ 102601: "font_zhandou5",

    // 盘丝洞
    /*"穿花箭"*/ 103701: "font_zhandou12",
    /*"封魂咒"*/ 103301: "font_zhandou11",
    /*"六脉血逆"*/ 103201: "font_zhandou4",

    // 五庄观
    /*"剑雨藏锋"*/ 104201: "font_zhandou3",
    /*"霜天剑舞"*/ 104501: "font_zhandou1",
    /*"御剑伏魔"*/ 104601: "font_zhandou2",
}

export const normalSkills = [
    100101,
    101301,
    101501,
    101201,
    102401,
    102301,
    102601,
    103701,
    103301,
    103201,
    104201,
    104501,
    104601,
]

