import { ConfigUtils } from "../../utils/ConfigUtil";

export module TitleConfig {
    interface TitleAttribute {
        name: string,
        value: number,
    }
    interface TitleInfo {
        name: string,
        color: number,
        attribute: Array<TitleAttribute>,
        picId: number,
        limitedQuantity: number,
        fc: number,
        type: number,
        id: number,
        description: string
        effectId: string,
        recommendedPrice: number
    }

    let initial: boolean = false;
    let config = {};
    let godConfig = null;
    export async function getConfigById(id: number): Promise<TitleInfo> {
        if (!initial) {
            config = await ConfigUtils.getConfigJson('TitleInformations');
            initial = true;
        }
        return config[id]
    }

    export async function getGodConfigById(id: number) {
        if (!godConfig) {
            godConfig = await ConfigUtils.getConfigJson('GodTitle')
        }
        let godInfo = godConfig[id];
        return {
            titleInfo: await getConfigById(godInfo.prototypeId),
            serialNum: godInfo['nowNumber']
        }
    }

    export async function getConfig() {
        if (!initial) {
            config = await ConfigUtils.getConfigJson('TitleInformations');
            initial = true;
        }
        return config;
    }
}
