import { NetUtils } from "../../net/NetUtils";
import PlayerData from "../../data/PlayerData";
import { CommonUtils } from "../../utils/CommonUtils";
import GainEnergyPanel from "./GainEnergyPanel";
import { Notify } from "../../config/Notify";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { TipsManager } from "../../base/TipsManager";
import { QuestManager } from "../../quest/QuestManager";
import KBWheelAwardItemNew from "./KbWheelAwardItemNew";
import ItemConfig from "../../bag/ItemConfig";
import { showVideoAd } from "../../utils/NativeUtils";
import { EventDispatcher } from "../../utils/event/EventDispatcher";


type KbConfig = {
    [key: number]: KbConfigItem
}
type KbConfigItem = {
    id: number;
    name: string;
    currencyId: number;
    amount: number;
    broadcastId?: number;
    sequence: number;   // 顺序号
    exhibit: number;
    showResult: number;
}


const { ccclass, property } = cc._decorator;

@ccclass
export default class KbWheel extends cc.Component {
    @property(cc.Sprite)
    energySolt: cc.Sprite = null;

    @property(cc.Sprite)
    arrow: cc.Sprite = null;
    
    @property(cc.Sprite)
    shodow: cc.Sprite = null;
    // LIFE-CYCLE CALLBACKS:
    
    @property(cc.RichText)
    msgRichText: cc.RichText = null;
    
    @property(cc.Button)
    closeBtn: cc.Button = null;
    
    @property(cc.Button)
    helpBtn: cc.Button = null;
    // onLoad () {}
    
    @property(cc.Button)
    gainEnergy: cc.Button = null;
    
    @property(cc.Label)
    turnCountLabel: cc.Label = null;
    
    @property(cc.Label)
    eneryLabel: cc.Label = null;
    
    @property(cc.Button)
    turnBtn: cc.Button = null;
    
    @property(cc.Sprite)
    blockBg1: cc.Sprite = null;
    
    @property(cc.Sprite)
    blockBg2: cc.Sprite = null;
    
    @property(cc.SpriteFrame)
    kbSpriteFrame: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    ybSpriteFrame: cc.SpriteFrame = null;
    
    @property([KBWheelAwardItemNew])
    awardItemArray: Array<KBWheelAwardItemNew> = [];
    
    @property(cc.SpriteFrame)
    awardFrame: cc.SpriteFrame = null;
    
    @property(cc.SpriteFrame)
    awardFrameSelected: cc.SpriteFrame = null;
    
    @property(cc.Sprite)
    energyBg: cc.Sprite = null;
    
    // invite
    @property(cc.Button)
    inviteAwardBtn: cc.Button = null;
    
    @property(cc.Sprite)
    inviteFlag: cc.Sprite = null;
    
    @property(cc.Sprite)
    plusOne: cc.Sprite = null;
    
    @property(cc.Node)
    feverSpriteNode: cc.Node = null;
	
	@property(cc.Sprite)
	bgLighting: cc.Sprite;
    
    remainTime: number = 0;
    ENERGY_MAX: number = 1000;
    recoverTimeRange: number = 0;
    config: KbConfig = {};
    awardRecords = [];
    awawrdRecordIndex = 0;
    timeToNext = 120;
    updateAwardRecordTimer = false;
    showAwardRecordIsOn = false;
    todayTurnCount = 0
    isFever = false
    remainTurnCount = 30;
    
    start() {
        // let action = cc.rotateBy(0.025, 3);
        this.schedule(this.refreshAwardBg, 0.025);
        // this.arrow.node.runAction(cc.repeatForever(action));
        // this.arrow.schedule(this.change3.bind(this), 0.01);
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.close.bind(this));
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, CommonUtils.showInfoPanel(null, 38));
        this.gainEnergy.node.on(cc.Node.EventType.TOUCH_END, this.openGainEnergy.bind(this));
        this.turnBtn.node.on(cc.Node.EventType.TOUCH_END, this.turnWheel.bind(this));
        this.inviteAwardBtn.node.on(cc.Node.EventType.TOUCH_END, this.getInviteAward.bind(this));
        this.energyBg.node.on(cc.Node.EventType.TOUCH_END, () => {
            TipsManager.showMsgFromConfig(1480);
        });
        this.blockBg1.node.on(cc.Node.EventType.TOUCH_END, () => { });
        this.blockBg2.node.on(cc.Node.EventType.TOUCH_END, () => { });
        this.blockBg2.node.active = false;

        EventDispatcher.on(Notify.ON_AD_SUCCESS, this.onAdSucces);
		
		const action = cc.repeatForever(cc.rotateTo(10, 360))
		this.bgLighting.node.runAction(action)
		
        this.init();
        this.initData();
    }

    onAdSucces = function() {
        TipsManager.showMessage("视频观看成功, 奖励已发送!")
        this.initRecord()
    }.bind(this)
    
    async init() {
        await this.initData()
        this.config = await ConfigUtils.getConfigJson("KCWheel");
        let len = this.awardItemArray.length;
        for (let i = 0; i < len; ++i) {
            let index = i + 1;
            let awardItem = this.awardItemArray[i];
            awardItem.nameLabel.string = this.config[index]['name'];
            awardItem.init({
                currencyId: this.config[index].currencyId,
                amount: Math.floor(this.config[index].amount * (1 + Math.floor(PlayerData.getInstance().playerLevel / 10) * 0.3)) * (this.isFever == true ? 3 : 1)
            })
        }
    
        // 更新awardRecords
        if (!this.updateAwardRecordTimer) {
            this.schedule(this.updateAwardRecord, 15);
        }
        await this.updateAwardRecord();
        this.showAwardRecord();
    }
    
    async initData() {
        this.initRecord()
        const responseFever = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/kbdzp/view/fever', [])
        if (responseFever.status === 0) {
            this.isFever = String(responseFever.content) === "true"
            this.feverSpriteNode.active = this.isFever
        }
    }
    
    async initRecord() {
        const responseMyself = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/kbdzp/view/myself', []);
        if (responseMyself.status === 0) {
            const record = responseMyself.content
            this.todayTurnCount = record.todayTurnCount
            if (record.pendingAward) {
                // 身上有尚未领取的奖励
                let awardRes = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/kbdzp/obtainAward', []) as any;
                if (awardRes.status == 0) {
                    let currencyId = this.config[record.pendingAward]['currencyId'];
                    let currencyNumber = this.config[record.pendingAward]['amount'];
                    let icon = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(-1);
                    let awardStr = '恭喜你获得[fff2aa]' + currencyNumber + "[ffffff]<img src='currency_icon_" + icon + "'/>";
                    TipsManager.showMessage(awardStr);
                }
            }
    
            const responseEnergy = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET,  `/currency/view/${PlayerData.getInstance().accountId}/${152}`, []);
            if (responseEnergy.status === 0) {
                record.energy = responseEnergy.content.amount
                PlayerData.getInstance().kbRecord = record
            }
            
            this.refreshRecord();
        }
    }
    
    refreshRecord() {
        let record = PlayerData.getInstance().kbRecord;
		
        this.turnCountLabel.string = `本日可转动${30 - record.todayTurnCount}/30次`
        // 初始化能量槽
        this.setEnergy(record.energy);
        if (record.energy < 10) {
        	this.eneryLabel.string = '00' + record.energy;
        } else if (record.energy < 100) {
        	this.eneryLabel.string = '0' + record.energy;
        } else {
        	this.eneryLabel.string = record.energy + '';
        }
        if (record.energy >= 100) {
            let outline = this.eneryLabel.getComponent(cc.LabelOutline) as cc.LabelOutline;
            outline.color = cc.Color.fromHEX(outline.color, "#1d4103")
            this.eneryLabel.node.color = cc.Color.fromHEX(this.eneryLabel.node.color, "#3ddb1b")
            // outline.color = cc.hexToColor("#1d4103");
            // this.eneryLabel.node.color = cc.hexToColor("#3ddb1b");
        } else {
            let outline = this.eneryLabel.getComponent(cc.LabelOutline) as cc.LabelOutline;
            outline.color = cc.Color.fromHEX(outline.color, "#840d0d")
            this.eneryLabel.node.color = cc.Color.fromHEX(this.eneryLabel.node.color, "#ff4444")
            // outline.color = cc.hexToColor("#840d0d");
            // this.eneryLabel.node.color = cc.hexToColor("#ff4444");
        }
    
        let available = record.inviteeBonusAvailable && !record.inviteeBonusDelivered;
        this.inviteAwardBtn.node.active = available;
        this.inviteFlag.node.active = available;
    }
    
    setEnergy(value: number) {
        let start = 8;
        let range = 188 - start;
        let percent = value / this.ENERGY_MAX;
        if (percent > 1) percent = 1;
        this.energySolt.node.height = start + range * percent;
    
        let h = this.energySolt.node.height - 8;
        this.shodow.node.width = Math.sqrt(90 * 90 - (90 - h) * (90 - h)) * 196 / 90;
        this.shodow.node.height = (1 - Math.abs(90 - h) / 90) * 25 + 10;
        this.shodow.node.y = 46.4 + this.energySolt.node.height - 97;
    }


    refreshAwardBg() {
        let rotation = ((this.arrow.node.rotation + 360 / 16) % 360 + 360) % 360;
        let index = Math.floor(rotation / 360 * 8);
        this.awardItemArray[index].bg.spriteFrame = this.awardFrameSelected;
        this.awardItemArray[(index + 7) % 8].bg.spriteFrame = this.awardFrame;
    }
    
    async turnWheel() {
        if (!QuestManager.isFinished(700040)) {
            this.close();
            TipsManager.showMsgFromConfig(1084);
            return;
        }
        try {
            this.blockBg2.node.active = true;
            let extra = {}
            if (this.todayTurnCount > 0 && this.todayTurnCount % 10 === 0) {
                let result = await CommonUtils.getCaptchaResponse();
                extra = {
                    ticket: result.ticket,
                    randStr: result.randstr
                }
            }
            let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/kbdzp/makeTurn', [], {}, extra) as any;
            if (response.status === 0 && response.content) {
                let awardId = response.content.pendingAward;
                if (awardId) {
                    // 动画表现
                    let realAngle = (awardId - 1) * 360 / 8 + 360 * 5 + Math.random() * 30 - 15;
                    let action = cc.rotateTo(3, realAngle);
                    this.arrow.node.runAction(action.easing(cc.easeQuadraticActionOut()));
                    await CommonUtils.wait(3.1);
                    this.arrow.node.rotation = realAngle;
                    let awardRes = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/kbdzp/obtainAward', []) as any;
                    if (awardRes.status == 0) {
                        let currencyId = this.config[awardId]['currencyId'];
                        let currencyNumber = this.config[awardId]['amount'];
                        let amount = Math.floor(currencyNumber * (1 + Math.floor(PlayerData.getInstance().playerLevel / 10) * 0.3)) * (this.isFever == true ? 3 : 1);
                        let icon = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(-1);
                        let awardStr = '恭喜你获得[fff2aa]' + amount + "[ffffff]<img src='currency_icon_" + icon + "'/>";
                        TipsManager.showMessage(awardStr);
                    }
                }
                this.initRecord()
            } else if (response.status === 300) {
                // 能量值不足 弹出提示
                // CommonUtils.showRichSCBox(
                //     `看一段小小的广告，立马得 <color=#900404>100</color><img src='icon_nengliang'/> ！！！`,
                //     null,
                //     null,
                //     () => {
                //         showVideoAd(PlayerData.getInstance().accountId)
                //     }
                // )
            }
        } catch (e) {
            console.error(e)
        } finally {
            this.blockBg2.node.active = false;
        }
    }
    
    async updateAwardRecord() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/kbdzp/latestInterestingAwards', []) as any;
        if (response.status == 0 && response.content) {
            this.awardRecords = response.content;
            this.awawrdRecordIndex = 0;
        }
    }
    
    async showAwardRecord() {
        if (this.showAwardRecordIsOn) {
            return;
        }
        if (!this.node.parent) {
            return;
        }
        if (this.awardRecords.length == 0) {
            this.msgRichText.string = '点击转动，立刻上榜！';
            return;
        }
        this.showAwardRecordIsOn = true;
        if (this.awawrdRecordIndex >= this.awardRecords.length) {
            this.awawrdRecordIndex = 0;
        }
        let record = this.awardRecords[this.awawrdRecordIndex];
        this.awawrdRecordIndex += 1;
        let awardId = record.kbdzpAwardId;
        let currencyId = this.config[awardId]['currencyId'];
        let currencyNumber = this.config[awardId]['amount'];
        let amount = Math.floor(currencyNumber * (1 + Math.floor(PlayerData.getInstance().playerLevel / 10) * 0.3)) * (this.isFever == true ? 3 : 1);
		//
		let icon = ItemConfig.getInstance().getItemDisplayById(currencyId, PlayerData.getInstance().prefabId).fmap(x => x.iconId).getOrElse(-1);
        let content = '恭喜 [fff2aa]' + record.playerName + '[ffffff] 中奖获得[fff2aa]' + amount + "[ffffff]<img src='currency_icon_" + icon + "'/>";
		//
        let action1 = cc.spawn(cc.moveTo(0.2, 0, 30), cc.fadeTo(0.2, 0));
        this.msgRichText.node.runAction(action1);
        await CommonUtils.wait(0.3);
        this.msgRichText.string = CommonUtils.textToRichText(content);
        this.msgRichText.node.y = -30;
        let action2 = cc.spawn(cc.moveTo(0.2, 0, 0), cc.fadeTo(0.2, 255));
        this.msgRichText.node.runAction(action2);
        await CommonUtils.wait(4.22);
        this.showAwardRecordIsOn = false;
        this.showAwardRecord();
    }
    
    close() {
        this.unschedule(this.refreshAwardBg);
        this.node.parent.removeChild(this.node);
        EventDispatcher.off(Notify.ON_AD_SUCCESS, this.onAdSucces)
    }
    
    async openGainEnergy() {
        this.node.active = false;
        let event = new cc.Event.EventCustom(Notify.OPEN_PANEL, true);
        let prefab = await CommonUtils.getPanelPrefab('gainEnergy') as cc.Prefab;
        let panelInstance = cc.instantiate(prefab);
        let panel = panelInstance.getComponent(GainEnergyPanel);
        panel.from = this.node;
        event.detail = {
            panel: panel
        }
        this.node.dispatchEvent(event);
    }
    
    async getInviteAward() {
        let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/kbdzp/obtainInviteeBonus', []) as any;
        if (response.status == 0 && response.content) {
            PlayerData.getInstance().kbRecord = response.content;
			PlayerData.getInstance().kbRecord.energy = 100;
            TipsManager.showMessage("获得100<img src='icon_nengliang'/>")
            this.refreshRecord();
        }
    }
    // update (dt) {}
}
