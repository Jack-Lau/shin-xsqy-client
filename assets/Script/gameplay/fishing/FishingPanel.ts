// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { CommonUtils } from "../../utils/CommonUtils";
import { ResUtils } from "../../utils/ResUtils";
import { NetUtils } from "../../net/NetUtils";
import { ConfigUtils } from "../../utils/ConfigUtil";
import { EventDispatcher } from "../../utils/event/EventDispatcher";
import { Notify } from "../../config/Notify";
import FishingDetailPanel from "./FishingDetailPanel";
import FishingResultPanel from "./FishingResultPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FishingPanel extends cc.Component {

	@property(cc.Label)
	gainTotalFish: cc.Label = null;
	@property(cc.Label)
	gainFishingPoint: cc.Label = null;
	@property(cc.Label)
	gainXS: cc.Label = null;
	@property(cc.Label)
	gainGreenFish: cc.Label = null;
	@property(cc.Label)
	gainBlueFish: cc.Label = null;
	@property(cc.Label)
	gainPurpleFish: cc.Label = null;
	@property(cc.Label)
	gainOrangeFish: cc.Label = null;
	@property(cc.Label)
	gainRareFish: cc.Label = null;
	
	@property(cc.Button)
	closeBtn: cc.Button = null;
	@property(cc.Button)
	startBtn: cc.Button = null;
	
	@property(cc.Sprite)
	blockBg: cc.Sprite = null;
	@property(cc.Sprite)
	fishProgress: cc.Sprite = null;
	@property([cc.Sprite])
	fishProgressText: Array<cc.Sprite> = [];
	@property([cc.Sprite])
	fishPit: Array<cc.Sprite> = [];
	@property([cc.Sprite])
	fishPitLight: Array<cc.Sprite> = [];
	@property(cc.Sprite)
	pole: cc.Sprite = null;
	@property(cc.Sprite)
	water: cc.Sprite = null;
	
	@property(cc.Node)
	fishDetail: cc.Node = null;
	@property(cc.Node)
	fishProgressBar: cc.Node = null;
	
	fishCategory = null;
	fishingOverall = null;
	notFinishOnceRecord = null;
	
	currentFishPit = -1;
	currentStatus = -1;
	currentCD = 0;
	startCD = 0;
	nextStatusCD = 0;
	
	fishPitSpriteName = ['00008', '00007', '00006', '00005', '00004', '00003', '00002', '00001', '00000'];
	fishPitSpritePt = 0;
	
	fishPitLightInterval = 0.8;
	
	poleSpriteName = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
	poleSpritePt = 0;
	
	waterSpriteName = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
	waterSpritePt = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

	start() {
		this.initEvents();
		this.init();
	}

	initEvents() {
		this.blockBg.node.on(cc.Node.EventType.TOUCH_END, this.fillProgressBar.bind(this));
		this.fishDetail.on(cc.Node.EventType.TOUCH_END, this.showFishDetail.bind(this));
		this.startBtn.node.on(cc.Node.EventType.TOUCH_END, this.startFishing.bind(this));
		this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, this.fadeOut.bind(this));
	}

	async init() {
		this.fishCategory = await ConfigUtils.getConfigJson('FishCategory');
		//
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.GET, '/fishing/get', []);
		if (response.status === 0) {
			this.fishingOverall = response.content;
			this.refresh();
			for (let i = 0; i < response.content.fishingOnceRecords.length; i ++) {
				let onceRecord = response.content.fishingOnceRecords[i];
				if (onceRecord.finish != true){
					this.notFinishOnceRecord = onceRecord;
				}
			}
		}
		this.fishProgressBar.active = false;
		//
		this.node.opacity = 0;
		let fadeAction = cc.fadeTo(0.2, 255);
		this.node.runAction(fadeAction);
		//
		this.currentStatus = -1;
		this.pushFishStatus();
	}
		
	async showFishDetail() {
        let panel = await CommonUtils.getPanel('gameplay/fishing/FishingDetailPanel', FishingDetailPanel) as FishingDetailPanel;
		panel.init(this.fishingOverall.fishingOnceRecords);
        EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
	}
	
	async startFishing() {
		let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/fishing/fish', []);
		if (response.status === 0) {
			for (let i = 0; i < response.content.fishingOnceRecords.length; i ++) {
				let onceRecord = response.content.fishingOnceRecords[i];
				if (onceRecord.finish != true){
					this.notFinishOnceRecord = onceRecord;
				}
			}
			this.currentStatus = -1;
			this.pushFishStatus();
		}
	}
	
	async pushFishStatus() {
		if (this.notFinishOnceRecord != null) {
			switch (this.currentStatus) {
				case -1:{
					this.currentFishPit = Math.floor(Math.random() * this.fishPit.length);
					this.startCD = 0;
					this.currentCD = 0;
					this.startBtn.node.active = false;
					//
					for (let i = 0; i < this.fishPit.length; i ++) {
						this.fishPit[i].node.active = false;
					}
					for (let i = 0; i < this.fishPitLight.length; i ++ {
						this.fishPitLight[i].node.active = false;
					}
					for (let i = 0; i < this.fishProgressText.length; i ++) {
						this.fishProgressText[i].node.active = false;
					}
					this.fishProgressText[0].node.active = true;
					this.fishProgressBar.opacity = 0;
					this.fishProgress.node.width = 0;
					this.fishProgressBar.active = true;
					let fadeAction = cc.fadeTo(0.2, 255);
					this.fishProgressBar.runAction(fadeAction);
					//
					this.waterSpritePt = 0;
					this.poleSpritePt = 0;
					this.pole.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/effect/pole/' + this.poleSpriteName[this.poleSpritePt]);
					this.pole.node.opacity = 0;
					this.pole.node.active = true;
					let fa = cc.fadeTo(0.2, 255);
					this.pole.node.runAction(fa);
					//
					this.nextStatusCD = this.currentCD + this.notFinishOnceRecord.duration / 3 + 1;
					this.currentStatus = 0;
					this.schedule(this.pushFishStatus, 0.1);
					break;
				}
				case 0:{
					this.currentCD += 0.1;
					this.fishProgress.node.width = 596 * (this.currentCD - this.startCD) / (this.nextStatusCD - this.startCD);
					if (this.poleSpritePt < this.poleSpriteName.length) {
						this.pole.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/effect/pole/' + this.poleSpriteName[this.poleSpritePt]);
						this.poleSpritePt ++;
					}
					if (this.poleSpritePt >= this.poleSpriteName.length) {
						if (this.waterSpritePt == 0) {
							this.water.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/effect/water/' + this.waterSpriteName[this.waterSpritePt]);
							this.water.node.opacity = 0;
							this.water.node.active = true;
							let fa = cc.fadeTo(0.2, 255);
							this.water.node.runAction(fa);
						}
						if (this.waterSpritePt < this.waterSpriteName.length) {
							this.water.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/effect/water/' + this.waterSpriteName[this.waterSpritePt]);
							this.waterSpritePt ++;
						} else {
							this.water.node.active = false;
						}
					}
					if (this.currentCD >= this.nextStatusCD) {
						cc.tween(this.fishProgress.node).to(0.1, {
							width: 0
						}, { easing: cc.easing.smooth }).start();
						this.fishProgressText[0].node.active = false;
						this.fishProgressText[1].node.opacity = 0;
						this.fishProgressText[1].node.active = true;
						let fa = cc.fadeTo(0.2, 255);
						this.fishProgressText[1].node.runAction(fa);
						//
						this.fishPit[this.currentFishPit].node.opacity = 0;
						this.fishPit[this.currentFishPit].node.active = true;
						let fadeAction = cc.fadeTo(0.2, 255);
						this.fishPit[this.currentFishPit].node.runAction(fadeAction);
						this.fishPitSpritePt = 0;
						//
						this.startCD = this.currentCD;
						this.nextStatusCD = this.currentCD + this.notFinishOnceRecord.duration / 3 + 1;
						this.currentStatus = 1;
					}
					break;
				}
				case 1:{
					this.currentCD += 0.1;
					this.fishProgress.node.width = 596 * (this.currentCD - this.startCD) / (this.nextStatusCD - this.startCD);
					this.fishPit[this.currentFishPit].spriteFrame = await ResUtils.loadSpriteFromAltas('ui/effect/map_click_effect', this.fishPitSpriteName[this.fishPitSpritePt]);
					this.fishPitSpritePt ++;
					if (this.fishPitSpritePt >= this.fishPitSpriteName.length) {
						this.fishPitSpritePt = 0;
					}
					//
					if (this.currentCD >= this.nextStatusCD) {
						cc.tween(this.fishProgress.node).to(0.1, {
							width: 0
						}, { easing: cc.easing.smooth }).start();
						this.fishProgressText[1].node.active = false;
						this.fishProgressText[2].node.opacity = 0;
						this.fishProgressText[2].node.active = true;
						let fa = cc.fadeTo(0.2, 255);
						this.fishProgressText[2].node.runAction(fa);
						//
						this.fishPit[this.currentFishPit].spriteFrame = await ResUtils.loadSpriteFromAltas('ui/effect/map_click_effect', this.fishPitSpriteName[0]);
						let pitLightSpriteName = '绿';
						let fc = this.fishCategory[this.notFinishOnceRecord.fishCategoryId];
						switch (fc.color) {
							case 2: {
								pitLightSpriteName = '绿';
								break;
							}
							case 3: {
								pitLightSpriteName = '蓝';
								break;
							}
							case 4: {
								pitLightSpriteName = '紫';
								break;
							}
							case 5: {
								pitLightSpriteName = '橙';
								break;
							}
							case 6: {
								pitLightSpriteName = '稀有';
								break;
							}
						}
						this.fishPitLight[this.currentFishPit].spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/' + pitLightSpriteName);
						this.fishPitLight[this.currentFishPit].node.opacity = 0;
						this.fishPitLight[this.currentFishPit].node.active = true;
						this.fishPitLightInterval = 0.8;
						//
						this.startCD = this.currentCD;
						this.nextStatusCD = this.currentCD + this.notFinishOnceRecord.duration / 3 + 1;
						this.currentStatus = 2;
					}
					break;
				}
				case 2:{
					this.currentCD += 0.1;
					this.fishProgress.node.width = 596 * (this.currentCD - this.startCD) / (this.nextStatusCD - this.startCD);
					if (this.fishPitLight[this.currentFishPit].node.opacity == 0) {
						let fadeAction = cc.fadeTo(this.fishPitLightInterval, 255);
						this.fishPitLight[this.currentFishPit].node.runAction(fadeAction);
					}
					if (this.fishPitLight[this.currentFishPit].node.opacity == 255) {
						let fadeAction = cc.fadeTo(this.fishPitLightInterval, 0);
						this.fishPitLight[this.currentFishPit].node.runAction(fadeAction);
						if (this.fishPitLightInterval - 0.1 >= 0.2) {
							this.fishPitLightInterval -= 0.1;
						}
					}
					if (this.currentCD >= this.nextStatusCD) {
						cc.tween(this.fishProgress.node).to(0.1, {
							width: 0
						}, { easing: cc.easing.smooth }).start();
						this.fishProgressText[2].node.active = false;
						this.fishProgressText[3].node.opacity = 0;
						this.fishProgressText[3].node.active = true;
						let fa = cc.fadeTo(0.2, 255);
						this.fishProgressText[3].node.runAction(fa);
						//
						this.currentStatus = 3;
					}
					break;
				}
				case 3:{
					if (this.fishProgress.node.width < 590) {
						let fc = this.fishCategory[this.notFinishOnceRecord.fishCategoryId];
						if (this.notFinishOnceRecord.fishCategoryId >= 2000) {
							this.fishProgress.node.width -= (5 * (this.notFinishOnceRecord.fishCategoryId - 2000) + 5);
						} else {
							this.fishProgress.node.width -= (5 * (this.notFinishOnceRecord.fishCategoryId - (1000 + 3 * (fc.color - 2))) + 5);
						}
						if (this.fishProgress.node.width < 0) {
							this.fishProgress.node.width = 0;
						}						
						this.pole.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/effect/pole/' + this.poleSpriteName[this.poleSpriteName.length - 1]);
					}
					if (this.fishPitLight[this.currentFishPit].node.opacity == 0) {
						let fadeAction = cc.fadeTo(this.fishPitLightInterval, 255);
						this.fishPitLight[this.currentFishPit].node.runAction(fadeAction);
					}
					if (this.fishPitLight[this.currentFishPit].node.opacity == 255) {
						let fadeAction = cc.fadeTo(this.fishPitLightInterval, 0);
						this.fishPitLight[this.currentFishPit].node.runAction(fadeAction);
						if (this.fishPitLightInterval - 0.1 >= 0.2) {
							this.fishPitLightInterval -= 0.1;
						}
					}
					if (this.fishProgress.node.width >= 596) {
						this.unschedule(this.pushFishStatus);
						this.currentStatus = -1;
						let response = await NetUtils.sendHttpRequest(NetUtils.RequestType.POST, '/fishing/finish', [this.notFinishOnceRecord.id]);
						if (response.status === 0) {
							let panel = await CommonUtils.getPanel('gameplay/fishing/FishingResultPanel', FishingResultPanel) as FishingResultPanel;
							panel.init(this.notFinishOnceRecord);
							EventDispatcher.dispatch(Notify.OPEN_PANEL, { panel: panel });
							//
							this.fishPit[this.currentFishPit].node.active = false;
							this.fishProgressBar.active = false;
							this.pole.node.active = false;
							this.water.node.active = false;
							this.startBtn.node.active = true;
							this.fishingOverall = response.content;
							this.refresh();
						}
					}
					break;
				}
			}
		}
	}
	
	refresh() {
		let gtf = 0, gfp = 0, gxs = 0, ggf = 0, gbf = 0, gpf = 0, gof = 0, grf = 0;
		for (let i = 0; i < this.fishingOverall.fishingOnceRecords.length; i ++) {
			let onceRecord = this.fishingOverall.fishingOnceRecords[i];
			if (onceRecord.finish == true){
				gtf ++;
				if (onceRecord.awardCurrencyId == 150) {
					gxs += onceRecord.awardCurrencyAmount;
				} else {
					gfp += onceRecord.awardCurrencyAmount;
				}
				let fc = this.fishCategory[onceRecord.fishCategoryId];
				switch (fc.color) {
					case 2: {
						ggf ++;
						break;
					}
					case 3: {
						gbf ++;
						break;
					}
					case 4: {
						gpf ++;
						break;
					}
					case 5: {
						gof ++;
						break;
					}
					case 6: {
						grf ++;
						break;
					}
				}
			} else {
				this.notFinishOnceRecord = onceRecord;
			}
		}
		this.gainTotalFish.string = gtf;
		this.gainFishingPoint.string = gfp;
		this.gainXS.string = gxs;
		this.gainGreenFish.string = ggf;
		this.gainBlueFish.string = gbf;
		this.gainPurpleFish.string = gpf;
		this.gainOrangeFish.string = gof;
		this.gainRareFish.string = grf;
	}
	
	async fillProgressBar() {
		if (this.currentStatus == 3) {
			let fc = this.fishCategory[this.notFinishOnceRecord.fishCategoryId];
			this.fishProgress.node.width += 10 * (9 - fc.color);
			if (this.fishProgress.node.width >= 596) {
				this.fishProgress.node.width = 596;
			}
			this.pole.spriteFrame = await ResUtils.loadSprite('ui/revive/fishing/effect/pole/' + this.poleSpriteName[2]);
		}
	}
	
	fadeOut() {
		let fadeAction = cc.fadeTo(0.2, 1);
		this.node.runAction(cc.sequence(fadeAction, cc.callFunc(this.closePanel.bind(this))));
	}
	
	closePanel() {
		CommonUtils.safeRemove(this.node);
		this.unschedule(this.pushFishStatus);
	}
	
    // update (dt) {}
}
