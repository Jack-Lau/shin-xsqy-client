import { CommonUtils } from "../../utils/CommonUtils";
import PlayerAttributeItem from "../../player/PlayerAttributeItem";
import PetAttributePanel from "./attribute/PetAttributePanel";
import PetSkillLearn from "./skill/PetSkillLearn";
import PetDashStarPanel from "./dash/PetDashStarPanel";
import { TipsManager } from "../../base/TipsManager";
import PetSmeltingPanel from "./smelting/PetSmeltingPanel";
import GodBeastPanel from "./godBeast/GodBeastPanel";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import PetGainPanel from "./PetGainPanel";
import PetSoulPanel from "./soul/PetSoulPanel";

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

@ccclass
export default class PetPanel extends cc.Component {

    @property(cc.Button)
    closeBtn: cc.Button = null;
    
    @property(cc.Node)
    content: cc.Node = null;
    
    @property(cc.Sprite)
    title: cc.Sprite = null;
    @property(cc.SpriteFrame)
    titleSFs: Array<cc.SpriteFrame> = [];
    
    //content Prefab
    @property(cc.Prefab)
    petAttribute: cc.Prefab = null;
    @property(cc.Prefab)
    petSkill: cc.Prefab = null;
    @property(cc.Prefab)
    petDashStar: cc.Prefab = null;
    @property(cc.Prefab)
    petSoul: cc.Prefab = null;
    @property(cc.Prefab)
    petSmelting: cc.Prefab = null;
    @property(cc.Prefab)
    godBeast: cc.Prefab = null;

    @property(cc.Toggle)
    toggles: Array<cc.Toggle> = [];
    
    /**当前页 */
    currentPage: number = 1;
    selected: number = 0;
    selectPage: number = 0;
    
    componentCache = null;
    inited: Boolean = false;
    // onLoad () {}
    
    start() {
        if (!this.inited) {
            this.showContent(null, '0');
        }
        this.initEvents();
    }
    
    initEvents() {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
    }
    
    showContent(toggle, data: string) {
        this.inited = true;
        if (this.componentCache != null && this.componentCache.isRuning == true) {
            TipsManager.showMessage('操作中。。。');
            this.toggles[this.selectPage].isChecked = true;
            this.toggles[parseInt(data)].isChecked = false;
            return;
        }
        this.selectPage = parseInt(data);
        switch (this.selectPage) {
            case 0:
                this.setContent(this.petAttribute, PetAttributePanel);
                break;
            case 1:
                this.setContent(this.petSkill, PetSkillLearn);
                break;
            case 2:
                this.setContent(this.petDashStar, PetDashStarPanel);
                break;
            case 3:
                this.setContent(this.petSoul, PetSoulPanel);
                break;
            case 4:
				this.setContent(this.petSmelting, PetSmeltingPanel);
                break;
        }
    }
    
    setContent(prefab: cc.Prefab, component, isGod = false) {
        this.content.removeAllChildren();
        let panelNode = cc.instantiate(prefab);
        let comp = panelNode.getComponent(component) as any;
        comp['from'] = this;
        this.componentCache = comp;
        panelNode.parent = this.content;
        if (!isGod) {
            comp.init(this.currentPage, this.selected);
        }else{
            comp.from = this;
        }
        this.title.spriteFrame = this.titleSFs[this.selectPage];
    }
    
    // async setContent(pb: cc.Prefab, component) {
    //     for (let key in this.petContents) {
    //         CommonUtils.safeRemove(this.petContents[key].node);
    //     }
    //     let prefab = cc.instantiate(pb);
    //     prefab.parent = this.content;
    //     this.petContents[this.selectPage] = prefab.getComponent(component);
    //     this.title.spriteFrame = this.titleSFs[this.selectPage];
    //     this.petContents[this.selectPage].from = this;
    //     await this.petContents[this.selectPage].init(this.currentPage, this.selected);
    // }
    
    // update (dt) {}
    closePanel() {
        if (this.componentCache != null && this.componentCache.isRuning == true) {
            TipsManager.showMessage('操作中。。。');
            return;
        }
        CommonUtils.safeRemove(this.node);
    }

}
