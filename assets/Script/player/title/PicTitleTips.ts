import { TitleConfig } from "./TitleConfig";
import { ResUtils } from "../../utils/ResUtils";
import { CommonUtils } from "../../utils/CommonUtils";

/**
 * Copyright  : (C) Chenglin Huang 2018
 * Maintainer : Chenglin Huang <ustchcl@gmail.com>
 */


const { ccclass, property } = cc._decorator;
@ccclass
export default class PicTitleTips extends cc.Component {
    @property(cc.Sprite)
    colorSp: cc.Sprite = null;
    @property(cc.Sprite)
    iconSp: cc.Sprite = null;

    @property(cc.Label)
    attr1Label: cc.Label = null;
    @property(cc.Label)
    attr1ValueLabel: cc.Label = null;
    @property(cc.Label)
    attr2Label: cc.Label = null;
    @property(cc.Label)
    attr2ValueLabel: cc.Label = null;
    @property(cc.Label)
    fcLabel: cc.Label = null;
    @property(cc.Label)
    fcValueLabel: cc.Label = null;
    
    @property(cc.Label)
    descriptionLabel: cc.Label = null;
    
    @property(cc.Node)
    serialNode: cc.Node = null;
    @property(cc.Label)
    serialLabel: cc.Label = null;
    
    @property(cc.Label)
    lockLabel: cc.Label = null;
    
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;
    
    start () {
    
    }
    
    async init (config, serialNumber, tradeLockTime) {
        this.colorSp.spriteFrame = this.atlas.getSpriteFrame('color_' + config.color);
        this.iconSp.spriteFrame = await ResUtils.getTitleIconById(config.picId);
        
        this.attr1Label.string = R.path(['attribute', 0, 'name'], config)
        	.replace('最大生命', '气血')
        	.replace("物伤", "外伤")
        	.replace("物防", "外防")
        	.replace("法伤", "内伤")
        	.replace("法防", "内防")
        	.replace("额外命中率", "命中率")
            .replace("额外闪避率", "闪避率")
			.replace("格挡率", "招架率")
            .replace("暴击效果", "暴效");
        this.attr1ValueLabel.string = '+' + (R.path(['attribute', 0, 'value'], config) < 1 
        	? R.path(['attribute', 0, 'value'], config) * 100 + '%' : R.path(['attribute', 0, 'value'], config));
        
        this.attr2Label.string = R.path(['attribute', 1, 'name'], config)
        	.replace('最大生命', '气血')
        	.replace("物伤", "外伤")
        	.replace("物防", "外防")
        	.replace("法伤", "内伤")
        	.replace("法防", "内防")
        	.replace("额外命中率", "命中率")
            .replace("额外闪避率", "闪避率")
			.replace("格挡率", "招架率")
            .replace("暴击效果", "暴效") ;
        this.attr2ValueLabel.string = '+' + (R.path(['attribute', 1, 'value'], config) < 1 
        	? R.path(['attribute', 1, 'value'], config) * 100 + '%' : R.path(['attribute', 1, 'value'], config));
        	
        this.fcLabel.string = '战力';
        this.fcValueLabel.string = '+' + R.prop('fc', config);
        this.descriptionLabel.string = config.description;
        this.serialNode.active = serialNumber != undefined;
        let serial = CommonUtils.toSerailString(serialNumber, String(config.limitedQuantity).length);
        this.serialLabel.string = `★专属编号 ？？？`;
    
        if (tradeLockTime != null
            && tradeLockTime > CommonUtils.getServerTime()) {
            let t =  CommonUtils.getTimeInfo(tradeLockTime);
            this.lockLabel.string = `${t.year}年${t.month}月${t.day}日${t.hour}:${t.minute}:${t.seconds}前不能流通`;
            this.lockLabel.node.active = true;
        } else {
            this.lockLabel.node.active = false;
        }
    }
}
