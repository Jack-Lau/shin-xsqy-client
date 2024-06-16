import { CommonUtils } from "../utils/CommonUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AmountWidget extends cc.Component {
    @property(cc.Button)
    plusBtn: cc.Button = null;
    @property(cc.Button)
    minusBtn: cc.Button = null;
    @property(cc.Button)
    allBtn: cc.Button = null;
    @property(cc.EditBox)
    input: cc.EditBox = null;

    amount: number = 0;
    _max: number = 99;
    _min: number = 0;
    onChange = (value) => {};

    start () {
        
    }

    init(min, max, onChange) {
        this.plusBtn.node.on(cc.Node.EventType.TOUCH_END, this.plusBtnOnClick.bind(this));
        this.minusBtn.node.on(cc.Node.EventType.TOUCH_END, this.minusBtnOnClick.bind(this));
        this.allBtn.node.on(cc.Node.EventType.TOUCH_END, this.allBtnOnClick.bind(this));
        this.input.node.on('editing-did-ended', function() {
            let str = this.input.string;
            this.setAmount(parseInt(str));
        }.bind(this));
        this.editboxCenter();

        this.min = min;
        this.max = max;
        this.onChange = onChange;
    }

    setMax(max) {
        this.max = max;
    }

    minusBtnOnClick() {
        this.setAmount(this.amount - 1);
    }

    plusBtnOnClick() {
        this.setAmount(this.amount + 1);
    }

    allBtnOnClick() {
        this.setAmount(this.max);
    }

    setAmount(value: number) {
        if (undefined == value || value > this.max || value < this.min) return;
        this.amount = value;
        this.input.string = value.toString();
        this.editboxCenter();
        this.onChange(value);
    }

    getCurrentAmount() {
        return this.amount;
    }

    editboxCenter() {
        CommonUtils.editBoxCenter(this.input)
    }

    set min (min) {
        this._min = min;
    }

    set max (max) {
        this._max = max;
    }

    get min () {
        return this._min;
    }

    get max () {
        return this._max;
    }
}
