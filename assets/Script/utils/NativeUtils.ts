import { TipsManager } from "../base/TipsManager"
import { Notify } from "../config/Notify"
import { CommonUtils } from "./CommonUtils"
import { EventDispatcher } from "./event/EventDispatcher"

export function showVideoAd(sceneId: number) {
  if (cc.sys.os === cc.sys.OS_ANDROID) {
    jsb.reflection.callStaticMethod(
      "com/yting/gdt_reward_video/RewardVideoActivity", 
      "showAd", 
      "(I)V",
      sceneId
    )
  } else if (cc.sys.os === cc.sys.OS_IOS) {
    jsb.reflection.callStaticMethod(
      "GDTUtils",
      "showAd:",
      `${sceneId}`
    )
  }
}

export function loadVideoAd(sceneId: number) {
  jsb.reflection.callStaticMethod(
    "com/yting/gdt_reward_video/RewardVideoActivity", 
    "loadAd", 
    "(I)V",
    sceneId
  )
}

export function loginWithTaptap() {
  if (cc.sys.os === cc.sys.OS_ANDROID) {
  jsb.reflection.callStaticMethod(
    "com/yting/taptap/TapTapUtils", 
    "login", 
    "()V"
  );
  } else if (cc.sys.os === cc.sys.OS_IOS) {
    (jsb.reflection.callStaticMethod as any)(
      "TapUtils",
      "login",
    );
  }
}

export function signinWithApple() {
  if (cc.sys.os === cc.sys.OS_IOS) {
    (jsb.reflection.callStaticMethod as any)(
      "AppleUtils",
      "signinWithApple"
    )
  }
}

export function openForum(sceneId: string) {
  if (cc.sys.os === cc.sys.OS_IOS) {
    jsb.reflection.callStaticMethod("TapUtils", "openForum:", sceneId)
  } else {
    jsb.reflection.callStaticMethod("com/yting/taptap/TapTapUtils", "openForum", "(Ljava/lang/String;)V", sceneId)
  }
}

export function onAdSuccess() {
  EventDispatcher.dispatch(Notify.ON_AD_SUCCESS, {})
}

export function onTapLoginSuccess(accessToken: string, macKey: string) {
  EventDispatcher.dispatch(Notify.ON_TAP_LOGIN_SUCCESS, {accessToken, macKey})
}

export function onSigninWithAppleSuccess(code: string, token: string) {
  EventDispatcher.dispatch(Notify.ON_APPLE_SIGNIN_SUCCESS, {code, token})
}


/** 打开captcha */
export function openCaptcha() {
  if (cc.sys.os === cc.sys.OS_IOS) {
    (jsb.reflection.callStaticMethod as any)("CaptchaUtils", "openCaptcha")
  } else {
    jsb.reflection.callStaticMethod("com/yting/captcha/CaptchaUtils", "openCaptcha", "()V")
  }
} 

/** 
 * captcha操作回调 
 * success: 操作是否成功
 * data: { randstr: string, ticket: string }
*/
export function onCaptcha(success: boolean, data: string) {
  console.log(`success: ${success}, data: ${data}`)
  if (success) {
    const value: any = JSON.parse(data);
    CommonUtils.getCaptchaCompleter().complete(value)
  } else {
    TipsManager.showMessage('验证失败, 请再次验证');
    CommonUtils.getCaptchaCompleter().completeError("user cancel")
  }
}

/**
 * 打开更新
 */
export function openBrowser() {
  if (cc.sys.os === cc.sys.OS_IOS) {
    (jsb.reflection.callStaticMethod as any)("AppleUtils", "openBrowser")
  } else {
    jsb.reflection.callStaticMethod("com/yting/javascript/XsqyHelper", "openBrowser", "()V")
  }
}