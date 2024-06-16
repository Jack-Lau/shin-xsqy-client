import { CommonUtils } from "../../utils/CommonUtils";
import { Repeat } from "immutable";

/**
 * Copyright  : (C) Chenglin Huang 2019
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */

const { ccclass, property } = cc._decorator;

type ChipType = "40" | "200" | "1000" | "5000"

@ccclass
export default class ChipDisplay extends cc.Component {
    @property([cc.Layout])
    cols: Array<cc.Label> = [];

    @property(cc.SpriteFrame)
    sf40: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sf200: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sf1000: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sf5000: cc.SpriteFrame = null;

    @property(cc.Material)
    glassMaterial: cc.Material = null;

    repeat(func: () => void, n: number) {
        if (n <= 0) {
            return;
        }
        func();
        this.repeat(func, n - 1)
    }
    
    init (amount: number, total: number) {
        this.cols.forEach(col => col.node.removeAllChildren());

        let r1 = CommonUtils.divide(amount, 5000);
        let r2 = CommonUtils.divide(r1.remain, 1000);
        let r3 = CommonUtils.divide(r2.remain, 200);
        let r4 = CommonUtils.divide(r3.remain, 40);
        
        let arr = [
            this.gen(r1.value, 5000),
            this.gen(r2.value, 1000),
            this.gen(r3.value, 200),
            this.gen(r4.value, 40),
        ]
        arr.forEach((x, index) => this.addBet(x.type, x.amount, index, false))
        const global = Math.min(Math.max(0, total - amount), 30000)
        const globals = this.genGlobal(global)
        globals.forEach((x, index) => this.addBet(x.type, x.amount, index, true));
    }

    addBet(type: ChipType, amount: number, index: number, transparent: boolean = false) {
        const _this = this
        switch (type) {
            case "5000": {
                _this.repeat( () => {
                    let sp = _this.genSprite(_this.sf5000);
                    // if (transparent) {
                    //     sp.setMaterial(0, this.glassMaterial);
                    // }
                    sp.node.parent = _this.cols[index].node;
                }, amount );
                break;
            }
            case "1000": {
                _this.repeat( () => {
                    let sp = _this.genSprite(_this.sf1000);
                    // if (transparent) {
                    //     sp.setMaterial(0, this.glassMaterial);
                    // }
                    sp.node.parent = _this.cols[index].node;
                }, amount );
                break;
            }
            case "200": {
                _this.repeat( () => {
                    let sp = _this.genSprite(_this.sf200);
                    // if (transparent) {
                    //     sp.setMaterial(0, this.glassMaterial);
                    // }
                    sp.node.parent = _this.cols[index].node;
                }, amount );
                break;
            }
            case "40": {
                _this.repeat( () => {
                    let sp = _this.genSprite(_this.sf40);
                    // if (transparent) {
                    //     sp.setMaterial(0, this.glassMaterial);
                    // }
                    sp.node.parent = _this.cols[Math.min(2, index)].node;
                }, amount );
                break;
            }
        }
    }

    gen(amount, value): {type: ChipType, amount: number} {
        return {
            type: value.toString(),
            amount: amount
        }
    }

    genGlobal(num: number): {type: ChipType, amount: number}[] {
        console.log("num", num)
        var percent = 1.08
        const v_5000 = Math.floor(num/percent/5000);
        const v_1000 = Math.floor((num - v_5000 * 5000) / percent / 1000)
        const v_200 = Math.floor((num - v_5000 * 5000 - v_1000 * 1000) / percent / 200)
        const v_40 = Math.floor((num - v_5000 * 5000 - v_1000 * 1000 - v_200 * 200) / 40)
        return [
            {type: "5000", amount: v_5000},
            {type: "1000", amount: v_1000},
            {type: "200", amount: v_200},
            {type: "40", amount: v_40}
        ]
    }

    genSprite(sf: cc.SpriteFrame): cc.Sprite {
        let node = new cc.Node('Sprite');
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = sf;
        return sprite;
    }
}