
let http = require('http');
let fs = require('fs');

let url = 'http://192.168.0.138:8080/xsqy/api/view';

let response = '';

http.get(url, function(req, res) {
    req.on('data', function (data) {
        response += data;
    });
    req.on('end', function () {
        let apiJson = JSON.parse(response).content;
        let result = makeSubmodule(1, '', apiJson);
        result = 'export namespace API {\n\texport const params={\n' + result.replace(/,]/g, '],\n') + '}}';
        result = result.replace(/\[\]/g, '[],\n').replace(/,}/g, '}');
        fs.writeFileSync('./assets/Script/net/Api.ts', result);
    });
});

// -- json parse
function repeat(base, num) {
    let doRepeat = (base, num, result) => {
        if (num <= 0) {
            return result;
        }
        return doRepeat(base, num - 1, result + base);
    };
    return doRepeat(base, num, '');
}

function makeHeader(level, name) {
    return repeat('#', level, '') + ' ' + name + '\n';
} 

function makeItem(level, title, description) {
    return repeat('\t', level) + ' - ' + '\`' + title + '\`: ' + description + '\n';
}

function makeQuote(content) {
    return '> ' + content + '\n'; 
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
    if (obj.baseUri.startsWith('/management/')) {
        return ""
    }
    let name = obj.name;
    let baseUri = uri + obj.baseUri;
    let subModules = foldl((x, y) => { return x + makeSubmodule(level + 1, baseUri, y); } , '', obj.submodules);
    let interface = foldl((x, y) => { return x + makeInterface(baseUri, level + 1, y)}, '', obj.webInterfaces);
    return subModules + interface;
}

function makeInterface(baseUri, level, obj) {
    return '\t\t\"' + baseUri + obj.uri + '\":' + makeParameters(obj.requestParameters)
}

function makeParameters(params) {
    return foldl((x, y) => {return x + '\"' + y.name + '\",'}, '[', params) + ']';
    
}

function makeTableHeader() {
    return '|name|type|description|\n|:-----------:|:-----------|:-----------|\n';
}

function makeTableItem(obj) {
    return '|' + obj.name + '|' + obj.type + '|' + obj.description + '|\n';
}

