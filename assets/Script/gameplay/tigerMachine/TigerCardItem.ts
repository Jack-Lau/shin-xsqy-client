import { CommonUtils } from "../../utils/CommonUtils";
import { NetUtils } from "../../net/NetUtils";
import TigerMachinePanel from "./TigerMachinePanel";

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

export enum TigerCardType {
    F, A, B, C, D, E
}

@ccclass
export default class TigerCardItem extends cc.Component {

    @property(cc.Sprite)
    card1: cc.Sprite = null;
    @property(cc.Sprite)
    card2: cc.Sprite = null;
    @property(cc.Sprite)
    lockBtnSprite: cc.Sprite = null;
    @property(cc.Button)
    lockBtn: cc.Button = null;

    @property(cc.SpriteFrame)
    cardSpriteFrames: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    lockBtnSpriteFrames: cc.SpriteFrame[] = [];

    @property
    cardStartY1: number = 0;
    @property
    cardStartY2: number = 0;

    @property
    turnY: number = 0;

    nextType: TigerCardType;
    targetType: TigerCardType;

    readonly speedCard = 50;
    speed = 0;
    isTurn = 0;

    islock = false;

    fn = null;

    index = 0;
    from: TigerMachinePanel = null;
    // onLoad () {}

    start() {
        this.lockBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.aloneFunction(this.onLockBtn.bind(this)));
    }

    init(index: number, type: TigerCardType, islock: boolean, from: TigerMachinePanel) {
        this.from = from;
        this.index = index;
        this.islock = islock;
        this.card1.node.y = this.cardStartY1;
        this.card2.node.y = this.cardStartY2;

        this.card1.spriteFrame = this.cardSpriteFrames[type];
        this.nextType = type + 1;
        if (this.nextType > TigerCardType.E) {
            this.nextType = TigerCardType.A;
        }
        this.card2.spriteFrame = this.cardSpriteFrames[this.nextType];
        if (type == TigerCardType.F) {
            this.lockBtn.interactable = false;
            this.lockBtnSprite.spriteFrame = this.lockBtnSpriteFrames[0];
        } else {
            this.lockBtn.interactable = true;
            this.setLockBtn();
        }
    }

    async onLockBtn() {
        if (this.lockBtn.interactable && !this.from.isruning) {
            this.islock = !this.islock;
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/slots/lock', [this.index, this.islock ? 1 : 0]) as any;
            if (response.status === 0) {
                this.setLockBtn();
                this.from.setShakeLabel();
            } else {
                this.islock = !this.islock;
            }
        }
    }

    setLockBtn() {
        if (this.islock) {
            this.lockBtnSprite.spriteFrame = this.lockBtnSpriteFrames[2];
        } else {
            this.lockBtnSprite.spriteFrame = this.lockBtnSpriteFrames[1];
        }
    }

    startTurn(targetType: TigerCardType, fn) {
        if (this.islock) {
            fn();          
            return;
        }
        this.fn = fn;
        this.isTurn = 1;
        this.speed = this.speedCard + (Math.random() - 0.5) * 10;
        this.targetType = targetType;
        this.lockBtn.interactable = false;
        this.setLockBtn();
    }



    turnCard(card: cc.Sprite, showCard: cc.Sprite) {
        if (this.isTurn == 2) {
            if (this.nextType == this.targetType) {
                this.isTurn = 0;
                this.fn();
                this.lockBtn.interactable = true;
            }
            showCard.node.y = this.cardStartY1;
        }
        this.nextType += 1;
        if (this.nextType > TigerCardType.E) {
            this.nextType = TigerCardType.A;
        }
        card.spriteFrame = this.cardSpriteFrames[this.nextType];
        card.node.y = showCard.node.y - 308;
    }

    update(dt) {
        if (this.isTurn == 0) {
            return;
        }
        this.card1.node.y += this.speed;
        this.card2.node.y += this.speed;

        if (this.speed > 3) {
            this.speed *= 0.993;
        }
        if (this.speed < 20 && this.isTurn != 2) {
            this.isTurn = 2;
        }

        if (this.card1.node.y >= this.turnY) {
            this.turnCard(this.card1, this.card2);
        } else if (this.card2.node.y >= this.turnY) {
            this.turnCard(this.card2, this.card1);
        }
    }

}
