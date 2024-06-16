import ShaderMaterial from "./ShaderMaterial";
import { Shaders } from "./Shaders";

export default class ShaderManager {
  static useShader(sprite: cc.Sprite, frag: string): ShaderMaterial {
    if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
      console.warn('Shader not surpport for canvas');
      return;
    }
    // 隐藏后重新显示错误修正
    if (!sprite || !sprite.spriteFrame) {
      return;
    }
    let name = "COLOR_TRANSLATE";
    const lab: any = {
      vert: Shaders._default_vert,
      frag
    }
    console.log(name);
    if (!lab) {
      console.warn('Shader not defined', name);
      return;
    }
    cc.dynamicAtlasManager.enabled = false;
    let material = new ShaderMaterial(name, lab.vert, lab.frag, lab.defines ?? []);
    let texture = sprite.spriteFrame.getTexture();
    material.setTexture(texture, !!lab.flipY);
    material.setPos(sprite.node.width, sprite.node.height);
    material.updateHash();
    let sp = sprite as any;
    sp._material = material;
    sp._renderData._material = material;
    sp._state = 100;
    return material;
  }
}
