let http = require('http');
let js2t = require('json-schema-to-typescript');
let fs = require('fs');

let url = 'http://192.168.0.138:8080/kxy-web/api/types';

let schema = '';
// let reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g
http.get(url, function (req, res) {
    req.on('data', function (data) {
        schema += data;
    });
    req.on('end', async function () {
        let jsonSchema = JSON.parse(schema).content;
        fs.writeFileSync('./assets/Script/net/Protocol.d.ts', jsonSchema);
    });
});
