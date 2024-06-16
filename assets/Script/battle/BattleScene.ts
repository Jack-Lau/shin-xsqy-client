import BattleUnit, { UnitStance } from "./BattleUnit";
import { CommonUtils } from "../utils/CommonUtils";
import { BattleConfig, BattleType, normalSkills } from "./BattleConfig";
import { SpecialSkill } from "./SpecialSkill";
import { TipsManager } from "../base/TipsManager";
import { NetUtils } from "../net/NetUtils";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import SkillEffect from "./SkillEffect";
import PlayerData from "../data/PlayerData";
import { GameConfig } from "../config/GameConfig";
import { DamageType, ActionRecord, UnitInitInfo, TurnInfo } from "../net/Protocol";
import Optional from "../cocosExtend/Optional";
import { MovieclipUtils } from "../utils/MovieclipUtils";
import { BattleUtils } from "./BattleUitls";
import SkillItem from "./SkillItem";

const { ccclass, property } = cc._decorator;

enum TurnState {
    COUNTDOWN = 0,
    TURN_START = 1,
    PLAY_MC = 2,
    TURN_END = 3
}

enum ActionType {
    USE_SKILL = 'USE_SKILL',
    BUFF_AFFECT = 'BUFF_AFFECT',
    BUFF_DECAY = 'BUFF_DECAY',
    SUMMON = 'SUMMON',
}

export enum ActionResultType {
    DAMAGE = 'DAMAGE',
    RECOVER = 'RECOVER',
    DIE = 'DIE',
    FLY_OUT = 'FLY_OUT',
    REVIVE = 'REVIVE',
    BUFF_ATTACH = 'BUFF_ATTACH',
    BUFF_DETACH = 'BUFF_DETACH',
    SUMMONEE = 'SUMMONEE'
}

export enum ExecuteResult {
    SUCCESS = 'SUCCESS',
    FAIL_TARGETLOST = 'FAIL_TARGETLOST',
    FAIL_NOTENOUGHCOST = 'FAIL_NOTENOUGHCOST'
}

enum SelectorState {
    AUTO,   // 自动战斗
    MANU,   // 操作中
    MANU2   // 预购下次操作
}

interface Operation {
    battleId: number,
    turnCount: number,
    skillId: number,
    targetId: number
}

const BATTLE_MODE = 'battle_mode'


@ccclass
export default class BattleScene extends cc.Component {
    // All BattleUnits
    @property([BattleUnit])
    players: Array<BattleUnit> = [];
    @property([BattleUnit])
    enemies: Array<BattleUnit> = [];

    @property(cc.Prefab)
    buPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property(cc.Node)
    downGroup: cc.Node = null;

    // top
    @property(cc.Label)
    turnCount: cc.Label = null;
    @property(cc.Label)
    countDown: cc.Label = null;
    @property(cc.ProgressBar)
    playerHp: cc.ProgressBar = null;
    @property(cc.Sprite)
    shadowPlayerHp: cc.Sprite = null
    @property(cc.ProgressBar)
    enemyHp: cc.ProgressBar = null;
    @property(cc.Sprite)
    shadowEnemyHp: cc.Sprite = null
    @property(cc.Integer)
    shadowLength: number = 268
    @property(cc.Button)
    exitBtn: cc.Button = null;
    @property(cc.Button)
    instructionBtn: cc.Button = null;
    @property(cc.Sprite)
    battleStatus: cc.Sprite = null;

    @property(cc.Sprite)
    pleaseWaitFlag: cc.Sprite = null;

    @property(cc.Node)
    effectLayer: cc.Node = null;
    @property(cc.Node)
    unitGroup: cc.Node = null;
    @property(cc.Node)
    labelGroup: cc.Node = null;

    // battle selector
    selectorState: SelectorState = SelectorState.AUTO;
    operation: Operation = null;
    selectedSkillId: number = -1;
    skill1Id: number = 0;
    skill2Id: number = 0;

    @property(cc.Label)
    skillCostLabel1: cc.Label = null;
    @property(cc.Label)
    skillCostLabel2: cc.Label = null;
    @property(cc.Label)
    skillCostRedLabel1: cc.Label = null;
    @property(cc.Label)
    skillCostRedLabel2: cc.Label = null;
    @property(cc.Label)
    skillCostGreenLabel1: cc.Label = null;
    @property(cc.Label)
    skillCostGreenLabel2: cc.Label = null;

    @property(cc.Sprite)
    skillCard1: cc.Sprite = null;
    @property(cc.Sprite)
    skillCard2: cc.Sprite = null;
    @property(cc.Sprite)
    arrow: cc.Sprite = null;
    @property(cc.Sprite)
    maskImage: cc.Sprite = null;
    selectedBattleUnit: BattleUnit = null;
    @property(cc.Sprite)
    jiImage: cc.Sprite = null;
    @property(cc.Sprite)
    jiImage2: cc.Sprite = null;
    @property(cc.Sprite)
    jiEffectImage: cc.Sprite = null;
    @property(cc.Sprite)
    autoBattleFlag: cc.Sprite = null;
    @property(cc.Sprite)
    waitingFlag: cc.Sprite = null;

    @property(cc.Sprite)
    skillCardEffect1: cc.Sprite = null;
    @property(cc.Sprite)
    skillCardEffect2: cc.Sprite = null;
    @property(cc.Sprite)
    spBar: cc.Sprite = null;
    @property(cc.Label)
    spLabel: cc.Label = null;
    @property(cc.Sprite)
    spFullEffect: cc.Sprite = null;
    @property(cc.Node)
    skillDescNode: cc.Node = null;
    @property(cc.Label)
    skillNameLabel: cc.Label = null;
    @property(cc.Label)
    skillDescLabel: cc.Label = null;

    @property(cc.Node)
    instruction: cc.Node = null;
    @property(cc.Button)
    instrCloseBtn: cc.Button = null;
    @property(cc.Button)
    instrConfirmBtn: cc.Button = null;
    @property(cc.RichText)
    content: cc.RichText = null;
    @property(cc.Sprite)
    instrBlockBg: cc.Sprite = null;

    @property(cc.Node)
    battleUI: cc.Node = null;

    @property(cc.SpriteAtlas)
    skillCardAtlas: cc.SpriteAtlas = null;

    // animation
    @property(cc.Prefab)
    skillEffectPrefab: cc.Prefab = null;

    // 小技能列表
    @property([SkillItem])
    skillItems: SkillItem[] = []
    @property(cc.Node)
    normalSkillNode: cc.Node;
	
	// 界面动效
	@property(cc.Node)
    topGroup: cc.Node;
	@property(cc.Node)
    bottomGroup: cc.Node;
	@property(cc.Node)
    battleField: cc.Node;
	@property(cc.Node)
    blackBg: cc.Node;
	
    // 战斗结果
    battleIsWin: boolean = false;

    // flag
    battleIsEnd: boolean = true;
    turnState: TurnState = TurnState.COUNTDOWN;
    exitButtonClicked: boolean = false;
    spSkillArray = [100201, 101101, 101401, 102701, 102702, 102201, 103101, 103501, 104101, 104701];
    specialActionFunc = {
        1: SpecialSkill.物理攻击,
        100001: SpecialSkill.物理攻击,
        100101: SpecialSkill.单体伤害,
        100201: SpecialSkill.群体伤害,

        // 普陀山
        102201: SpecialSkill.辅助,
        102301: SpecialSkill.辅助,
        102401: SpecialSkill.群体伤害,
        102601: SpecialSkill.辅助,
        102701: SpecialSkill.辅助,
        102702: SpecialSkill.单体伤害,

        // 凌霄殿
        101101: SpecialSkill.群体伤害,
        101201: SpecialSkill.单体伤害,
        101301: SpecialSkill.单体伤害,
        101401: SpecialSkill.鬼神泣,
        101501: SpecialSkill.单体伤害,

        // 五庄观
        104101: SpecialSkill.单体伤害,
        104201: SpecialSkill.群体伤害,
        104501: SpecialSkill.群体伤害,
        104601: SpecialSkill.单体伤害,
        104701: SpecialSkill.群体伤害,

        // 盘丝洞
        103101: SpecialSkill.辅助,
        103201: SpecialSkill.辅助,
        103301: SpecialSkill.辅助,
        103501: SpecialSkill.辅助,
        103701: SpecialSkill.群体伤害,

        // 宠物技能
        3100210: SpecialSkill.单体伤害,
        3100220: SpecialSkill.单体伤害,
        3100230: SpecialSkill.单体伤害,
        3100240: SpecialSkill.单体伤害,
        3100250: SpecialSkill.单体伤害,
        3100260: SpecialSkill.群体伤害,
        3100270: SpecialSkill.群体伤害,
        3100280: SpecialSkill.群体伤害,
        3101180: SpecialSkill.单体伤害,
        3101190: SpecialSkill.群体伤害,
        3101200: SpecialSkill.单体伤害,
        3101210: SpecialSkill.群体伤害,
        3101220: SpecialSkill.群体伤害,
        3101230: SpecialSkill.单体伤害,
        3101240: SpecialSkill.群体伤害,
        3101250: SpecialSkill.群体伤害,
        3101260: SpecialSkill.单体伤害,
        3101270: SpecialSkill.群体伤害,
        3100161: SpecialSkill.单体伤害,
    };
    endBattleNextTurn: boolean = false;
    // data
    currentFuryRate = 0;
    actionList = [];
    battleInfo = {
        battleId: -1,
        turnInfo: null,
        turnCount: 1,
        selfPlayer: null,
        currFuryLevel: 0
    };

    playerPosition = [
        new cc.Vec2(-199, -199.5),
        new cc.Vec2(-309, -124.5),
        new cc.Vec2(-89, -274.5),
        new cc.Vec2(-114, -91.5),
        new cc.Vec2(-224, -16.5),
        new cc.Vec2(-4, -166.5)
    ]
    enemyPosition = [
        new cc.Vec2(193, 257),
        new cc.Vec2(303, 182),
        new cc.Vec2(83, 332),
        new cc.Vec2(108, 149),
        new cc.Vec2(218, 74),
        new cc.Vec2(-2, 224)
    ];

    cb = () => { };

    async start() {
        const mode = cc.sys.localStorage?.getItem(BATTLE_MODE) ?? "AUTO"
        if (mode !== "AUTO") {
            this.selectorState = SelectorState.MANU2
        }

        GameConfig.isInBattle = true;
        EventDispatcher.dispatch(Notify.REFRESH_ONLINE_STATUS_MYSELF, {});
        EventDispatcher.dispatch(Notify.MUSIC_CHANGE, {});
        this.battleUI.height = CommonUtils.getViewHeight();
        this.initUI();
        this.turnState = TurnState.COUNTDOWN;
		//
        for (let vec of this.playerPosition) {
            let player = cc.instantiate(this.buPrefab).getComponent(BattleUnit);
            player.nameLabel.node.color = cc.Color.fromHEX(player.nameLabel.node.color, '#00E507');
            player.node.x = vec.x;
            player.node.y = vec.y;
            player.node.parent = this.unitGroup;
            player.node.active = false;
            this.players.push(player);
        }
        for (let vec of this.enemyPosition) {
            let enemy = cc.instantiate(this.buPrefab).getComponent(BattleUnit);
            enemy.node.x = vec.x;
            enemy.node.y = vec.y;
            enemy.node.parent = this.unitGroup;
            enemy.node.active = false;
            this.enemies.push(enemy);
        }
        // this.battleInfo.turnInfo = [BattleConfig.getInstance().battleData.turnInfo[this.battleInfo.turnCount]]
        this.battleInfo.turnInfo = BattleConfig.getInstance().battleData.turnInfo;
        await this.initBattleUnits(BattleConfig.getInstance().battleData.unitInitInfo);
        this.battleInfo.selfPlayer = this.players[0];
 
        this.updateStatus();
        this.updateKi();

        this.exitBtn.node.on(cc.Node.EventType.TOUCH_END, this.exitBattle.bind(this));
        this.instructionBtn.node.on(cc.Node.EventType.TOUCH_END, this.showInstr.bind(this));
        this.instrCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideInstr.bind(this));
        this.instrConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideInstr.bind(this));

        this.skillCard1.node.on(cc.Node.EventType.TOUCH_START, this.skillCard1TouchBegin.bind(this));
        this.skillCard2.node.on(cc.Node.EventType.TOUCH_START, this.skillCard2TouchBegin.bind(this));

        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.skillCard1.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        this.skillCard1.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.skillCard2.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        this.skillCard2.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.jiImage.node.on(cc.Node.EventType.TOUCH_START, this.jiOnClick.bind(this));
        this.jiImage2.node.on(cc.Node.EventType.TOUCH_START, this.jiOnClick.bind(this));

        this.skillItems.forEach((elm) => {
            elm.node.on(cc.Node.EventType.TOUCH_START, this.normalSkillTouchBegin(elm).bind(this));
            elm.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
            elm.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        })

        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => { });
        this.instrBlockBg.node.on(cc.Node.EventType.TOUCH_END, () => { });

        await BattleConfig.getInstance().playTweenBeforeBattle();

        if (BattleConfig.getInstance().battleType != BattleType.MUTIL_PLAYER) {
            this.updateTurnState();
        } else {
            this.pleaseWaitFlag.node.active = true;
        }

        this.schedule(this.refreshIndex, 0.2);

        // 初始化怒气技能
        this.initBattleSkills(this.getSelfPlayer().fmap(x => x.skillIds).getOrElse([]));
		//
		this.fadeIn();
    }

    initUI() {
        // initAllUnits
        this.turnCount.string = this.countDown.string = "";
        this.battleIsEnd = false;
		this.topGroup.opacity = this.bottomGroup.opacity = this.battleField.opacity = 1;
		//
		this.blackBg.opacity = 1;
		let fadeAction = cc.fadeTo(0.5, 170);
		this.blackBg.runAction(fadeAction.clone());
    }
	
	fadeIn() {
		let fadeAction = cc.fadeTo(0.2, 255);
        cc.tween(this.topGroup.getComponent(cc.Widget)).to(0.2, {
            top: 0,
        }).start()
        cc.tween(this.bottomGroup.getComponent(cc.Widget)).to(0.2, {
            bottom: 0
        }).start()
		this.topGroup.runAction(fadeAction.clone());
		this.bottomGroup.runAction(fadeAction.clone());
		this.battleField.runAction(fadeAction.clone());
	}
	
	fadeOut() {
		let fadeAction = cc.fadeTo(0.2, 1);
		this.topGroup.runAction(fadeAction.clone());
		this.bottomGroup.runAction(fadeAction.clone());
		this.battleField.runAction(fadeAction.clone());
		this.blackBg.runAction(fadeAction.clone());
	}

    initBattleUnits(units: UnitInitInfo[]) {
        let myselfUnit = R.find(unit => unit.sourceId == PlayerData.getInstance().accountId, units) as UnitInitInfo;
        if (myselfUnit != undefined) {
            this.initKiCostLabel(myselfUnit.怒气消耗率);
            units.forEach(ele => {
                if (ele.hp === 0) {
                    if (ele.type == "TYPE_PET" || ele.type == "TYPE_MONSTER") {
                        return;
                    }
                }
                if (ele.stance === myselfUnit.stance) {
                    this.players[ele.position - 1].initUnit(ele);
                } else {
                    this.enemies[ele.position - 1].initUnit(ele);
                }
            });
        }
    }

    initKiCostLabel(furyRate: number) {
        let normalCostLabels = [this.skillCostLabel1, this.skillCostLabel2];
        let greenCostLabels = [this.skillCostGreenLabel1, this.skillCostGreenLabel2];
        let redCostLabels = [this.skillCostRedLabel1, this.skillCostRedLabel2];
        if (furyRate == undefined || furyRate == 1) {
            this.skillCostLabel1.string = '50';
            this.skillCostLabel2.string = this.skill2Id == -1 ? '' : '70';
            normalCostLabels.forEach(l => l.node.active = true);
            greenCostLabels.forEach(l => l.node.active = false);
            redCostLabels.forEach(l => l.node.active = false);
        } else if (furyRate > 1) {
            this.skillCostRedLabel1.string = `${Math.floor(furyRate * 50)}`;
            this.skillCostRedLabel2.string = this.skill2Id == -1 ? '' : `${Math.floor(furyRate * 70)}`;
            normalCostLabels.forEach(l => l.node.active = false);
            greenCostLabels.forEach(l => l.node.active = false);
            redCostLabels.forEach(l => l.node.active = true);
        } else if (furyRate < 1) {
            this.skillCostGreenLabel1.string = `${Math.floor(furyRate * 50)}`;
            this.skillCostGreenLabel2.string = this.skill2Id == -1 ? '' : `${Math.floor(furyRate * 70)}`;
            normalCostLabels.forEach(l => l.node.active = false);
            greenCostLabels.forEach(l => l.node.active = true);
            redCostLabels.forEach(l => l.node.active = false);
        }
    }

    // 更新上方敌我血条
    updateStatus() {
        let plusHp = (acc, ele) => {
            if (!ele.node.active) {
                return acc;
            }
            return acc + ele.hp;
        }
        let plusMaxHp = (acc, ele) => {
            if (!ele.node.active) {
                return acc;
            }
            return acc + ele.maxHp;
        }
        let percent = (arr) => {
            return CommonUtils.foldl(plusHp, 0, arr) / CommonUtils.foldl(plusMaxHp, 0, arr)
        }
        const playerPercent = percent(this.players)
        this.playBarTween(this.playerHp, this.shadowPlayerHp.node, this.shadowLength, playerPercent)
        const enemyPercent = percent(this.enemies)
        this.playBarTween(this.enemyHp, this.shadowEnemyHp.node, this.shadowLength, enemyPercent)
    }

    private playBarTween(bar: cc.ProgressBar, shadowNode: cc.Node, shadowLength: number, newPercent: number) {
        if (bar.progress > newPercent) {
            this.playBarDamageTween(bar, shadowNode, shadowLength, newPercent)
        } else if (bar.progress < newPercent) {
            this.playBarHealTween(bar, shadowNode, shadowLength, newPercent)
        }
    }

    private playBarDamageTween(bar: cc.ProgressBar, shadowNode: cc.Node, shadowLength: number, newPercent: number) {
        bar.progress = newPercent
		//
        cc.tween(shadowNode).to(1.0, {
            width: shadowLength * newPercent
        }, { easing: cc.easing.smooth })
        .start()
    }

    private playBarHealTween(bar: cc.ProgressBar, shadowNode: cc.Node, shadowLength: number, newPercent: number) {
		shadowNode.width = shadowLength * newPercent
		//
        cc.tween(bar).to(1.0, {
            progress: newPercent
        }, { easing: cc.easing.smooth })
        .call(() => bar.progress = newPercent)
        .start()
    }

    initBattleSkills(skills: any[]) {
        const playerSpSkills = skills.filter(x => x !== 102702 && R.contains(x, this.spSkillArray))
        const playerNormalSkills = skills.filter(x => x !== 102702 && R.contains(x, normalSkills))
        
        playerSpSkills.sort((a, b) => (BattleConfig.getInstance().skillDisplay[a]?.cost ?? 0) - (BattleConfig.getInstance().skillDisplay[b]?.cost ?? 0))
        playerNormalSkills.sort((a, b) => normalSkills.indexOf(a) - normalSkills.indexOf(b))

        let skill1Id = R.head(playerSpSkills);
        let skill2Id = R.head(R.tail(playerSpSkills));
        this.initSpSkill(skill1Id, skill2Id)
        this.initNormalSkill(playerNormalSkills)
    }

    initSpSkill(skill1Id: number | null, skill2Id: number | null) {
        if (skill1Id) {
            this.skill1Id = skill1Id;
            this.skillCard1.spriteFrame = this.skillCardAtlas.getSpriteFrame(String(skill1Id));
        }
        if (skill2Id) {
            this.skill2Id = skill2Id;
            this.skillCard2.spriteFrame = this.skillCardAtlas.getSpriteFrame(String(skill2Id));
            this.skillCostLabel2.string = '70';
        } else {
            this.skill2Id = -1;
        }
    }

    initNormalSkill(skillIds: number[]) {
        this.skillItems.forEach((elm, index) => {
            const active = index < skillIds.length
            elm.node.active = active
            elm.setActive(false)
            if (active) {
                elm.init(skillIds[index])
            }
        })
    }

    update() {
        if (this.countingDown) {
            let timeInfo = CommonUtils.getTimeInfo(Date.now() - this.startTime);
            let second = timeInfo.seconds;
            if (second >= this.NORMAL_COUNT_DOWN && this.selectorState != SelectorState.MANU) {
                this.countingDown = false;
                this.selectedBattleUnit = null;
                this.operationEnd();
                this.waitingForOperation = false;
            } else if (second >= this.MAX_COUNT_DOWN) {
                this.selectedBattleUnit = null;
                this.countingDown = false;
                this.operationEnd();
                this.skillCardRemovePopup();
                this.waitingForOperation = false;
            } else {
                this.countDown.string = (10 - second) + '';
            }
        }

    }
    startTime: number = Date.now();
    countingDown: boolean = false;
    readonly NORMAL_COUNT_DOWN = 2;
    readonly MAX_COUNT_DOWN = 10;
    /**
     * 战斗主循环
     */
    waitingForOperation = false;
    async updateTurnState() {
        if (this.battleIsEnd) return;
        switch (this.turnState) {
            case TurnState.COUNTDOWN: {
                this.turnCount.string = this.battleInfo.turnCount.toString();
                if (SelectorState.MANU2 == this.selectorState) {
                    this.operation = { battleId: this.battleInfo.battleId, turnCount: this.battleInfo.turnCount, skillId: null, targetId: null };
                    this.selectorState = SelectorState.MANU;
                    this.countDown.string = '';
                    this.skillCardPopup();
                } else {
                    this.operation = { battleId: this.battleInfo.battleId, turnCount: this.battleInfo.turnCount, skillId: null, targetId: null };
                }
                this.startTime = Date.now();
                this.countingDown = true;
                this.waitingForOperation = true;
                break;
            }
            case TurnState.TURN_START: {
                if (!this.battleInfo.turnInfo || 0 === this.battleInfo.turnInfo.length) {
                    this.battleIsEnd = true;
                    this.updateTurnState();
                    return;
                }
                let playerId = this.battleInfo.selfPlayer.id;
                for (let battleUnitStatus of this.battleInfo.turnInfo[0].unitStatus) {
                    if (parseInt(<any>battleUnitStatus.id) == parseInt(<any>playerId)) {
                        let hp = battleUnitStatus.currHp;
                        let sp = battleUnitStatus.currSp;
                        this.updateKi();
                        // 更新对应的battleUnit
                        let battleUnit = this.getBattleUnitById(playerId);
                        if (battleUnit.valid) {
                            battleUnit.val.setHp(hp);
                            battleUnit.val.setSp(sp);
                        }
                    }
                }
                this.actionList = [];
                for (let i = 0; i < this.battleInfo.turnInfo.length; ++i) {
                    for (let j = 0; j < this.battleInfo.turnInfo[i].actionRecord.length; ++j) {
                        this.actionList.push(this.battleInfo.turnInfo[i].actionRecord[j]);
                    }
                }
                // 怒火显示
                // if (this.battleInfo.turnInfo[0].furyLevel != this.battleInfo.currFuryLevel) {
                //     this.battleInfo.currFuryLevel = this.battleInfo.turnInfo[0].furyLevel;
                // }
                this.turnState = TurnState.PLAY_MC;
                this.updateTurnState();
                break;
            }
            case TurnState.PLAY_MC: {
                this.playMC();
                break;
            }
            case TurnState.TURN_END: {
                if (this.exitButtonClicked || this.endBattleNextTurn) {
                    setTimeout(function () {
                        this.battleIsEnd = true;
                        this.exitBattle();
                    }.bind(this), 1000);
                    break;
                }
                this.turnState = TurnState.COUNTDOWN;
                this.updateTurnState();
                break;
            }
        }
        this.refreshState()
    }

    playMC() {
        if (this.battleIsEnd) return;
        if (this.exitButtonClicked) {
            this.actionList = [];
        }
        if (0 === this.actionList.length) {
            if (this.turnState == TurnState.PLAY_MC) {
                if (BattleConfig.getInstance().battleType == BattleType.MUTIL_PLAYER) {
                    if (this.battleInfo.turnInfo && this.battleInfo.turnInfo.length) {
                        let turnInfo = this.battleInfo.turnInfo[0] as TurnInfo;
                        if (turnInfo && turnInfo.endOfTurnUnitStatus) {
                            turnInfo.endOfTurnUnitStatus.forEach(ele => {
                                let battleUnit = this.getBattleUnitById(ele.id);
                                if (battleUnit.valid) {
                                    battleUnit.val.setHp(ele.currHp);
                                    battleUnit.val.furyRate = ele.怒气消耗率;
                                }
                                if (battleUnit.fmap(x => x.isMyself()).getOrElse(false)) {
                                    this.initKiCostLabel(ele.怒气消耗率);
                                }
                            });
                        }
                    }
                    if (this.endBattleNextTurn) {
                        BattleUtils.sendAfterBattleSync();
                        this.turnState = TurnState.TURN_END;
                        this.updateTurnState();
                    } else {
                        BattleUtils.sendAfterTurnSync();
                    }
                } else {
                    if (this.battleInfo.turnInfo && this.battleInfo.turnInfo.length) {
                        let turnInfo = this.battleInfo.turnInfo[0] as TurnInfo;
                        if (turnInfo && turnInfo.endOfTurnUnitStatus) {
                            turnInfo.endOfTurnUnitStatus.forEach(ele => {
                                let battleUnit = this.getBattleUnitById(ele.id);
                                if (battleUnit.valid) {
                                    battleUnit.val.setHp(ele.currHp);
                                    battleUnit.val.furyRate = ele.怒气消耗率;
                                }
                                if (battleUnit.fmap(x => x.isMyself()).getOrElse(false)) {
                                    this.initKiCostLabel(ele.怒气消耗率);
                                }
                            });
                        }
                    }
                    this.turnState = TurnState.TURN_END;
                    this.updateTurnState();
                }
            }
            return;
        }
        let action = this.actionList.shift();
        let actionType = action.type;
        // refresh index >>>>
        switch (actionType) {
            case ActionType.USE_SKILL: {
                // if (battleUnit.isPlayer && !battleUnit.isPet && this.spSkillArray.indexOf(skillId) != -1) {
                //     this.playSpSkill(action);
                // } else {
                this.playUseSkill(action);
                // }
                break;
            }
            case ActionType.BUFF_AFFECT: {
                this.playBuffAffect(action);
                break;
            }
            case ActionType.BUFF_DECAY: {
                this.playBuffDecay(action);
                break;
            }
            case ActionType.SUMMON: {
                this.playSummon(action);
                break;
            }
            default: {
                CommonUtils.log('illegal action type');
            }
        }
    }

    playSpSkill(action) {

    }

    playUseSkill(action) {
        if (this.battleIsEnd) return;
        let actionId = action.actionId;
        let executeResult = action.executeResult;
        if (this.battleInfo.selfPlayer.id == action.actorId && ExecuteResult.FAIL_TARGETLOST === executeResult) {
            // TipsManager.showMessage('行动失败，目标丢失');
            setTimeout(this.playMC.bind(this), 200);
            return;
        } else if (ExecuteResult.FAIL_NOTENOUGHCOST === executeResult) {
            if (this.battleInfo.selfPlayer.id == action.actorId) {
                TipsManager.showMessage('怒气不足，释放技能失败');
            }
            setTimeout(this.playMC.bind(this), 200);
            return;
        }
        let actionResultPackArray = action.affectRecordPack;
        if (!actionResultPackArray[0] || !actionResultPackArray[0][0]) {
            setTimeout(this.playMC.bind(this), 200);
            return;
        }
        let targetId = actionResultPackArray[0][0].target.id;
        // 新的技能动画实现
        if (this.specialActionFunc && this.specialActionFunc[actionId] != null) {
            this.specialActionFunc[actionId](action, this);
            return;
        }
		if (actionId !== 0) {
            SpecialSkill.物理攻击(action, this);
        } else {
            this.playMC();
        }
        // 播放被动技能 buff 类效果

        // setTimeout(this.playMC.bind(this), 800);
    }

    playBuffAffect(action) {
        R.forEach((ele) => {
            R.forEach((ele2) => {
                let target = this.getBattleUnitById(ele2.target.id);
                if (!target.valid) {
                    return;
                }
                if (R.prop('type', ele2) === ActionResultType.DAMAGE) {
                    this.beAttacked(ele2, target.val);
                }
                this.processDamage(ele2, null, target.val);
            }, ele)
        }, action.affectRecordPack)

        this.playMC();
    }

    playBuffDecay(action) {
        let buffId = action.buffActor.id;
        let target = this.getBattleUnitById(action.actorId);
        if (!target.valid) {
            this.playMC();
            return;
        }
        target.val.playBuffDecay(buffId, action.buffActor.countDown);

        R.forEach((ele) => {
            R.forEach((ele2) => {
                let resultTarget = this.getBattleUnitById(ele2.target.id);
                if (resultTarget.valid) {
                    this.processResult(ele2, resultTarget.val);
                }
            }, ele)
        }, action.affectRecordPack)

        this.playMC();
    }

    async playSummon(action: ActionRecord) {
        let actionResultPackArray = action.affectRecordPack;
        for (let actionResultPack of actionResultPackArray) {
            for (let actionResult of actionResultPack) {
                if (actionResult.type == ActionResultType.SUMMONEE) {
                    let summoneeInfo = actionResult.summonee;
                    let prefabId = R.prop('prefabId', summoneeInfo);
                    let type = summoneeInfo.stance == BattleConfig.getInstance().myselfStance ? "ru" : "ld";
                    let battleUnit = this.getBattleUnitByPosition(summoneeInfo.position, summoneeInfo.stance);

                    if (battleUnit.valid) {
                        battleUnit.val.node.stopAllActions();
                        battleUnit.val.node.opacity = 0;
                        let sp = cc.instantiate(this.skillEffectPrefab);
                        let effect = sp.getComponent(SkillEffect) as SkillEffect;
                        let offset = { x: 0.496, y: 0.658 };
                        sp.anchorX = offset.x;
                        sp.anchorY = offset.y;
                        sp.x = battleUnit.val.orignalPos.x;
                        sp.y = battleUnit.val.orignalPos.y;
                        sp.parent = this.downGroup;
                        effect.ani.on('finished', function () {
                            CommonUtils.safeRemove(sp);
                        });
                        let ac = await MovieclipUtils.getEffectClipData('ui/base/battle/battle_summon_effect', 24);
                        ac.wrapMode = cc.WrapMode.Normal;

                        // 放在下面防止加载资源会影响 召唤特效的加载
                        // let battleStatus = ["attack", "die", "hit", "idle", "magic"];
                        const status = "attack"
                        if (undefined == BattleConfig.getInstance().res['movieclip/' + prefabId + '/' + prefabId + "_" + status + "_" + type]) {
                            battleUnit.val.syncInitUnitForSummon(summoneeInfo);
                            this.loadModel(summoneeInfo);
                        } else {
                            battleUnit.val.initUnit(summoneeInfo, true);
                        }
                        battleUnit.val.node.runAction(cc.fadeTo(1.5, 255));
                        effect.play(ac);
                        this.loadSummoneeSpSkill(summoneeInfo);
                    }
                }
            }
        }
        let summoner = this.getBattleUnitById(action.actorId);
        if (summoner.valid) {
            summoner.val.setMcAction('magic');
            summoner.val.playTweenName('召唤');
        }
        await CommonUtils.wait(1.3);
        this.playMC();
    }

    async loadModel(summoneeInfo) {
        let prefabId = summoneeInfo.prefabId;
        let type = summoneeInfo.stance == BattleConfig.getInstance().myselfStance ? "ru" : "ld";
        let battleUnit = this.getBattleUnitByPosition(summoneeInfo.position, summoneeInfo.stance);
        await MovieclipUtils.loadMcBySummon(prefabId, type);
        if (battleUnit.valid) {
            await battleUnit.val.initMcs(battleUnit.val.prefabId, battleUnit.val.weaponId);
            battleUnit.val.mcSprite.node.active = true;
        }
    }

    async loadSummoneeSpSkill(summoneeInfo) {
        let skillResArray = [];
        summoneeInfo.skillIds.forEach(id => {
            let skillAnimation = BattleConfig.getInstance().skillDisplay[id];
            if (skillAnimation == undefined || skillAnimation["effectId"] == 0) {
                return;
            }
            let effectId = skillAnimation["effectId"];
            let resName = '/effect_skill/' + "effect_skill_" + effectId
            if (BattleConfig.getInstance().res[effectId] == undefined) {
                skillResArray.push(resName);
            }
        });
        if (skillResArray.length > 0) {
            await MovieclipUtils.loadSkillsBySummon(skillResArray);
        }
    }


    /**
     * action 
     */
    playEffect(actionId: number, battleUnit: BattleUnit, damageType: DamageType = undefined) {
        let skillAnimation = BattleConfig.getInstance().skillDisplay[actionId];
        if (skillAnimation == undefined || !battleUnit) {
            return;
        }

        if (damageType == "ABSOLUTE") {
            battleUnit.play反震();
            return;
        }

        let effectId = skillAnimation["effectId"];
        if (0 === effectId || !effectId) return;

        let sp = cc.instantiate(this.skillEffectPrefab);
        let effect = sp.getComponent(SkillEffect) as SkillEffect;
        let offset = BattleConfig.getInstance().skillEffectOffset[effectId];
        sp.anchorX = offset.x;
        sp.anchorY = offset.y;

        if (skillAnimation.effectLocation == 1) {
            if (battleUnit.stance == UnitStance.Enemy) {
                sp.x = 150.5;
                sp.y = 203;
            } else {
                sp.x = -156.5;
                sp.y = -145.5;
            }
        } else {
            sp.x = battleUnit.node.x;
            sp.y = battleUnit.node.y;
        }

        if (battleUnit.stance == UnitStance.Player) {
            if (skillAnimation["isFlipHorizontal"] == 1) {
                sp.scaleX *= -1;
            }
            if (skillAnimation["isFlipVertical"] == 1) {
                sp.scaleY *= -1;
            }
        }

        // 崩山裂放大
        if (effectId == 3101230) {
            sp.scaleX *= 1.8;
            sp.scaleY *= 1.8;
        }

        sp.parent = this.effectLayer;
        effect.ani.on('finished', function () {
            CommonUtils.safeRemove(sp);
        });

        let ac = BattleConfig.getInstance().getEffectAC(effectId);
        effect.play(ac);
    }

    attack(actionId: number, battleUnit: BattleUnit, target?: BattleUnit) {
        if (this.battleIsEnd) return;
        battleUnit.playUseSkill(actionId)
    }

    beAttacked(actionResult: any, battleUnit: BattleUnit) {
        if (this.battleIsEnd) {
            return;
        }
        let type = actionResult.type;
        let isHit = actionResult.isHit;
        if (type == ActionResultType.DAMAGE) {
            if (isHit) {
                battleUnit.playHit(actionResult);
            } else if (!isHit) {
                battleUnit.playDodge();
            }
        } else if (type == ActionResultType.RECOVER) { // RECOVER
            // TipEffectUtils.showEffectTipsDownToUp(battleUnit, "+" + actionResult.resultValue.hp, 0);
        }
    }

    processDamage(actionResult: any, battleUnit: any, target: any) {
        if (this.battleIsEnd) {
            return;
        }
        let type = actionResult.type;
        let isHit = actionResult.isHit;
        let buffId = actionResult.buffId;
        if (type == ActionResultType.DAMAGE) {
            target.playDamage(actionResult, target);
        } else {
            this.processResult(actionResult, target);
        }
        this.updateStatus();
    }

    public processResult(actionResult: any, battleUnit: BattleUnit) {
        if (this.battleIsEnd) {
            return;
        }
        let type = actionResult.type;
        let isHit = actionResult.isHit;
        let buffId = actionResult.buffId;

        switch (type) {
            case ActionResultType.DAMAGE: {
                break;
            }
            case ActionResultType.RECOVER: {
                battleUnit.playRecover(actionResult);
                if (battleUnit && battleUnit.id == this.battleInfo.selfPlayer.id) {
                    this.updateKi();
                }
                break;
            }
            case ActionResultType.BUFF_ATTACH: {
                battleUnit.playBuffAttach(actionResult);
                break;
            }
            case ActionResultType.BUFF_DETACH: {
                battleUnit.playBuffDetach(actionResult, battleUnit);
                break;
            }
            case ActionResultType.DIE: {
                battleUnit.playDie(actionResult);
                if (battleUnit && battleUnit.id == this.battleInfo.selfPlayer.id) {
                    this.updateKi();
                }
                break;
            }
            case ActionResultType.FLY_OUT: {
                battleUnit.playFlyOut(actionResult);
                break;
            }
            case ActionResultType.REVIVE: {
                battleUnit.playRevive(actionResult);
                break;
            }
            //case ActionResultType.SUMMONEE: {
            //   battleUnit.playSummonee(actionResult, battleUnit);
            //    break;
            //}
            default:
                break;
        }
        this.updateStatus();
    }

    playCost(action: any, battleUnit: BattleUnit) {
        battleUnit.playCost(action);
        this.updateKi();
    }

    endBattle() {
    }

    getBattleUnitById(actorId): Optional<BattleUnit> {
        for (let player of this.players) {
            if (player.id == actorId) {
                return Optional.Just(player);
            }
        }
        for (let enemy of this.enemies) {
            if (enemy.id == actorId) {
                return Optional.Just(enemy);
            }
        }
        return Optional.Nothing<BattleUnit>();
    }

    getBattleUnitByPosition(position, stance): Optional<BattleUnit> {
        if (stance == BattleConfig.getInstance().myselfStance) {
            for (let player of this.players) {
                if (player.position == position) {
                    return Optional.Just(player);
                }
            }
        } else {
            for (let enemy of this.enemies) {
                if (enemy.position == position) {
                    return Optional.Just(enemy);
                }
            }
        }
        return Optional.Nothing<BattleUnit>();
    }

    getSelfPlayer(): Optional<BattleUnit> {
        for (let player of this.players) {
            if (player.sourceId == PlayerData.getInstance().accountId) {
                return Optional.Just(player);
            }
        }
        return Optional.Nothing<BattleUnit>();
    }
    // update (dt) {}


    // battle skill selector

    updateKi() {
        let kiNum = this.battleInfo.selfPlayer.sp;
        this.spBar.node.width = kiNum * 4;
        this.spLabel.string = Math.floor(kiNum).toString();
        this.spFullEffect.node.active = kiNum == 100;
    }

    skillCardActive: boolean = false;
    skillCard1TouchBegin(event: cc.Event.EventTouch) {
        this.selectedSkillId = this.operation.skillId = this.skill1Id; // 技能ID 
        this.skillCardActive = true;
        this.skillCard1.node.scaleX = 1.1;
        this.skillCard1.node.scaleY = 1.1;

        this.arrow.node.active = true;
        this.arrow.node.x = this.skillCard1.node.x;
        this.arrow.node.y = this.skillCard1.node.y;

        // show skill
        let skill = BattleConfig.getInstance().skillDisplay[this.skill1Id];
        this.skillNameLabel.string = skill["name"];
        this.skillDescLabel.string = skill["description"];
        this.skillDescNode.active = true;
    }

    skillCard2TouchBegin(event: cc.Event.EventTouch) {
        if (this.skill2Id === -1) {
            TipsManager.showMessage('第二怒气技在门派对应技能达到30级后开启');
            return;
        }
        this.selectedSkillId = this.operation.skillId = this.skill2Id; // 技能ID 
        this.skillCardActive = true;
        this.skillCard2.node.scaleX = 1.1;
        this.skillCard2.node.scaleY = 1.1;

        this.arrow.node.active = true;
        this.arrow.node.x = this.skillCard2.node.x;
        this.arrow.node.y = this.skillCard2.node.y;

        // show skill
        let skill = BattleConfig.getInstance().skillDisplay[this.skill2Id];
        this.skillNameLabel.string = skill["name"];
        this.skillDescLabel.string = skill["description"];
        this.skillDescNode.active = true;
    }

    normalSkillTouchBegin(skillItem: SkillItem) {
        return (event: cc.Event.EventTouch) => {
            this.selectedSkillId = this.operation.skillId = skillItem.skillId
            this.skillCardActive = true;
            skillItem.setActive(true)

            this.arrow.node.active = true;
            this.arrow.node.position = new cc.Vec3(284, -230 + skillItem.node.y, 0)
            const showPos = (v: cc.Vec3) => `x: ${v.x}, y: ${v.y}, z: ${v.z}`

            // show skill
            let skill = BattleConfig.getInstance().skillDisplay[skillItem.skillId];
            this.skillNameLabel.string = skill["name"];
            this.skillDescLabel.string = skill["description"];
            this.skillDescNode.active = true;
        }
    }

    touchMove(event: cc.Event.EventTouch) {
        if (!this.skillCardActive) return;
        if (this.selectorState !== SelectorState.MANU) return;
        let location = event.getLocation();
        let startLocation = this.arrow.node.getPosition();

        let deltaX = location.x - startLocation.x - 384;
        let deltaY = CommonUtils.getViewHeight() / 2 - location.y + startLocation.y;

        let rotation = 45;
        if (deltaX != 0) {
            rotation = Math.atan(deltaY / deltaX) * 180 / Math.PI;
            if (deltaX < 0) {
                rotation -= 180;
            }
        } else {
            if (deltaY >= 0) {
                rotation = 90;
            } else {
                rotation = -90;
            }
        }

        this.arrow.node.rotation = rotation;
        this.arrow.node.width = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) - 50);

        let skill = BattleConfig.getInstance().skillDisplay[this.selectedSkillId];
        if (!skill) return;
        let onEnemy = true;
        let onPlayer = false;
        switch (parseInt(skill["targetRange"])) {
            case 0: {
                onEnemy = false;
                onPlayer = true;
                break;
            }
            case 1: {
                onEnemy = true;
                onPlayer = false;
                break;
            }
            case 2: {
                onEnemy = true;
                onPlayer = true;
                break;
            }
        }
        let selectSize = 80;
        let min = 1000;
        let height = CommonUtils.getViewHeight();
        if (onPlayer) {
            for (let battleUnit of this.players) {
                if (!battleUnit.node.active) continue;
                battleUnit.selectedImage.node.active = false;
                battleUnit.preSelectedImage.node.active = true;
                let point = battleUnit.getPosition();
                let deltaX = point.x - location.x + 384;
                let deltaY = height / 2 - location.y + point.y;
                let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                if (min >= distance) {
                    min = distance;
                    this.selectedBattleUnit = battleUnit;
                }
            }
            if (min <= selectSize) {
                this.selectedBattleUnit.selectedImage.node.active = true;
                this.selectedBattleUnit.preSelectedImage.node.active = false;
            } else {
                this.selectedBattleUnit = null;
            }
        }
        if (onEnemy) {
            for (let battleUnit of this.enemies) {
                if (!battleUnit.node.active) continue;
                battleUnit.preSelectedImage.node.active = true;
                battleUnit.selectedImage.node.active = false;
                let point = battleUnit.getPosition();
                let deltaX = point.x + 384 - location.x;
                let deltaY = point.y + height / 2 - location.y;
                let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                if (min >= distance) {
                    min = distance;
                    this.selectedBattleUnit = battleUnit;
                }
            }
            if (min <= selectSize) {
                this.selectedBattleUnit.selectedImage.node.active = true;
                this.selectedBattleUnit.preSelectedImage.node.active = false;
            } else {
                this.selectedBattleUnit = null;
            }
        }
    }

    touchEnd() {
        if (!this.skillCardActive) return;
        if (this.selectorState !== SelectorState.MANU) return;
        this.skillCardActive = false;
        this.arrow.node.active = false;
        if (this.selectedBattleUnit) {
            this.selectedBattleUnit.selectedImage.node.active = false;
            this.operationEnd();
            this.skillCardRemovePopup();
        } else {
            this.operation.skillId = null;
            this.operation.targetId = null;
        }

        this.players.forEach(ele => {
            if (ele.node.active) {
                ele.preSelectedImage.node.active = false;
            }
        });
        this.enemies.forEach(ele => {
            if (ele.node.active) {
                ele.preSelectedImage.node.active = false;
            }
        })
        this.skillCard1.node.scaleX = this.skillCard1.node.scaleY = 1;
        this.skillCard2.node.scaleX = this.skillCard2.node.scaleY = 1;
        this.skillItems.forEach(elm => elm.setActive(false))
        this.skillDescNode.active = false;
    }
    // AUTO: 自动
    // MANU: 技能卡牌弹出
    // MANU2: 下次回合开始技能卡牌弹出
    jiOnClick() {
        if (this.sendingOperation) return;
        if (this.waitingForOperation) {
            if (this.selectorState == SelectorState.AUTO) {
                this.selectorState = SelectorState.MANU;
                this.countDown.string = '';
                this.skillCardPopup();
                this.showJiEffect();
            } else if (this.selectorState == SelectorState.MANU) {
                this.operation.skillId = null;
                this.operationEnd();
                this.skillCardRemovePopup();
                this.selectorState = SelectorState.AUTO;
            } else if (this.selectorState == SelectorState.MANU2) {
                this.selectorState = SelectorState.AUTO;
            }
        } else {
            if (this.selectorState == SelectorState.AUTO) {
                this.selectorState = SelectorState.MANU2;
                this.showJiEffect();
            } else if (this.selectorState == SelectorState.MANU) {
                this.operationEnd();
                this.skillCardRemovePopup();
                this.selectorState = SelectorState.AUTO;
            } else if (this.selectorState == SelectorState.MANU2) {
                this.selectorState = SelectorState.AUTO;
            }
        }
        if (this.selectorState === SelectorState.AUTO) {
            cc.sys.localStorage?.setItem(BATTLE_MODE, "AUTO")
        } else {
            cc.sys.localStorage?.setItem(BATTLE_MODE, "MANUAL")
        }
        this.refreshState();
    }

    refreshState() {
        this.normalSkillNode.active = this.selectorState == SelectorState.MANU;
        this.jiImage2.node.active = this.autoBattleFlag.node.active = this.selectorState == SelectorState.AUTO;
        this.waitingFlag.node.active = !this.autoBattleFlag.node.active && this.selectorState == SelectorState.MANU2;
        this.jiImage.node.active = !this.jiImage2.node.active;
        this.jiEffectImage.node.active = this.jiImage.node.active;
    }

    clear() {
        this.waitingForOperation = false;
        this.countDown.string = '';
        this.arrow.node.active = false;
        this.players.forEach(ele => {
            if (ele.node.active) {
                ele.preSelectedImage.node.active = false;
                ele.selectedImage.node.active = false;
            }
        });
        this.enemies.forEach(ele => {
            if (ele.node.active) {
                ele.preSelectedImage.node.active = false;
                ele.selectedImage.node.active = false;
            }
        })
        this.skillCard1.node.scaleX = this.skillCard1.node.scaleY = 1;
        this.skillCard2.node.scaleX = this.skillCard2.node.scaleY = 1;
        this.skillDescNode.active = false;
    }

    sendingOperation: boolean = false;
    async operationEnd() {

        if (this.sendingOperation) return;
        this.clear();
        this.sendingOperation = true;
        if (!this.selectedBattleUnit) {
            this.operation.skillId = null;
            this.operation.targetId = null;
        } else {
            this.operation.targetId = this.selectedBattleUnit.id;
        }

        this.countDown.string = '';
        this.battleStatus.node.active = false;
        // xhr operartion
        let params = [
            BattleConfig.getInstance().battleSessionId,
            this.battleInfo.turnCount
        ]
        if (this.operation.skillId != undefined && this.operation.targetId != undefined) {
            if (this.operation.skillId === 102701 && this.selectedBattleUnit && this.selectedBattleUnit.stance === UnitStance.Enemy) {
                this.operation.skillId = 102702;
            }
            params = [
                BattleConfig.getInstance().battleSessionId,
                this.battleInfo.turnCount,
                this.operation.skillId,
                this.operation.targetId
            ]
        }

        if (this.turnState !== TurnState.COUNTDOWN) {
            this.sendingOperation = false;
            return;
        }

        if (BattleConfig.getInstance().battleType == BattleType.MUTIL_PLAYER) {
            BattleUtils.sendActionSync({
                skillId: params[2],
                targetId: params[3]
            })
            return;
        }
        let result = await this.getNextTurnInfo(params, 0);
        if (result == false) {
            TipsManager.showMessage('网络已断开，请重新登录');
            await CommonUtils.loadSceneWithProgress('login');
        }
        this.sendingOperation = false;
    }

    async getNextTurnInfo(params, count) {
        if (count >= 3) {
            return false;
        }
        try {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/action/{id}/nextTurn', R.clone(params)) as any;
            if (response.status == 0) {
                this.initByTurnInfo(response);
                return true;
            }
        } catch (err) {
            await CommonUtils.wait(3);
            return await this.getNextTurnInfo(params, count + 1);
        }
    }

    slice102701(action) {
        let tempR1 = R.clone(action);
        let tempR2 = R.clone(action);
        tempR1.affectRecordPack = R.of(tempR1.affectRecordPack[0]);
        tempR2.affectRecordPack = R.of(tempR2.affectRecordPack[1]);
        let costLens = R.lensPath(['cost', 'sp']);
        tempR2 = R.set(costLens, 0, tempR2)
        return { first: tempR1, second: tempR2 }
    }

    readonly mergeSkillIds = [3100210, 3101180, 3101200, 3101230, 3101260, 101201, 100101, 101501]
    initByTurnInfo(response) {
        let actionRecord = response.content.actionRecord as Array<ActionRecord>;
        let length = actionRecord.length;
        let result = [];

        let record = R.clone(actionRecord[0]);
        if (record.actionId == 102701 && record.affectRecordPack.length == 2) { // 大慈心光度
            let sliceResult = this.slice102701(record);
            result.push(sliceResult.first);
            result.push(sliceResult.second);
        } else {
            result.push(record);
        }
        for (let i = 1; i < length; ++i) {
            let r1 = actionRecord[i];
            let r2 = result[result.length - 1];
            if (r1.actorId == r2.actorId && r1.actionId == r2.actionId && this.mergeSkillIds.indexOf(r1.actionId) != -1) {
                result[result.length - 1].affectRecordPack = R.concat(r2.affectRecordPack, r1.affectRecordPack);
            } else {
                if (r1.actionId == 102701 && r1.affectRecordPack.length == 2) { // 大慈心光度
                    let sliceResult = this.slice102701(r1);
                    result.push(sliceResult.first);
                    result.push(sliceResult.second);
                } else {
                    result.push(r1);
                }
            }
        }
        response.content.actionRecord = result;
        this.battleInfo.turnInfo = [
            response.content
        ];
        (response.content as TurnInfo).unitStatus.forEach(ele => {
            let battleUnit = this.getBattleUnitById(ele.id);
            if (battleUnit.valid) {
                battleUnit.val.setHp(ele.currHp);
                battleUnit.val.sp = ele.currSp;
                battleUnit.val.furyRate = ele.怒气消耗率;
            }
            if (battleUnit.fmap(x => x.isMyself()).getOrElse(false)) {
                this.initKiCostLabel(ele.怒气消耗率);
            }
        });
        this.updateKi();
        this.battleInfo.turnCount += 1;
        this.turnState = TurnState.TURN_START;
        let player = this.battleInfo.selfPlayer;
        if (player && player.怒火补正率) {
            if (player.怒火补正率 != this.currentFuryRate) {
                this.currentFuryRate = player.怒火补正率;
                let furry = player.怒火补正率 * 100 + '%';
                TipsManager.showMessage(`随着回合变化，全体目标额外承受${furry}的伤害`)
            }
        }
        this.updateTurnState();
        if (response.content.battleEnd) {
            this.endBattleNextTurn = true;
        }
    }

    showJiEffect() {

    }

    skillCardPopup() {
        this.skillCardEffect1.node.active = this.battleInfo.selfPlayer.sp >= 50;
        this.skillCardEffect2.node.active = this.battleInfo.selfPlayer.sp >= 70 && this.skill2Id !== -1;
        this.skillCard1.node.active = this.skillCard2.node.active = true;
        this.waitingFlag.node.active = false;
    }

    skillCardRemovePopup() {
        if (this.selectorState === SelectorState.MANU) {
            this.selectorState = SelectorState.MANU2
        }
        // this.selectorState = SelectorState.AUTO;
        this.refreshState();
        this.skillCard1.node.active = this.skillCard2.node.active = false;
    }

    // 退出战斗
    async exitBattle() {
		this.fadeOut();
		//
		this.cb();
        EventDispatcher.dispatch(Notify.SHOW_AFTER_BATTLE, { battleId: BattleConfig.getInstance().battleSessionId, playerStance: BattleConfig.getInstance().myselfStance });
        this.unschedule(this.refreshIndex);
        GameConfig.isInBattle = false;
        EventDispatcher.dispatch(Notify.REFRESH_ONLINE_STATUS_MYSELF, {});
        EventDispatcher.dispatch(Notify.MUSIC_CHANGE, {});
		await CommonUtils.wait(0.2)
		//
		CommonUtils.safeRemove(this.node);
    }

    showInstr() {
        this.content.string = CommonUtils.textToRichText(
            '1、系统[2c5e07]默认自动战斗[ffffff]，此时会自动释放技能，特定技能需要手动释放。\n\n'
            + '2、点击右下角[2c5e07]\"技\"[ffffff]字切换自动和手动；[2c5e07]\"技\"[ffffff]字点亮后，[2c5e07]回合初[ffffff]可手动释放怒气技能。\n\n'
            + '3、战斗[2c5e07]初始怒气为50点[ffffff]，每回合回复10点怒气，玩家自身受到攻击会获得怒气，怒气积攒上限为100。\n\n'
            + '4、体型比一般怪物大的敌方会[2c5e07]免疫封印[ffffff]效果。 \n\n'
            + '5、若战斗超过[2c5e07]60回合[ffffff]未分出胜负，则判定该场战斗发起者失败。'
        )
        this.instruction.active = true;
    }

    hideInstr() {
        this.instruction.active = false;
    }

    refreshIndex() {
        let arr = this.players.concat(this.enemies);
        let yArr = arr.map(ele => {
            return Math.floor(ele.node.y);
        });
        let sorted = CommonUtils.reverse(CommonUtils.quickSort(yArr));
        sorted.forEach((ele, i) => {
            let index = yArr.indexOf(ele);
            if (index == -1) return;
            arr[index].node.zIndex = i;
        });
    }

    // 多人战斗接口
    forceStartOperation() {
        this.actionList = [];
        this.turnState = TurnState.COUNTDOWN;
        this.pleaseWaitFlag.node.active = false;
        this.updateTurnState();
    }

    forceOperationEnd() {
        this.selectedBattleUnit = null;
        this.countingDown = false;
        this.operationEnd();
        this.skillCardRemovePopup();
        this.waitingForOperation = false;
    }
}
