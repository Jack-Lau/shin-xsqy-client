import SettingPage, { Page } from "./userCenter/SettingPagePanel";
import { EventDispatcher } from "../utils/event/EventDispatcher";
import { Notify } from "../config/Notify";
import { CommonUtils } from "../utils/CommonUtils";
import PlayerData from "../data/PlayerData";
import ExchangePanel from "../exchange/ExchangePanel";
import UpdateNewsPanel from "../login/UpdateNewsPanel";
import WalletPanel from "./wallet/WalletPanel";
import { GameConfig } from "../config/GameConfig";
import { TipsManager } from "../base/TipsManager";
import { NetUtils } from "../net/NetUtils";
import { Setting } from "../base/Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SettingPanel extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    switchMcVisibleBtn: cc.Button = null;
    @property(cc.Button)
    userCenterBtn: cc.Button = null;
    @property(cc.Button)
    musicBtn: cc.Button = null;
    @property(cc.Button)
    updateNewsBtn: cc.Button = null;
    @property(cc.Button)
    feedbackBtn: cc.Button = null;
    @property(cc.Button)
    exchangeBtn: cc.Button = null;
    @property(cc.Button)
    switchBtn: cc.Button = null;
    
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    accountIdLabel: cc.Label = null;
    @property(cc.Label)
    nthLabel: cc.Label = null;
    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;
    @property(cc.Label)
    totalPlayerLabel: cc.Label = null;

    @property(cc.Prefab)
    pagePrefab: cc.Prefab = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;

    @property([cc.SpriteFrame])
    playerIcons: Array<cc.SpriteFrame> = [];
    @property(cc.SpriteFrame)
    musicOnSf:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    musicOffSf:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    hideMcSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    showMcSf: cc.SpriteFrame = null;


    start () {
        this.switchMcVisibleBtn.node.on(cc.Node.EventType.TOUCH_END, this.changeRobotVisible.bind(this));
        this.userCenterBtn.node.on(cc.Node.EventType.TOUCH_END, this.openSettingPage(Page.USER_CENTER_1).bind(this));
        this.musicBtn.node.on(cc.Node.EventType.TOUCH_END, this.musicBtnOnClick.bind(this));
        this.updateNewsBtn.node.on(cc.Node.EventType.TOUCH_END, this.openUpdateNews.bind(this));
        this.feedbackBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showToDo);
        this.exchangeBtn.node.on(cc.Node.EventType.TOUCH_END, this.openExchange.bind(this));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, () => {});
        this.init();
        const visible = Setting.robotMcVisible.value
        this.switchMcVisibleBtn.getComponent(cc.Sprite).spriteFrame = visible ? this.showMcSf : this.hideMcSf; 
    }

    init() {
        this.accountIdLabel.string = '编号 ' + PlayerData.getInstance().accountId;
        this.nthLabel.string = '第' + PlayerData.getInstance().serialNumber + '位玩家';
        this.nameLabel.string= PlayerData.getInstance().playerName;
        this.playerIcon.spriteFrame = this.playerIcons[PlayerData.getInstance().prefabId - 4000001];
        this.initTotalPlayer();
        this.refreshMusicIcon();
    }

    async initTotalPlayer() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/player/count', []) as any;
        if (response.status === 0) {
            this.totalPlayerLabel.string = '当前游侠总数 ' + response.content;
        }
    }

    openSettingPage(page: Page) {
        return function() {
            this.node.active = false;
            let settingPage = cc.instantiate(this.pagePrefab).getComponent(SettingPage);
            settingPage.from = this.node;
            settingPage.init(page);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: settingPage});
        }.bind(this);
    }

    changeRobotVisible() {
        const visible = !Setting.robotMcVisible.value
        this.switchMcVisibleBtn.getComponent(cc.Sprite).spriteFrame = visible ? this.showMcSf : this.hideMcSf; 
        Setting.robotMcVisible.add(visible)
    }

    async openWallet() {
        // if (GameConfig.isFromKXQ && window['web3']) {
        if (window['web3'] && GameConfig.isFromKXQ) {
            if (!window['web3']) {
                TipsManager.showMessage('版本低于5.0的android手机暂时无法使用钱包╮(╯▽╰)╭');
            }
            let panel = await CommonUtils.getPanel('setting/walletPanel', WalletPanel) as WalletPanel;
            this.node.active = false;
            panel.from = this.node;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
        }
        // } else {
            // this.openSettingPage(Page.WALLET_1)();
            // CommonUtils.showToDo();
            // TipsManager.showMessage('请通过氪星球App打开块西游使用钱包');
        // }
    }

    async openExchange() {
        this.node.active = false;
        let prefab = await CommonUtils.getPanelPrefab('exchange/exchangePanel') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(ExchangePanel);
        panel.from = this.node;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: panel});
    }

    async openUpdateNews() {
        this.node.active = false;
        let updateNewsPrefab = await CommonUtils.getPanelPrefab('login/updateNews') as cc.Prefab;
        let updateNews = cc.instantiate(updateNewsPrefab).getComponent(UpdateNewsPanel);
        updateNews.from = this.node;
        [updateNews.node.x, updateNews.node.y] = [0, 0];
        EventDispatcher.dispatch(Notify.OPEN_PANEL, {panel: updateNews});
    }

    musicBtnOnClick () {
        // if (GameConfig.is138) {
            GameConfig.playMusic = !GameConfig.playMusic;
            EventDispatcher.dispatch(Notify.MUSIC_CHANGE, {});
            this.refreshMusicIcon();
        // } else {
        //     CommonUtils.showToDo();
        // }
    }

    refreshMusicIcon () {
        this.musicBtn.node.getComponent(cc.Sprite).spriteFrame = GameConfig.playMusic ? this.musicOnSf : this.musicOffSf;
    }

    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
}
