import { ItemQuality, EquipmentPart } from "../bag/ItemConfig";
import Optional from "../cocosExtend/Optional";
import { activityFonts, activityPictures, currencyIds, petSkillIds } from "./AppendResConfig";

export namespace ResUtils {
	
    export let musics = {}
	
    export function loadMusic(url: string) {
        return new Promise<cc.AudioClip>(function (resolve, reject) {
            if (musics[url]) {
                resolve(musics[url]);
            } else {
                cc.resources.load(`music/${url}`, cc.AudioClip, (err: Error, audioClip) => {
                    if (err) {
                        cc.error(err.message || err);
                        reject();
                    }
                    musics[url] = audioClip;
                    resolve(audioClip as cc.AudioClip);
                });
            }
        });
    } 

    // 加载单张图片
    export function loadSprite(url: string) {
        return new Promise<cc.SpriteFrame>(function (resolve, reject) {
            cc.resources.load(url, cc.SpriteFrame, function (err: Error, spriteFrame) {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                resolve(spriteFrame as cc.SpriteFrame);
            });
        });
    }
	
    // 加载 SpriteAtlas（图集），并且获取其中的一个 SpriteFrame
    // 注意 atlas 资源文件（plist）通常会和一个同名的图片文件（png）放在一个目录下, 
    // 所以需要在第二个参数指定资源类型
    export function loadSpriteFromAltas(url: string, name: string) {
        return new Promise<cc.SpriteFrame>(function (resolve, reject) {
            cc.resources.load(url, cc.SpriteAtlas, function (err: Error, atlas) {
                if (err) {
                    cc.error(err.message || err);
                    return;
                }
                let spriteFrame = (atlas as cc.SpriteAtlas).getSpriteFrame(name);
                if (spriteFrame) {
                    resolve(spriteFrame);
                } else {
                    cc.error(url + ' doesnt contain ' + name);
                }
            });
        });
    }

    export async function getCurrencyIconbyId(iconId: number) {
        const item = currencyIds[iconId]
        if (item) {
            return loadSprite(item.big)
        } else {
            return await ResUtils.loadSpriteFromAltas('ui/icon/currency_icon', iconId.toString())
        }
    }

    export async function getSmallCurrencyIconbyId(iconId: number) {
        const item = currencyIds[iconId]
        if (item) {
            return loadSprite(item.small)
        } else {
            return await ResUtils.loadSpriteFromAltas('ui/icon/item_icon', 'currency_icon_' + iconId.toString())
        }
    }

    export async function getItemFrameByQuality(q: ItemQuality) {
        let name = 'bg_lvsepinzhi';
        switch (q) {
            case ItemQuality.White: { name = 'bg_baisepinzhi'; break; }
            case ItemQuality.Green: { name = 'bg_lvsepinzhi'; break; }
            case ItemQuality.Blue: { name = 'bg_lansepinzhi'; break; }
            case ItemQuality.Purple: { name = 'bg_zisepinzhi'; break; }
            case ItemQuality.Orange: { name = 'bg_chengsepinzhi'; break; }
            case ItemQuality.Gold: { name = 'bg_chengsepinzhi'; break; }
        }
        let sf = await loadSpriteFromAltas('ui/basic/item_frame', name);
        return sf;
    }

    export async function getEquipmentIconById(iconId: number) {
        return await ResUtils.loadSpriteFromAltas('ui/icon/equipment_icon', 'icon_item_' + iconId.toString())
    }
    
    export async function getEquipmentByIcon(name: string) {
        let sf = await loadSpriteFromAltas('ui/icon/equipment_icon', "icon_item_" + name);
        return sf;
    }

    export async function getEmptyEquipmentIconByPart(part: EquipmentPart) {
        let name = 'icon_wuqi';
        switch (part) {
            case EquipmentPart.Weapon: { name = 'icon_wuqi'; break; }
            case EquipmentPart.Head: { name = 'icon_toubu'; break; }
            case EquipmentPart.Necklace: { name = 'icon_xianglian'; break; }
            case EquipmentPart.Belt: { name = 'icon_shipin'; break; }
            case EquipmentPart.Shoes: { name = 'icon_xiezi'; break; }
            case EquipmentPart.Clothes: { name = 'icon_yifu'; break; }
        }
        return await loadSpriteFromAltas('ui/base/playerPanel/playerPanel', name);
    }

    export async function getPlayerRectIconById(prefabId: number) {
        return await loadSpriteFromAltas('original/icon/icon_model', 'icon_model-head_rect_' + prefabId);
    }

    export async function getPlayerCircleIconById(prefabId: number) {
        return await loadSpriteFromAltas('original/icon/icon_model', 'icon_model-head_circle_' + prefabId);
    }

    export async function getSchoolIconById(schoolId: Optional<number>) {
        if (schoolId.isValid()) {
            return await loadSpriteFromAltas('ui/icon/school_icon', "school_icon_" + schoolId.getValue());
        } else {
            return await loadSpriteFromAltas('ui/icon/school_icon', "school_icon_0");
        }
    }

    export async function getPetSkillIconById(skillId: number) {
        const path = petSkillIds[skillId]
        if (path) {
            return await loadSprite(path)
        } else {
            return await loadSpriteFromAltas('ui/icon/pet_skill_icon', skillId.toString());
        }
    }
    
    export async function getPetHeadIconById(prefabId: number) {
        return await loadSpriteFromAltas('ui/icon/pet_head_icon', prefabId.toString());
    }

    export async function getPetActSkillIconById(skillId: number) {
        return await loadSpriteFromAltas('ui/icon/pet_active_skill_icon', skillId.toString()+'_1');
    }

    function switch_159012_159013(name: string) {
        if (name.startsWith("159012")) {
            return name.replace("159012", "159013")
        } else if (name.startsWith("159013")) {
            return name.replace("159013", "159012")
        } else {
            return name
        }
    }

    export async function getActivityFont(name: string) {
        name = switch_159012_159013(name)
        if (activityFonts[name]) {
            return await loadSprite(activityFonts[name])
        } else {
            return await loadSpriteFromAltas('ui/gameplay/activityEntry/activityFont', name);
        }
    }

    export async function getActivityIcon(name: string) {
        name = switch_159012_159013(name)
        if (activityPictures[name]) {
            return await loadSprite(activityPictures[name])
        } else {
            return await loadSpriteFromAltas('ui/gameplay/activityEntry/activityIconBing', name)
        }
    }

    export async function getTitleIconById(titleId: number) {
        return loadSpriteFromAltas('ui/icon/icon_title', `icon_title_${titleId}`);
    }

    export async function getBagTitleIcon() {
        return await loadSpriteFromAltas('ui/icon/item_icon', 'icon_item_40099')
    }

    // equipment big icon
    export async function getEquipmentBigIcon(iconId: number) {
        return await loadSpriteFromAltas('ui/icon/equipment_tip_icon', String(iconId))
    }

    // equipment effect icons 
    export async function getEquipmentEffectIcon(effectId: number) {
        return await loadSpriteFromAltas('ui/icon/equipment_tip_icon', String(effectId))
    }

    export async function getExhibitIcon(iconId: number, isBig: boolean) {
        let ext = isBig ? '_big' : '';
        return await loadSpriteFromAltas('ui/icon/item_icon', `exhibit_${iconId}${ext}`)
    }

}
