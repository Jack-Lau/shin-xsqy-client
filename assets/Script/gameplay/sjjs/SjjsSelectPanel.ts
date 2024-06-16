import { CommonUtils } from "../../utils/CommonUtils";
import { TipsManager } from "../../base/TipsManager";
import CommonPanel from "../../base/CommonPanel";
import MapConfig from "../../config/MapConfig";
import { SjjsTeamInfo } from "./SjjsTeamInfo";
import ItemConfig from "../../bag/ItemConfig";
import PlayerData from "../../data/PlayerData";
import { NetUtils } from "../../net/NetUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import { ResUtils } from "../../utils/ResUtils";

const { ccclass, property } = cc._decorator;

interface SjjsSelectState {
    teamId: number,
    mapId: number;
}

@ccclass
export default class SjjsSelectPanel extends CommonPanel {
	
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.ToggleContainer)
    mapContainer: cc.ToggleContainer = null;
    @property([cc.Sprite])
    greySpArr: Array<cc.Sprite> = [];

    @property(cc.ToggleContainer)
    teamContainer: cc.ToggleContainer = null;
    
    @property(cc.Sprite)
    titleSp: cc.Sprite = null;
    @property(cc.Sprite)
    picSp: cc.Sprite = null;
    @property(cc.Label)
    efficiencyLabel: cc.Label = null;
    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Label)
    percentLabel: cc.Label = null;
    @property(cc.RichText)
    contentRT: cc.RichText = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Label)
    ownLabel: cc.Label = null;
    @property(cc.Sprite)
    currencyIcon: cc.Sprite = null;
    @property(cc.Label)
    costLabel: cc.Label = null;
    
    @property(cc.Sprite)
    lapDownSp: cc.Sprite = null;
    @property(cc.Sprite)
    blockBg: cc.Sprite = null;
    
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    
    @property(cc.SpriteFrame)
    ybSf: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    kbSf: cc.SpriteFrame = null;
    
    // 二次确认框
    @property(cc.Node)
    secondConfirmNode: cc.Node = null;
    @property(cc.Button)
    sCloseBtn: cc.Button = null;
    @property(cc.Label)
    sPriceLabel: cc.Label = null;
    @property(cc.Label)
    sAPCostLabel: cc.Label = null;
    @property(cc.Label)
    sYbCostLabel: cc.Label = null;
    @property(cc.Label)
    sOwnLabel: cc.Label = null;
    @property(cc.Button)
    sConfirmBtn: cc.Button = null;
    
    @property(cc.Label)
    totalBenefitLabel: cc.Label = null;
    @property(cc.Sprite)
    benefitIcon: cc.Sprite = null;
    
    prices = {};
    ybCost: number = 0;
    apCost: number = 0;
    
    start() {
    }
    
    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/idleMine/price', []);
        if (response.status === 0) {
            response.content.forEach(ele => {
                this.prices[ele.mapId] = ele;
            })
        }
        this.initEvents();
        this.greySpArr.forEach(ele => CommonUtils.grey(ele));
        this._state.value = {
            teamId: 4420001,
            mapId: 1,
        }
    }
    
    initEvents() {
        this.blockBg.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.greySpArr.forEach(ele => ele.node.on(cc.Node.EventType.TOUCH_END, () => { TipsManager.showMessage('即将开放') }));
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.confirmBtnOnClick.bind(this));
    
        // mapIcon
        this.mapContainer.node.children[0].on(cc.Node.EventType.TOUCH_END, this.changeMapState(1).bind(this));
        this.mapContainer.node.children[1].on(cc.Node.EventType.TOUCH_END, this.changeMapState(2).bind(this));
		this.mapContainer.node.children[2].on(cc.Node.EventType.TOUCH_END, this.changeMapState(3).bind(this));
        this.mapContainer.node.children[3].on(cc.Node.EventType.TOUCH_END, this.changeMapState(4).bind(this));
        this.mapContainer.node.children[4].on(cc.Node.EventType.TOUCH_END, this.changeMapState(5).bind(this));
        this.mapContainer.node.children[6].on(cc.Node.EventType.TOUCH_END, this.changeMapState(7).bind(this));
        this.mapContainer.node.children[7].on(cc.Node.EventType.TOUCH_END, this.changeMapState(8).bind(this));
		this.mapContainer.node.children[8].on(cc.Node.EventType.TOUCH_END, this.changeMapState(9).bind(this));
    
        this.teamContainer.node.children[0].on(cc.Node.EventType.TOUCH_END, this.changeTeamState(4420001).bind(this));
        this.teamContainer.node.children[1].on(cc.Node.EventType.TOUCH_END, this.changeTeamState(4420002).bind(this));
        this.teamContainer.node.children[2].on(cc.Node.EventType.TOUCH_END, this.changeTeamState(4420003).bind(this));
        this.teamContainer.node.children[3].on(cc.Node.EventType.TOUCH_END, this.changeTeamState(4420004).bind(this));
        this.teamContainer.node.children[4].on(cc.Node.EventType.TOUCH_END, this.changeTeamState(4420005).bind(this));
        this.teamContainer.node.children[5].on(cc.Node.EventType.TOUCH_END, this.changeTeamState(4420006).bind(this));
    
        // this.picSp.node.on(cc.Node.EventType.TOUCH_END, this.showTotalAward.bind(this));
        this.sCloseBtn.node.on(cc.Node.EventType.TOUCH_END, this.hideSCBox.bind(this));
        this.sConfirmBtn.node.on(cc.Node.EventType.TOUCH_END, this.sConfirmBtnOnClick.bind(this));
    }
    
    changeMapState(mapId) {
        let _this = this;
        return () => {
            _this._state.value = R.set(R.lensProp('mapId'), mapId, _this._state.value);
        }
    }
    
    changeTeamState(teamId) {
        let _this = this;
        return () => {
            _this._state.value = R.set(R.lensProp('teamId'), teamId, _this._state.value);
        }
    }
    
    refreshState() {
        let state = this._state.value as SjjsSelectState;
        this.initBottom(state.mapId, state.teamId);
        super.refreshState();
    }
    
    async initBottom(mapId: number, teamId: number) {
        let config = MapConfig.getInstance().idleMineInfo[mapId];
        let teamInfo = SjjsTeamInfo[teamId];
        let teamConfig = R.find(R.propEq('id', teamId), config.expeditionTeam)
        if (config) {
            let time = teamInfo['currencyId'] == 150 ? config.goldUnitTime : config.kcUnitTime;
            let timeStr = String(time / 60);
            let amount = teamConfig.efficiency;
            let totalTime = String(teamConfig.totalTime / 3600);
            let isYb = SjjsTeamInfo[teamId]['currencyId'] == 150;
            this.titleSp.spriteFrame = this.getSf(`title_${teamId}`);
            this.picSp.spriteFrame = this.getSf(`pic_${teamId}`)
            this.efficiencyLabel.string = `效率 ${amount}个/${timeStr}分钟`;
            this.timeLabel.string = `外出 ${totalTime}小时`;
            if (isYb == true) {
            	this.percentLabel.string = '100%';
            } else {
            	this.percentLabel.string = '200%';
            }
            //
            let mapName = MapConfig.getInstance().getMapName(mapId);
            let cuurencyId = config.produceCurrencyId;
            let cuurencyName = ItemConfig.getInstance().getCurrencyInfo(cuurencyId).fmap(x => x.name).getOrElse('');
            this.contentRT.string = `准备前往 <color=#53ff3c>${mapName}</c> 收购 <color=#fffec1>${cuurencyName}</c>`;
            //
            let own = isYb ? PlayerData.getInstance().ybAmount : PlayerData.getInstance().kbAmount;
            let price = Math.ceil(this.getPrice(mapId, teamId) * teamInfo['priceMultiple']);
            this.ownLabel.string = '' + own;
            this.sOwnLabel.string = '' + own;
            // this.ownLabel.node.color = cc.hexToColor(price > own ? '#ff0000' : '#0C6D08');            
            this.costLabel.string = `/${price}`;
            this.currencyIcon.spriteFrame = isYb ? this.ybSf : this.kbSf;
            this.initTotalAward();
        }
    }
    
    closePanel() {
        CommonUtils.safeRemove(this.node);
    }
    
    async confirmBtnOnClick() {
        let state = this._state.value as SjjsSelectState;
        let isYb = SjjsTeamInfo[state.teamId]['currencyId'] == 150;
        let priceInfo = this.prices[state.mapId];
        let price = isYb ? priceInfo.goldPrice : priceInfo.kcPrice;
        let own = isYb ? PlayerData.getInstance().ybAmount : PlayerData.getInstance().kbAmount;
        let ybPrice = Math.ceil(this.getPrice(state.mapId, state.teamId) * SjjsTeamInfo[state.teamId]['priceMultiple']);
        if (isYb) {
            await this.showSCBox();
            return;
        }
		//
        let callback = async () => {
            if (own < ybPrice) {
                TipsManager.showMsgFromConfig(1069);
                return;
            }
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/hire', [state.teamId, state.mapId, 0, price]);
            if (response.status === 0) {
                TipsManager.showMessage('派遣成功');
                EventDispatcher.dispatch(Notify.SJJS_PANEL_UPDATE, { data: response.content });
                this.closePanel();
            }
        }
        let cid = SjjsTeamInfo[state.teamId]['currencyId'];
        let cid2 = MapConfig.getInstance().idleMineInfo[state.mapId].produceCurrencyId;
        let name = SjjsTeamInfo[state.teamId]['name'];
        CommonUtils.showRichSCBox(
            `是否花费<img src='currency_icon_${cid}'/>${ybPrice}委派<color=#187122>${name}</c>前往收购<img src='currency_icon_${cid2}'/>？`,
            `(当前拥有<img src='currency_icon_${cid}'/>${own})`,
            "价格越高，收购时间越长哦",
            callback
        );
    }
    
    async sConfirmBtnOnClick() {
        if (PlayerData.getInstance().ybAmount < this.ybCost) {
            TipsManager.showMessage('拥有的元宝不足');
            return;
        }
        let state = this._state.value as SjjsSelectState;
        let priceInfo = this.prices[state.mapId];
        let price = priceInfo.goldPrice;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/idleMine/hire', [state.teamId, state.mapId, this.apCost, price]) as any;
        if (response.status == 0) {
            TipsManager.showMessage('派遣成功');
            EventDispatcher.dispatch(Notify.SJJS_PANEL_UPDATE, { data: response.content });
            this.hideSCBox();
            this.closePanel();
        }
    }
    
    async showSCBox() {
        let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [PlayerData.getInstance().accountId, 155]) as any;
        if (response2.status == 0) {
            let apAmount = response2.content.amount;
            let state = this._state.value as SjjsSelectState;
            let isYb = SjjsTeamInfo[state.teamId]['currencyId'] == 150;
            let priceInfo = this.prices[state.mapId];
            let price = isYb ? priceInfo.goldPrice : priceInfo.kcPrice;
            let ybPrice = price * SjjsTeamInfo[state.teamId]['priceMultiple'];
            this.apCost = Math.min(apAmount, ybPrice / 2);
            this.ybCost = Math.max(ybPrice - this.apCost, 0);
            this.sYbCostLabel.string = String(this.ybCost);
            this.sAPCostLabel.string = String(this.apCost);
            this.sPriceLabel.string = String(ybPrice);
            this.secondConfirmNode.active = true;
        }
    }
    
    hideSCBox() {
        this.secondConfirmNode.active = false;
    }
    
    async initTotalAward() {
        let state = this._state.value as SjjsSelectState;
        let config = MapConfig.getInstance().idleMineInfo[state.mapId];
        let currencyId = config.produceCurrencyId;
        let teamConfig = R.find(R.propEq('id', state.teamId), config.expeditionTeam);
        let time = SjjsTeamInfo[state.teamId]['currencyId'] == 150 ? config.goldUnitTime : config.kcUnitTime;
        let amount = teamConfig.efficiency;
        let totalAward = Math.floor(teamConfig.totalTime / time * amount);
        this.benefitIcon.spriteFrame = await ResUtils.getSmallCurrencyIconbyId(currencyId == 185 ? 157 : currencyId);
        this.totalBenefitLabel.string = String(totalAward);
        // TipsManager.showMessage(`合计可获得${totalAward}<img src='currency_icon_${currencyId}'/>`);
    }
    
    getPrice(mapId, teamId) {
        let isYb = SjjsTeamInfo[teamId]['currencyId'] == 150;
        let price = this.prices[mapId];
        return isYb ? price.goldPrice : CommonUtils.toCKb(price.kcPrice);
    }
    
    getSf(name: string) {
        return this.atlas.getSpriteFrame(name);
    }

}
