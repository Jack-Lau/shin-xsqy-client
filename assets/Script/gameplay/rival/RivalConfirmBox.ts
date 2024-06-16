import { CommonUtils } from "../../utils/CommonUtils";


const {ccclass, property} = cc._decorator; 

@ccclass
export default class RivalConfirmBox extends cc.Component {
    @property(cc.Button)
    closeBtn: cc.Button = null;
    @property(cc.Button)
    cancelBtn: cc.Button = null;
    @property(cc.Button)
    confirmBtn: cc.Button = null;
    @property(cc.Node)
    gouNode: cc.Node = null;
    @property(cc.Node)
    bgNode: cc.Node = null;
  
    start () {
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.cancelBtn.node.on(cc.Node.EventType.TOUCH_END, this.closePanel.bind(this));
        this.bgNode.on(cc.Node.EventType.TOUCH_END, this.bgNodeOnClick.bind(this));
       
    }

    closePanel () {
        CommonUtils.safeRemove(this.node);
    }

    bgNodeOnClick () {
        this.gouNode.active = !this.gouNode.active;
        cc.sys.localStorage.setItem('RivalConfirmBox', String(!this.gouNode.active));
    }  

    init (cb) {
        this.confirmBtn.node.on(cc.Node.EventType.TOUCH_END, function () {
            this.closePanel();
            cb();
        }.bind(this));
    }



}