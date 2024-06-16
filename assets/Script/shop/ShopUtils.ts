import { ConfigUtils } from "../utils/ConfigUtil";
import Optional from "../cocosExtend/Optional";
import { CommonUtils } from "../utils/CommonUtils";
import CommonShopPanel from "./CommonShopPanel";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";

export module ShopUtils {
    export interface ShopCommodity {
        id: number,
        currencyId: number,
        currencyName: string,
        purchaseCurrencyId: number,
        purechaseCurrencyName: string,
        unitPrice: number,
        resetCondition: number,
        allowBatchBuy: number,
        tag: number,
        rawPrice: number,
    }

    export async function getConfig(): Promise<any> {
        return await ConfigUtils.getConfigJson('ShopCommodity');
    }

    export async function getConfigById(commodityId): Promise<Optional<ShopCommodity>> {
        let config = await getConfig();
        return new Optional<ShopCommodity>(R.prop(commodityId, config));
    }

    export async function openShopPanel(shopId: number) {
        let panel = await CommonUtils.getPanel('shop/commonShopPanel', CommonShopPanel) as CommonShopPanel;
        panel.init(shopId);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

}
