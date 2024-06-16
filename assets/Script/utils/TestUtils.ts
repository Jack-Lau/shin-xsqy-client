import { ResUtils } from "./ResUtils";
import { EventDispatcher } from "./event/EventDispatcher";
import { Notify } from "../config/Notify";
import { CommonUtils } from "./CommonUtils";
import { TipsManager } from "../base/TipsManager";
import { NetUtils } from "../net/NetUtils";
import { BattleConfig } from "../battle/BattleConfig";
import { GameConfig } from "../config/GameConfig";
import JgtManager from "../gameplay/jinguangta/JgtManager";
import { PetDetail } from "../net/Protocol";
import PetTips from "../gameplay/pet/PetTips";
import { PetData } from "../gameplay/pet/PetData";
import { GameInit } from "../map/GameInit";
import Optional from "../cocosExtend/Optional";
import { Web3Utils } from "../net/Web3Utils";
import { ShopUtils } from "../shop/ShopUtils";

export module TestUtils {
    export function init() {
        window['进入金光塔'] = async function() {
            JgtManager.getInstance().enterJgt();
        }

        window['踢出金光塔'] = async function() {
            EventDispatcher.dispatch(Notify.SWITCH_TO_MAP, {mapId: 1});
            TipsManager.showMessage('金光塔层数已重置');
        }

        window['生成宝箱'] = async function () {
            let boxNum = CommonUtils.randomInt(3, 5);
            for (let i = 0; i < boxNum; ++i) {
                let sprite = await generateSprite('ui/gameplay/jinguangta/jgt_box');
                sprite.node.x = CommonUtils.randomInt(-300, 300);
                sprite.node.y = CommonUtils.randomInt(-384, 0);
                EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, {component: sprite.node});
                sprite.node.on(cc.Node.EventType.TOUCH_END, function() {
                    TipsManager.showMessage("获得" + CommonUtils.randomInt(1000, 100000) + "<img src='icon_nengliang'/>");
                    CommonUtils.safeRemove(sprite.node);
                });
            }
        }

        window['战斗'] = async function (battleId) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/battle/start', [battleId, false]) as any;
            if (response.status == 0) {
                BattleConfig.getInstance().battleSessionId = response.content.battleSessionId;
                let callback = () => {
                }
                EventDispatcher.dispatch(Notify.BATTLE_OPEN, { data: response.content.result, cb: callback });
            }
        }

        window['领取任务'] = async function(questId) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/quest/action/myself/{questId}/start', [questId]);
            if (response.status === 0) {
                TipsManager.showMessage(`领取任务${questId}成功`);
            }
        }

        window['show pets'] = async function () {
            let pets = await PetData.testLogAllPets();
            pets.forEach(pet => {
                if (pet.valid) {
                    console.log(pet.val);
                }
            })
        }

        window['create_title'] = async function (titleId) {
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/title/grantForTest', [titleId]);
            if (response.status === 0) {
                TipsManager.showMessage('生成称号成功');
            }
        }
        
        window['server time'] = function () {
            let map = GameConfig.timeInfo;
            if (Immutable.Map.isMap(map)) {
                let serverNow = map.get('serverTime') + Date.now() - map.get('clientTime');
                console.log(CommonUtils.getTimeInfo(serverNow));
            }
        }

        window['deleteChainPets'] = function () {
            Web3Utils.deletePet();
        }

        window['showMyWallet'] = function () {
            Web3Utils.getEquipmentContract().ownedTokensOf(Web3Utils.HONG_ACCOUNT, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                result.forEach(ele => 
                    console.log(ele.toNumber())
                );
            });
        }

        window['cmd'] = function (command:string, ...params) {
            if (window[command]) {
                window[command](...params);
            }
        }

        window['startBattle'] = async function () {
            await NetUtils.post('/multiplayerBattle/clean', []);
            await NetUtils.post('/multiplayerBattle/startBattle', ['38', '105']);
        }
    }

    async function addSprite() {
        let rand = CommonUtils.randomInt(1, 7);
        let node = new cc.Node('Sprite');
        let sprite = node.addComponent(cc.Sprite);
        node.x = 109 - 1280 / 2;
        node.y = 1536 / 2 - 1112;
        let spriteFrame = await ResUtils.loadSprite('ui/gameplay/jinguangta/jgt_zhu_' + rand);
        sprite.spriteFrame = spriteFrame;
        EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, {component: node});

        let node2 = new cc.Node('Sprite');
        let sprite2 = node2.addComponent(cc.Sprite);
        node2.x = 336 - 1280 / 2;
        node2.y = 1536 / 2 - 1220;
        sprite2.spriteFrame = spriteFrame;
        EventDispatcher.dispatch(Notify.ADD_COMPONENT_TO_MAP, {component: node2});
    }

    async function generateSprite(path: string) {
        let node = new cc.Node('Sprite');
        let sprite = node.addComponent(cc.Sprite);
        let spriteFrame = await ResUtils.loadSprite(path);
        sprite.spriteFrame = spriteFrame;
        return sprite;
    }


    function ss () {
        let x = new Optional<any>();
        let accountIds = x.fmap(y => y.info as Array<any>).fmap(z => z.map(a => a.accountId as number)).fmap(b => b.join(','));
        if (accountIds.valid) {
            
        }
    }
}
