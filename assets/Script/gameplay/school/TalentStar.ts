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

const {ccclass, property} = cc._decorator;

@ccclass
export default class TalentStar extends cc.Component {

    @property(cc.Sprite)
    starItems: cc.Sprite[] = [];
    @property(cc.Animation)
    animations: cc.Animation[] = [];
  
    // onLoad () {}

    show (index:number) {
        this.starItems.forEach((item,ind)=>{
            if(ind < index){
                item.node.active = true;
            }else{
                item.node.active = false;
            }
        });
    }

    async anim(index:number){
        let time = this.animations[index-1].play().duration;
        await CommonUtils.wait(time);
        this.show(index);
    }
    // update (dt) {}
}
