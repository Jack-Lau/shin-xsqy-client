import { BattleConfig } from "./BattleConfig";
import { Action } from "./Action";
import { ActionResultType } from "./BattleScene";
import BattleUnit from "./BattleUnit";
import { ActionRecord, AffectRecord } from "../net/Protocol";

export module SpecialSkill {
	
    export function getAttackSequences(prefabId: any, skillId: any): any {
        let modelId = parseInt(prefabId)
        let actionId = parseInt(skillId);
        let modelShow = BattleConfig.getInstance().modelShow[modelId + ""];

        let afkTotalFrames = 30;
        if (modelShow && modelShow["atkTotalFrames"] != undefined) {
            afkTotalFrames = modelShow["afkTotalFrames"]
        }
        let physical = 15;
        if (modelShow && modelShow["atkCruxFrame"] != undefined) {
            physical = modelShow["atkCruxFrame"]
        }
        let magic = 0;
        if (modelShow && modelShow["magCruxFrame"] != undefined) {
            magic = modelShow["magCruxFrame"]
        }
        let magicTotal = 30;
        if (modelShow && modelShow["magTotalFrames"] != undefined) {
            magicTotal = modelShow["magTotalFrames"]
        }
        let effect = 0;
        let skillShow = BattleConfig.getInstance().skillDisplay[actionId + ""]
        if (skillShow && skillShow["effectTotalFrames"] != undefined) {
            effect = skillShow["effectTotalFrames"]
        }
        let beAttacked = 0;
        if (skillShow && skillShow["effectCruxFrame"] != undefined) {
            beAttacked = skillShow["effectCruxFrame"]
        }
        let frameRate = 24;
        if (skillShow && skillShow["effectFrameRate"]) {
            frameRate = skillShow["effectFrameRate"]
        }
        return {
            "physical": physical,
            "physicalTotal": afkTotalFrames,
            "magic": magic,
            "magicTotal": magicTotal,
            "effect": effect,
            "beAttacked": beAttacked,
            "frameRate": frameRate
        }
    }

    export function 物理攻击(action: any, obj: any) {
        let battleUnit = obj.getBattleUnitById(action.actorId).val;
        let moveTimeRange = 200;
        let skillTime = 200;
        let sufferSkillTime = 600;
        let moveBackTime = sufferSkillTime + 200;
        let moveBackTimeRange = 200;
        let actionResultPackArray = action.affectRecordPack;
        let targetId = actionResultPackArray[0][0].target.id;
        let target = obj.getBattleUnitById(targetId).val;
        let damageNumber = 0;
        let damagePackArray = [];
        let resultPackArray = [];

        let allActions = [];
        let moveAction = new Action.BaseAction(battleUnit.playMove.bind(battleUnit), moveTimeRange, target);
        allActions.push(moveAction);

        // if (action.actionId !== 100001) {
        battleUnit.playSkillName(action.actionId);
        // }

        let config = getAttackSequences(battleUnit.prefabId, parseInt(action.actionId));
        let attackType = "physical";
        let frameRate = 40;
        if (battleUnit.prefabId > 4000004) {
            frameRate = 24;
        }
        let turnRange = Math.floor((config[attackType] / frameRate + 0.1) * 1000);
        let attack = 0;
        let effect = Math.floor(config[attackType] / frameRate * 1000)
        let beAttack = Math.floor(config["beAttacked"] / config["frameRate"] * 1000) + effect;

        // damageArray.push(actionResultArray[0]);

        for (let i = 0; i < actionResultPackArray.length; ++i) {
            if (isDamagePack(actionResultPackArray[i][0])) {
                damagePackArray.push(actionResultPackArray[i]);
            } else {
                resultPackArray.push(actionResultPackArray[i]);
            }
        }
        damageNumber = damagePackArray.length;

        // 播放消耗动画
        allActions.push(new Action.BaseAction(obj.playCost.bind(obj), skillTime, action, battleUnit));

        // 播放打击，受击，伤害等动画
        let compActionArr = [];
        damagePackArray.map((damgePackResult, index) => {
            let actionArr = [];
            for (let i = 0; i < damgePackResult.length; ++i) {
                let unit = obj.getBattleUnitById(damgePackResult[i].target.id).val;
                if (isDamagePack(damgePackResult[i])) {
                    actionArr.push(new Action.BaseAction(obj.attack.bind(obj), attack, 100001, battleUnit, unit));
                    actionArr.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, 100001, unit));
                    actionArr.push(new Action.BaseAction(obj.beAttacked.bind(obj), beAttack, damgePackResult[i], unit));
                }
                actionArr.push(new Action.BaseAction(obj.processDamage.bind(obj), beAttack, damgePackResult[i], battleUnit, unit, obj));
            }
            compActionArr.push(new Action.CompondAction(actionArr, turnRange * index));
        });
        let damageAction = new Action.CompondAction(compActionArr, moveTimeRange);

        allActions.push(damageAction);

        // 播放结果动画： 恢复，Buff等
        let isFlyOut = false;
        for (let i = 0; i < resultPackArray.length; ++i) {
            let actionResultPack = resultPackArray[i];
            for (let j = 0; j < actionResultPack.length; ++j) {
                let unit = obj.getBattleUnitById(actionResultPack[j].target.id).val;
                allActions.push(new Action.BaseAction(obj.processResult.bind(obj), sufferSkillTime + 900 * damageNumber - 400, actionResultPack[j], unit));
                if (actionResultPack[j].type == ActionResultType.FLY_OUT) { // Battle.ActionResultType.FLY_OUT
                    isFlyOut = true;
                }
            }
        }

        // 回去的动画
        moveBackTime = moveTimeRange + 900 * damageNumber;
        allActions.push(new Action.BaseAction(battleUnit.playMoveBack.bind(battleUnit), moveBackTime));

        // 播放下一个包
        let nextPlayMCtime = moveBackTime + moveBackTimeRange + 50;
        if (isFlyOut) {
            nextPlayMCtime += 200;
        }
        allActions.push(new Action.BaseAction(obj.playMC.bind(obj), nextPlayMCtime));

        Action.excute(new Action.CompondAction(allActions, 0));
    }

    function isDamagePack (pack) {
        return pack && (pack.type == ActionResultType.DAMAGE || pack.isAbsorb)
    }

    /**
     * 单体多伤
     * 每次只能对单体造成伤害
     */
    export function 单体伤害(action: any, obj: any) {
        let battleUnit = obj.getBattleUnitById(action.actorId).val;
        let moveTimeRange = 200;
        let skillTime = 200;
        let sufferSkillTime = 600;
        let moveBackTime = sufferSkillTime + 200;
        let moveBackTimeRange = 200;
        let actionResultPackArray = action.affectRecordPack;
        let targetId = actionResultPackArray[0][0].target.id;
        let target = obj.getBattleUnitById(targetId).val;
        let damageNumber = 0;
        let damagePackArray = [];
        let resultPackArray = [];

        let allActions = [];

        let skill = BattleConfig.getInstance().skillDisplay[action.actionId];
        let isMove = skill ? (skill.isMove == 1) : false;
        let aoe = skill ? false : true;
        if (isMove) {
            let moveAction = new Action.BaseAction(battleUnit.playMove.bind(battleUnit), moveTimeRange, target);
            allActions.push(moveAction);
        }

        battleUnit.playSkillName(action.actionId);

        let config = getAttackSequences(battleUnit.prefabId, parseInt(action.actionId));
        let attackType = "physical";
        // if (isMove) {
        //     attackType = "physical";
        // }
        let frameRate = 40;
        if (battleUnit.prefabId > 4000004) {
            frameRate = 24;
        }
        let effectEndTime = Math.floor((config[attackType] / frameRate + config["effect"] / config["frameRate"] + 0.1) * 1000);
        // let turnRange = Math.floor((config[attackType] / frameRate + config["effect"] / config["frameRate"]) * 1000);
        let attack = 0;
        let effect = Math.floor(config[attackType] / frameRate * 1000);
        let beAttack = Math.floor(config["beAttacked"] / config["frameRate"] * 1000) + effect;
        let turnRange = beAttack + 100;
        if (isMove) {
            turnRange += 50;
            effect += 50;
            attack += 25;
            beAttack += 50;
        }

        // damageArray.push(actionResultArray[0]);

        for (let i = 0; i < actionResultPackArray.length; ++i) {
            if (isDamagePack(actionResultPackArray[i][0])) {
                damagePackArray.push(actionResultPackArray[i]);
            } else {
                resultPackArray.push(actionResultPackArray[i]);
            }
        }
        damageNumber = damagePackArray.length;

        // 播放消耗动画
        allActions.push(new Action.BaseAction(obj.playCost.bind(obj), skillTime, action, battleUnit));

        // 播放打击，受击，伤害等动画
        let compActionArr = [];
        damagePackArray.map((damgePackResult: Array<AffectRecord>, index) => {
            let actionArr = [];
            if (isMove && damgePackResult.length >= 1 && index >= 1) {
                let targetId = damgePackResult[0].target.id;
                let targetTemp = obj.getBattleUnitById(targetId).val;
                actionArr.push(new Action.BaseAction(battleUnit.playQuickMove.bind(battleUnit), 0, targetTemp));
            }
            for (let i = 0; i < damgePackResult.length; ++i) {
                let unit = obj.getBattleUnitById(damgePackResult[i].target.id).val;
                let sourceId = damgePackResult[i].sourceId;
                if (isDamagePack(damgePackResult[i])) {
                    actionArr.push(new Action.BaseAction(obj.attack.bind(obj), attack, action.actionId, battleUnit, unit));
                    actionArr.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, action.actionId, unit, damgePackResult[i].damageType));
                    actionArr.push(new Action.BaseAction(obj.beAttacked.bind(obj), beAttack, damgePackResult[i], unit));
                }
                actionArr.push(new Action.BaseAction(obj.processDamage.bind(obj), beAttack, damgePackResult[i], battleUnit, unit, obj));
            }
            compActionArr.push(new Action.CompondAction(actionArr, turnRange * index));
        });
        let damageAction = new Action.CompondAction(compActionArr, moveTimeRange);

        allActions.push(damageAction);

        // 播放结果动画： 恢复，Buff等
        let isFlyOut = false;
        let count = 0;
        for (let i = 0; i < resultPackArray.length; ++i) {
            let actionResultPack = resultPackArray[i];
            for (let j = 0; j < actionResultPack.length; ++j) {
                let unit = obj.getBattleUnitById(actionResultPack[j].target.id).val;
                ++count;
                
                if (actionResultPack[j].type === ActionResultType.DIE
                    || actionResultPack[j].type === ActionResultType.FLY_OUT) {
                    // isFlyOut = true;
                    allActions.push(new Action.BaseAction(obj.processResult.bind(obj), turnRange * damageNumber + moveTimeRange + count * 50, actionResultPack[j], unit));
                } else {
                    allActions.push(new Action.BaseAction(obj.processResult.bind(obj), turnRange * count + moveTimeRange + count * 50, actionResultPack[j], unit));
                }
            }
        }

        // 回去的动画
        moveBackTime = turnRange * damageNumber;
        if (isMove) {
            allActions.push(new Action.BaseAction(battleUnit.playMoveBack.bind(battleUnit), moveBackTime + moveTimeRange));
        }

        // 播放下一个包
        let nextPlayMCtime = moveBackTime + 50 + (isMove ? moveTimeRange * 2 : 0) + (effectEndTime - turnRange);
        if (isFlyOut) {
            nextPlayMCtime += 500;
        }
        allActions.push(new Action.BaseAction(obj.playMC.bind(obj), nextPlayMCtime));

        Action.excute(new Action.CompondAction(allActions, 0));
    }

    // 多体多伤
    // 每次可对多个目标造成伤害
    export function 群体伤害(action: any, obj: any) {
        let battleUnit = obj.getBattleUnitById(action.actorId).val;
        let moveTimeRange = 200;
        let skillTime = 200;
        let sufferSkillTime = 600;
        let moveBackTime = sufferSkillTime + 200;
        let moveBackTimeRange = 200;
        let actionResultPackArray = action.affectRecordPack;
        let targetId = actionResultPackArray[0][0].target.id;
        let target = obj.getBattleUnitById(targetId).val;
        let damageNumber = 0;
        let damagePackArray = [];
        let resultPackArray = [];

        let allActions = [];

        let skill = BattleConfig.getInstance().skillDisplay[action.actionId];
        let isMove = false ;// skill ? skill.isMove : false;
        let aoe = skill.effectLocation == 1;
        if (isMove) {
            let moveAction = new Action.BaseAction(battleUnit.playMove.bind(battleUnit), moveTimeRange, target);
            allActions.push(moveAction);
        }

        battleUnit.playSkillName(action.actionId);

        let config = getAttackSequences(battleUnit.prefabId, parseInt(action.actionId));
        let attackType = "magic";
        if (isMove) {
            attackType = "physical";
        }
        let frameRate = 40;
        if (battleUnit.prefabId > 4000004) {
            frameRate = 24;
        }
        let effectEndTime = Math.floor((config[attackType] / frameRate + config["effect"] / config["frameRate"] + 0.1) * 1000);
        let attack = 0;
        let effect = Math.floor(config[attackType] / frameRate * 1000);
        let beAttack = Math.floor(config["beAttacked"] / config["frameRate"] * 1000) + effect;
        let turnRange = beAttack + 100;
        if (isMove) {
            turnRange += 50;
            effect += 50;
            attack += 25;
            beAttack += 50;
        }
        
        // damageArray.push(actionResultArray[0]);

        for (let i = 0; i < actionResultPackArray.length; ++i) {
            if (isDamagePack(actionResultPackArray[i][0])) {
                damagePackArray.push(actionResultPackArray[i]);
            } else {
                resultPackArray.push(actionResultPackArray[i]);
            }
        }
        damageNumber = damagePackArray.length;

        // 播放消耗动画
        allActions.push(new Action.BaseAction(obj.playCost.bind(obj), skillTime, action, battleUnit));
        if (aoe) {
            allActions.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, action.actionId, obj.getBattleUnitById(R.path([0, 0, 'target', 'id'], damagePackArray)).val));
        }

        let compActionArr = [];
        damagePackArray.map((damgePackResult, index) => {
            let actionArr = [];

            if (isMove) {
                actionArr.push(new Action.BaseAction(battleUnit.playQuickMove, 0));
            }

            for (let i = 0; i < damgePackResult.length; ++i) {
                let unit = obj.getBattleUnitById(damgePackResult[i].target.id).val;
                let sourceId = parseInt(damgePackResult[i].sourceId)
                if (isDamagePack(damgePackResult[i])) {
                    actionArr.push(new Action.BaseAction(obj.attack.bind(obj), attack, action.actionId, battleUnit, unit));
                    actionArr.push(new Action.BaseAction(obj.beAttacked.bind(obj), beAttack, damgePackResult[i], unit));
                    if (!aoe) {
                        allActions.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, action.actionId, unit, damgePackResult[i].damageType));
                    } else if ("ABSOLUTE" == damgePackResult[i].damageType) {
                        allActions.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, action.actionId, unit, damgePackResult[i].damageType));
                    }
                }
                actionArr.push(new Action.BaseAction(obj.processDamage.bind(obj), beAttack, damgePackResult[i], battleUnit, unit, obj));
            }
            compActionArr.push(new Action.CompondAction(actionArr, 0));
        });
        let damageAction = new Action.CompondAction(compActionArr, moveTimeRange);
        allActions.push(damageAction);

        // 播放结果动画： 恢复，Buff等
        let isFlyOut = false;
        let count = 0;
        for (let i = 0; i < resultPackArray.length; ++i) {
            let actionResultPack = resultPackArray[i];
            for (let j = 0; j < actionResultPack.length; ++j) {
                let unit = obj.getBattleUnitById(actionResultPack[j].target.id).val;
                ++count;
                allActions.push(new Action.BaseAction (obj.processResult.bind(obj), turnRange + moveTimeRange - 200 + count * 50, actionResultPack[j], unit));
                // if (actionResultPack[j].type == 5) { // Battle.ActionResultType.FLY_OUT
                //     isFlyOut = true;
                // }
            }
        }

        // 回去的动画
        let delayTime = 0;
        moveBackTime = effectEndTime + delayTime;
        allActions.push(new Action.BaseAction(battleUnit.playMoveBack.bind(battleUnit), moveBackTime));

        // 播放下一个包
        let nextPlayMCtime = moveBackTime + 50;
        if (isFlyOut) {
            nextPlayMCtime += 500;
        }
        allActions.push(new Action.BaseAction(obj.playMC.bind(obj), nextPlayMCtime));

        Action.excute(new Action.CompondAction(allActions, 0));
    }

    export function 辅助(action: any, obj: any) {
        let battleUnit = obj.getBattleUnitById(action.actorId).val;
        let moveTimeRange = 200;
        let skillTime = 200;
        let sufferSkillTime = 600;
        let moveBackTime = sufferSkillTime + 200;
        let moveBackTimeRange = 200;
        let actionResultPackArray = action.affectRecordPack;
        let targetId = actionResultPackArray[0][0].target.id;
        let target = obj.getBattleUnitById(targetId).val;
        let damageNumber = 0;
        let damagePackArray = [];
        let resultPackArray = [];

        let allActions = [];

        let skill = BattleConfig.getInstance().skillDisplay[action.actionId];
        let aoe = skill.effectLocation == 1; //skill ? false : true;


        battleUnit.playSkillName(action.actionId);

        let config = getAttackSequences(battleUnit.prefabId, parseInt(action.actionId));
        let attackType = "magic";

        let frameRate = 40;
        if (battleUnit.prefabId > 4000004) {
            frameRate = 24;
        }
        let effectEndTime = Math.floor((config[attackType] / frameRate + config["effect"] / config["frameRate"] + 0.1) * 1000);
        let attack = 0;
        let effect = Math.floor(config[attackType] / frameRate * 1000);
        let beAttack = Math.floor(config["beAttacked"] / config["frameRate"] * 1000) + effect;
        let turnRange = beAttack + 100;
        
        // damageArray.push(actionResultArray[0]);

        for (let i = 0; i < actionResultPackArray.length; ++i) {
            if (actionResultPackArray[i][0] && actionResultPackArray[i][0].type == ActionResultType.DAMAGE) {
                damagePackArray.push(actionResultPackArray[i]);
            } else {
                resultPackArray.push(actionResultPackArray[i]);
            }
        }
        damageNumber = damagePackArray.length;

        // 播放消耗动画
        allActions.push(new Action.BaseAction(obj.attack.bind(obj), 0, action.actionId, battleUnit, target));
        allActions.push(new Action.BaseAction(obj.playCost.bind(obj), skillTime, action, battleUnit));

        if (aoe) {
            allActions.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, action.actionId, target));
        }

        // 播放结果动画： 恢复，Buff等
        let isFlyOut = false;
        let count = 0;
        for (let i = 0; i < resultPackArray.length; ++i) {
            let actionResultPack = resultPackArray[i];
            for (let j = 0; j < actionResultPack.length; ++j) {
                let unit = obj.getBattleUnitById(actionResultPack[j].target.id).val;
                ++count;
                allActions.push(new Action.BaseAction (obj.processResult.bind(obj), beAttack, actionResultPack[j], unit));
                if (!aoe) {
                    if (actionResultPack[j].type == 'RECOVER' && actionResultPack[j].value.hp == 0) {
                        // 如果恢复怒气则不显示动画
                    } else {
                        let sourceId = actionResultPack[j].sourceId;
                        allActions.push(new Action.BaseAction(obj.playEffect.bind(obj), effect, action.actionId, unit));
                    }
                }
            }
        }

        // 回去的动画
        let delayTime = 0;
        moveBackTime = effectEndTime + delayTime;
        allActions.push(new Action.BaseAction(battleUnit.playMoveBack.bind(battleUnit), moveBackTime));

        // 播放下一个包
        let nextPlayMCtime = moveBackTime + 50;
        allActions.push(new Action.BaseAction(obj.playMC.bind(obj), nextPlayMCtime));

        Action.excute(new Action.CompondAction(allActions, 0));
    }

    export function 鬼神泣(action: any, obj: any) {
        let battleUnit = obj.getBattleUnitById(action.actorId).val;
        let moveTimeRange = 200;
        let skillTime = 200;
        let sufferSkillTime = 600;
        let moveBackTime = sufferSkillTime + 400;
        let moveBackTimeRange = 200;
        let actionResultPackArray = action.affectRecordPack;
        let targetId = actionResultPackArray[0][0].target.id;
        let target = obj.getBattleUnitById(targetId).val;
        let damageNumber = 0;
        let damagePackArray = [];
        let resultPackArray = [];

        battleUnit.playSkillName(action.actionId);
        // damageArray.push(actionResultArray[0]);

        for (let i = 0; i < actionResultPackArray.length; ++i) {
            if (actionResultPackArray[i][0] && actionResultPackArray[i][0].type == ActionResultType.DAMAGE) {
                damagePackArray.push(actionResultPackArray[i]);
            } else {
                resultPackArray.push(actionResultPackArray[i]);
            }
        }
        damageNumber = damagePackArray.length;

        let allActions = [];
        allActions.push(new Action.BaseAction(obj.playCost.bind(obj), skillTime, action, battleUnit));
        allActions.push(new Action.BaseAction(obj.playEffect.bind(obj), 100, 101401, target));
        allActions.push(new Action.BaseAction(obj.attack.bind(obj), 900, 100001, battleUnit));
        allActions.push(new Action.BaseAction(obj.attack.bind(obj), 0, 101101, battleUnit));
        allActions.push(new Action.BaseAction(battleUnit.playMove.bind(battleUnit), 700, target));

        let compActionArr = [];
        damagePackArray.map((damgePackResult, index) => {
            let actionArr = [];
            for (let i = 0; i < damgePackResult.length; ++i) {
                let unit = obj.getBattleUnitById(damgePackResult[i].target.id).val;
                actionArr.push(new Action.BaseAction(obj.beAttacked.bind(obj), 150, damgePackResult[i], unit));
                actionArr.push(new Action.BaseAction(obj.processDamage.bind(obj), 150, damgePackResult[i], battleUnit, unit, obj));
            }
            compActionArr.push(new Action.CompondAction(actionArr, 350 * index));
        });
        let damageAction = new Action.CompondAction(compActionArr, 0);
        allActions.push(damageAction);

        let isFlyOut = false;
        for (let i = 0; i < resultPackArray.length; ++i) {
            let actionResultPack = resultPackArray[i];
            for (let j = 0; j < actionResultPack.length; ++j) {
                let unit = obj.getBattleUnitById(actionResultPack[j].target.id).val;
                allActions.push(new Action.BaseAction (obj.processResult.bind(obj), 2200, actionResultPack[j], unit));
                if (actionResultPack[j].type === ActionResultType.DIE
                    || actionResultPack[j].type === ActionResultType.FLY_OUT) { // Battle.ActionResultType.FLY_OUT
                    isFlyOut = true;
                }
            }
        }

        moveBackTime = 1700;
        allActions.push(new Action.BaseAction(battleUnit.playMoveBack.bind(battleUnit), moveBackTime));

        let nextPlayMCtime = moveBackTime + moveBackTimeRange + 50;
        if (isFlyOut) {
            nextPlayMCtime += 500;
        }
        allActions.push(new Action.BaseAction(obj.playMC.bind(obj), nextPlayMCtime));
        Action.excute(new Action.CompondAction(allActions, 0));
    }

}