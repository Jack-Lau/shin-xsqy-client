
let http = require('http');
let fs = require('fs');

let url = 'http://192.168.0.138:8080/kxy-web/api/view';

let response = '';

http.get(url, function(req, res) {
    req.on('data', function (data) {
        response += data;
    });
    req.on('end', function () {
        let apiJson = JSON.parse(response).content;
        let result = '[TOC]\n' + makeSubmodule(1, '', apiJson)
        fs.writeFileSync('./apiDoc/api.md', result)
    })
});

// -- json parse
function repeat(base, num) {
    let doRepeat = (base, num, result) => {
        if (num <= 0) {
            return result;
        }
        return doRepeat(base, num - 1, result + base);
    }
    return doRepeat(base, num, '');
}

function makeHeader(level, name) {
    return repeat('#', level, '') + ' ' + name + '\n'
} 

function makeItem(level, title, description) {
    return repeat('\t', level) + ' - ' + '\`' + title + '\`: ' + description + '\n'
}

function makeBaseItem(title) {
    return '**' + title + '**\n';
}

function makeQuote(content) {
    return '> ' + content + '\n\n'; 
}

function makeSelected(content) {
    return '\`' + content + '\`\n';
}



// (b -> a -> b) -> b -> [a] -> b
function foldl(func, acc, arr) {
    if (arr.length == 0) {
        return acc;
    }
    let value = arr.shift();
    return foldl(func, func(acc, value), arr);
}


function makeSubmodule(level, uri, obj) {
    let name = obj.name;
    let baseUri = uri + obj.baseUri;
    let subModules = foldl((x, y) => { return x + makeSubmodule(level + 1, baseUri, y); } , '', obj.submodules);
    let interface = foldl((x, y) => { return x + '\n---\n' +  makeInterface(baseUri, level + 2, y)}, '', obj.webInterfaces);
    let notification = foldl((x, y) => { return x + makeNotification(y)}, '', obj.webNotifications);
    return makeHeader(level, name) + makeQuote(baseUri)     
                + makeHeader(level + 1, '子模块') + subModules 
                + makeHeader(level + 1, '接口') + interface
                + makeHeader(level + 1, '通知') + notification;
}

function makeInterface(baseUri, level, obj) {
    return makeHeader(level, obj.description) 
            + makeBaseItem('路径') + makeQuote(baseUri + obj.uri)
            + makeBaseItem('请求方法') + makeSelected(obj.httpMethod)
            + makeBaseItem('参数') + makeParameters(obj.requestParameters)
            + makeBaseItem('返回值') + makeQuote(obj.responseJsonType)
            + makeBaseItem('状态码') + makeList(obj.expectableErrors)
}

function makeParameters(params) {
    let table = foldl((x, y) => {return x + makeTableItem(y)}, '', params);
    if (table == '') {
        return '无\n'
    } else {
        return makeTableHeader() + table;
    }
}

function makeTableHeader() {
    return '|name|type|description|\n|:-----------:|:-----------|:-----------|\n'
}

function makeTableItem(obj) {
    return '|' + obj.name + '|' + obj.type + '|' + obj.description + '|\n';
}

function makeList(arr) {
    return foldl((x, y) => {
        return x + makeItem(0, y.errorCode, y.description) 
    }, '', arr);
}

function makeNotification(obj) {
    return makeBaseItem('路径') + makeQuote(obj.destination)
        + makeBaseItem('描述') + makeQuote(obj.description);
}
