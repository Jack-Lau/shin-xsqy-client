import { CommonUtils } from "../../utils/CommonUtils";
import CommonPanel from "../../base/CommonPanel";
import PlayerPrefab from "../PlayerPrefab";
import PlayerData from "../../data/PlayerData";
import Optional from "../../cocosExtend/Optional";
import TitlePanelItem from "./TitlePanelItem";
import { TitleConfig } from "./TitleConfig";
import { NetUtils } from "../../net/NetUtils";
import { TipsManager } from "../../base/TipsManager";
import { Title } from "../../net/Protocol";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;
@ccclass
export default class TitlePanel extends CommonPanel {
    @property(cc.Button)
    closeBtn: cc.Button = null;

    // attributes
    @property(cc.Label)
    attr1Label: cc.Label = null;
    @property(cc.Label)
    attr2Label: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    
    @property(cc.Button)
    armBtn: cc.Button = null;
    @property(cc.Button)
    disarmBtn: cc.Button = null;
    
    @property(PlayerPrefab)
    player: PlayerPrefab = null;
    
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    
    @property(cc.Node)
    blockNode: cc.Node = null;
    
    @property(cc.Node)
    emptyNode: cc.Node = null;
    @property(cc.Node)
    nonAttrNode: cc.Node = null;
    @property(cc.Node)
    fcNode: cc.Node = null;
    
    data = {}
    
    start () {
        this.initEvents();
        this.init();
    }
    
    initEvents () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.blockNode.on(cc.Node.EventType.TOUCH_END, CommonUtils.blockClick);
        this.armBtn.node.on(cc.Node.EventType.TOUCH_END, this.armTitle. bind(this));
        this.disarmBtn.node.on(cc.Node.EventType.TOUCH_END, this.disarmTitle.bind(this));
    }
    
    async init() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/title/viewMine', []);
        if (response.status === 0) {
            response.content.forEach(title => {
                this.data[title.id] = title;
            })
        }
        this.initPlayer();
        let config = await TitleConfig.getConfig();
        let ids = R.keys(this.data) as Array<number>;
        ids = ids.sort((id1, id2) => {
            if (this.isArmed(id1)) {
                return -1;
            } else if (this.isArmed(id2)) {
                return 1;
            } else {
                let did1 = this.data[id1].definitionId;
                let did2 = this.data[id2].definitionId;
                let color1 = config[did1].color;
                let color2 = config[did2].color;
                if (color1 > color2) {
                    return -1;
                } else if (color1 < color2) {
                    return 1;
                } else {
                    return (did1 > did2) ? -1 :1;
                }
            }
        });
    
        this.emptyNode.active = this.nonAttrNode.active = ids.length == 0;
        this.fcNode.active = this.attr1Label.node.active = this.attr2Label.node.active = ids.length > 0;
    
        if (ids.length > 0) {
            this._data.value = ids;
            this._state.value = this._data.value[0];
        } else {
            this.armBtn.node.active = this.disarmBtn.node.active = false;
        }
    }
    
    isArmed (inputId) {
        return PlayerData.getInstance().title.fmap(t => t.id == inputId).getOrElse(false)
    }
    
    initPlayer() {
        this.player.initNameLabel(
            new Optional<number>(PlayerData.getInstance().schoolId).getOrElse(0)
            , PlayerData.getInstance().playerName
        );
        this.player.initAnimation(
            PlayerData.getInstance().prefabId
            , PlayerData.getInstance().equipments['weapon'].fmap(CommonUtils.getEPId)
            , PlayerData.getInstance().fashion
            , PlayerData.getInstance().fashionDye
        );
    }
    
    async initAttributes (definitionId) {
        let config = await TitleConfig.getConfigById(definitionId);
        let getAttr = index => R.path(['attribute', index, 'name'], config)
        	.replace('最大生命', '气血')
        	.replace("物伤", "外伤")
        	.replace("物防", "外防")
        	.replace("法伤", "内伤")
        	.replace("法防", "内防") 
        	.replace("额外命中率", "命中率")
            .replace("额外闪避率", "闪避率")
			.replace("格挡率", "招架率")
            .replace("暴击效果", "暴效") 
        	+ '+' 
        	+ (R.path(['attribute', index, 'value'], config) < 1 
        	? R.path(['attribute', index, 'value'], config) * 100 + '%' : R.path(['attribute', index, 'value'], config));
        this.attr1Label.string = getAttr(0);
        this.attr2Label.string = getAttr(1);
        this.fcLabel.string = R.prop('fc', config);
    }
    
    refreshState () {
        let titleId = this._state.value;
        let idArr = this._data.value;
        let selectedIndex = idArr.indexOf(titleId);
    
        this.player.initTitle(new Optional<number>(this.data[titleId].definitionId));
        this.scroll.content.children.forEach((ele, index) => {
            ele.getComponent(TitlePanelItem).setSelected(index == selectedIndex);
        });
        this.initAttributes(this.data[titleId].definitionId);
        let isArmed = this.isArmed(titleId);
        this.armBtn.node.active = !isArmed;
        this.disarmBtn.node.active = isArmed;
        super.refreshState();
    }
    
    refreshData () {
        let titleId = this._state.value;
        let idArr = this._data.value;
        let selectedIndex = idArr.indexOf(titleId);
        this.scroll.content.removeAllChildren();
        CommonUtils.asyncForEach(idArr, async (id, index) => {
            let item = cc.instantiate(this.itemPrefab).getComponent(TitlePanelItem) as TitlePanelItem;
            item.init(id, this.data[id].definitionId, selectedIndex == index);
            item.node.parent = this.scroll.content;
            item.node.on(cc.Node.EventType.TOUCH_END, this.changeState(id).bind(this));
        });
        super.refreshData();
    }
    
    changeState(id) {
        let _this = this;
        return () => {
            _this._state.value = id;
        }
    }
    
    closePanel () {
        CommonUtils.safeRemove(this.node)
    }
    
    async armTitle () {
        let title = this.data[this._state.value];
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/title/action/{id}/primary', [this._state.value]) as any;
        if (response.status == 0) {
              TipsManager.showMessage('称号装备成功');
            PlayerData.getInstance().title = new Optional<Title>(title);
            this.refreshData();
            EventDispatcher.dispatch(Notify.PLYAER_WEAPON_CHANGE, {});
            this.closePanel();
            PlayerData.getInstance().updateFc();
        }
    }
    
    async disarmTitle () {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/title/untitle', []) as any;
        if (response.status == 0) {
              TipsManager.showMessage('称号卸下成功');
            PlayerData.getInstance().title = new Optional<Title>();
            this.refreshData();
            EventDispatcher.dispatch(Notify.PLYAER_WEAPON_CHANGE, {});
            this.closePanel();
            PlayerData.getInstance().updateFc();
        }
    }
}
