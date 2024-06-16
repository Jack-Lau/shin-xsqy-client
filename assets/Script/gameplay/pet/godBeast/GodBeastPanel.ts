import { MovieclipUtils } from "../../../utils/MovieclipUtils";
import GodBeastPuzzle from "./GodBeastPuzzle";
import { CommonUtils } from "../../../utils/CommonUtils";
import { PetDetail } from "../../../net/Protocol";
import { PetData } from "../PetData";
import SelectGodBeastPanel from "./SelectGodBeastPanel";
import { EventDispatcher } from "../../../utils/event/EventDispatcher";
import { Notify } from "../../../config/Notify";
import GodBeastExchangePanel from "./GodBeastExchangePanel";
import { TipsManager } from "../../../base/TipsManager";
import { NetUtils } from "../../../net/NetUtils";
import PlayerData from "../../../data/PlayerData";
import PetPanel from "../PetPanel";
import PetExhibitPanel from "../PetExhibitPanel";
import GodBeastTrainPanel from "./GodBeastTrainPanel";

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
export default class GodBeastPanel extends cc.Component {
    @property(cc.Button)
    helpBtn: cc.Button = null;
    @property(cc.Button)
    addBtn: cc.Button = null;
    @property(cc.Sprite)
    model: cc.Sprite = null;
    @property(cc.Sprite)
    levelSprite: cc.Sprite = null;
    @property(cc.SpriteFrame)
    levelSpriteFrames: cc.SpriteFrame[] = [];
    @property(cc.Label)
    effectLabel: cc.Label = null;
    @property(cc.Node)
    unEffect: cc.Node = null;
    @property(cc.Label)
    progressLabel: cc.Label = null;

    @property(cc.Button)
    exchangeBtn: cc.Button = null;
    @property(cc.Button)
    advancedBtn: cc.Button = null;
    @property(GodBeastPuzzle)
    cowPuzzle: GodBeastPuzzle = null;
    @property(GodBeastPuzzle)
    monkeyPuzzle: GodBeastPuzzle = null;
    @property(cc.Animation)
    anim: cc.Animation = null;
    
    currentPuzzle: GodBeastPuzzle = null;
    
    isRuning = false;
    idLevels = {
        300018: 0, 300019: 1, 300020: 2, 300021: 3, 300022: 4,
        300023: 0, 300024: 1, 300025: 2, 300026: 3, 300027: 4
    };
    
    monkeyIds = [300023, 300024, 300025, 300026, 300027];
    cowIds = [300018, 300019, 300020, 300021, 300022];
    
    petId = 0;
    effectLabelNames = ['洪荒之力', '无中生有', '怒火中烧', '不灭金身'];
    
    from: GodBeastTrainPanel = null;
    petDetail: PetDetail = null;
    start() {
        this.init()
        this.initEvents();
        // this.isHGod();
    }
    init() {
        this.addBtn.node.active = true;
        this.unEffect.active = true;
        this.effectLabel.node.parent.active = false;
        this.cowPuzzle.node.active = false;
        this.monkeyPuzzle.node.active = false;
        this.monkeyPuzzle.node.parent.active = false;
        this.levelSprite.node.active = false;
        this.model.node.active = false;
    }
    
    // async isHGod() {
    //     let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/pet/view/legendaryOfMine/id', []);
    //     if (response.status === 0) {
    //         let ids = response.content;
    //         if (ids.length < 1) {
    //             this.onExchangeBtn();
    //         }
    //     }
    // }
    
    initEvents() {
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 36));
        this.addBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onAddBtn.bind(this)));
        this.model.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onSwitch.bind(this)));
        this.exchangeBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onExchangeBtn.bind(this)));
        this.advancedBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onAdvancedBtn.bind(this)));
    }
    
    async updateShow(petDetail: PetDetail) {
        this.petDetail = petDetail;
        this.petId = petDetail.pet.id;
        let level = this.idLevels[petDetail.pet.definitionId];
        if (level > 3) {
            TipsManager.showMessage('恭喜神兽升到最高阶级！');
            this.init();
            return;
        }
        this.addBtn.node.active = false;
        let config = await PetData.getConfigById(petDetail.pet.definitionId);
        this.initMc(config.fmap(x => x.prefabId).getOrElse(400010));
        this.levelSprite.node.active = true;
        this.levelSprite.spriteFrame = this.levelSpriteFrames[level];
    
        this.unEffect.active = false;
        this.effectLabel.node.parent.active = true;
        this.effectLabel.string = `2、激活神兽技能——${this.effectLabelNames[level]}`;
    
        this.monkeyPuzzle.node.parent.active = true;
        if (this.monkeyIds.indexOf(petDetail.pet.definitionId) > -1) {
            this.cowPuzzle.node.active = false;
            this.monkeyPuzzle.node.active = true;
            this.currentPuzzle = this.monkeyPuzzle;
        } else if (this.cowIds.indexOf(petDetail.pet.definitionId) > -1) {
            this.cowPuzzle.node.active = true;
            this.monkeyPuzzle.node.active = false;
            this.currentPuzzle = this.cowPuzzle;
        }
        await this.currentPuzzle.init(petDetail.pet.definitionId);
        let m = 0;
        this.currentPuzzle.debrisItems.forEach((item, index) => {
            if (item.node.opacity == 0) {
                m += 1;
            }
        });
        this.progressLabel.string = `拼图完成度 ${Math.floor(m / this.currentPuzzle.debrisItems.length * 100)}%`;
    }
    
    async onAddBtn() {
        let panel = await CommonUtils.getPanel('gameplay/pet/dogBeast/SelectGodBeastPanel', SelectGodBeastPanel) as SelectGodBeastPanel;
        panel.init(null, this.updateShow.bind(this));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    async onSwitch() {
        let panel = await CommonUtils.getPanel('gameplay/pet/dogBeast/SelectGodBeastPanel', SelectGodBeastPanel) as SelectGodBeastPanel;
        panel.init(this.petDetail, this.updateShow.bind(this));
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }
    
    async onExchangeBtn() {
        let panel = await CommonUtils.getPanel('gameplay/pet/dogBeast/GodBeastExchangePanel', GodBeastExchangePanel) as GodBeastExchangePanel;
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        // this.from.closePanel();
    }
    
    async onAdvancedBtn() {
        if (this.addBtn.node.active) {
            TipsManager.showMessage('请选择神兽！');
            return;
        }
        for (let item of this.currentPuzzle.debrisItems) {
            if (item.node.opacity != 0) {
                TipsManager.showMsgFromConfig(1259);
                return;
            }
        }
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/legendaryPet/ascend', [this.petId]) as any;
        if (response.status === 0) {
            let response2 = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/pet/viewDetail', [this.petId]);
            if (response2.status === 0) {
                let data = response2.content[0] as PetDetail;
                await CommonUtils.wait(this.anim.play().duration);
                PetData.updatePetInfo(data);
                PlayerData.getInstance().updateFc();
                TipsManager.showMessage('恭喜神兽升阶成功！');
                let panel = await CommonUtils.getPanel('gameplay/pet/petExhibitPanel', PetExhibitPanel) as PetExhibitPanel;
                panel.initAsAward(data);
                EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
                this.updateShow(data);
            }
        }
    }
    
    async initMc(prefabId: number) {
    
        let animationClip = await MovieclipUtils.getMovieclip(prefabId, 'idle_ld', prefabId == 4100014 ? 10 : 16);
        let animation = this.model.getComponent(cc.Animation);
        animation.addClip(animationClip, 'idle_ld');
        animation.play('idle_ld');
        let offset = MovieclipUtils.getOffset(prefabId + '_idle_ld');
        this.model.node.anchorX = offset.x;
        this.model.node.anchorY = offset.y;
        this.model.node.active = true;
    }
    
    // update (dt) {}
}
