import { StatusHandler } from "./StatusHandler";
import { API } from "./Api";
import { CommonUtils } from "../utils/CommonUtils";
import { TimerUtils } from "../utils/TimerUtils";
import Optional from "../cocosExtend/Optional";
import Either from "../cocosExtend/Either";
import { getData, setData } from "../utils/LocalStorage";

export namespace NetUtils {
    /**
     * 如果某个字段传`NONE_VALUE`, 
     * 则该字段不会作为请求的参数
     */
    export const NONE_VALUE = "@__NONE_VALUE__@";

    const X_AUTH_TOKEN = 'X-Auth-Token'

    export enum RequestType {GET = 'GET', POST = 'POST', POST_JSON = 'post_json'}
    // let baseRoute = 'http://server.kxiyou.com/kxy-web';
    // export let wsRoute = 'ws://server.kxiyou.com/kxy-web/websocket';
    export const IsDebug = true;
    
    // const serverIpPort = cc.sys.isNative ? "games.yting.com.cn" : "192.168.0.138:8080/xsqy"
    const serverIpPort = IsDebug ? "192.168.0.138:8080/shin-xsqy" : "games.yting.com.cn"

    let baseRoute = `http://${serverIpPort}`
    const wsRoute = `ws://${serverIpPort}/websocket`;

    export function getWsRoute(): string {
        return `${wsRoute}?sessionid=${getData("xAuthToken")}`
    }

    // export function sendHttpRequest(type: RequestType, route: string, params: Array<any>, body = {}) {
    //     return new Promise<any>(function (resolve, reject) {
    //         // var xhr = new XMLHttpRequest();

    //         // xhr.withCredentials = true;
    //         let onload = function (response: Response) {
    //             resolve(StatusHandler.handle(response.status, response.json()));
    //         };
    //         let onerror = function() {
    //             reject(Error("Network Error"));
    //         }
    //         let request = getRequest(route, params);
    //         if (type == RequestType.POST) {
    //             let random = TimerUtils.now().toString();
    //             fetch(baseRoute + request.route, {
    //                 method: "POST",
    //                 credentials: "include",
    //                 headers: {
    //                     "Content-Type": "application/x-www-form-urlencoded",
    //                     "X-Timestamp": random,
    //                     "X-Nonce": CommonUtils.$_____(random)
    //                 },
    //                 body: request.params
    //             }).then(onload).catch(onerror)

    //         } else if (type == RequestType.GET) {
    //             fetch(baseRoute + request.route + "?" + request.params, {
    //                 method: "GET",
    //                 credentials: 'include',
    //                 body: null
    //             }).then(onload).catch(onerror)
    //         } else if (type == RequestType.POST_JSON) {
    //             let random = TimerUtils.now().toString();
    //             fetch(baseRoute + request.route, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     "X-Timestamp": random,
    //                     "X-Nonce": CommonUtils.$_____(random)
    //                 },
    //                 credentials: 'include',
    //                 body: JSON.stringify(body)
    //             }).then(onload).catch(onerror)
    //         }
    //     });
    // }

    export function sendHttpRequest(type: RequestType, route: string, params: Array<any>, body = {}, extraParams = {}) {
        if (IsDebug) {
            console.log(`uri: ${route}, params: ${JSON.stringify(params)}`)
        }
        return new Promise<any>(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            
            // xhr.withCredentials = true;
            xhr.onload = function () {
                if ('' !== xhr.response) {
                    const token = xhr.getResponseHeader(X_AUTH_TOKEN)
                    console.log(xhr.getAllResponseHeaders());
                    if (token) {
                        setData("xAuthToken", token)
                    }
                    resolve(StatusHandler.handle(xhr.status, JSON.parse(xhr.response)));
                } else {
                    resolve({content: 'ok'});
                }
            };
            xhr.onerror = function() {
                reject(Error("Network Error"));
            }
            var token = getData("xAuthToken") ?? ""
            let request = getRequest(route, params);
            const extra = Object.keys(extraParams).map(key => `${key}=${extraParams[key]}`).join('&')
           
            if (request.params.length === 0) {
                request.params = extra
            } else {
                request.params += "&" + extra
            }
            if (type == RequestType.POST) {
                xhr.open(type, baseRoute + request.route, true);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.setRequestHeader(X_AUTH_TOKEN, token)

                let random = TimerUtils.now().toString();
                xhr.setRequestHeader("X-Timestamp", random);
                xhr.setRequestHeader("X-Nonce", CommonUtils.$_____(random));
                xhr.send(request.params);
            } else if (type == RequestType.GET) {
                xhr.open(type, baseRoute + request.route + "?" + request.params, true);
                xhr.setRequestHeader(X_AUTH_TOKEN, token)
                xhr.send(null);
            } else if (type == RequestType.POST_JSON) {
                xhr.open(RequestType.POST, baseRoute + request.route, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader(X_AUTH_TOKEN, token)
                let random = TimerUtils.now().toString();
                xhr.setRequestHeader("X-Timestamp", random);
                xhr.setRequestHeader("X-Nonce", CommonUtils.$_____(random));
                xhr.send(JSON.stringify(body));
            }
        });
    }
    
    export async function get<T>(route: string, params: Array<any>, body = {}): Promise<Either<string, T>> {
        let response = await NetUtils.sendHttpRequest(RequestType.GET, route, params, body);
        if (response.status === 0) {
            return Either.Right<string, T>(response.content);
        }
        return Either.Left<string, T>(response.error)
    }

    export async function post<T>(route: string, params: Array<any>, body = {}): Promise<Either<string, T>> {
        let response = await NetUtils.sendHttpRequest(RequestType.POST, route, params, body);
        if (response.status === 0) {
            return Either.Right<string, T>(response.content);
        }
        return Either.Left<string, T>(response.error);
    }

    /****************************/
    /********* 参数生成 **********/
    /****************************/

    function copyData(data) {
        if (data instanceof Array) {
            return data.map((value) => {
                return copyData(value);
            })
        }
        let temp = data;
        return temp;
    }

    export function gen(key: string, value: string): string {
        return key + '=' + value;
    }


    let reg = new RegExp(/\{.*?\}/g);
    export function getRequest(route: string, value) {
        let requestParams = copyData(API.params[route]);
        let matchResult = route.match(reg);
        if (matchResult) {
            matchResult.forEach(p => {
                let paramName = p.slice(1, p.length-1)
                let index = requestParams.indexOf(paramName);
                requestParams.splice(index, index + 1);
                let paramValue = value.splice(index, index + 1);
                if (paramValue.length  == 0) {
                    cc.error('参数数量错误');
                    return;
                }
                route = route.replace(p, paramValue[0]);
            });
        }
        return {
            route: route,
            params: zipWith(gen, requestParams, value).join('&')
        }
    }

    /**
     * 
     * @param func a -> b -> c
     * @param a [a]
     * @param b [b]
     * return [c]
     */
    export function zipWith(func, a: Array<any>, b: Array<any>): Array<any> {
        let _doLift = function(func, tempA, tempB, tempC) {
            if (!tempA || !tempB || tempA.length == 0 || tempB.length == 0) {
                return tempC;
            }
            let va = tempA.shift();
            let vb = tempB.shift();
            if (vb !== NONE_VALUE) {
                if (vb == undefined) {
                    console.error(`参数${va}为空`)
                } else {
                    tempC.push(func(va, vb));
                }
            }
            return _doLift(func, tempA, tempB, tempC)
        }
        return _doLift(func, a, b, []);
    }

    // (b -> a -> b) -> b -> [a] -> b
    export function foldl(func, acc, arr: Array<any>) {
        if (arr.length == 0) {
            return acc;
        }
        let value = arr.shift();
        return foldl(func, func(acc, value), arr);
    }
}
