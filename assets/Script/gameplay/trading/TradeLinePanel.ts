import PagingControl from "../../base/PagingControl";
import { NetUtils } from "../../net/NetUtils";
import { ConsignmentDetail, ConsignmentMarker, PagedConsignmentList } from "../../net/Protocol";
import TradingGoodsItem from "./TradingGoodsItem";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import FriendsData from "../friends/FriendsData";
import { TipsManager } from "../../base/TipsManager";
import TradingBuyTips from "./TradingBuyTips";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import TradeLineShowScreen from "./TradeLineShowScreen";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

export class TradeScreenEqu {
    part: number;
    color: number;
    maxEnhanceLevel: number;
    paramMatch: string;
    patk: number;
    matk: number;
    fc: number;
    effectMatch: string;
    effectIds: string;
    skillEnhancementEffectIds: string;

    constructor() {
        this.empty();
    }

    empty() {
        this.part = NetUtils.NONE_VALUE as any;
        this.basisEmpty();
        this.attributeEmpty();
        this.effsEmpty();
        this.schoolEmpty();
    }

    basisEmpty() {
        this.color = NetUtils.NONE_VALUE as any;
        this.maxEnhanceLevel = NetUtils.NONE_VALUE as any;
    }
    attributeEmpty() {
        this.paramMatch = NetUtils.NONE_VALUE as any;
        this.patk = NetUtils.NONE_VALUE as any;
        this.matk = NetUtils.NONE_VALUE as any;
        this.fc = NetUtils.NONE_VALUE as any;
    }
    effsEmpty() {
        this.effectMatch = NetUtils.NONE_VALUE as any;
        this.effectIds = NetUtils.NONE_VALUE as any;
    }

    schoolEmpty() {
        this.skillEnhancementEffectIds = NetUtils.NONE_VALUE as any;
    }
}

export class TradeScreenPet {
    petDefinitionId: number;
    petRank: number;
    maxPetRank: number;
    aptitudeHp: number;
    aptitudeAtk: number;
    aptitudePdef: number;
    aptitudeMdef: number;
    aptitudeSpd: number;
    abilitiyMatch: string;
    abilityIds: string;

    constructor() {
        this.empty();
    }

    empty() {
        this.petDefinitionId = NetUtils.NONE_VALUE as any;
        this.starEmpty();
        this.qualificationEmpty();
        this.skillEmpty();
    }

    starEmpty() {
        this.petRank = NetUtils.NONE_VALUE as any;
        this.maxPetRank = NetUtils.NONE_VALUE as any;
    }

    qualificationEmpty() {
        this.aptitudeHp = NetUtils.NONE_VALUE as any;
        this.aptitudeAtk = NetUtils.NONE_VALUE as any;
        this.aptitudePdef = NetUtils.NONE_VALUE as any;
        this.aptitudeMdef = NetUtils.NONE_VALUE as any;
        this.aptitudeSpd = NetUtils.NONE_VALUE as any;
    }

    skillEmpty() {
        this.abilityIds = NetUtils.NONE_VALUE as any;
        this.abilitiyMatch = NetUtils.NONE_VALUE as any;
    }
}

enum Classify {
    Hottest = 0, Equipment, Pet, Title
}

@ccclass
export default class TradeLinePanel extends cc.Component {

    @property(cc.Toggle)
    classifyToggles: cc.Toggle[] = [];

    //筛选
    @property(TradeLineShowScreen)
    showScreen: TradeLineShowScreen = null;

    //内容
    @property(TradingGoodsItem)
    goodsItems: TradingGoodsItem[] = [];
    @property(PagingControl)
    page: PagingControl = null;

    @property(cc.Label)
    myCurrency: cc.Label = null;
    @property(cc.Button)
    buyBtn: cc.Button = null;
    @property(cc.Button)
    moreBtn: cc.Button = null;
    @property(cc.Button)
    contactBtn: cc.Button = null;
    @property(cc.Button)
    focusBtn: cc.Button = null;
    @property(cc.Node)
    moreLayout: cc.Node = null;
    @property(cc.Sprite)
    focusBtnSprite1: cc.Sprite = null;
    @property(cc.Sprite)
    focusBtnSprite2: cc.Sprite = null;
    @property(cc.Sprite)
    moreBtnSprite1: cc.Sprite = null;
    @property(cc.Sprite)
    moreBtnSprite2: cc.Sprite = null;
    @property(cc.Node)
    empty: cc.Node = null;

    screenEqu: TradeScreenEqu = null;
    screenPet: TradeScreenPet = null;

    contentSelected = -1;

    classify: Classify = Classify.Hottest;

    data: ConsignmentDetail[] = [];

    consignmentMarker: ConsignmentMarker[] = [];

    pageNumber = 1;

    readonly Page_Size = 8;


    onLoad() { }

    start() {
        this.screenEqu = new TradeScreenEqu();
        this.screenPet = new TradeScreenPet();
        this.page.init(1, this.updatePage.bind(this));
        this.initEvents();
        this.showScreen.from = this;
    }

    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/marker/mine', []) as any;
        if (response.status === 0) {
            this.consignmentMarker = response.content as ConsignmentMarker[];
        }
        this.setMyCurrency();
        this.initClassify(this.classify, this.pageNumber);
    }

    initEvents() {
        this.classifyToggles.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.initClassify.bind(this, index)));
        });
        this.buyBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onBuyBtn.bind(this)));
        this.moreBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onMoreBtn.bind(this)));
        this.moreLayout.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onMoreBtn.bind(this)));
        this.contactBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onContactBtn.bind(this)));
        this.focusBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onFocusBtn.bind(this)));
        this.goodsItems.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onItem.bind(this, index)));
        });
    }

    onItem(index: number) {
        this.contentSelected = index;
        this.goodsItems.forEach((item, ind) => {
            if (ind == this.contentSelected) {
                item.showSelected();
            } else {
                item.cancelSelected();
            }
        });
    }

    async onBuyBtn() {
   
        if (this.contentSelected == -1) {
            TipsManager.showMessage('请选择！');
            return;
        }
        let panel = await CommonUtils.getPanel('gameplay/trading/TradingBuyTips', TradingBuyTips) as TradingBuyTips;
        panel.init(this.data[this.contentSelected].consignment);
        panel.from = this;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });

    }

    async onMoreBtn() {
        await CommonUtils.wait(0.2);
        let isShow = this.focusBtn.node.parent.active;
        this.focusBtn.node.parent.active = !isShow;
        this.moreBtnSprite1.node.active = isShow;
        this.moreBtnSprite2.node.active = !isShow;
        if (this.contentSelected == -1) {
            this.focusBtnSprite1.node.active = true;
            this.focusBtnSprite2.node.active = false;
            return;
        }
        let id = this.data[this.contentSelected].consignment.id;
        let isFocus = this.toIsFocus(id);
        this.focusBtnSprite1.node.active = !isFocus;
        this.focusBtnSprite2.node.active = isFocus;
    }

    async onContactBtn() {
        if (this.contentSelected == -1) {
            TipsManager.showMessage('请选择！');
            this.onMoreBtn();
            return;
        }
        let id = this.data[this.contentSelected].consignment.sellerAccountId;
        if (id != PlayerData.getInstance().accountId) {
            FriendsData.getInstance().openFriendChatByID(id);
        } else {
            TipsManager.showMsgFromConfig(1180);
        }
        this.onMoreBtn();
    }

    async onFocusBtn() {
        if (this.contentSelected == -1) {
            TipsManager.showMessage('请选择！');
            this.onMoreBtn();
            return;
        }
        let id = this.data[this.contentSelected].consignment.id;
        let isFocus = this.toIsFocus(id);
        if (isFocus) {
            // 取消
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/market/consignment/{id}/unmark', [id]) as any;
            if (response.status === 0) {
                this.adjustPage();
            }
        } else {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/market/consignment/{id}/mark', [id]) as any;
            if (response.status === 0) {
                this.adjustPage();
            }
        }
        this.onMoreBtn();
    }

    /** 一级筛选初始化 */
    async initClassify(classify: Classify, pagem) {
        if (!(pagem instanceof Number)) {
            pagem = 1;
        }
        this.goodsItems.forEach((item) => {
            item.node.active = false;
        });
        this.classify = classify;
        if (classify == Classify.Hottest) {
            this.contentSelected = -1;
            this.page.node.active = false;
            this.showScreen.node.active = false;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/consignment/', [0, this.Page_Size]) as any;
            if (response.status === 0) {
                this.data = (response.content as PagedConsignmentList).consignments;
            }
            this.updateShow();
        } else {
            this.page.node.active = true;
            this.showScreen.updateShow();
            this.updatePage(pagem);
        }
    }

    async updatePage(pageNumber: number) {
        if (this.classify == Classify.Hottest) {
            return;
        }
        this.pageNumber = pageNumber;
        this.contentSelected = -1;
        switch (this.classify) {
            case Classify.Equipment:
                this.showScreen.node.active = true;
                let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/consignment/equipments'
                    , [this.screenEqu.part, this.screenEqu.color, this.screenEqu.maxEnhanceLevel, this.screenEqu.paramMatch, this.screenEqu.patk, this.screenEqu.matk
                        , this.screenEqu.fc, this.screenEqu.effectMatch, this.screenEqu.effectIds, this.screenEqu.skillEnhancementEffectIds, pageNumber - 1, this.Page_Size]) as any;
                if (response.status === 0) {
                    let list = response.content as PagedConsignmentList;
                    this.data = list.consignments;
                    this.page.setMax(list.totalPages);
                }
                break;
            case Classify.Pet:
                this.showScreen.node.active = true;
                let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/consignment/pets',
                    [this.screenPet.petDefinitionId, this.screenPet.petRank, this.screenPet.maxPetRank, this.screenPet.aptitudeHp, this.screenPet.aptitudeAtk,
                    this.screenPet.aptitudePdef, this.screenPet.aptitudeMdef, this.screenPet.aptitudeSpd,
                    this.screenPet.abilitiyMatch, this.screenPet.abilityIds, pageNumber - 1, this.Page_Size]) as any;
                if (response2.status === 0) {
                    let list = response2.content as PagedConsignmentList;
                    this.data = list.consignments;
                    this.page.setMax(list.totalPages);
                }

                break;
            case Classify.Title:
                this.showScreen.node.active = false;
                let response3 = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/market/consignment/titles', [pageNumber - 1, this.Page_Size]) as any;
                if (response3.status === 0) {
                    let list = response3.content as PagedConsignmentList;
                    this.data = list.consignments;
                    this.page.setMax(list.totalPages);
                }
                break;
        }
        this.page.setPage(pageNumber);
        this.updateShow();
    }

    async updateShow() {
        if (this.data.length == 0) {
            this.empty.active = true;
        } else {
            this.empty.active = false;
        }
        this.goodsItems.forEach((item, index) => {
            if (index < this.data.length) {
                item.node.active = true;
                item.init(this.data[index].consignment, this.toIsFocus(this.data[index].consignment.id));
                item.setCollectionLabel(this.data[index].markerCount);
            } else {
                item.node.active = false;
            }
        });
    }

    toIsFocus(consignmentId: number) {
        for (let mekar of this.consignmentMarker) {
            if (mekar.consignmentId == consignmentId) {
                return true;
            }
        }
        return false;
    }

    async setMyCurrency() {
        let currency = 0;
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, `/currency/view/${PlayerData.getInstance().accountId}/${151}`, []) as any;
        if (response.status === 0) {
            currency = R.prop('amount', response.content);
        }
        this.myCurrency.string = CommonUtils.toCKb(currency).toString();
    }

    adjustPage() {
        if (this.data.length == 1 && this.pageNumber > 1) {
            this.pageNumber -= 1;
        }
        this.init();
    }

    // update (dt) {}
}
