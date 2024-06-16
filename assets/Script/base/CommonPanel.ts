import StateData from "./StateData";

/**
 * 一种抽象面板模型
 *  event ---------- onclick -----------------------------
 *  state ---------- stateOnchange -----------------------
 *  data  ---------- dataOnChange ------------------------
 * 
 * onclick 抛出变化到的状态 -->  stateOnChange函数接受此状态，并根据状态更新数据
 *     --> 也可以造成数据的变化 
 * 
 * 用户的操作会导致两种Effect, 1. 数据变化， 2. 状态变化
 * 1. 与服务器交互，从服务器获得新数据，更新到本地
 * 2. 切换显示状态，已在该状态则不变化
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonPanel extends cc.Component {
    protected _data: StateData = new StateData();
    protected _state: StateData = new StateData();
    protected _updateFunc: any = {};

    initData(data) {
        this._data.value = data;
    }

    setState(state) {
        this._state.value = state;
    }

    refreshAll() {
        this.refreshData();
        this.refreshState();
    }

    // 负责更新状态相关部分
    refreshState() {
        this._state.reset();
    }

    // 负责更新与状态无关部分
    refreshData() {
        this._data.reset();
    }

    update(dt) {
        if (this._data.changed) {
            this.refreshAll();
        } else if (this._state.changed) {
            this.refreshState();
        }
    }
}