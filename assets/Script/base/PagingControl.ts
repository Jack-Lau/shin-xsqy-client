import { CommonUtils } from "../utils/CommonUtils";

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
export default class PagingControl extends cc.Component {

    /**上一页 */
    @property(cc.Button)
    beforeBtn: cc.Button = null;
    /**下一页 */
    @property(cc.Button)
    afterBtn: cc.Button = null;
    @property(cc.EditBox)
    editBox: cc.EditBox = null;
    @property(cc.Label)
    pageLabel: cc.Label = null;

    /**当前页 */
    currentPage: number = 0;
    /**start 最大页数 */
    maxPage: number = 0;

    receive = null;
    // onLoad () {}

    start() {

        this.initEvents();
    }

    init(maxPage: number, receive, page = 0) {
        this.maxPage = maxPage;
        this.receive = receive;
        if (this.maxPage == 0) {
            this.maxPage = 1;
        }
        if (page == 0) {
            this.setPage(1);
            this.switchPage(1);
        }
    }

    initEvents() {
        this.beforeBtn.node.on(cc.Node.EventType.TOUCH_END, this.before.bind(this));
        this.afterBtn.node.on(cc.Node.EventType.TOUCH_END, this.after.bind(this));

    }

    /**上一页 */
    before() {
        this.switchPage(this.currentPage - 1);
    }
    /**下一页 */
    after() {
        this.switchPage(this.currentPage + 1);
    }
    //输入控制
    editStart() {
        this.pageLabel.enabled = false;
        CommonUtils.editBoxCenter(this.editBox);
    }
    editComplete() {
        this.pageLabel.enabled = true;
        if (R.equals(this.editBox.string)("")) return;
        this.switchPage(parseInt(this.editBox.string));
        this.editBox.string = "";
    }

    switchPage(page: number) {
        if (page < 1) {
            page = this.maxPage;
        } else if (page > this.maxPage) {
            page = 1;
        }
        if (this.receive) {
            this.receive(page);
        }
    }

    setPage(page: number) {
        this.currentPage = page;
        this.pageLabel.string = `${page}/${this.maxPage}`;
    }

    setMax(max: number) {
        if (max < 1 || max == NaN) {
            max = 1;
        }
        this.maxPage = max;
        this.pageLabel.string = `${this.currentPage}/${this.maxPage}`;
    }
    // update (dt) {}
}
