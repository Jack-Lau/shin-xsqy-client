import CommonPanel from "../../base/CommonPanel";
import { CommonUtils } from "../../utils/CommonUtils";
import ArticleItem from "./ArticleItem";
import BagData from "../../bag/BagData";
import BagItem from "../../bag/BagItem";
import PlayerData from "../../data/PlayerData";
import { Notify } from "../../config/Notify";
import BagToTreasurePanel from "./BagToTreasurePanel";
import { TipsManager } from "../../base/TipsManager";
import { GameConfig } from "../../config/GameConfig";
import WalletPanel from "../../setting/wallet/WalletPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import SettingPage, { Page } from "../../setting/userCenter/SettingPagePanel";
import PagingControl from "../../base/PagingControl";
import MysteryStorePanel from "../mysteryStore/MysteryStorePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BagPanel extends CommonPanel {
    //*按钮事件
    @property(cc.Button)
    closeBtn: cc.Button = null;
    /**添加仙石 */
    @property(cc.Button)
    addBtn151: cc.Button = null;

    /**变废为宝 */
    @property(cc.Button)
    toTreasureBtn: cc.Button = null;
    //
    @property(PagingControl)
    page: PagingControl = null;
    //显示数字
    @property(cc.Label)
    currency150: cc.Label = null;
    @property(cc.Label)
    currency151: cc.Label = null;

    @property(cc.Node)
    articleLayout: cc.Node = null;

    /**每页显示 */
    @property()
    readonly MAX_ITEM: number = 30;

    /**背包格子列表 */
    articleItems: Array<ArticleItem> = [];

    isInit: Boolean = true;

    /** */
    async start() {
        this.init();
        this.initEvents();

        EventDispatcher.on(Notify.BAG_ITEM_CHANGE, this.bagItemOnChange);
    }

    async init() {
        this.articleLayout.getComponentsInChildren(ArticleItem).forEach((item, index) => {
            this.articleItems.push(item);
        })
        this.page.init(BagData.getInstance().getItemPageNum(), this.switchPage.bind(this));

    }

    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.toTreasureBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.toTreasurePanel.bind(this)));
        this.addBtn151.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.addCurrency151.bind(this)));
    }

    async addCurrency151() {
        let panel = await CommonUtils.getPanel("gameplay/mysteryStore/mysteryStorePanel", MysteryStorePanel);
        this.closePanel();
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        // if (GameConfig.isFromKXQ && window['web3']) {
        //     if (!window['web3']) {
        //         TipsManager.showMessage('版本低于5.0的android手机暂时无法使用钱包╮(╯▽╰)╭');
        //     }
        //     let panel = await CommonUtils.getPanel('setting/walletPanel', WalletPanel) as WalletPanel;
        //     this.node.active = false;
        //     panel.from = this.node;
        //     EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        // } else {
        //     this.node.active = false;
        //     let settingPage = await CommonUtils.getPanel('setting/settingPagePanel', SettingPage) as SettingPage;
        //     settingPage.from = this.node;
        //     settingPage.init(Page.WALLET_1);
        //     EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: settingPage });
        // }
    }

    async toTreasurePanel() {
        let panel = await CommonUtils.getPanel('gameplay/bag/BagToTreasurePanel', BagToTreasurePanel) as BagToTreasurePanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        this.node.active = false;
        panel.from = this.node;
        return panel;
    }

    // update (dt) {}

    refreshState() {
        //处理 显示
        this.refresh();
        super.refreshState();
    }

    async refresh() {
        let bagItems: Array<BagItem> = BagData.getInstance().getItemsByPage(this._state.value);
        this.currency151.string = PlayerData.getInstance().kbAmount.toString();
        this.currency150.string = PlayerData.getInstance().ybAmount.toString();

        for (let i = bagItems.length; i < this.articleItems.length; i++) {
            this.articleItems[i].recovery();
        }
        for (let i = 0; i < this.articleItems.length; i++) {
            this.articleItems[i].recovery();
            if (bagItems[i] != null) {
                this.articleItems[i].init(bagItems[i], true);
            }
        }
        this.page.setPage(this._state.value+1);
    }


    /**切换页 */
    switchPage(page) {
        this.setState(page - 1)//设置页 数据地址
    }
    closePanel() {
        EventDispatcher.off(Notify.BAG_ITEM_CHANGE, this.bagItemOnChange);
        CommonUtils.safeRemove(this.node);
    }

    bagItemOnChange = function () {
        this.page.setMax(BagData.getInstance().getItemPageNum());
        this.setState(this.page.currentPage - 1);
    }.bind(this);
}
