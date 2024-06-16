import { ModelOffset } from "../config/ModelOffset";
import { BattleConfig } from "../battle/BattleConfig";

export namespace MovieclipUtils {

    export function getOffset(name: string): cc.Vec2 {
        if (name in ModelOffset.offset) {
            return ModelOffset.offset[name];
        } else if (ModelOffset.offset[name.split('_')[0] + '_stand_d']) {
            return ModelOffset.offset[name.split('_')[0] + '_stand_d'];
        } else {
            return new cc.Vec2(0.5, 0.5);
        }
    }

    const prefabIds = [4200032, 4200034, 4200034, 4200035]

    export function getMovieclip(prefabId: number, status: string, sample: number, wrapMode = cc.WrapMode.Loop) {
        return new Promise<cc.AnimationClip>(function (resolve, reject) {
            let realStatus = status;
            if (prefabId >= 4200009 && prefabId <= 4200099 && prefabIds.indexOf(prefabId) == -1) {
                realStatus = "stand_d"
            }
            cc.resources.load('movieclip/' + prefabId + '/' + prefabId + '_' + realStatus, cc.SpriteAtlas, function (err, atlas) {
                if (err) {
                    reject(err);
                    return;
                }
                let spriteFrames = (atlas as cc.SpriteAtlas).getSpriteFrames();
                let movieclip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, sample);
                movieclip.wrapMode = wrapMode;
                movieclip.name = prefabId + '_' + status;
                resolve(movieclip);
            });
        })
    }

    export function getMovieclipRaw(url: string, name: string, sample: number, wrapMode = cc.WrapMode.Loop) {
        return new Promise<cc.AnimationClip>(function (resolve, reject) {
            cc.resources.load(url, cc.SpriteAtlas, function (err, atlas) {
                if (err) {
                    reject(err);
                    return;
                }
                let spriteFrames = (atlas as cc.SpriteAtlas).getSpriteFrames();
                let movieclip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, sample);
                movieclip.wrapMode = wrapMode;
                movieclip.name = name;
                resolve(movieclip);
            });
        })
    }

    export function getEffectClipData(url: string, sample) {
        return new Promise<cc.AnimationClip>(function (resolve, reject) {
            cc.resources.load(url, cc.SpriteAtlas, function (err, atlas) {
                if (err) {
                    reject(err);
                    return;
                }
                let spriteFrames = (atlas as cc.SpriteAtlas).getSpriteFrames();
                let movieclip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, sample);
                movieclip.wrapMode = cc.WrapMode.Loop;
                resolve(movieclip);
            });
        })
    }

    export function setEffectClipData(url: string, sample: number, mode: cc.WrapMode, callback) {
        cc.resources.load(url, cc.SpriteAtlas, function (err, atlas) {
            if (err) {
                console.error(err);
                return;
            }
            let spriteFrames = (atlas as cc.SpriteAtlas).getSpriteFrames();
            let movieclip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, sample);
            movieclip.wrapMode = mode;
            callback(movieclip);
        })
    }

    export function getSpWithAnimation(ac: cc.AnimationClip) {
        let sprite = new cc.Sprite();
        sprite.node = new cc.Node();
        sprite.addComponent(cc.Animation).addClip(ac, ac.name);
        return sprite;
    }

    export async function initMc(prefabId: number, weaponId: number, playerMc: cc.Sprite, weaponMc: cc.Sprite, status: string) {
        let playerClip = await getMovieclip(prefabId, status, 10) as cc.AnimationClip;
        let weaponClip = await getMovieclip(weaponId, status, 10) as cc.AnimationClip;
        playerMc.getComponent(cc.Animation).addClip(playerClip, status);
        weaponMc.getComponent(cc.Animation).addClip(weaponClip, status);
        let anchor = getOffset(prefabId + "_" + status);
        playerMc.node.anchorX = anchor.x;
        playerMc.node.anchorY = anchor.y;
        weaponMc.node.anchorX = anchor.x;
        weaponMc.node.anchorY = anchor.y;
        playerMc.getComponent(cc.Animation).play(status);
        weaponMc.getComponent(cc.Animation).play(status);
    }

    export async function loadMcBySummon(prefabId: number, type: string) {
        let battleStatus = ["attack", "die", "hit", "idle", "magic"];
        let resArray = battleStatus.map(status => 'movieclip/' + prefabId + '/' + prefabId + "_" + status + "_" + type)

        let resources = await loadResArray(resArray);

        resources.forEach(element => {
            let key = element._name.split('.')[0];
            BattleConfig.getInstance().res[key] = element;
        });
    }

    export async function loadSkillsBySummon(skillResNames: Array<string>) {
        let resources = await loadResArray(skillResNames);

        resources.forEach(element => {
            let key = element._name.split('.')[0];
            BattleConfig.getInstance().res[key] = element;
        });
    }

    export async function loadResArray(resArray: Array<string>) {
        return new Promise<Array<any>>(function (resolve) {
            let completeCallback = (err: Error, res: any[]) => {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                resolve(res);
            }
            cc.resources.load(resArray, cc.SpriteAtlas, completeCallback);
        });
    }
}
