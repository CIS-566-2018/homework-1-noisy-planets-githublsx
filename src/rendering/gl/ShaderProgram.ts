import {vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;

  unifTime: WebGLUniformLocation;
  unifSize: WebGLUniformLocation;
  unifOctaves: WebGLUniformLocation;
  unifDepth: WebGLUniformLocation;
  unifStrength: WebGLUniformLocation;

  unifTransspeed: WebGLUniformLocation;
  unifRotatespeed: WebGLUniformLocation;

  unifSize2: WebGLUniformLocation;
  unifOctaves2: WebGLUniformLocation;
  unifDepth2: WebGLUniformLocation;
  unifStrength2: WebGLUniformLocation;

  unifLddwater: WebGLUniformLocation;
  unifLdwater: WebGLUniformLocation;
  unifLwater: WebGLUniformLocation;
  unifLshore: WebGLUniformLocation;
  unifLdirt: WebGLUniformLocation;
  unifLrock: WebGLUniformLocation;
  unifLsnow: WebGLUniformLocation;
  unifLtreestart: WebGLUniformLocation;
  unifLtreeend: WebGLUniformLocation;

  unifCddwater: WebGLUniformLocation;
  unifCdwater: WebGLUniformLocation;
  unifCwater: WebGLUniformLocation;
  unifCshore: WebGLUniformLocation;
  unifCdirt: WebGLUniformLocation;
  unifCrock: WebGLUniformLocation;
  unifCsnow: WebGLUniformLocation;
  unifCtree: WebGLUniformLocation;
  unifCcloudshadow: WebGLUniformLocation;

  unifCamerapos: WebGLUniformLocation;
  unifShineness: WebGLUniformLocation;
  unifSpecularcolor: WebGLUniformLocation;
  unifSpecularstrength: WebGLUniformLocation;

  unifSize3: WebGLUniformLocation;
  unifOctaves3: WebGLUniformLocation;
  unifDepth3: WebGLUniformLocation;
  unifStrength3: WebGLUniformLocation;
  unifTransspeed3: WebGLUniformLocation;
  unifRotatespeed3: WebGLUniformLocation;

  unifEyedirect: WebGLUniformLocation;
  unifAtomspower: WebGLUniformLocation;
  unifAtomsstrength: WebGLUniformLocation;
  unifAtomscolor: WebGLUniformLocation;

  unifChange: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor      = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime       = gl.getUniformLocation(this.prog, "u_Time");

    this.unifSize       = gl.getUniformLocation(this.prog, "u_size");
    this.unifOctaves       = gl.getUniformLocation(this.prog, "u_octaves");
    this.unifDepth       = gl.getUniformLocation(this.prog, "u_depth");
    this.unifStrength       = gl.getUniformLocation(this.prog, "u_strength");

    this.unifTransspeed       = gl.getUniformLocation(this.prog, "u_transspeed");
    this.unifRotatespeed      = gl.getUniformLocation(this.prog, "u_rotatespeed");

    this.unifSize2       = gl.getUniformLocation(this.prog, "u_size2");
    this.unifOctaves2       = gl.getUniformLocation(this.prog, "u_octaves2");
    this.unifDepth2       = gl.getUniformLocation(this.prog, "u_depth2");
    this.unifStrength2      = gl.getUniformLocation(this.prog, "u_strength2");
    
    this.unifDepth2       = gl.getUniformLocation(this.prog, "u_depth2");
    this.unifStrength2      = gl.getUniformLocation(this.prog, "u_strength2");

    this.unifLdwater       = gl.getUniformLocation(this.prog, "l_dwater");
    this.unifLddwater       = gl.getUniformLocation(this.prog, "l_ddwater");
    this.unifLwater       = gl.getUniformLocation(this.prog, "l_water");
    this.unifLshore      = gl.getUniformLocation(this.prog, "l_shore");
    this.unifLdirt       = gl.getUniformLocation(this.prog, "l_dirt");
    this.unifLrock      = gl.getUniformLocation(this.prog, "l_rock");
    this.unifLsnow      = gl.getUniformLocation(this.prog, "l_snow");
    this.unifLtreestart      = gl.getUniformLocation(this.prog, "l_treestart");
    this.unifLtreeend      = gl.getUniformLocation(this.prog, "l_treeend");

    this.unifCddwater       = gl.getUniformLocation(this.prog, "c_ddwater");
    this.unifCdwater       = gl.getUniformLocation(this.prog, "c_dwater");
    this.unifCwater       = gl.getUniformLocation(this.prog, "c_water");
    this.unifCshore      = gl.getUniformLocation(this.prog, "c_shore");
    this.unifCdirt       = gl.getUniformLocation(this.prog, "c_dirt");
    this.unifCrock      = gl.getUniformLocation(this.prog, "c_rock");
    this.unifCsnow      = gl.getUniformLocation(this.prog, "c_snow");
    this.unifCtree      = gl.getUniformLocation(this.prog, "c_tree");
    this.unifCcloudshadow      = gl.getUniformLocation(this.prog, "c_cloudshadow");

    this.unifCamerapos      = gl.getUniformLocation(this.prog, "u_camerapos");
    this.unifShineness      = gl.getUniformLocation(this.prog, "u_shineness");
    this.unifSpecularcolor      = gl.getUniformLocation(this.prog, "u_specularcolor");
    this.unifSpecularstrength      = gl.getUniformLocation(this.prog, "u_specularstrength");

    this.unifSize3       = gl.getUniformLocation(this.prog, "u_size3");
    this.unifOctaves3       = gl.getUniformLocation(this.prog, "u_octaves3");
    this.unifDepth3       = gl.getUniformLocation(this.prog, "u_depth3");
    this.unifStrength3      = gl.getUniformLocation(this.prog, "u_strength3");
	  this.unifTransspeed3       = gl.getUniformLocation(this.prog, "u_transspeed3");
    this.unifRotatespeed3      = gl.getUniformLocation(this.prog, "u_rotatespeed3");

    this.unifEyedirect      = gl.getUniformLocation(this.prog, "u_eyedirt");
    this.unifAtomspower      = gl.getUniformLocation(this.prog, "u_atomspower");
    this.unifAtomsstrength      = gl.getUniformLocation(this.prog, "u_atomsstrength");
    this.unifAtomscolor      = gl.getUniformLocation(this.prog, "u_atomscolor");

    this.unifChange = gl.getUniformLocation(this.prog, "u_change");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, time);
    }
  }

  setSize(time: number) {
    this.use();
    if (this.unifSize !== -1) {
      gl.uniform1f(this.unifSize, time);
    }
  }

  setOctaves(time: number) {
    this.use();
    if (this.unifOctaves !== -1) {
      gl.uniform1f(this.unifOctaves, time);
    }
  }

  setDepth(time: number) {
    this.use();
    if (this.unifDepth !== -1) {
      gl.uniform1f(this.unifDepth, time);
    }
  }

  setStrength(time: number) {
    this.use();
    if (this.unifStrength !== -1) {
      gl.uniform1f(this.unifStrength, time);
    }
  }

  setSize2(time: number) {
    this.use();
    if (this.unifSize2 !== -1) {
      gl.uniform1f(this.unifSize2, time);
    }
  }

  setOctaves2(time: number) {
    this.use();
    if (this.unifOctaves2 !== -1) {
      gl.uniform1f(this.unifOctaves2, time);
    }
  }

  setDepth2(time: number) {
    this.use();
    if (this.unifDepth2 !== -1) {
      gl.uniform1f(this.unifDepth2, time);
    }
  }

  setStrength2(time: number) {
    this.use();
    if (this.unifStrength2 !== -1) {
      gl.uniform1f(this.unifStrength2, time);
    }
  }

  setTransspeed(time: number) {
    this.use();
    if (this.unifTransspeed !== -1) {
      gl.uniform1f(this.unifTransspeed, time);
    }
  }

  setRotatespeed(time: number) {
    this.use();
    if (this.unifRotatespeed !== -1) {
      gl.uniform1f(this.unifRotatespeed, time);
    }
  }

  setLddwater(time: number) {
    this.use();
    if (this.unifLddwater !== -1) {
      gl.uniform1f(this.unifLddwater, time);
    }
  }

  setLdwater(time: number) {
    this.use();
    if (this.unifLdwater !== -1) {
      gl.uniform1f(this.unifLdwater, time);
    }
  }

  setLwater(time: number) {
    this.use();
    if (this.unifLwater !== -1) {
      gl.uniform1f(this.unifLwater, time);
    }
  }

  setLshore(time: number) {
    this.use();
    if (this.unifLshore !== -1) {
      gl.uniform1f(this.unifLshore, time);
    }
  }

  setLdirt(time: number) {
    this.use();
    if (this.unifLdirt !== -1) {
      gl.uniform1f(this.unifLdirt, time);
    }
  }

  setLrock(time: number) {
    this.use();
    if (this.unifLrock !== -1) {
      gl.uniform1f(this.unifLrock, time);
    }
  }

  setLsnow(time: number) {
    this.use();
    if (this.unifLsnow !== -1) {
      gl.uniform1f(this.unifLsnow, time);
    }
  }

  setLtreestart(time: number) {
    this.use();
    if (this.unifLtreestart !== -1) {
      gl.uniform1f(this.unifLtreestart, time);
    }
  }

  setLtreeend(time: number) {
    this.use();
    if (this.unifLtreeend !== -1) {
      gl.uniform1f(this.unifLtreeend, time);
    }
  }

  setCddwater(color: vec4) {
    this.use();
    if (this.unifCddwater !== -1) {
      gl.uniform4fv(this.unifCddwater, color);
    }
  }

  setCdwater(color: vec4) {
    this.use();
    if (this.unifCdwater !== -1) {
      gl.uniform4fv(this.unifCdwater, color);
    }
  }

  setCwater(color: vec4) {
    this.use();
    if (this.unifCwater !== -1) {
      gl.uniform4fv(this.unifCwater, color);
    }
  }

  setCshore(color: vec4) {
    this.use();
    if (this.unifCshore !== -1) {
      gl.uniform4fv(this.unifCshore, color);
    }
  }

  setCdirt(color: vec4) {
    this.use();
    if (this.unifCdirt !== -1) {
      gl.uniform4fv(this.unifCdirt, color);
    }
  }

  setCrock(color: vec4) {
    this.use();
    if (this.unifCrock !== -1) {
      gl.uniform4fv(this.unifCrock, color);
    }
  }

  setCsnow(color: vec4) {
    this.use();
    if (this.unifCsnow !== -1) {
      gl.uniform4fv(this.unifCsnow, color);
    }
  }

  setCtree(color: vec4) {
    this.use();
    if (this.unifCtree !== -1) {
      gl.uniform4fv(this.unifCtree, color);
    }
  }

  setCcloudshadow(color: vec4) {
    this.use();
    if (this.unifCcloudshadow !== -1) {
      gl.uniform4fv(this.unifCcloudshadow, color);
    }
  }

  setCamerapos(pos: vec4) {
    this.use();
    if (this.unifCamerapos !== -1) {
      gl.uniform4fv(this.unifCamerapos, pos);
    }
  }

  setShineness(time: number) {
    this.use();
    if (this.unifShineness !== -1) {
      gl.uniform1f(this.unifShineness, time);
    }
  }

  setSpecularcolor(pos: vec4) {
    this.use();
    if (this.unifSpecularcolor !== -1) {
      gl.uniform4fv(this.unifSpecularcolor, pos);
    }
  }
  
  setSpecularstrength(time: number) {
    this.use();
    if (this.unifSpecularstrength !== -1) {
      gl.uniform1f(this.unifSpecularstrength, time);
    }
  }

  setSize3(time: number) {
    this.use();
    if (this.unifSize3 !== -1) {
      gl.uniform1f(this.unifSize3, time);
    }
  }

  setOctaves3(time: number) {
    this.use();
    if (this.unifOctaves3 !== -1) {
      gl.uniform1f(this.unifOctaves3, time);
    }
  }

  setDepth3(time: number) {
    this.use();
    if (this.unifDepth3 !== -1) {
      gl.uniform1f(this.unifDepth3, time);
    }
  }

  setStrength3(time: number) {
    this.use();
    if (this.unifStrength3 !== -1) {
      gl.uniform1f(this.unifStrength3, time);
    }
  }

  setTransspeed3(time: number) {
    this.use();
    if (this.unifTransspeed3 !== -1) {
      gl.uniform1f(this.unifTransspeed3, time);
    }
  }

  setRotatespeed3(time: number) {
    this.use();
    if (this.unifRotatespeed3 !== -1) {
      gl.uniform1f(this.unifRotatespeed3, time);
    }
  }

  setEyedirect(pos: vec4) {
    this.use();
    if (this.unifEyedirect !== -1) {
      gl.uniform4fv(this.unifEyedirect, pos);
    }
  }

  setAtomsstrength(time: number) {
    this.use();
    if (this.unifAtomsstrength !== -1) {
      gl.uniform1f(this.unifAtomsstrength, time);
    }
  }

  setAtomspower(time: number) {
    this.use();
    if (this.unifAtomspower !== -1) {
      gl.uniform1f(this.unifAtomspower, time);
    }
  }

  setAtomscolor(pos: vec4) {
    this.use();
    if (this.unifAtomscolor !== -1) {
      gl.uniform4fv(this.unifAtomscolor, pos);
    }
  }

  setChange(time: number) {
    this.use();
    if (this.unifChange !== -1) {
      gl.uniform1f(this.unifChange, time);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }
};

export default ShaderProgram;
