// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { toVec2, toVec3 } from "../utils/BaseFunction";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.Camera)
    bgCamera: cc.Camera = null;

    // @property(cc.Animation)
    // anim: cc.Animation = null;
    //Jump Zoom
    
    jumpZoom = false;
    centerAtStart = true;
    //Smooth Follow

    smoothFollow = false;
    startFollow = false;
    visibleSize: cc.Size = null;
    initZoomRatio: number = 1;
    previousPos: cc.Vec2 = null;
    pointerPos: cc.Vec2 = null;

    followX = 300;
    followY = 300;
    minFollowDist = 10;
    followRatio = 1;

    //Overview
    overview = false;
    overviewTargets: Array<cc.Node> = [];
    overviewMargin = 0;        
    //Speed Zoom
    speedZoom = false;
    zoomInSpeed = 0;
    zoomOutSpeed = 0;
    //Camera Shake
    canShake = false;
    shakeDuration = 0;
    //Pointer Pan
    pointerPan = true;
    pointerXMult = 0;
    pointerYMult = 0;
    //Boundaries in world position
    useBoundaries = true;
    topBound = 0;
    bottomBound = 0;
    leftBound = 0;
    rightBound = 0;


    // use this for initialization
    onLoad () {
        this.startFollow = false;
        let canvas = cc.find('Canvas').getComponent(cc.Canvas); 
        this.visibleSize = cc.view.getVisibleSize();

        this.initZoomRatio = this.bgCamera.zoomRatio;
        //place camera on target if centerAtStart
        if (this.centerAtStart) {
            this.node.position = toVec3(this.target.convertToWorldSpaceAR(cc.Vec2.ZERO))
        }
        this.previousPos = toVec2(this.node.position)
        // if (this.pointerPan) {
        //     // this.jumpZoom = false;
        //     this.overview = false;
        //     this.speedZoom = false;
        //     canvas.node.on('mousemove', this.onMouseMove, this);
        //     canvas.node.on('touchmove', this.onTouchMove, this);
        //     this.pointerPos = null;
        // }
        if (this.overview) {
            this.jumpZoom = false;
            this.speedZoom = false;
        }
        if (this.speedZoom) {
            this.jumpZoom = false;
        }
    }

    onEnable () {
        // cc.director.getPhysicsManager().attachDebugDrawToCamera(this.camera);
    }

    onDisable () {
        // cc.director.getPhysicsManager().detachDebugDrawFromCamera(this.camera);
    }

    // called every frame, uncomment this function to activate update callback
    lateUpdate (dt) {
        let targetPos;

        if (this.overview){
            targetPos = this.target.parent.convertToWorldSpaceAR(this.getOverviewTargetsMidpoint());
        } else {
            targetPos = this.target.parent.convertToWorldSpaceAR(this.target.position);
        }

        if (this.pointerPan && this.pointerPos) {
            let xDelta = this.pointerPos.x / (this.visibleSize.width/2) - 1;
            let yDelta = this.pointerPos.y / (this.visibleSize.height/2) - 1;
            xDelta *= this.pointerXMult;
            yDelta *= this.pointerYMult;
            cc.Vec2.add(targetPos, targetPos, new cc.Vec2(xDelta, yDelta));
        }

        //smooth follow
        if (this.smoothFollow) {
            if (Math.abs(targetPos.x - this.node.x) >= this.followX ||
                Math.abs(targetPos.y - this.node.y) >= this.followY) {//when camera and target distance is larger than max distance
                this.startFollow = true;
            }
            if (this.startFollow) {
                this.node.position = this.node.position.lerp(targetPos,this.followRatio);
                if (cc.Vec2.distance(targetPos, this.node.position) <= this.minFollowDist) {
                    this.startFollow = false;
                }
            }
        } else {
            this.node.position = this.node.parent.convertToNodeSpaceAR(targetPos);
        }

        //speed zoom
        if (this.speedZoom) {
            let curSpeed = Math.abs(this.previousPos.x - targetPos.x) / dt;
            let ratio = 0;
            if (curSpeed > this.zoomOutSpeed) {
                ratio = 1 - (curSpeed - this.zoomOutSpeed) / (this.zoomInSpeed  - this.zoomOutSpeed);
                this.bgCamera.zoomRatio = cc.lerp(this.bgCamera.zoomRatio, ratio, 0.02);
            } else {
                this.bgCamera.zoomRatio = cc.lerp(this.bgCamera.zoomRatio, this.initZoomRatio, 0.02);
            }
        }

        this.previousPos = targetPos;
        
        //jump zoom
        if (this.jumpZoom) {
            let ratio = targetPos.y / cc.winSize.height;
            this.bgCamera.zoomRatio = 1 + (0.6 - ratio) * 0.35;
        }

        //boundaries

        if (this.useBoundaries) {
            let width = (this.visibleSize.width/2) / this.bgCamera.zoomRatio;
            let height = (this.visibleSize.height/2) / this.bgCamera.zoomRatio;
            let minX = this.node.x - width * 2;
            let maxX = this.node.x;  
            let minY = this.node.y - height * 2;
            let maxY = this.node.y;
            if (minX < this.leftBound) {
                this.node.x = this.leftBound + width * 2;
            }
            if (minY < this.bottomBound) {
                this.node.y = this.bottomBound + height * 2;
            }
            if (maxX > this.rightBound) {
                this.node.x = this.rightBound;
            }
            if (maxY > this.topBound) {
                this.node.y = this.topBound;
            }
        }
    }

    getOverviewTargetsMidpoint () {
        let midPoint = new cc.Vec2(0, 0);
        let minX = 99999, minY = 99999, maxX = -99999, maxY = -99999;
        for (let i = 0; i < this.overviewTargets.length; ++i) {
            let target = this.overviewTargets[i];
            maxX = target.x > maxX ? target.x : maxX;
            minX = target.x < minX ? target.x : minX;
            maxY = target.y > maxY ? target.y : maxY;
            minY = target.y < minY ? target.y : minY;
        }
        maxX += this.overviewMargin;
        minX -= this.overviewMargin;
        maxY += this.overviewMargin;
        minY -= this.overviewMargin;
        let distX = Math.abs(maxX - minX);
        let distY = Math.abs(maxY - minY);
        midPoint = new cc.Vec2(minX + distX/2, minY + distY/2);
        let ratio = Math.max(distX / this.visibleSize.width, distY / this.visibleSize.height);
        this.bgCamera.zoomRatio = 1/ratio;
        return midPoint;
    }


    shakeCamera () {
        // if (!this.canShake) return;
        // this.anim.play('shake');
        // this.scheduleOnce(this.stopShake.bind(this), this.shakeDuration);
    }

    stopShake () {
        // this.anim.stop();
        this.bgCamera.node.position = new cc.Vec3(0, 0, 0);
    }

    onMouseMove (event) {
        this.pointerPos = event.getLocation();
    }
    

    onTouchMove (event) {
        this.pointerPos = event.getLocation();
    } 

    start() {

    }

    // update (dt) {}
}
