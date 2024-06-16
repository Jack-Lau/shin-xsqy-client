import { MovieclipUtils } from "../../utils/MovieclipUtils";
import { ArrayUtils } from "../../cocosExtend/ArrayUtils";
import { CommonUtils } from "../../utils/CommonUtils";
import ColorTranslate from "../../cocosExtend/shader/ColorTranslate";
import PlayerData from "../../data/PlayerData";
import ItemConfig, { ItemQuality } from "../../bag/ItemConfig";
import { TimerUtils } from "../../utils/TimerUtils";
import { FashionDye, Fashion } from "../../net/Protocol";
import { FashionConfig } from "./FashionConfig";
import Optional from "../../cocosExtend/Optional";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;
enum ModelState { Normal = 0, Battle = 1 }
@ccclass
export default class FashionModel extends cc.Component {
    @property(cc.Sprite)
    base: cc.Sprite = null;
    @property(cc.Sprite)
    part1: cc.Sprite = null;
    @property(cc.Sprite)
    part2: cc.Sprite = null;
    @property(cc.Sprite)
    part3: cc.Sprite = null;

    // maybe more here ...

    @property(cc.Sprite)
    weapon: cc.Sprite = null;

    prefabId = 4000005;
    currentStatus = "";

    cityResComplete = false;
    battleResComplete = false;

    // clockwise
    readonly normalDirections = ['d', 'ld', 'l', 'lu', 'u', 'ru', 'r', 'rd'];
    readonly battleDirections = ['ld', 'ru'];

    resStatus = {
        0: { // Normal
        },
        1: { // battle
        }
    }
    loading: boolean = false;

    currentState: ModelState = ModelState.Normal;

    start() {
        
    }

    // 带有旋转的初始化
    init(prefabId: number) {
        this.prefabId = prefabId;
        this.currentState = ModelState.Normal;
        this.schedule(this.tryChange, 4);
    }

    // 主城显示初始化
    async initAsNormal(prefabId: number, weaponId: Optional<number>, definitionId: number, dye: Optional<FashionDye>) {
        this.prefabId = FashionConfig.getPrefabId(definitionId, prefabId);
        this.currentState = ModelState.Normal;
        await this.loadNormalRes(prefabId, weaponId.getOrElse(10002));
        this.setDye(dye, definitionId, true);
    }

    // 站立单面向初始化
    initByDirection(prefabId: number, weaponId: Optional<number>, definitionId: number, direction: string, dye: Optional<FashionDye>) {
        this.prefabId = FashionConfig.getPrefabId(definitionId, prefabId);
        this.currentState = ModelState.Normal;
        this.loadRes2(direction, true, prefabId, weaponId.getOrElse(10002));
        this.setDye(dye, definitionId, true);
    }

    // 战斗中初始化
    async initInBattle(prefabId: number, weaponId: number, definitionId: number, dye: Optional<FashionDye>, direction: string) {
        this.prefabId = FashionConfig.getPrefabId(definitionId, prefabId);
        this.currentState = ModelState.Battle;
        await this.loadBattleRes(direction, prefabId, weaponId);
        this.setDye(dye, definitionId, true);
    }

    isChanging: boolean = false;
    async tryChange() {
        if (this.isChanging) {
            return;
        }
        let arr = this.currentStatus.split('_');
        if (arr.length != 2) {
            return;
        }
        let direction = arr[1];
        this.isChanging = true;
        if (this.checkRes(direction)) {
            if (this.currentState == ModelState.Normal) {
                let state = this.base.getComponent(cc.Animation).getAnimationState("run_" + direction.replace('l', 'r'));
                if (state) {
                    this.playAnimation("run_" + direction);
                    await CommonUtils.wait(state.duration);
                    this.playAnimation("stand_" + direction);
                }
            } else {
                let action = CommonUtils.randomOne(["magic", "attack"])
                let state = this.base.getComponent(cc.Animation).getAnimationState(action + "_" + direction);
                if (state) {
                    this.playAnimation(action + "_" + direction);
                    await CommonUtils.wait(state.duration);
                    this.playAnimation("idle_" + direction);
                }
            }
        }
        this.isChanging = false;
    }

    async loadRes(direction: string, standOnly: boolean = false) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        let actions = standOnly ? ['stand'] : ['stand', "run"];
        if (this.currentState == ModelState.Battle) {
            actions = ['idle', 'attack', 'magic'];
        }
        let realDirection = this.currentState == ModelState.Normal ? direction.replace('l', 'r') : direction
        const directions = ['_' + realDirection];
        let parts = ['', '_part1', '_part2', '_part3'];
        let wdId = PlayerData.getInstance().equipments['weapon'].fmap(CommonUtils.getEPId).getOrElse(10002);
        let display = ItemConfig.getInstance().getItemDisplayById(wdId, PlayerData.getInstance().prefabId);
        let showEffect = display.fmap(x => x.quality == ItemQuality.Orange || x.quality == ItemQuality.Gold).getOrElse(false);
        parts.push(showEffect ? "_weapon2" : "_weapon1");

        const func = (y: Array<string>) => (x: string) => y.map(z => x + z);
        const allStatus = ArrayUtils.flatMap(func(parts))(ArrayUtils.flatMap(func(directions))(actions));
        const allUrls = allStatus.map(x => `movieclip/${this.prefabId}/${this.prefabId}_${x}`);
        await this._doLoadRes(allUrls, allStatus);
        this.resStatus[this.currentState][realDirection] = true;
        this.playAnimation(actions[0] + '_' + direction);
        this.loading = false;
    }

    async loadRes2(direction: string, standOnly: boolean, prefabId, weaponId) {
        if (this.loading) {
            return;
        }
        this.loading = true;
        let actions = standOnly ? ['stand'] : ['stand', "run"];
        if (this.currentState == ModelState.Battle) {
            actions = ['idle', 'attack', 'magic'];
        }
        let realDirection = this.currentState == ModelState.Normal ? direction.replace('l', 'r') : direction
        const directions = ['_' + realDirection];
        let parts = ['', '_part1', '_part2', '_part3'];
        let display = ItemConfig.getInstance().getItemDisplayById(weaponId, prefabId);
        let showEffect = display.fmap(x => x.quality == ItemQuality.Orange || x.quality == ItemQuality.Gold).getOrElse(false);
        parts.push(showEffect ? "_weapon2" : "_weapon1");

        const func = (y: Array<string>) => (x: string) => y.map(z => x + z);
        const allStatus = ArrayUtils.flatMap(func(parts))(ArrayUtils.flatMap(func(directions))(actions));
        const allUrls = allStatus.map(x => `movieclip/${this.prefabId}/${this.prefabId}_${x}`);
        await this._doLoadRes(allUrls, allStatus);
        this.resStatus[this.currentState][realDirection] = true;
        this.playAnimation(actions[0] + '_' + direction);
        this.loading = false;
    }

    private async loadNormalRes(prefabId, weaponId) {
        const direction = ['_d', '_u', '_r', '_rd', '_ru'];
        const actions = ['stand', "run"];
        let parts = ['', '_part1', '_part2', '_part3'];
        let display = ItemConfig.getInstance().getItemDisplayById(weaponId, prefabId);
        let showEffect = display.fmap(x => x.quality == ItemQuality.Orange || x.quality == ItemQuality.Gold).getOrElse(false);
        parts.push(showEffect ? "_weapon2" : "_weapon1");
        const func = (y: Array<string>) => (x: string) => y.map(z => x + z);
        const allStatus = ArrayUtils.flatMap(func(parts))(ArrayUtils.flatMap(func(direction))(actions));
        const allUrls = allStatus.map(x => `movieclip/${this.prefabId}/${this.prefabId}_${x}`);
        await this._doLoadRes(allUrls, allStatus);
        this.playAnimation('stand_d');
    }

    private async loadBattleRes(d: string, prefabId, weaponId) {
        const direction = [d];
        const actions = ['attack', "hit", "magic", "die", "idle"];
        let parts = ['', '_part1', '_part2', '_part3'];
        let display = ItemConfig.getInstance().getItemDisplayById(weaponId, prefabId);
        let showEffect = display.fmap(x => x.quality == ItemQuality.Orange || x.quality == ItemQuality.Gold).getOrElse(false);
        parts.push(showEffect ? "_weapon2" : "_weapon1");
        const func = (y: Array<string>) => (x: string) => y.map(z => x + z);
        const allStatus = ArrayUtils.flatMap(func(parts))(ArrayUtils.flatMap(func(direction))(actions));
        const allUrls = allStatus.map(x => `movieclip/${this.prefabId}/${this.prefabId}_${x}`);
        this.currentState = ModelState.Battle;
        await this._doLoadRes(allUrls, allStatus);
        this.playAnimation('stand_d');
    }

    async _doLoadRes(allUrls: Array<string>, allStatus: Array<string>) {
        let frame = 10;
        if (this.currentState == ModelState.Battle) {
            frame = 40;
        }
        const promise = (url, name) => MovieclipUtils.getMovieclipRaw(url, name, frame);
        const mcArray = await Promise.all(R.zipWith(promise, allUrls, allStatus));
        let baseAni = this.base.getComponent(cc.Animation);
        let part1Ani = this.part1.getComponent(cc.Animation);
        let part2Ani = this.part2.getComponent(cc.Animation);
        let part3Ani = this.part3.getComponent(cc.Animation);
        let weaponAni = this.weapon.getComponent(cc.Animation);

        let loop = (status) => {
            return status.indexOf('attack') == -1
                && status.indexOf('magic') == -1
                && status.indexOf('hit') == -1
                && status.indexOf('die') == -1
        }

        mcArray.forEach((movieclip: cc.AnimationClip) => {
            let name = movieclip.name;
            movieclip.wrapMode = loop(movieclip.name) ? cc.WrapMode.Loop : cc.WrapMode.Normal;
            if (name.indexOf('part1') != -1) {
                part1Ani.addClip(movieclip, name.replace('_part1', ''));
            } else if (name.indexOf('part2') != -1) {
                part2Ani.addClip(movieclip, name.replace('_part2', ''));
            } else if (name.indexOf('part3') != -1) {
                part3Ani.addClip(movieclip, name.replace('_part3', ''));
            } else if (name.indexOf('weapon') != -1) {
                weaponAni.addClip(movieclip, name.replace('_weapon1', '').replace('_weapon2', ''));
            } else {
                baseAni.addClip(movieclip, name);
            }
        });
    }

    checkRes(direction): Boolean {
        if (direction.indexOf('l') != -1 && this.currentState == ModelState.Normal) {
            return this.checkRes(direction.replace('l', 'r'))
        }
        return this.resStatus[this.currentState][direction] == true;
    }

    switchToBattle() {
        this.currentState = ModelState.Battle;
        if (this.checkRes('ld')) {
            this.playAnimation('idle_ld')
        } else {
            this.loadRes('ld');
        }
    }

    switchToNormal() {
        this.currentState = ModelState.Normal;
        if (this.checkRes('d')) {
            this.playAnimation('stand_d')
        } else {
            this.loadRes('d');
        }
    }

    playAnimation(status: string) {
        if (status == this.currentStatus) {
            return;
        }
        this.currentStatus = status;
        let scaleX = 1;
        if (this.currentState == ModelState.Normal && status.indexOf('l') != -1) {
            status = status.replace('l', 'r');
            scaleX = -1;
        }
        let anchor = MovieclipUtils.getOffset(this.prefabId + "_" + status);
        let anis = this.getAnis();
        let nodes = this.getSpNodes();
        anis.forEach(ani => ani.pause());
        let onPlay = function () {
            nodes.forEach(node => {
                node.anchorX = anchor.x;
                node.anchorY = anchor.y;
                node.scaleX = scaleX;
            });
            anis[0].off('play', onPlay);
        }.bind(this);
        anis[0].on('play', onPlay);
        anis.forEach(ani => ani.play(status))
    }

    private getAnis(): Array<cc.Animation> {
        return [
            this.base.getComponent(cc.Animation),
            this.part1.getComponent(cc.Animation),
            this.part2.getComponent(cc.Animation),
            this.part3.getComponent(cc.Animation),
            this.weapon.getComponent(cc.Animation),
        ]
    }

    private getSpNodes(): Array<cc.Node> {
        return [
            this.base.node,
            this.part1.node,
            this.part2.node,
            this.part3.node,
            this.weapon.node,
        ]
    }

    clockwiseRotate() {
        let arr = this.currentStatus.split('_');
        if (arr.length != 2) {
            return;
        }
        let newDirection = ArrayUtils.getNextOne(this.currentState == ModelState.Normal ? this.normalDirections : this.battleDirections, arr[1]);
        if (newDirection.valid) {
            if (this.checkRes(newDirection.val)) {
                this.playAnimation(arr[0] + '_' + newDirection.val);
            } else {
                this.loadRes(newDirection.val);
            }
        }
    }

    counterClockwiseRotate() {
        let arr = this.currentStatus.split('_');
        if (arr.length != 2) {
            return;
        }
        let newDirection = ArrayUtils.getPreviousOne(this.currentState == ModelState.Normal ? this.normalDirections : this.battleDirections, arr[1]);
        if (newDirection.valid) {
            if (this.checkRes(newDirection.val)) {
                this.playAnimation(arr[0] + '_' + newDirection.val);
            } else {
                this.loadRes(newDirection.val);
            }
        }
    }

    async setDye(dye: Optional<FashionDye>, definitionId: number, isNormal: boolean = false) {
        let defaultColor = await FashionConfig.getDefaultColor2(definitionId)
        if (dye.valid) {
            this.part1.node.active = this.part2.node.active = this.part3.node.active = true;
            for (let index = 0; index < 3; index ++) {
                let h = R.prop(`part_${index+1}_color`, dye.val);
                let s = R.prop(`part_${index+1}_saturation`, dye.val);
                let b = R.prop(`part_${index+1}_brightness`, dye.val);
                this.setHue(index, h == -1 ? defaultColor[index].color : h);
                this.setSaturation(index,  (s == -1 ? defaultColor[index].saturation : s) / 100);
                this.setBrightness(index,  FashionConfig.pToB((b == -1 ? defaultColor[index].brightness : b) / 100));
            }
        } else {
            if (isNormal) {
                this.part1.node.active = this.part2.node.active = this.part3.node.active = false;
            } else {
                for (let index = 0; index < 3; index ++) {
                    this.setHue(index, defaultColor[index].color);
                    this.setSaturation(index, defaultColor[index].saturation / 100);
                    this.setBrightness(index, FashionConfig.pToB(defaultColor[index].brightness / 100));
                }
            }
        }
    }


    setHue(part: number, hue: number) {
        let ct = this.getPart(part).getComponent(ColorTranslate);
        ct.setHue(hue);
    }

    setSaturation(part: number, saturation: number) {
        let ct = this.getPart(part).getComponent(ColorTranslate);
        ct.setSaturation(saturation);
    }

    setBrightness(part: number, brightness: number) {
        let ct = this.getPart(part).getComponent(ColorTranslate);
        ct.setBrightness(brightness);
    }

    getPart(part: number): cc.Sprite {
        if (part == 0) {
            return this.part1;
        } else if (part == 1) {
            return this.part2;
        } else {
            return this.part3;
        }
    }

    onDestroy() {
        this.unschedule(this.tryChange);
    }
}