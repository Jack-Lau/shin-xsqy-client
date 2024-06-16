import Optional from "../../cocosExtend/Optional";
import { NetUtils } from "../../net/NetUtils";
import { PetDetail, Pet } from "../../net/Protocol";
import SideEffect from "../../cocosExtend/Effect";
import { ConfigUtils } from "../../utils/ConfigUtil";
import PlayerData from "../../data/PlayerData";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ItemQuality } from "../../bag/ItemConfig";


export interface PetConfigItem {
    id: number;
    name: string;
    prefabId: number;
    modelScale: number;
    color: number;
    isMagic: boolean;
    isLimited: boolean;
    lifeApt: {
        max: number;
        min: number;
    };
    atkApt: {
        max: number;
        min: number;
    };
    pDefApt: {
        max: number;
        min: number;
    };
    mDefApt: {
        max: number;
        min: number;
    };
    spdApt: {
        max: number;
        min: number;
    };
    star: {
        max: number;
        min: number;
    }
    activeSkill: {
        fst: number;
        snd: number;
    }

    maxSkillNum: number;
    description: string;
    recommendedPrice: number;
}

export interface PetSkillConfigItem {
    id: number;
    isActive: boolean;
    category: number;
    isNormal: boolean;
    icon: number;
    name: string;
    description: string;
    showType: string;
    recommendedPrice: number;
}

export interface PetAttributes {
    hp: number,
    atk: number,
    pDef: number,
    mDef: number,
    spd: number,
    fc: number
}
export interface PetAbilityStudy {
    successRate: number,
    currencyId: number,
    amount: number,
    abilityAmount: number,
    currencyName: string,
    id: number
}

export module PetData {
    let petIds: Array<number> = [];
    let petData: { [key: number]: PetDetail } = {};
    let petConfig: { [key: number]: PetConfigItem } = {};
    let petSkillConfig: { [key: number]: PetSkillConfigItem } = {};
    let petAbilityStudys: Array<PetAbilityStudy> = [];
    let petConfigIsReady: boolean = false;
    let petSkillConfigIsReady: boolean = false;
    let petAbilityStudyIsReady: boolean = false;
    export function getPetNum() {
        return petIds.length;
    }

    export function getAllPetIds() {
        return R.clone(petIds);
    }

    export async function testLogAllPets() {
        return await getPets(petIds);
    }
    export async function getAllPets() {
        return await getPets(petIds);
    }
    export function getPetMaxPage() {
        return Math.ceil(petIds.length / 4);
    }

    export function sortIds(): SideEffect {
        let bpId1 = PlayerData.getInstance().battlePetId1;
        let bpId2 = PlayerData.getInstance().battlePetId2;
        let bpId3 = PlayerData.getInstance().battlePetId3;
        if (bpId3.valid) {
            petIds = R.prepend(bpId3.val, R.remove(petIds.indexOf(bpId3.val), 1, petIds));
        }
        if (bpId2.valid) {
            petIds = R.prepend(bpId2.val, R.remove(petIds.indexOf(bpId2.val), 1, petIds));
        }
        if (bpId1.valid) {
            petIds = R.prepend(bpId1.val, R.remove(petIds.indexOf(bpId1.val), 1, petIds));
        }
        return SideEffect.getInstance('sortIds after modify battle list')
    }

    export async function getPetsByPage(pageNum: number, pageSize = 4) {
        return await getPets(R.slice(pageNum * pageSize, (pageNum + 1) * pageSize, petIds));
    }

    export async function getPets(petIds: Array<number>): Promise<Array<Optional<PetDetail>>> {
        let newPetIds = R.filter(id => petData[id] == undefined, petIds);
        if (newPetIds.length > 0) {
            await batchUpdatePetInfo(newPetIds);
        }
        return petIds.map(getPetById);
    }

    function getPetById(id: number): Optional<PetDetail> {
        return new Optional<PetDetail>(R.prop(id, petData));
    }

    async function batchUpdatePetInfo(ids: Array<number>) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/viewDetail', [ids.join(',')]);
        let infoArr = [];
        if (response.status === 0) {
            infoArr = response.content;
        }
        infoArr.forEach(info => {
            updatePetInfo(info, false);
        });
    }

    export function updatePetInfo(info: PetDetail | any, dispatch: boolean = true): SideEffect {
        if (!info) return;
        petData[info.pet.id] = info;

        if (dispatch) {
            let index = petIds.indexOf(info.pet.id);
            if (index != -1) {
                index += 1;
                EventDispatcher.dispatch(Notify.PET_DATA_CHANGE, { page: Math.ceil(index / 4), id: info.pet.id });
            }
        }
        return SideEffect.getInstance('update pet info');
    }

    export async function requestPetInfo(ids: Array<number>) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/viewDetail', [ids.join(',')]);
        if (response.status === 0) {
            return response.content;
        } else {
            return [];
        }
    }

    export async function updatePetIds() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/view/mine/id', []);
        if (response.status === 0) {
            petIds = response.content;
            sortIds();
        }
    }

    // pet config 
    async function _initPetConfig() {
        let config = await ConfigUtils.getConfigJson('PetInformations');
        for (let key in config) {
            let value = R.prop(key, config);
            let isMagic = R.prop('type', value) == 1;
            let item: PetConfigItem = {
                id: R.prop('id', value),
                name: R.prop('petName', value),
                prefabId: R.prop('prefabId', value),
                modelScale: R.prop('modelScale', value),
                color: R.prop('color', value),
                isMagic: isMagic,
                isLimited: R.prop('limited', value) == 1,
                lifeApt: {
                    max: R.prop('生命资质上限', value),
                    min: R.prop('生命资质下限', value),
                },
                atkApt: {
                    max: R.prop('攻击资质上限', value),
                    min: R.prop('攻击资质下限', value),
                },
                pDefApt: {
                    max: R.prop('物防资质上限', value),
                    min: R.prop('物防资质下限', value),
                },
                mDefApt: {
                    max: R.prop('法防资质上限', value),
                    min: R.prop('法防资质下限', value),
                },
                spdApt: {
                    max: R.prop('速度资质上限', value),
                    min: R.prop('速度资质下限', value),
                },
                star: {
                    max: R.prop('maxAddStar', value),
                    min: R.prop('minAddStar', value),
                },
                activeSkill: {
                    fst: R.path(['activeSkill', 0, 'id'], value),
                    snd: R.path(['activeSkill', 1, 'id'], value),
                },
                maxSkillNum: R.prop('maxAbilityCount', value),
                description: R.prop('description', value),
                recommendedPrice: R.prop('recommendedPrice', value)
            }
            petConfig[key] = item;
        }
    }

    export async function getConfigById(id: number): Promise<Optional<PetConfigItem>> {
        await initPetConfig();
        return new Optional<PetConfigItem>(petConfig[id]);
    }

    export async function getPetConfig(){
        await initPetConfig();
        return petConfig;
    }

    export async function initPetConfig() {
        if (!petConfigIsReady) {
            await _initPetConfig();
            petConfigIsReady = true;
        }
    }

    /**
     * 调用此方法请确保已经调用  @function initPetConfig
     * @param id 宠物原型ID
     */
    export function syncGetConfig(id: number): Optional<PetConfigItem> {
        return new Optional<PetConfigItem>(petConfig[id]);
    }

    // pet skill config
    async function initPetSkillConfig() {
        let config = await ConfigUtils.getConfigJson('PetAbilityInformation');
        for (let key in config) {
            let value = R.prop(key, config);
            let item: PetSkillConfigItem = {
                id: R.prop('id', value),
                name: R.prop('name', value),
                isActive: R.prop('type', value) == 1,
                category: R.prop('classification', value),
                isNormal: R.prop('abilityClass', value) == 0,
                icon: R.prop('icon', value),
                description: R.prop('description', value),
                showType: R.prop('showType', value),
                recommendedPrice: R.prop('recommendedPrice', value)
            }
            petSkillConfig[key] = item;
        }
    }

    export async function getPetSkillInfoById(id: number): Promise<Optional<PetSkillConfigItem>> {
        if (!petSkillConfigIsReady) {
            await initPetSkillConfig();
            petSkillConfigIsReady = true;
        }
        return new Optional<PetSkillConfigItem>(petSkillConfig[id])
    }

    export async function getPetSkillConfig() {
        if (!petSkillConfigIsReady) {
            await initPetSkillConfig();
            petSkillConfigIsReady = true;
        }
        return petSkillConfig;
    }

    // 资质到属性的计算
    const param1 = 400;
    const param2 = 10;

    function calculate(ap, star, param3, param4) {
        let level = PlayerData.getInstance().playerLevel;
        return star * (Math.floor(Math.max(1, (level + param1) * (ap + param2) * param3 + param4)));
    }

    export async function getAttributes(petDetail: PetDetail): Promise<PetAttributes> {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/view/{id}/parameters', [petDetail.pet.id]);
        if (response.status === 0) {
            let arr = response.content;
            let obj = {};
            arr.forEach(ele => {
                obj[ele.name] = ele.value;
            });
            let config = await getConfigById(petDetail.pet.definitionId);
            let isMagic = config.valid ? config.val.isMagic : false;
            return {
                hp: Math.floor(obj['最大生命']),
                atk: isMagic ? Math.floor(obj['法伤']) : Math.floor(obj['物伤']),
                pDef: Math.floor(obj['物防']),
                mDef: Math.floor(obj['法防']),
                spd: Math.floor(obj['速度']),
                fc: Math.floor(obj['战斗力']),
            }
        }
    }

    function geBaseFc(petDetail: PetDetail) {
        let level = PlayerData.getInstance().playerLevel;
        return Math.floor((level + 400) * (petDetail.pet.sortingIndex + 100) * 0.004 + 490);
    }

    export function getSkillFc(petDetail: PetDetail) {
        if (petSkillConfigIsReady) {
            return 0;
        }
        let skillInfos = petDetail.pet.abilities.map(id => new Optional<PetSkillConfigItem>(petSkillConfig[id])).map(info => info.fmap(x => x.isNormal))
        let normalSkillNum = R.filter(x => x.valid && x.val, skillInfos).length;
        let goodSkillNum = R.filter(x => x.valid && !x.val, skillInfos).length;
        return normalSkillNum * 250 + goodSkillNum * 650
    }

    export function getRecommendValue(config: PetConfigItem) {
        return Math.floor((config.lifeApt.max * 17 + config.atkApt.max * 25 + config.pDefApt.max * 19
            + config.mDefApt.max * 19 + config.spdApt.max * 20) / 10);
    }

    export function getQualityByColor(color: number) {
        switch (color) {
            case 1: return ItemQuality.White;
            case 2: return ItemQuality.Green;
            case 3: return ItemQuality.Blue;
            case 4: return ItemQuality.Purple;
            case 5: return ItemQuality.Orange;
            case 6: return ItemQuality.Gold;
            default: return ItemQuality.Green;
        }
    }

    export async function getPetAbilityStudy() {
        if (!petAbilityStudyIsReady) {
            await initPetAbilityStudy();
            petAbilityStudyIsReady = true;
        }
        return new Optional<Array<PetAbilityStudy>>(petAbilityStudys);
    }

    async function initPetAbilityStudy() {
        petAbilityStudys = R.values(await ConfigUtils.getConfigJson('PetAbilityStudy'))
    }

    export async function getGodPet(): Promise<Pet> {
        return null;
    }

}
