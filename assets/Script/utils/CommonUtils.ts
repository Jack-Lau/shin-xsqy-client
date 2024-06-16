import { Notify } from "../config/Notify";
import { GameConfig } from "../config/GameConfig";
import { TipsManager } from "../base/TipsManager";
import { ConfigUtils } from "./ConfigUtil";
import CommonInfoPanel from "../base/CommonInfoPanel";
import { EventDispatcher } from "./event/EventDispatcher";
import * as Encrypt from "../cocosExtend/Encrypt"
import ItemConfig, { ItemQuality, Currency } from "../bag/ItemConfig";
import Optional from "../cocosExtend/Optional";
import { Equipment, CurrencyStack, PlayerBaseInfo, PlayerDetail } from "../net/Protocol";
import { ResUtils } from "./ResUtils";
import ItemTips from "../gameplay/bag/ItemTips";
import RichSecondConfirmBox from "../base/RichSCBox";
import { NetUtils } from "../net/NetUtils";
import { EquipUtils } from "../gameplay/equipment/utils/EquipmentUtils";
import PlayerData from "../data/PlayerData";
import BagData from "../bag/BagData";
import { GameInit } from "../map/GameInit";
import ViewPlayerBox from "../base/ViewPlayerBox";
import TitleTips from "../player/title/TitleTips";
import { BattleConfig } from "../battle/BattleConfig";
import CommonAwardTips, { AwardTipsData } from "../base/CommonAwardTips";
import GodPetJPTips from "../gameplay/bag/GodPetJPTips";
import { setDefault } from "./BaseFunction";
import LoadingPanel from "../loading/LoadingPanel";
import { Completer } from "./Completer";
import { openCaptcha } from "./NativeUtils";

export namespace CommonUtils {
	
    export let stageWidth = 768;
    export let stageHeight = 1366;

    export function randomSelectOne(arr: Array<any>) {
        if (!arr) {
            return null;
        } else if (arr.length == 0) {
            return null;
        } else {
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }

    export function deepCopy(obj: any): any {
        var newObj;
        if (obj instanceof Array) {
            newObj = [];
        }
        else if (obj instanceof Object) {
            newObj = {};
        }
        else {
            return obj;
        }
        var keys = Object.keys(obj);
        for (var i: number = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            newObj[key] = this.copyDataHandler(obj[key]);
        }
        return newObj;
    }

    export function translateX(x: number, w: number) {
        return w / 2 - x;
    }

    export function translateY(y: number, h: number) {
        return h / 2 + y;
    }

    export function decodeMatrix(matrix: string): Array<Array<boolean>> {
        let result: Array<Array<boolean>> = [];
        var arr = matrix.split("\n");

        for (var i = 0; i < arr.length; ++i) {
            var arr2 = arr[i];
            var tempArray: Array<boolean> = [];
            for (var j = 0; j < arr2.length; ++j) {
                let value = parseInt(arr2[j], 16).toString(2);
                while (value.length < 4) {
                    value = "0" + value;
                }
                value.split("").map(
                    function (item) {
                        tempArray.push(item == "1");
                    }
                );
            }
            result.push(tempArray);
        }
        return result;
    }

    export function mkTag(content: string, tag: string, value: string) {
        return '<' + tag + value + '>' + content + '</' + tag + '>';
    }

    export function mkRichText(content: string, options: Object) {
        let result = content;
        for (let tag in options) {
            let value = options[tag];
            if (value && value.attributes) {
                let tagValue = '';
                for (let key in value.attributes) {
                    tagValue += ' ' + key + '=' + value.attributes[key];
                }
                result = mkTag(result, tag, tagValue);
            } else if (value && value.value && value.value != '') {
                result = mkTag(result, tag, '=' + value['value']);
            } else {
                result = mkTag(result, tag, '');
            }
        }
        return result;
    }

    export function getPanelPrefab(prefabName: string) {
        return new Promise(function (resolve, reject) {
            cc.resources.load('prefab/' + prefabName, cc.Asset, function (err, prefab) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(prefab);
            });
        });
    }

    export function randomOne(arr: Array<any>): any {
        if (0 == arr.length || undefined == arr) {
            cc.error('Array cannot be empty');
            return null;
        }
        return arr[Math.floor(Math.random() * arr.length)];
    }

    export function foldl(func, acc, arr: Array<any>) {
        arr.forEach(ele => {
            acc = func(acc, ele);
        })
        // if (arr.length == 0) {
        //     return acc;
        // }
        // let value = arr.shift();
        // return foldl(func, func(acc, value), arr);
        return acc;
    }

    export function getViewWidth() {
        return cc.view.getVisibleSize().width;
    }

    export function getViewHeight() {
        return cc.view.getVisibleSize().height;
    }

    export function textToRichText(text: string): string {
        if (text == undefined) text = "";
        text = text.toString();
        text = text.replace(/\[f{6}\]/g, "</color>").replace(/\n/g, '<br/>');
        let pattern = /\[([a-zA-Z0-9]{6})\]/g;
        text = text.replace(pattern, "<color=#$1>")
        return text;
    }

    export function editBoxCenter(editBox: cc.EditBox) {

        // let editbox = editBox.getComponent(cc.EditBox) as any;
        // if (editbox) {
        //     console.log(editBox)
        //     let render_cmd = editbox._sgNode._renderCmd;
        //     render_cmd._edFontName = 'Microsoft Yahei';
        //     render_cmd._textLabel['_hAlign'] = 1;
        //     let edText = render_cmd._edTxt;
        //     edText.style["text-align"] = "center";
        //     let placeHolder = render_cmd._placeholderLabel;
        //     placeHolder['_hAlign'] = 1;
        // }
    }

    export function editBoxRight(editBox: cc.EditBox) {
        // let editbox = editBox.getComponent(cc.EditBox) as any;
        // if (editbox) {
        //     let render_cmd = editbox._sgNode._renderCmd;
        //     render_cmd._edFontName = 'Microsoft Yahei';
        //     render_cmd._textLabel['_hAlign'] = 2;
        //     let edText = render_cmd._edTxt;
        //     edText.style["text-align"] = "right";
        //     let placeHolder = render_cmd._placeholderLabel;
        //     placeHolder['_hAlign'] = 2;
        // }
    }

    export function openPanel(prefabName: string, panelType: { prototype: cc.Component }, thisObj) {
        return async function () {
            let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
            let prefab = await CommonUtils.getPanelPrefab(prefabName) as cc.Prefab;
            let panelInstance = cc.instantiate(prefab);
            let panel = panelInstance.getComponent(panelType);
            event.detail = {
                panel: panel
            }
            this.node.dispatchEvent(event);
            return panel;
        }.bind(thisObj);
    }

    export async function getPanel<T extends cc.Component>(prefabName: string, panelType: { prototype: cc.Component }) {
        let prefab = await CommonUtils.getPanelPrefab(prefabName) as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        return panelInstance.getComponent(panelType) as T;
    }

    export function getWindowSearch() {
        return R.compose(R.prop('search'), R.prop('location'))(window);
    }

    export function getUrlParams(search, name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式 
        var r = search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    export function wait(seconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, seconds * 1000);
        })
    }

    /**
     * return [from, to]
     * @param from 
     * @param to 
     */
    export function randomInt(from, to) {
        return from + Math.floor(Math.random() * (to + 1 - from));
    }

    function setLoadingDisplay() {
        if (cc.sys.isNative) {
            return;
        }
        // Loading splash scene
        let splash = document.getElementById('splash');
        let progressBar = splash.querySelector('.progress-bar span');
        (cc.loader as any).onProgress = function (completedCount, totalCount, item) {
            let percent = 100 * completedCount / totalCount;
            if (progressBar) {
                (progressBar as any).style.width = percent.toFixed(2) + '%';
            }
        };
        splash.style.display = 'block';
        (progressBar as any).style.width = '0%';

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            splash.style.display = 'none';
        });
    }

    /**
     * @deprecated use loading with process instead
     * @param scene 
     * @param cb 
     */
    export async function _loadSceneWithProgress(scene: string, cb?: Function) {
        setLoadingDisplay();
        await GameInit.beforeStart();
        cc.director.preloadScene(scene, () => {
            setTimeout(() => {
                cc.director.loadScene(scene, cb);
            }, 1000);
        });
    }

    export async function loadSceneWithProgress(scene: string, cb?: Function) {
        let prefab = await CommonUtils.getPanelPrefab('loading/loadingPanel') as cc.Prefab;
        let panel = cc.instantiate(prefab).getComponent(LoadingPanel) as LoadingPanel;
        [panel.node.x, panel.node.y, panel.node.height] = [0, 0, CommonUtils.getViewHeight()];
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        await GameInit.beforeStart()
        await panel.loadScene(scene)
        cc.director.loadScene(scene, cb);
    }


    export function getWeaponId(prefabId: number, oid: Optional<number>) {
        let prototypeId = 0;
        if (!oid.isValid()) {
            prototypeId = 10002;
        } else {
            prototypeId = oid.getValue();
        }
        let roleIds = [4000001, 4000002, 4000003, 4000004];
        if (roleIds.indexOf(prefabId) == -1) return null;
        let level = prototypeId - 10001;
        return 4300000 + (prefabId % 10) * 1000 + level;
    }

    // 获取装备原型Id
    export function getEPId(e: Equipment): number {
        return e.definitionId;
    }

    export function safeRemove(node: cc.Node) {
        if (node && node.parent) {
            node.parent.removeChild(node);
        }
    }


    export function log(msg?: any, ...optionParams: any[]) {
        if (GameConfig.debug) {
            console.log(msg, ...optionParams);
        }
    }

    export function take(length: number, arr: Array<any>): Array<any> {
        return arr.filter((value, index) => {
            return index < length;
        })
    }

    export function takeFrom(start: number, length: number, arr: Array<any>): Array<any> {
        return arr.filter((value, index) => {
            return index < start + length && index >= start;
        })
    }

    export function reverse(arr: Array<any>): Array<any> {
        let result = [];
        for (let i = arr.length - 1; i >= 0; --i) {
            result.push(arr[i]);
        }
        return result;
    }

    // [a] -> [a -> a] -> [a] 
    export function replaceArr(str: string, kv) {
        for (let key in kv) {
            str = str.replace('${' + key + '}', kv[key]);
        }
        return str;
    }

    export function showTipsFunc(tipId) {
        return function () {
            TipsManager.showMsgFromConfig(tipId);
        };
    }

    export function showToDo() {
        TipsManager.showMessage('敬请期待~');
    }

    export function blockClick() {
        // do nothing
    }

    export function copyToClipBoard(content: string) {
        let iosCopyToClipboard = function (el) {
            var oldContentEditable = el.contentEditable,
                oldReadOnly = el.readOnly,
                range = document.createRange();

            el.contenteditable = true;
            el.readonly = false;
            range.selectNodeContents(el);

            var s = window.getSelection();
            s.removeAllRanges();
            s.addRange(range);

            el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

            el.contentEditable = oldContentEditable;
            el.readOnly = oldReadOnly
            document.execCommand('copy');
        }
        var textArea = document.createElement("textarea")
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.width = '2em'
        textArea.style.height = '2em'
        textArea.style.padding = '0'
        textArea.style.border = 'none'
        textArea.style.outline = 'none'
        textArea.style.boxShadow = 'none'
        textArea.style.background = 'transparent'
        textArea.value = content
        document.body.appendChild(textArea)
        textArea.select()
        iosCopyToClipboard(textArea);
        document.body.removeChild(textArea);
    }

    export function quickSort(arr: Array<number>): Array<number> {
        if (arr.length == 0) return [];
        let povit = arr[0];
        let smaller = arr.filter((v, i) => { return v <= povit && i > 0 });
        let bigger = arr.filter((v, i) => { return v > povit });
        return quickSort(smaller).concat([povit], quickSort(bigger));
    }

    let showInfoWaiting = false;
    export function showInfoPanel(titleSf: cc.SpriteFrame, infoId: number) {
        return async function () {
            if (showInfoWaiting) return;
            showInfoWaiting = true;
            let config = await ConfigUtils.getConfigJson('ExplainInformations');
            let panel = await getPanel('base/commonInfoPanel', CommonInfoPanel) as CommonInfoPanel;
            let text: string = setDefault(config[infoId].content, "")
            text = text.toString();
            text = text.replace(/\[f{6}\]/g, "</color>")
                .replace(/\n/g, '<br/><br/>')
                .replace(/\\n/g, "<br/><br/>")
                .replace(/<br\/>(<br\/>)+/g, "<br/><br/>")
            let pattern = /\[([a-zA-Z0-9]{6})\]/g;
            text = text.replace(pattern, "<color=#$1>")
            panel.init(titleSf, text);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
            showInfoWaiting = false;
        }
    }

    export function $_____(str) {
        return Encrypt.hahahaha(str)
    }

    export function aloneFunction(func) {
        let isRunning = false;
        return async (...params) => {
            if (isRunning) return;
            isRunning = true;
            let result = await func(params);
            isRunning = false;
            return result;
        }
    }

    export function ifExec(condition, func, ...params) {
        if (condition) {
            func(params);
        }
    }

    // export function getCaptchaResponse() {
    //     // if (!window['TecentCaptcha']) {
    //     //     return null;
    //     // }
    //     return new Promise<any>(function (resolve) {
    //         let captcha1 = new window['TencentCaptcha']('2034926907', function (res) {
    //             resolve(res);
    //         })
    //         captcha1.show();
    //     });
    // }

    type CaptchaResponse = {
        randstr: string;
        ticket: string;
    }

    let _captchaCompleter: Completer<CaptchaResponse>;

    export function getCaptchaCompleter(): Completer<CaptchaResponse> {
        return _captchaCompleter;
    }

    export async function getCaptchaResponse() {
        _captchaCompleter = new Completer(openCaptcha);
        _captchaCompleter.start();
        return _captchaCompleter.toPromise()
    }

    export function toCKb(amount) {
        return Math.floor(R.divide(amount, 1000));
    }

    export function toSKb(amount) {
        return R.multiply(amount, 1000);
    }

    export function divide(num1, num2) {
        let result = { value: null, remain: null };
        if (num2 === 0) {
            return result;
        }
        result.value = Math.floor(num1 / num2);
        result.remain = num1 % num2;
        return result;
    }

    export function divideArray(num1: number, numArray: Array<number>): Array<number> {
        let result = [];
        let temp = num1;
        for (let n of numArray) {
            let p = divide(temp, n);
            temp = p.remain;
            result.push(p.value);
        }
        result.push(temp);
        return result;
    }

    export function evalDescription(description: string, petLevel: number, skillLevel: number): string {
        let LV = skillLevel;
        let PLV = petLevel;
        let ret: string = "";
        let pattern1 = /\[(.*?)\]/g;
        let pattern2 = /\[.*?\]/g;
        let result = [];

        let values = [];
        while (result = pattern1.exec(description)) {
            let value = eval(result[1]).toFixed(2);
            if (value[value.length - 1] == "0") {
                value = eval(result[1]).toFixed(1);
                if (value[value.length - 1] == "0") {
                    value = eval(result[1]).toFixed(0);
                }
            }
            values.push(value);
        }

        let array = description.split(pattern2);
        if (array.length == values.length + 1) {
            let i = 0;
            for (; i < values.length; ++i) {
                ret += array[i] + values[i];
            }
            ret += array[i];
        }
        return ret;
    }

    export function getLabel(content: string, fontSize: number = 24, color: string = '#ffffff'): cc.Label {
        let node = new cc.Node('Label');
        let label = node.addComponent(cc.Label);
        label.fontSize = fontSize;
        label.fontFamily = 'Microsoft Yahei';
        node.color = cc.Color.fromHEX(node.color, color)
        // node.color = cc.hexToColor(color)
        return label.getComponent(cc.Label);
    }

    export function getPetTipColorByColor(color: number): string {
        let hex = '#ffffff';
        switch (color) {
            case 2: { hex = '#30ff3c'; break; }
            case 3: { hex = '#50D8FF'; break; }
            case 4: { hex = '#d3a2ff'; break; }
            case 5: { hex = '#ff964f'; break; }
            case 6: { hex = '#fffa7c'; break; }
        }
        return hex;
    }

    export function getTipColorByQuality(q: ItemQuality): string {
        let hex = '#ffffff';
        switch (q) {
            case ItemQuality.Green: { hex = '#30ff3c'; break; }
            case ItemQuality.Blue: { hex = '#50D8FF'; break; }
            case ItemQuality.Purple: { hex = '#d3a2ff'; break; }
            case ItemQuality.Orange: { hex = '#ff964f'; break; }
        }
        return hex;
    }

    export function getForgeColorByQuality(q: ItemQuality): string {
        let hex = '#ffffff';
        switch (q) {
            case ItemQuality.Green: { hex = '#21640f'; break; }
            case ItemQuality.Blue: { hex = '#0e6e9d'; break; }
            case ItemQuality.Purple: { hex = '#664b8f'; break; }
            case ItemQuality.Orange: { hex = '#d25910'; break; }
        }
        return hex;
    }

    export function getTimeInfo(time: number) {
        let date = new Date(time);
        return {
            'year': date.getFullYear(),
            'month': date.getMonth() + 1,
            'day': date.getDate(),
            'hour': date.getHours(),
            'minute': date.getMinutes(),
            'seconds': date.getSeconds()
        }
    }

    export function getHMS(time: number) {
        if (time < 0) time = 0;
        time = Math.floor(time / 1000);
        let hour = divide(time, 3600);
        let minite = divide(hour.remain, 60);
        let second = minite.remain
        return {
            'hour': hour.value,
            'minute': minite.value,
            'second': second
        }
    }

    export function getDeltaDay(time2: number) {
        let time1 = getServerTime();
        const dayMs = 86400000;
        let beijing = 8 * 3600 * 1000;
        let d1 = Math.floor((time1 + beijing) / dayMs);
        let d2 = Math.floor((time2 + beijing) / dayMs);
        return d1 - d2;
    }

    export async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

    export async function generateSprite(path: string) {
        let node = new cc.Node('Sprite');
        let sprite = node.addComponent(cc.Sprite);
        let spriteFrame = await ResUtils.loadSprite(path);
        sprite.spriteFrame = spriteFrame;
        return sprite;
    }

    /**
     * 格式化货币数量
     */
    export function formatCurrencyAmount(amount: number): string {
        if (amount > 10000000) {
            return Math.floor(amount / 1000000) + 'M'
        } else if (amount > 1000000) {
            return Math.floor(amount / 100000) / 10 + 'M'
        } else if (amount > 10000) {
            return Math.floor(amount / 1000) + 'k'
        } else if (amount > 1000) {
            return Math.floor(amount / 100) / 10 + 'k'
        } else {
            return amount + '';
        }
    }

    // vec2 的相关操作
    export function negateVec(vec: cc.Vec2) {
        return new cc.Vec2(-vec.x, -vec.y)
    }

    export function addVec(vec1: cc.Vec2, vec2: cc.Vec2) {
        return new cc.Vec2(vec1.x + vec2.x, vec1.y + vec2.y);
    }

    export function scaleVec(vec: cc.Vec2, scale: number) {
        return new cc.Vec2(vec.x * scale, vec.y * scale);
    }


    export function showPetSkillTips(skillId) {
        return async (event: cc.Event.EventTouch) => {
            let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
            panel.initForPetSkill(skillId);
            let location = event.getLocationInView();
            let func = R.compose(
                R.min(768 / 2 - panel.tipNode.width / 2),
                R.max(panel.tipNode.width / 2 - 768 / 2)
            );
            panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
            panel.tipNode.y = CommonUtils.getViewHeight() / 2 - (location.y + panel.tipNode.height / 2);
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        };
    }

    /**
     * 获取服务器时间信息，如果本地初始化时间失败，则会使用本地时间
     */
    export function getServerTimeInfo() {
        return getTimeInfo(getServerTime());
    }

    export function getServerTime(): number {
        let map = GameConfig.timeInfo;
        if (Immutable.Map.isMap(map)) {
            let serverNow = map.get('serverTime') + Date.now() - map.get('clientTime');
            return serverNow;
        } else {
            return Date.now();
        }
    }

    /**
     * 灰度化一张图片
     * @param sprite 图片
     */
    export function grey(sprite: cc.Sprite) {
        if (!sprite) {
            return;
        }
        sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-gray-sprite"))
        // sprite?._sgNode?.setState(1);
    }

    export function ungrey(sprite) {
        if (!sprite) {
            return;
        }
        // sprite.setState(cc.Sprite.State.NORMAL)
        sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-sprite"))
        // sprite._sgNode.setState(0);
    }

    export function showAttributeTips(attrId) {
        return async () => {
            let config = await ConfigUtils.getConfigJson('AttributesShow');
            TipsManager.showMessage(R.path([attrId, 'description'], config));
        }
    }

    export function sample(n: number, arr: Array<any>): Array<any> {
        n = Math.max(Math.min(n, arr.length), 0);
        let tempArr = R.clone(arr);
        let last = tempArr.length - 1;
        for (var i = 0; i < n; i++) {
            var rand = random(i, last, false);
            swap(tempArr, i, rand);
        }
        return R.take(n, tempArr);
    }

    export function swap(arr, a, b) {
        var tmp = arr[a];
        arr[a] = arr[b];
        arr[b] = tmp;
        return arr;
    }

    export function random(min, max, floating) {
        if (max == null) {
            max = min;
            min = 0;
        }

        var rand = Math.random();

        if (floating || min % 1 || max % 1) {
            return Math.min(
                min +
                rand *
                (max - min + parseFloat('1e-' + ((rand + '').length - 1))),
                max
            );
        }

        return min + Math.floor(rand * (max - min + 1));
    }

    function splitArrayFunction(item, length, arr: Array<Array<any>>): Array<Array<any>> {
        let arrLength = arr.length;
        if (arrLength == 0 || arr[arrLength - 1].length >= length) {
            arr.push([]);
        }
        arr[arr.length - 1].push(item);
        return arr;
    }

    // 以固定长度分割数组为一系列的小数组
    export function splitArray(array: Array<any>, length: number): Array<Array<any>> {
        let result = [];
        for (let item of array) {
            splitArrayFunction(item, length, result);
        }
        return result;
    }

    export function showCurrencyTips(stack: CurrencyStack, showButton = false) {
        return async (event) => {
            let panel = await CommonUtils.getPanel('gameplay/bag/itemTips', ItemTips) as ItemTips;
            panel.init(ItemConfig.getInstance().getItemDisplayById(stack.currencyId, null), stack.amount, showButton);
            let location = event.getLocation();
            let func = R.compose(
                R.min(768 / 2 - panel.tipNode.width / 2),
                R.max(panel.tipNode.width / 2 - 768 / 2)
            );
            panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
            panel.tipNode.y = location.y - (CommonUtils.getViewHeight() + panel.tipNode.height) / 2;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

    export function showGodPetJPTips(stack: CurrencyStack, showButton = false) {
        return async (event) => {
            let panel = await CommonUtils.getPanel('gameplay/bag/godpetJPTips', GodPetJPTips) as GodPetJPTips;
            panel.init(ItemConfig.getInstance().getItemDisplayById(stack.currencyId, null), stack.amount, showButton);
            let location = event.getLocation();
            let func = R.compose(
                R.min(768 / 2 - panel.tipNode.width / 2),
                R.max(panel.tipNode.width / 2 - 768 / 2)
            );
            panel.tipNode.x = func(location.x - 768 / 2 + panel.tipNode.width / 2);
            panel.tipNode.y = location.y - (CommonUtils.getViewHeight() + panel.tipNode.height) / 2;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
        }
    }

    export async function showRichSCBox(content, description1, description2, callback) {
        let panel = await CommonUtils.getPanel('base/richSCBox', RichSecondConfirmBox) as RichSecondConfirmBox;
        panel.init(
            content,
            new Optional<string>(description1),
            new Optional<string>(description2),
            callback
        )
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    export async function exchangeEquipment(e: Equipment) {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/equipment/action/{id}/arm', [e.id]) as any;
        if (response.status === 0) {
            TipsManager.showMessage('装备穿戴成功!');
            let part = EquipUtils.getProto(e).fmap(x => x.part);
            let equipment = PlayerData.getInstance().equipments[part.val];
            if (equipment.isValid()) {  // 如果身上该部位有装备，把该装备移到背包
                BagData.getInstance().pushEquipmentToBag(equipment.getValue());
                PlayerData.getInstance().equipedIds = R.filter(x => x != equipment.getValue().id, PlayerData.getInstance().equipedIds);
            }
            PlayerData.getInstance().equipments[part.val] = new Optional<Equipment>(e);
            PlayerData.getInstance().equipedIds.push(e.id);
            PlayerData.getInstance().recheck();
            BagData.getInstance().removeEquipmentFromBag(e)
            EventDispatcher.dispatch(Notify.PLYAER_WEAPON_CHANGE, {});
            PlayerData.getInstance().updateFc();
        }
    }

    export async function showViewPlayerBox(playerBaseInfo: PlayerBaseInfo) {
        let panel = await CommonUtils.getPanel('base/viewPlayerBox', ViewPlayerBox) as ViewPlayerBox;
        panel.init(playerBaseInfo);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    export function showCommonAwardsTips(data: AwardTipsData) {
        return async function (event: cc.Event.EventTouch) {
            let tips = await getPanel('base/commonAwardTips', CommonAwardTips) as CommonAwardTips;
            tips.init(data);
            let location = event.getLocation();
            let y = Math.min(location.y - CommonUtils.getViewHeight() / 2 + 30, CommonUtils.getViewHeight() - tips.tipsNode.height - 30);
            let x = location.x - 768 / 2;
            tips.setPosition(new cc.Vec2(x, y));
            let xl = location.x - tips.tipsNode.width / 2;
            let xr = location.x + tips.tipsNode.width / 2;
            if (xl < 0) {
                tips.setTipsX(0 - xl);
            } else if (xr > 768) {
                tips.setTipsX(768 - xr);
            }
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: tips });
        }
    }

    export function showCommonAwardsTipsWithoutArrow(data: AwardTipsData) {
        return async function (event: cc.Event.EventTouch) {
            let tips = await getPanel('base/commonAwardTips', CommonAwardTips) as CommonAwardTips;
            tips.init(data);
            let location = event.getLocation();
            let y = Math.min(location.y - CommonUtils.getViewHeight() / 2 - tips.tipsNode.height, CommonUtils.getViewHeight() - 30);
            let x = location.x - 768 / 2;
            tips.setPosition(new cc.Vec2(x, y));
            let xl = location.x - tips.tipsNode.width / 2;
            let xr = location.x + tips.tipsNode.width / 2;
            if (xl < 0) {
                tips.setTipsX(0 - xl);
            } else if (xr > 768) {
                tips.setTipsX(768 - xr);
            }
            tips.arrowNode.active = false;
            EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: tips });
        }
    }

    export function numMulti(num1, num2) {
        var baseNum = 0;
        try {
            baseNum += num1.toString().split(".")[1].length;
        } catch (e) {
        }
        try {
            baseNum += num2.toString().split(".")[1].length;
        } catch (e) {
        }
        return Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", "")) / Math.pow(10, baseNum);
    }

    export async function getCurrencyAmount(currencyId: number): Promise<number> {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/currency/view/{accountId}/{currencyId}', [PlayerData.getInstance().accountId, currencyId]);
        if (response.status === 0) {
            return response.content.amount;
        }
        return 0;
    }

    export async function showTitleTips(titleId: number, serialNum: string) {
        let panel = await CommonUtils.getPanel('player/title/titleTips', TitleTips) as TitleTips;
        panel.initTitleById(titleId, serialNum);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
    }

    export async function startBattleBySessionId(sessionId, callback) {
        // let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/view/{id}', [sessionId]) as any;
        // if (response.status == 0) {
        //     BattleConfig.getInstance().battleSessionId = response.content.battleSessionId;
        //     EventDispatcher.dispatch(Notify.BATTLE_OPEN, { data: response.content.result, cb: callback });
        // }
        const data = NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/view/{id}', [sessionId])
            .then(response =>
                response.status != 0
                    ? null
                    : Object.assign(response?.content?.result ?? {}, { battleSessionId: response?.content?.battleSessionId }))
        EventDispatcher.dispatch(Notify.BATTLE_OPEN_WITH_PROMISE, {
            data,
            beforeCb: (data) => BattleConfig.getInstance().battleSessionId = data.battleSessionId,
            afterCb: callback
        })
    }

    export function getCheckedIndex(container: cc.ToggleContainer) {
        if (!container) {
            return -1;
        }
        if (container.toggleItems.length == 0) {
            return -1;
        }
        return R.findIndex(R.prop('isChecked'), container.toggleItems);
    }

    export function reportError(url: string, parameters, errorMsg) {
        let json = {
            url: url,
            parameters: parameters,
            errorMsg: errorMsg
        }
        NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/track/reportMessage', [JSON.stringify(json)]);
    }

    export function toSerailString(x: number, length: number) {
        let result = String(x);
        while (result.length < length) {
            result = '0' + result;
        }
        return result;
    }

    /**
     * @param node offset [0.5, 0.5]
     * @param point target point
     */
    export function hitTest(node: cc.Node, point: cc.Vec2): boolean {
        if (!node || !point) {
            return false;
        }
        let w = node.width;
        let h = node.height;
        let x = node.x;
        let y = node.y;

        let inFunc = (x, from, to) => x >= from && x <= to;
        return inFunc(point.x, x - w / 2, x + w / 2) && inFunc(point.y, y - h / 2, y + h / 2)
    }

    /**
     * 3, 32 -> '032'
     * @param n 
     * @param val 
     * @param prefix 
     * @returns 
     */
    export function prefixNum(n: number, val: number, prefix: string = '0'): string {
        let valStr = String(val)
        if (valStr.length >= n) {
            return valStr
        } else {
            return `${R.repeat('0', n - valStr.length).join('')}${valStr}`
        }
    }

    export function replaceAttributeName(name: string): string {
        return name.replace("最大生命", "气血")
            .replace("生命", "气血")
            .replace("物防", "外防")
            .replace("法防", "内防")
            .replace("物伤", "外伤")
            .replace("法伤", "内伤")
            .replace("额外命中率", "命中率")
            .replace("额外闪避率", "闪避率")
            .replace("格挡率", "招架率")
            .replace("暴击效果", "暴效");
    }

    export function getWorldPosition(node: cc.Node): cc.Vec3 {
        if (node.parent) {
            return getWorldPosition(node.parent).add(node.position)
        } else {
            return cc.Vec3.ZERO.clone()
        }
    }

    export function makePromise<T>(data: T): Promise<T> {
        return new Promise(resolve => resolve(data))
    }
}

