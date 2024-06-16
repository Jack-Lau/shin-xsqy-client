import { CommonUtils } from "../../utils/CommonUtils";

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
export default class TalentItem extends cc.Component {

    @property(cc.Node)
    bgNodes: cc.Node[] = [];
    @property(cc.Label)
    level: cc.Label = null;
    @property(cc.Node)
    selected: cc.Node = null;

    start() {
        this.selected.active = false;
    }

    init(show: string, level: number) {
        let showID = 0;
        if (show == 'YIN') {
            showID = 1;
        } else if (show == 'YANG') {
            showID = 2;
        }
        this.bgNodes.forEach((item, index) => {
            if (showID == index) {
                item.active = true;
            } else {
                item.active = false;
            }
        });
        this.level.string = level.toString();
        this.celSelected();
    }

    toRotation(time: number, r: number) {
        let actionBy = cc.rotateBy(time, r);
        this.node.runAction(actionBy);
    }

    toSelected() {
        this.selected.active = true;
    }

    celSelected() {
        this.selected.active = false;
    }

    // update (dt) {}
}
