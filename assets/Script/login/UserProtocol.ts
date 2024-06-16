import PagingControl from "../base/PagingControl";

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
export default class NewClass extends cc.Component {

    @property(cc.Node)
    contents: cc.Node[] = [];

    @property(PagingControl)
    pageControl: PagingControl = null;

    start() {
        this.pageControl.init(this.contents.length, this.switchPage.bind(this));
    }

    switchPage(page) {
        
        let currentIndex = page - 1;
        this.contents.forEach((item, index) => {
            if (index == currentIndex) {
                item.active = true;
            } else {
                item.active = false;
            }
        });
        this.pageControl.setPage(page);
    }
    // update (dt) {}
}
