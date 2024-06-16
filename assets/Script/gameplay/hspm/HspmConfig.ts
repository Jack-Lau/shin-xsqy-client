import { ConfigUtils } from "../../utils/ConfigUtil";

export module HspmConfig {
    let configCache = null;

    export interface HspmItem {
        id: number,
        auctionId: number,
        name: string,
        type: number,
        floorPrice: number,
        PriceRise: number,
        time: number,
        hotShow: number,
    }

    export async function getConfigById (id: number): Promise<HspmItem> {
        let config = await initConfigCache();
        return R.prop(id, config);
    }

    export async function getConfig(): Promise<{[key: string]: HspmItem}> {
        return await initConfigCache();
    }

    async function initConfigCache () {
        if (!configCache) {
            configCache = await ConfigUtils.getConfigJson('BlackMarketAuctionInfo');
        }
        return configCache;
    }
}
