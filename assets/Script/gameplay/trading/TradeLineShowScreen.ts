import TradeLinePanel from "./TradeLinePanel";
import { CommonUtils } from "../../utils/CommonUtils";
import { Notify } from "../../config/Notify";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import TradingSceenEquTips from "./TradingSceenEquTips";
import { NetUtils } from "../../net/NetUtils";
import TradingSceenPetTips from "./TradingSceenPetTips";

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
export default class TradeLineShowScreen extends cc.Component {

    @property(cc.Button)
    screenBtn: cc.Button = null;

    @property(cc.Node)
    equNode: cc.Node = null;
    @property(cc.Node)
    petNode: cc.Node = null;

    @property(cc.Sprite)
    equSprite: cc.Sprite[] = [];
    @property(cc.Sprite)
    equCancel: cc.Sprite[] = [];
    @property(cc.Sprite)
    petSprite: cc.Sprite[] = [];
    @property(cc.Sprite)
    petCancel: cc.Sprite[] = [];

    from: TradeLinePanel = null;
    // onLoad () {}

    start() {
        this.screenBtn.node.on(cc.Node.EventType.TOUCH_END,CommonUtils.aloneFunction(this.onScreenBtn.bind(this)));
        this.equCancel.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.onCancel.bind(this, index));
        });
        this.petCancel.forEach((item, index) => {
            item.node.on(cc.Node.EventType.TOUCH_END, this.onCancel.bind(this, index));
        });
    }

    async onScreenBtn() {
        if (this.from.classify == 1) {
            let panel = await CommonUtils.getPanel('gameplay/trading/TradingSceenEquTips', TradingSceenEquTips) as TradingSceenEquTips;
            panel.from = this.from;
            panel.init(this.from.screenEqu);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        } else if (this.from.classify == 2) {
            let panel = await CommonUtils.getPanel('gameplay/trading/TradingSceenPetTips', TradingSceenPetTips) as TradingSceenPetTips;
            panel.from = this.from;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

    onCancel(index: number) {
        if (this.from.classify == 1) {
            if (index == 0) {
                this.equSprite.forEach((item) => {
                    item.node.parent.active = false;
                });
                this.from.screenEqu.empty();
            } else {
                switch (index) {
                    case 1:
                        this.from.screenEqu.basisEmpty();
                        this.equSprite[1].node.parent.active = false;
                        break;
                    case 2:
                        this.from.screenEqu.attributeEmpty();
                        this.equSprite[2].node.parent.active = false;
                        break;
                    case 3:
                        this.from.screenEqu.effsEmpty();
                        this.from.screenEqu.schoolEmpty();
                        this.equSprite[3].node.parent.active = false;
                        break;
                }
            }
        } else if (this.from.classify == 2) {
            if (index == 0) {
                this.petSprite.forEach((item) => {
                    item.node.parent.active = false;
                });
                this.from.screenPet.empty();
            } else {
                switch (index) {
                    case 1:
                        this.from.screenPet.starEmpty();
                        this.petSprite[1].node.parent.active = false;
                        break;
                    case 2:
                        this.from.screenPet.qualificationEmpty();
                        this.petSprite[2].node.parent.active = false;
                        break;
                    case 3:
                        this.from.screenPet.skillEmpty();
                        this.petSprite[3].node.parent.active = false;
                        break;
                }
            }
        }
        this.from.adjustPage();
    }

    updateShow() {
        if (this.from.classify == 1) {
            this.equNode.active = true;
            this.petNode.active = false;
            if (this.from.screenEqu.part == (NetUtils.NONE_VALUE as any)) {
                this.equSprite.forEach((item) => {
                    item.node.parent.active = false;
                });
                this.from.screenEqu.empty();
            } else {
                this.equSprite[0].node.parent.active = true;

                if (this.from.screenEqu.maxEnhanceLevel != (NetUtils.NONE_VALUE as any) || this.from.screenEqu.color != (NetUtils.NONE_VALUE as any)) {
                    this.equSprite[1].node.parent.active = true;
                } else {
                    this.equSprite[1].node.parent.active = false;
                }
                if (this.from.screenEqu.fc != (NetUtils.NONE_VALUE as any) || this.from.screenEqu.patk != (NetUtils.NONE_VALUE as any)
                    || this.from.screenEqu.matk != (NetUtils.NONE_VALUE as any)) {
                    this.equSprite[2].node.parent.active = true;
                } else {
                    this.equSprite[2].node.parent.active = false;
                }
                if (this.from.screenEqu.effectIds != (NetUtils.NONE_VALUE as any) || this.from.screenEqu.skillEnhancementEffectIds != (NetUtils.NONE_VALUE as any)) {
                    this.equSprite[3].node.parent.active = true;
                } else {
                    this.equSprite[3].node.parent.active = false;
                }
            }

        } else if (this.from.classify == 2) {
            this.equNode.active = false;
            this.petNode.active = true;
            if (this.from.screenPet.petDefinitionId == (NetUtils.NONE_VALUE as any)) {
                this.petSprite.forEach((item) => {
                    item.node.parent.active = false;
                });
                this.from.screenPet.empty();
            } else {
                this.petSprite[0].node.parent.active = true;

                if (this.from.screenPet.petRank != (NetUtils.NONE_VALUE as any) || this.from.screenPet.maxPetRank != (NetUtils.NONE_VALUE as any)) {
                    this.petSprite[1].node.parent.active = true;
                } else {
                    this.petSprite[1].node.parent.active = false;
                }
                if (this.from.screenPet.aptitudeHp != (NetUtils.NONE_VALUE as any) || this.from.screenPet.aptitudeAtk != (NetUtils.NONE_VALUE as any)
                    || this.from.screenPet.aptitudePdef != (NetUtils.NONE_VALUE as any) || this.from.screenPet.aptitudeMdef != (NetUtils.NONE_VALUE as any)
                    || this.from.screenPet.aptitudeSpd != (NetUtils.NONE_VALUE as any)) {
                    this.petSprite[2].node.parent.active = true;
                } else {
                    this.petSprite[2].node.parent.active = false;
                }
                if (this.from.screenPet.abilityIds != (NetUtils.NONE_VALUE as any)) {
                    this.petSprite[3].node.parent.active = true;
                } else {
                    this.petSprite[3].node.parent.active = false;
                }
            }

        }
    }

    // update (dt) {}
}
