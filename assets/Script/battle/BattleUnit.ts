import { MovieclipUtils } from "../utils/MovieclipUtils";
import { BattleConfig } from "./BattleConfig";
import { CommonUtils } from "../utils/CommonUtils";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import BattleScene, { ActionResultType } from "./BattleScene";
import SkillEffect from "./SkillEffect";
import Optional from "../cocosExtend/Optional";
import { TitleConfig } from "../player/title/TitleConfig";
import { ResUtils } from "../utils/ResUtils";
import FashionModel from "../gameplay/fashion/FashionModel";
import { Fashion, FashionDye, ActionRecord, AffectRecord } from "../net/Protocol";
import { BattleUtils } from "./BattleUitls";
import PlayerData from "../data/PlayerData";

const { ccclass, property } = cc._decorator;

export enum UnitStance { Player = 0, Enemy }

enum UnitMcName {
    IDLE = 'idle',
    MAGIC = 'magic',
    ATTACK = 'attack',
    HIT = 'hit',
    DIE = 'die'
}

@ccclass
export default class BattleUnit extends cc.Component {
    stance: UnitStance = UnitStance.Player;
    orignalPos: cc.Vec2 = cc.Vec2.ZERO;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Sprite)
    mcSprite: cc.Sprite = null;
    @property(cc.Sprite)
    weapon: cc.Sprite = null;
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;

    @property(cc.ProgressBar)
    hpBar: cc.ProgressBar = null;
    hpBarLength: number = 95
    @property(cc.Sprite)
    shadowHpBar: cc.Sprite = null
    @property(cc.Integer)
    shadowHpBarLength: number = 93

    @property(cc.Sprite)
    barSp: cc.Sprite = null;
    @property(cc.SpriteFrame)
    greenSF: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    redSF: cc.SpriteFrame = null;

    @property(cc.Prefab)
    recoverPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    damagePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    mpPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    kiPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    skillNamePrefab: cc.Prefab = null;
    @property(cc.Sprite)
    beAttackedEffect: cc.Sprite = null;

    @property(cc.Sprite)
    selectedImage: cc.Sprite = null;
    @property(cc.Sprite)
    preSelectedImage: cc.Sprite = null;

    @property(cc.Prefab)
    effectPrefab: cc.Prefab = null;
    @property(cc.Node)
    effectUpGroup: cc.Node = null;
    @property(cc.Node)
    effectDownGroup: cc.Node = null;

    @property(FashionModel)
    fashionModel: FashionModel = null;

    isFashion: boolean = false;
    fashion: Optional<Fashion> = Optional.Nothing();

    furyRate = 0;


    /**
     * BattleUnit 自身属性
     */
    hp: number = 0;
    sp: number = 0;
    maxHp: number = 0;
    maxSp: number = 0;
    pos: cc.Vec2 = cc.Vec2.ZERO;

    id: number = -1;
    sourceId: number = -1;
    prefabId: number = 4000001;
    weaponId: number = 0;
    decorationPrefabId: number = 0;
    modelScale = 1;
    name = 'player';
    type = 'type_player';
    position = 1;
    isShowHp = true;
    skillIds = [];
    currentStatus = UnitMcName.IDLE
    titleId = 0;

    buffDict = {};

    public isPlayer: boolean = false;
    public isPet: boolean = false;
    hasPicTitle: boolean = true;

    start() {

    }

    /**
     * 初始化Unit
     */
    public async initUnit(data, isSummon: boolean = false) {
        this.id = data.id;
        this.sourceId = data.sourceId;
        this.prefabId = data.prefabId;
        this.weaponId = data.weaponSerialId;
        this.modelScale = data.modelScale;
        this.mcSprite.node.scaleX = this.mcSprite.node.scaleY = this.modelScale;
        this.name = data.name;
        this.type = data.type;
        this.stance = data.stance == BattleConfig.getInstance().myselfStance ? UnitStance.Player : UnitStance.Enemy;
        this.position = data.position;
        this.maxHp = data.maxHp;
        this.maxSp = data.maxSp;
        this.hp = data.hp;
        this.sp = data.sp;
        //this.isShowHp = BattleConfig.getInstance().isSync() ? this.stance == UnitStance.Player : !(!data.hpVisible && this.stance == UnitStance.Enemy);
		this.isShowHp = data.hpVisible;
        this.hpBar.node.active = this.isShowHp;
        this.isPlayer = data.isPlayer;
        this.isPet = data.isPet;
        this.titleId = data.titleId;
        // this.hasPicTitle = data.titleId != 0;
        this.initTitle(new Optional(data.titleId == 0 ? null : data.titleId));
        this.furyRate = data.furyRate;

        this.nameLabel.string = data.name;

        if (this.stance == UnitStance.Player) {
            this.barSp.spriteFrame = this.greenSF;
        } else {
            this.barSp.spriteFrame = this.redSF;
        }

        let prefabId = this.prefabId;
        this.skillIds = data.skillIds;


        let weaponId = CommonUtils.getWeaponId(prefabId, new Optional<number>(data.weaponPrefabId == 0 ? null : data.weaponPrefabId));
        if (!weaponId) {
            this.weapon.node.active = false;
        }
        this.weaponId = weaponId;
        await this.initAnimation(prefabId, data.weaponPrefabId, new Optional(data.fashionId), new Optional(data.fashionDye));

        // await this.initMcs(prefabId, weaponId);
        this.node.active = true;

        if (isSummon) {
            this.node.x = this.orignalPos.x;
            this.node.y = this.orignalPos.y;
            this.currentStatus = UnitMcName.IDLE
        } else {
            this.orignalPos.x = this.node.x;
            this.orignalPos.y = this.node.y;
        }

        this.hpBar.progress = this.hp / this.maxHp;

        this.beAttackedEffect.getComponent(cc.Animation).on('finished', function () {
            this.beAttackedEffect.node.active = false;
        }.bind(this));

        if (this.hp == 0) {
            this.setMcAction(UnitMcName.DIE);
        }

        // let res: {[key: string]: cc.SpriteAtlas} = {};
        // let status = '4000001_magic_ld';
        // let atlas = res[status];
        // let spriteFrames = atlas.getSpriteFrames();
        // let movieclip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, 25);
        // movieclip.wrapMode = cc.WrapMode.Loop;
        // movieclip.name = status;
    }

    public syncInitUnitForSummon(summoneeInfo) {
        this.id = summoneeInfo.id;
        this.sourceId = summoneeInfo.sourceId;
        this.prefabId = summoneeInfo.prefabId;
        this.weaponId = summoneeInfo.weaponSerialId;
        this.modelScale = summoneeInfo.modelScale;
        this.mcSprite.node.scaleX = this.mcSprite.node.scaleY = this.modelScale;
        this.name = summoneeInfo.name;
        this.type = summoneeInfo.type;
        this.stance = summoneeInfo.stance == BattleConfig.getInstance().myselfStance ? UnitStance.Player : UnitStance.Enemy;
        this.position = summoneeInfo.position;
        this.maxHp = summoneeInfo.maxHp;
        this.maxSp = summoneeInfo.maxSp;
        this.hp = summoneeInfo.hp;
        this.sp = summoneeInfo.sp;
        this.isShowHp = BattleConfig.getInstance().isSync() ? this.stance == UnitStance.Player : !(!summoneeInfo.hpVisible && this.stance == UnitStance.Enemy);;
        this.hpBar.node.active = this.isShowHp;
        this.isPlayer = summoneeInfo.isPlayer;
        this.isPet = summoneeInfo.isPet;
        this.titleId = summoneeInfo.titleId;
        // this.hasPicTitle = data.titleId != 0;
        this.initTitle(new Optional(summoneeInfo.titleId == 0 ? null : summoneeInfo.titleId));
        this.furyRate = summoneeInfo.furyRate;

        this.nameLabel.string = summoneeInfo.name;

        if (this.stance == UnitStance.Player) {
            this.barSp.spriteFrame = this.greenSF;
        } else {
            this.barSp.spriteFrame = this.redSF;
        }

        let prefabId = this.prefabId;
        this.skillIds = summoneeInfo.skillIds;


        let weaponId = CommonUtils.getWeaponId(prefabId, new Optional<number>(summoneeInfo.weaponPrefabId == 0 ? null : summoneeInfo.weaponPrefabId));
        if (!weaponId) {
            this.weapon.node.active = false;
        }
        this.weaponId = weaponId;
        this.node.active = true;
        this.node.x = this.orignalPos.x;
        this.node.y = this.orignalPos.y;
        this.currentStatus = UnitMcName.IDLE

        this.hpBar.progress = this.hp / this.maxHp;

        this.beAttackedEffect.getComponent(cc.Animation).on('finished', function () {
            this.beAttackedEffect.node.active = false;
        }.bind(this));
        this.mcSprite.node.active = false;
    }

    async initTitle(definitionId: Optional<number>) {
        if (!definitionId.valid) {
            this.titleSp.node.active = false;
            this.hasPicTitle = false;
        } else {
            let title = await TitleConfig.getConfigById(definitionId.val);
            let isPic = title.type == 1;
            this.titleSp.node.active = isPic;
            if (isPic) {
                this.titleSp.spriteFrame = await ResUtils.getTitleIconById(title.picId);
            }
            this.hasPicTitle = isPic;
        }
    }

    async initAnimation(prefabId: number, weaponId: number, definitionId: Optional<number>, dye: Optional<FashionDye>) {
        if (definitionId.valid) {
            this.isFashion = true;
            this.fashionModel.node.active = true;
            this.mcSprite.node.active = false;
            this.weapon.node.active = false;
            await this.fashionModel.initInBattle(prefabId, weaponId, definitionId.val, dye, this.stance == UnitStance.Player ? "_ru" : "_ld");
            this.currentStatus = null;
            this.setMcAction(UnitMcName.IDLE);
        } else {
            this.isFashion = false;
            this.mcSprite.node.active = true;
            this.weapon.node.active = true;
            this.fashionModel.node.active = false;
            let readlWeaponId = CommonUtils.getWeaponId(prefabId, new Optional<number>(weaponId == 0 ? null : weaponId));
            this.initMcs(prefabId, readlWeaponId);
        }
    }

    async initMcs(prefabId: number, weaponId: number) {
        let statusArray = [
            UnitMcName.IDLE,
            UnitMcName.ATTACK,
            UnitMcName.MAGIC,
            UnitMcName.HIT,
            UnitMcName.DIE
        ];

        let face = "_ld";
        if (this.stance == UnitStance.Player) {
            face = "_ru";
        }

        statusArray.map(ele => { return ele + face; }).forEach(ele => {
            let playerMC = BattleConfig.getInstance().getMC(prefabId + '_' + ele, prefabId);
            let animation1 = this.mcSprite.getComponent(cc.Animation);
            animation1.addClip(playerMC, playerMC.name);

            if (prefabId >= 4000001 && prefabId <= 4000004) {
                let weaponMC = BattleConfig.getInstance().getMC(weaponId + '_' + ele);
                let animation2 = this.weapon.getComponent(cc.Animation);
                animation2.addClip(weaponMC, weaponMC.name);
            }
        });

        let baseStatus = prefabId + '_' + UnitMcName.IDLE;
        let status = baseStatus + '_ld';
        if (this.stance == UnitStance.Player) {
            status = baseStatus + '_ru';
        }

        let animation = this.mcSprite.getComponent(cc.Animation);
        animation.stop();
        animation.play(status);

        if (weaponId) {
            let animation2 = this.weapon.getComponent(cc.Animation);
            animation2.stop();
            animation2.play(status.replace(prefabId.toString(), weaponId.toString()));
        }
        let anchor = MovieclipUtils.getOffset(status);
        this.mcSprite.node.anchorX = anchor.x;
        this.mcSprite.node.anchorY = anchor.y;
        this.weapon.node.anchorX = anchor.x;
        this.weapon.node.anchorY = anchor.y;
    }

    async setMcAction(status) {
        if (this.currentStatus === UnitMcName.DIE || (this.currentStatus == UnitMcName.IDLE && this.currentStatus === status)) return;
        this.currentStatus = status;
        let face = '_ld';
        if (this.stance === UnitStance.Player) {
            face = '_ru'
        }
        if (this.isFashion) {
            this.fashionModel.playAnimation(status + face);
            if (status !== UnitMcName.IDLE && status !== UnitMcName.DIE) {
                let ani = this.fashionModel.base.getComponent(cc.Animation);
                await this.onStop(ani);
                this.setMcAction('idle');
            }
            return;
        }

        let prefabId = this.prefabId;
        let weaponId = this.weaponId;

        let ani = this.mcSprite.getComponent(cc.Animation) as cc.Animation;
        let ani2 = this.weapon.getComponent(cc.Animation) as cc.Animation;
        ani.pause();
        ani2.pause();
        let onPlay = function () {
            let anchor = MovieclipUtils.getOffset(prefabId + "_" + status + face);
            this.mcSprite.node.anchorX = anchor.x;
            this.mcSprite.node.anchorY = anchor.y;
            this.weapon.node.anchorX = anchor.x;
            this.weapon.node.anchorY = anchor.y;
        }.bind(this);
        ani.on('play', onPlay, this);


        ani.play(prefabId + '_' + status + face);
        if (this.prefabId > 4000000 && this.prefabId < 4000005) {
            ani2.play(weaponId + '_' + status + face);
        }
        if (status !== UnitMcName.IDLE && status !== UnitMcName.DIE) {
            await this.onStop(ani);
            this.setMcAction('idle');
        }
    }

    onStop(ani: cc.Animation) {
        return new Promise(function (resolve) {
            ani.on('finished', () => {
                resolve(null);
            });
        });
    }

    /**
     * Battle Unit 在战斗中的行为
     */
    public playMove(target: BattleUnit) {
        if (target.orignalPos.x == 0 && target.orignalPos.y == 0) {
            console.error(target);
        }
        let time = 0.2;
        if (this.stance == UnitStance.Player) {
            let action = cc.moveTo(time, target.orignalPos.x - 90, target.orignalPos.y - 70);
            this.node.runAction(action);
        } else {
            let action = cc.moveTo(time, target.orignalPos.x + 90, target.orignalPos.y + 70);
            this.node.runAction(action);
        }
    }

    public playQuickMove(target: BattleUnit) {
        let time = 0.05;
        if (this.stance == UnitStance.Player) {
            let action = cc.moveTo(time, target.orignalPos.x - 90, target.orignalPos.y - 70);
            this.node.runAction(action);
        } else {
            let action = cc.moveTo(time, target.orignalPos.x + 90, target.orignalPos.y + 70);
            this.node.runAction(action);
        }
    }

    public playMoveBack() {
        let time = 0.2;
        let action = cc.moveTo(time, this.orignalPos);
        this.node.runAction(action);
    }

    public playUseSkill(actionId: number) {
        let skillAnimation = BattleConfig.getInstance().skillDisplay[actionId];
        if (skillAnimation == undefined) {
            return;
        }
        if (skillAnimation.isMove == 1) {
            this.setMcAction(UnitMcName.ATTACK);
        } else {
            this.setMcAction(UnitMcName.MAGIC);
        }
    }

    public async playSkillName(actionId: number) {
        let skillExhibit = BattleConfig.getInstance().skillDisplay[actionId];
        if (!skillExhibit) {
            return;
        }
        await this.playTweenName(skillExhibit.name);
    }

    async playTweenName(name: string) {
        let skillName = cc.instantiate(this.skillNamePrefab);
        skillName.parent = this.node;
        skillName.getComponent(cc.Label).string = `[${name}]`;

        let y = this.hasPicTitle ? 50 : 0;
        skillName.y = y + 120;
        skillName.x = 0;
        skillName.scaleX = 0.5;
        skillName.scaleY = 0.5;

        skillName.active = true;
        let action1 = cc.scaleTo(0.5, 1, 1).easing(cc.easeBackOut())
        let action2 = cc.delayTime(0.1);
        let action3 = cc.fadeTo(0.6, 0);
        skillName.runAction(cc.sequence(action1, action2, action3));
        await CommonUtils.wait(1.3);
        CommonUtils.safeRemove(skillName);
    }

    public playHit(action: any) {
        if (action && action.isHit) {
            this.setMcAction(UnitMcName.HIT);
        }
    }

    public playCost(action: any) {
        let actionCost = action.cost;
        // let hp = parseInt(actionCost.hp);
        let sp = parseInt(actionCost.sp);
        // this.hp = (this.hp - hp > 0) ? (this.hp - hp) : 0;
        this.sp = Math.max(0, this.sp - sp);
        EventDispatcher.dispatch('update_battle_unit_status', {
            sp: sp
        });
    }

    public playDamage(actionResult: any) {
        let hp = parseInt(actionResult.value.hp);
        let sp = parseInt(actionResult.value.sp);
        if (hp == 0 && sp == 0) {
            return;
        }
        this.hp = (this.hp - hp > 0) ? (this.hp - hp) : 0;
        this.sp = (this.sp - sp > 0) ? (this.sp - sp) : 0;

        // 更新BattleUnit信息，并显示伤害信息
        this.setHp(this.hp);

        let effectName = 'battle_feibaoji';
        let prev = '';
        if (actionResult.isCritical) {
            effectName = 'battle_baoji'
            prev = '暴 ';

        } else if (actionResult.isBlock) {
            effectName = 'battle_gedang';
            prev = '格 ';
        }
        this.beAttackedEffect.node.active = true;
        this.beAttackedEffect.getComponent(cc.Animation).play(effectName);
        if (hp != 0) {
            if (actionResult.isCritical) {
                this.会心一击动画(prev + hp);
            } else {
                this.playStatus('damage', prev + hp);
            }
        }
        if (sp != 0) {
            this.playStatus('ki', prev + sp);
        }
    }

    public playDodge() {
        let deltaX = 50;
        let deltaY = 35;
        let time = 0.2;
        if (this.stance == UnitStance.Player) {
            let action = cc.sequence([
                cc.moveTo(time, this.node.x - deltaX, this.node.y - deltaY),
                cc.moveTo(time, this.orignalPos)
            ]);
            this.node.runAction(action);
        } else {
            let action = cc.sequence([
                cc.moveTo(time, this.node.x + deltaX, this.node.y + deltaY),
                cc.moveTo(time, this.orignalPos)
            ]);
            this.node.runAction(action);
        }
        this.playStatus('damage', '闪');
    }

    public playRecover(actionResult: any) {
        let hp = parseInt(actionResult.value.hp);
        let sp = parseInt(actionResult.value.sp);
        let prev = '';
        if (actionResult.isCritical) {
            prev = '暴 ';
        } else if (actionResult.isBlock) {
            prev = '格 ';
        } else if (actionResult.isBless) {
            prev = '神 ';
            this.beAttackedEffect.getComponent(cc.Animation).play('battle_shenyou');
        }
        if (hp != 0) {
            if (actionResult.isCritical) {
                this.会心一击动画(prev + hp, false);
            } else {
                this.playStatus('recover', prev + hp);
            }
        }

        this.hp = R.min(this.maxHp, this.hp + hp);
        this.setHp(this.hp);

        this.sp += sp;
        if (this.sp > 100) this.sp = 100;
        // if (sp != 0) {
        //     this.playStatus('ki', prev + sp);
        // }
    }


    public play反震() {
        this.beAttackedEffect.node.active = true;
        this.beAttackedEffect.getComponent(cc.Animation).play('battle_fanzhen');
    }

    public playBuffAttach(action: any) {
        if (!action.isHit) {
            this.playDodge();
            return;
        }
        let buffIds = action.buffs;
        R.forEach(this.attachBuff.bind(this), buffIds);
    }

    attachBuff(obj) {
        let buffId = obj.id;
        let countDown = obj.countDown ? obj.countDown : 1;
        if (this.buffDict[buffId]) {
            return;
        }

        let buff = BattleConfig.getInstance().skillDisplay[buffId];
        let offset = BattleConfig.getInstance().skillEffectOffset[buff.effectId];
        if (!offset) {
            return;
        }

        // if (buffId == 3102005) { // 七煞诀强化
        //     if (this.buffDict[3102003]) { // 七煞诀
        //         this.removeBuffById(3102003);
        //     }
        // } else if (buffId == 3102003 && this.buffDict[3102005]) {
        //     return;
        // }
        let sp = cc.instantiate(this.effectPrefab);
        let effect = sp.getComponent(SkillEffect) as SkillEffect;

        sp.anchorX = offset.x;
        sp.anchorY = offset.y;
        sp.x = 0;
        sp.y = 0;

        let ac = BattleConfig.getInstance().getEffectAC(buff.effectId);
        effect.play(ac);

        if (R.prop('effectLocation', buff) == 1) {
            sp.parent = this.effectDownGroup;
        } else {
            sp.parent = this.effectUpGroup;
        }

        this.buffDict[buffId] = { mc: sp, countDown: countDown + 1 };
    }

    public playBuffDecay(buffId: number, countDown: number) {
        if (!this.buffDict[buffId]) {
            return;
        }
        let buff = BattleConfig.getInstance().skillDisplay[buffId];
        this.buffDict[buffId].countDown = countDown;
    }

    public playBuffDetach(action: any, obj: any) {
        let buffs = action.buffs;
        buffs.forEach(ele => {
            let buffId = ele.id;
            if (buffId in this.buffDict) {
                this.removeBuffById(buffId);
            }
        })
    }

    removeBuffById(buffId) {
        let mc = this.buffDict[buffId].mc;
        CommonUtils.safeRemove(mc);
        this.buffDict[buffId] = null;
        delete this.buffDict[buffId];
    }

    public clearBuff() {
        for (let buffId in this.buffDict) {
            let mc = this.buffDict[buffId].mc;
            CommonUtils.safeRemove(mc);
            this.buffDict[buffId] = null;
            delete this.buffDict[buffId];
        }
    }

    public playDie(action: AffectRecord) {
        // this.clearBuff();
        this.setMcAction(UnitMcName.DIE);
        let sp = new Optional(action).fmap(x => x.value).fmap(x => x.sp).getOrElse(0);
        this.sp = Math.max(0, this.sp + sp);
    }

    public playFlyOut(action: any) {
        this.clearBuff();
        // this.setMcAction(UnitMcName.DIE);
        this.currentStatus = UnitMcName.DIE;
        let w = CommonUtils.getViewWidth();
        let h = CommonUtils.getViewHeight();
        let k = 1.153;
        let p1 = new cc.Vec2(this.node.x, this.node.y);
        let p2 = new cc.Vec2(0, 0)
        let p3 = new cc.Vec2(0, 0);
        let p4 = new cc.Vec2(0, 0);
        if (this.stance === UnitStance.Player) {
            p2.x = -384;
            p2.y = this.calculateY(k, p1, -384);
            if (p2.y < -h / 2) { // 先碰到-h/2
                p2.y = -h / 2;
                p2.x = this.calculateX(k, p1, -h / 2);

                p3.x = -384;
                p3.y = this.calculateY(-k, p2, p3.x);
            } else {
                p3.y = -h / 2;
                p3.x = this.calculateX(-k, p2, p3.y);
            }
            p4.x = R.max(384, this.calculateX(k, p3, h / 2));
            p4.y = R.max(h / 2, this.calculateY(k, p3, 384));
        } else {
            p2.x = 384;
            p2.y = this.calculateY(k, p1, 384);
            if (p2.y > h / 2) { // 先碰到-h/2
                p2.y = h / 2;
                p2.x = this.calculateX(k, p1, h / 2);

                p3.x = 384;
                p3.y = this.calculateY(-k, p2, p3.x);
            } else {
                p3.y = h / 2;
                p3.x = this.calculateX(-k, p2, p3.y);
            }
            p4.x = R.min(-384, this.calculateX(k, p3, -h / 2));
            p4.y = R.min(-h / 2, this.calculateY(k, p3, -384));
        }

        let l1 = this.getDistance(p1, p2);
        let l2 = this.getDistance(p2, p3);
        let l3 = this.getDistance(p3, p4);
        let ccAction = cc.sequence([
            cc.moveTo(0.6 * l1 / l3, p2),
            cc.moveTo(0.6 * l2 / l3, p3),
            cc.moveTo(0.6, p4)
        ]);
        this.node.runAction(ccAction);
    }

    getDistance(p1: cc.Vec2, p2: cc.Vec2) {
        return Math.floor(Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)));
    }

    calculateY(k, p, x) {
        return k * (x - p.x) + p.y;
    }

    calculateX(k, p, y) {
        return (y - p.y) / k + p.x;
    }

    public playRevive(action: any) {
        // this.beAttackedEffect.getComponent(cc.Animation).play('battle_shenyou');
        this.playRecover(action);
        this.currentStatus = UnitMcName.HIT;
        this.setMcAction(UnitMcName.IDLE);
    }

    actionNum: number = 0;
    async playStatus(type: string, content: string) {
        let label = null;
        if ('ki' === type) {
            label = cc.instantiate(this.kiPrefab).getComponent(cc.Label) as cc.Label;
        } else if ('damage' === type) {
            label = cc.instantiate(this.damagePrefab).getComponent(cc.Label) as cc.Label;
        } else if ('recover' === type) {
            label = cc.instantiate(this.recoverPrefab).getComponent(cc.Label) as cc.Label;
        } else if ('skillName' === type) {
            label = cc.instantiate(this.skillNamePrefab).getComponent(cc.Label) as cc.Label;
        }

        if (!label) return;
        let startY = (this.hasPicTitle ? 145 : 95) + this.node.y;
        let _this = this;
        let action = cc.sequence([cc.moveTo(0.3, this.node.x, startY + 30), cc.delayTime(0.3), cc.fadeTo(0.2, 0), cc.callFunc(() => {
            CommonUtils.safeRemove(label.node);
            if (_this.actionNum > 0) {
                _this.actionNum -= 1;
            }
        })]);
        //
        if (type == 'damage' || type == 'recover') {
            action = cc.sequence([
                cc.moveTo(0.3, this.node.x, startY + 30).easing(cc.easeExponentialOut()),
                cc.delayTime(0.3),
                cc.fadeTo(0.2, 0),
                cc.callFunc(() => {
                    CommonUtils.safeRemove(label.node);
                    if (_this.actionNum > 0) {
                        _this.actionNum -= 1;
                    }
                }
                )
            ]);
        }
        //
        [label.string, label.node.x, label.node.y] = [content, this.node.x, startY];

        _this.actionNum += 1;
        await CommonUtils.wait(0.2 * (_this.actionNum - 1));
        if (this.node.parent && this.node.parent.parent && this.node.parent.parent.parent) {
            let battleScene = this.node.parent.parent.parent.getComponent(BattleScene);
            if (battleScene) {
                label.node.parent = battleScene.labelGroup;
                label.node.runAction(action);
            }
        }
        await CommonUtils.wait(0.3);
    }

    async 会心一击动画(content: string, isDamage: boolean = true) {
        let label = null;
        if (isDamage) {
            label = cc.instantiate(this.damagePrefab).getComponent(cc.Label) as cc.Label;
        } else {
            label = cc.instantiate(this.recoverPrefab).getComponent(cc.Label) as cc.Label;
        }
        let startY = (this.hasPicTitle ? 175 : 125) + this.node.y;
        let _this = this;
        let action = cc.sequence(
            [
                cc.scaleTo(0.3, 2, 2).easing(cc.easeBackInOut()),
                cc.scaleTo(0.3, 1, 1),
                cc.fadeTo(0.3, 0),
                cc.callFunc(() => {
                    CommonUtils.safeRemove(label.node);
                    if (_this.actionNum > 0) {
                        _this.actionNum -= 1;
                    }
                })
            ]
        );
        [label.string, label.node.x, label.node.y] = [content, this.node.x, startY];
        _this.actionNum += 1;
        await CommonUtils.wait(0.2 * (_this.actionNum - 1));
        if (this.node.parent && this.node.parent.parent && this.node.parent.parent.parent) {
            let battleScene = this.node.parent.parent.parent.getComponent(BattleScene);
            if (battleScene) {
                label.node.parent = battleScene.labelGroup;
                label.node.runAction(action);
            }
        }
        await CommonUtils.wait(0.3);
    }

    /**
     * getter setters
     */

    public setHp(hp: number): void {
        const newPercent = hp === 0 ? 0 : Math.max(0.05, hp / this.maxHp);
        if (this.hpBar.progress >= newPercent) {
            this.playDamageTween(newPercent)
        } else {
            this.playHealTween(newPercent)
        }
    }

    private playDamageTween(newPercent: number) {
        this.hpBar.progress = newPercent
        cc.tween(this.shadowHpBar.node).to(1.0, {
            width: this.shadowHpBarLength * newPercent
        }, { easing: cc.easing.smooth })
            .start()
    }

    private playHealTween(newPercent: number) {
        cc.tween(this.shadowHpBar.node).to(0.1, {
            width: this.shadowHpBarLength * newPercent
        }, { easing: cc.easing.smooth })
            .start()
        // this.shadowHpBar.node.width = this.shadowHpBarLength * newPercent
        cc.tween(this.hpBar).to(1.0, {
            progress: newPercent
        }, { easing: cc.easing.smooth })
            .call(() => {
                this.hpBar.progress = newPercent
            })
            .start()
    }

    public setSp(sp: number): void {

    }

    public getPosition(): cc.Vec2 {
        return this.orignalPos;
    }

    hideTitleSp() {
        if (this.isPet) {
            return;
        }
        // this.titleSp.node.active = false;
        let action = cc.fadeTo(0.2, 0);
        this.titleSp.node.runAction(action);
    }

    showTitleSp() {
        if (this.isPet) {
            return;
        }
        // this.titleSp.node.active = true;
        let action = cc.fadeTo(0.2, 255);
        this.titleSp.node.runAction(action);
    }

    isMyself(): Boolean {
        return this.sourceId == PlayerData.getInstance().accountId;
    }
}
