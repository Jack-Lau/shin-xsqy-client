import { TipsManager } from "../base/TipsManager";
import { CommonUtils } from "./CommonUtils";


/**
 * 简化前置条件的书写
 * @param value 前提条件
 * @param tip 条件不满足时，弹出的提示信息 1. 配置的ID， 2. 文本信息
 */
export function precondition(value: boolean, tip?: number | string): boolean {
    if (!value && tip) {
        if (typeof tip === "number") {
            TipsManager.showMsgFromConfig(tip);
        } else if (typeof tip == "string") {
            TipsManager.showMessage(tip);
        }
    }
    return value == true;
}

export function setDefault<T>(value: T, defaultValue: T): T {
    if (value == undefined) {
        return defaultValue;
    } else {
        return value;
    }
}

export function randomInt(from: number, to: number) {
    return from + Math.floor(Math.random() * (to + 1 - from));
}

export function toVec2(vec3: cc.Vec3): cc.Vec2 {
    return new cc.Vec2(vec3.x, vec3.y)
}

export function toVec3(vec2: cc.Vec2, z: number = 0): cc.Vec3 {
    return new cc.Vec3(vec2.x, vec2.y, z)
}