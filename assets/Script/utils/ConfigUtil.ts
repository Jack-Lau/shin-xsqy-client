export namespace ConfigUtils {
    let cache = {};
    export function getConfigJson(name: string): Promise<any> {
        return new Promise(function(resolve, reject) {
            if (cache[name]) {
                resolve(cache[name]);
            } else {
                cc.resources.load(`config/c${name}`, cc.JsonAsset, (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const json = (res.addRef() as cc.JsonAsset).json
                    cache[name] = json
                    resolve(json);
                });
            }
        });
    }
}