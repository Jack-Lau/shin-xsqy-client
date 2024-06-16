import { TipsManager } from "../base/TipsManager";
import { GameConfig } from "../config/GameConfig";

/****************************/
/********* 状态处理 **********/
/****************************/

export namespace StatusHandler {
    // 422 需要处理response的错误
    // 403 没有登录
    export function handle(httpStatus, response): any {
        if (401 === httpStatus) {
            if (GameConfig.whiteListIsOn) {
                TipsManager.showMessage('服务器维护中，请稍候重试');
            } else {
                TipsManager.showMessage('账号或密码不正确');
            }
        } else if (403 === httpStatus) {
            // TipsManager.showMessage('登录已失效，请重新登录');
        } else if (404 === httpStatus) {
            response.content = null;
            response.status = 404; 
        } else if (503 === httpStatus) {
            TipsManager.showMessage('服务器繁忙，请稍后再试');
        } else {
            if (response.status != 0) {
                TipsManager.showMsgFromStatusCode(response.status);
                console.log(response.error);
                response.content = null;
            }
        }
        return response;
    }
}