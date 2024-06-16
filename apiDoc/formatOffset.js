let fs = require('fs');
let offset = fs.readFileSync('../assets/resources/config/ModelPivot.json', {encoding:"utf-8"});
offset = JSON.parse(offset)
console.log(JSON.stringify(offset['1086']))
let formatOffet = {};
function format(offset) {
    for (let k in offset) {
        let value = offset[k];
        if (!value.modelId) {
            return;
        }
        console.log(k)
        let newKey = [value.modelId +'', value.action, value.orientation].join('_')
        let newValue = {
            x: value.pivotX,
            y: value.pivotY
        }
        formatOffet[newKey] = newValue;
    }
    fs.writeFileSync('./ModelOffset.ts', 'export module ModelOffset { export let offset=' + JSON.stringify(formatOffet) + ';}')
}

format(offset);