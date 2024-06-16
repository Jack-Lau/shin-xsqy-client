export module Shaders {
    export const _default_vert_no_mvp =
    `
    attribute vec4 a_position;
     attribute vec2 a_texCoord;
     attribute vec4 a_color;
     varying vec2 v_texCoord;
     varying vec4 v_fragmentColor;
     void main()
     {
         gl_Position = CC_PMatrix  * a_position;
         v_fragmentColor = a_color;
         v_texCoord = a_texCoord;
     }
    `

    export const _default_vert =
    `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    attribute vec4 a_color;
    varying vec2 v_texCoord;
    varying vec4 v_fragmentColor;
    void main()
    {
        gl_Position = CC_PMatrix * a_position;
        v_fragmentColor = a_color;
        v_texCoord = a_texCoord;
    }
    `

    export const _color_translate =
    `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec2 v_texCoord;
    varying vec4 v_fragmentColor;


    vec3 hueShift( vec3 color, float hueAdjust ) {
			const vec3  kRGBToYPrime = vec3 (0.299, 0.587, 0.114);
			const vec3  kRGBToI      = vec3 (0.596, -0.275, -0.321);
			const vec3  kRGBToQ      = vec3 (0.212, -0.523, 0.311);

			const vec3  kYIQToR     = vec3 (1.0, 0.956, 0.621);
			const vec3  kYIQToG     = vec3 (1.0, -0.272, -0.647);
			const vec3  kYIQToB     = vec3 (1.0, -1.107, 1.704);

			float   YPrime  = dot (color, kRGBToYPrime);
			float   I       = dot (color, kRGBToI);
			float   Q       = dot (color, kRGBToQ);
			float   hue     = atan (Q, I);
			float   chroma  = sqrt (I * I + Q * Q);

			hue += hueAdjust;

			Q = chroma * sin (hue);
			I = chroma * cos (hue);

			vec3    yIQ   = vec3 (YPrime, I, Q);

			return vec3( dot (yIQ, kYIQToR), dot (yIQ, kYIQToG), dot (yIQ, kYIQToB) );

	}

    vec3 rgb2hsv(vec3 c)
    {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    vec3 hsv2rgb(vec3 c)
    {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    vec3 format_rgb(vec3 c) {
        return vec3(c.x, c.x, c.x);
    }

    void main()
    {
        float delta_h = _Hue_;  // [0, 1]  色相
        float delta_s = _Saturation_;  // [0, 1]  饱和度
        float delta_v = _Brightness_;  // [0, 1]  亮度

        gl_FragColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
        vec3 hsv = rgb2hsv(format_rgb(gl_FragColor.rgb));

        hsv.x = mod(hsv.x * 360.0 + delta_h , 360.0) / 360.0;
        hsv.y = max(0.0, min(hsv.y + delta_s, 1.0));
        hsv.z = max(0.0, min(hsv.z + delta_v, 1.0));

        vec3 rgb = hsv2rgb(hsv);
        if (texture2D(CC_Texture0, v_texCoord).a == 0.0) {
            discard;
        } else {
            gl_FragColor = vec4(rgb.r, rgb.g, rgb.b, texture2D(CC_Texture0, v_texCoord).a);
        }
    }
    `
}
