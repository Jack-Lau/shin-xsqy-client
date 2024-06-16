import { TipsManager } from "../base/TipsManager";

export module OpenApp {
    export function openApp(appUrl, downLoadUrl) {
        let ua = navigator.userAgent.toLocaleLowerCase();
        let openBrowser = null;
        let deviceVersion = 0;
        let matchVersion = null;
        let openAppType = "oldType";

        //如果是在微信内部点击的时候
        if (ua.indexOf("micromessenger") != -1) {
            TipsManager.showMessage('微信中不允许跳转到其他app');
        } else {
            //在浏览器打开，判断是在移动端还是在PC端
            if (matchVersion = navigator.userAgent.match(/OS\s*(\d+)/)) {
                //赋值，并且判断
                //IOS设备的浏览器
                deviceVersion = matchVersion[1] || 0;
                if (deviceVersion - 9 >= 0) {
                    openAppType = "newType";
                }
            } else if (matchVersion = navigator.userAgent.match(/Android\s*(\d+)/)) {
                //Android的设备
                deviceVersion = matchVersion[1] || 0;

                if (deviceVersion - 5 >= 0) {
                    openAppType = "newType";
                }

            } else {
                //PC端的设备
                openAppType = "pc";
            }


            if (openAppType == "pc") {
                // PC提示
                TipsManager.showMessage('请在手机端操作~');
            } else if (openAppType == "newType") {
                //使用新的方法，尝试打开APP
                //IOS>9,Android>5的版本
                let history = window.history;
                let body = document.body;
                let iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.setAttribute('z-index', '101');
                iframe.setAttribute('border', 'none');
                iframe.setAttribute('width', '100%');
                iframe.setAttribute('height', '100%');
                iframe.style.position = 'absolute';
                iframe.style.top = '0px'; iframe.style.left = '0px';
                iframe.style.right = '0px'; iframe.style.bottom = '0px';
                iframe.style.background = 'White';
                iframe.src = downLoadUrl;
                body.appendChild(iframe);
                window.addEventListener('popstate', function (e) {
                    let state = history.state;
                    if (!state) {
                        iframe.style.display = 'none';
                    }
                });

                let _show = () => {
                    history.pushState({}, '下载APP链接页', "");
                    iframe.style.display = 'inline';
                }

                location.href = appUrl;
                _show();

                //     $(window).on("popstate",function(e){
                //         var state = history.state;

                //         if(!state){
                //             ifr.addClass("dn");
                //         }
                //     });

                //     function _show(){
                //         history.pushState({}, "下载APP链接页", "");
                //         ifr.removeClass("dn");
                //     }

                //     _openAppUrl = function(url){
                //         location.href = url;
                //         _show();
                //     }

                //     _openAppUrl(url);

                // }
            } else {
                //使用计算时差的方案打开APP
                let now = () => {
                    return (new Date()).getTime();
                }
                var checkOpen = (cb) => {
                    let _clickTime = now();
                    let _count = 0;
                    let intHandle: any = 0;

                    //启动间隔20ms运行的定时器，并检测累计消耗时间是否超过3000ms，超过则结束
                    intHandle = setInterval(() => {
                        _count++;
                        var elsTime = now() - _clickTime;

                        if (_count >= 100 || elsTime > 3000) {
                            clearInterval(intHandle);
                            //计算结束，根据不同，做不同的跳转处理，0表示已经跳转APP成功了
                            if (elsTime > 3000 || document.hidden) {
                                cb(0);
                            } else {
                                cb(1);
                            }
                        }
                    }, 20);
                }

                var ifr = document.createElement('iframe');

                ifr.src = appUrl;
                ifr.style.display = 'none';

                checkOpen(function (opened) {
                    if (opened === 1) {
                        location.href = downLoadUrl;
                    }
                });

                document.body.appendChild(ifr);

                setTimeout(function () {
                    document.body.removeChild(ifr);
                }, 2000);

            }

        }

    }




}