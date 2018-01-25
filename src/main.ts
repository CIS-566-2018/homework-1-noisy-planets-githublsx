import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 7,
  'Load Scene': loadScene, // A function pointer, essentially
  color: [182, 255, 208],
  shader: 'fun',
  drawable: 'sphere',
  size: 5.0,
  octaves: 5.0,
  depth: 0.56,
  strength: 0.45,
  size2: 12.0,
  octaves2: 4.0,//6.0,
  cloudoffsetdepth: 0.56,//0.65,
  cloudoffsetstrength: 1.8,//0.60
  cloudcolordepth: 0.37,//0.46,//0.65,
  cloudcolorstrength: 2.0,//1.4,//0.60
  cloudtransspeed: 0.1,
  cloudrotatespeed: 0.15,//0.15,
  planetrotatespeed: 0.1,//0.1,
  waterdepth: 0.30,
  waterstrength: 1.00,
  lddwater: 0.31,
  ldwater: 0.45,
  lwater: 0.50,
  lshore: 0.58,
  ldirt: 0.6,
  lrock: 0.79,
  lsnow: 0.89,
  ltreestart: 0.54,
  ltreeend: 0.79,
  cddwater: [1, 1, 1],
  cdwater: [28, 31, 87],
  cwater: [6, 66, 115],
  cshore: [205, 193, 156],
  cdirt: [190,	148, 100],
  crock: [124, 132, 133],
  csnow: [235, 235, 235],
  ctree: [61, 117, 43],
  //	 17,70,0
  colorwater: [0, 142, 255],//[15, 94, 156],//
  treesize: 14.0,
  treeoctaves: 6.0,
  treedepth: 0.27,
  treestrength: 2.0,
  shineness: 2.7,
  specularwater: [255, 240, 0],
  specularstrength: 15.4,
  specularalpha: 0.11,
  planetshineness: 3.0, //20.0,
  specularplanet: [	233, 255, 135],
  planetspecularstrength: 20, //75,
  ccloudshadow: [27, 16, 0],
  cloudshadowstrength: 5.0,
  ccloudshadow2: [	35, 35, 100],
  cloudshadowstrength2: 4.0,
  cloudshadowalpha: 0.3,
  nightcloudappear: 0.12,
  catomsphere: [21, 35, 80],
  atomspherestrength: 1.2,
  atomspherepower: 2.8,
  catomsphere2: [45, 242, 255],
  glowstrength: 1.3,
  glowpower: 1.6,
  glowcolor: [15, 94, 156],
  glowstrength2: 1,
  glowpower2: 7.5,
  glowcolor2: [	0, 44, 150],
  change: 0.0,
};

let icosphere: Icosphere;
let icosphere2: Icosphere;
let icosphere3: Icosphere;
let icosphere4: Icosphere;
let square: Square;
let cube: Cube;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  icosphere2 = new Icosphere(vec3.fromValues(0, 0, 0), 1.1, controls.tesselations);
  icosphere2.create();
  icosphere3 = new Icosphere(vec3.fromValues(0, 0, 0), 1.15, controls.tesselations);
  icosphere3.create();
  icosphere4 = new Icosphere(vec3.fromValues(0, 0, 0), 1.5, controls.tesselations);
  icosphere4.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 10).step(1);
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'change', 0, 1).step(0.01);
  //gui.addColor(controls, 'color');
  //gui.add(controls, 'shader', ['lambert','fun']);
  //gui.add(controls, 'drawable', ['cube','sphere','square']);
  var f1 = gui.addFolder('Planet');
  f1.add(controls, 'planetrotatespeed', 0, 1).step(0.01);
  f1.add(controls, 'cloudshadowstrength', 0, 10).step(0.01);
  var f10 = f1.addFolder('Landspace');
  f10.add(controls, 'size', 0, 20).step(0.01);
  f10.add(controls, 'octaves', 0, 7).step(1);
  f10.add(controls, 'depth', 0, 1).step(0.01);
  f10.add(controls, 'strength', 0, 2).step(0.01);
  var f11 = f1.addFolder('Altitude');
  f11.add(controls, 'lddwater', 0, 1).step(0.01);
  f11.add(controls, 'ldwater', 0, 1).step(0.01);
  f11.add(controls, 'lwater', 0, 1).step(0.01);
  f11.add(controls, 'lshore', 0, 1).step(0.01);
  f11.add(controls, 'ldirt', 0, 1).step(0.01);
  f11.add(controls, 'lrock', 0, 1).step(0.01);
  f11.add(controls, 'lsnow', 0, 1).step(0.01);
  var f12 = f1.addFolder('Color');
  f12.addColor(controls, 'cddwater');
  f12.addColor(controls, 'cdwater');
  f12.addColor(controls, 'cwater');
  f12.addColor(controls, 'cshore');
  f12.addColor(controls, 'cdirt');
  f12.addColor(controls, 'crock');
  f12.addColor(controls, 'csnow');
  f12.addColor(controls, 'ctree');
  f12.addColor(controls, 'ccloudshadow');
  var f13 = f1.addFolder('Tree');
  f13.add(controls, 'treesize', 0, 20).step(0.01);
  f13.add(controls, 'treeoctaves', 0, 7).step(1);
  f13.add(controls, 'treedepth', 0, 1).step(0.01);
  f13.add(controls, 'treestrength', 0, 10).step(0.01);
  f13.add(controls, 'ltreestart', 0, 1).step(0.01);
  f13.add(controls, 'ltreeend', 0, 1).step(0.01);
  var f14 = f1.addFolder('Specular');
  f14.add(controls, 'planetshineness', 0, 20).step(0.01);
  f14.addColor(controls, 'specularplanet');
  f14.add(controls, 'planetspecularstrength', 0, 100).step(0.01);
  var f2 = gui.addFolder('Cloud');
  f2.add(controls, 'size2', 0, 20).step(0.01);
  f2.add(controls, 'octaves2', 0, 7).step(1);
  f2.add(controls, 'cloudoffsetdepth', 0, 1).step(0.01);
  f2.add(controls, 'cloudoffsetstrength', 0, 2).step(0.01);
  f2.add(controls, 'cloudcolordepth', 0, 1).step(0.01);
  f2.add(controls, 'cloudcolorstrength', 0, 2).step(0.01);
  f2.add(controls, 'cloudtransspeed', 0, 1).step(0.01);
  f2.add(controls, 'cloudrotatespeed', 0, 1).step(0.01);
  var f3 = gui.addFolder('Water');
  var f30 = f3.addFolder('Basic');
  f30.addColor(controls, 'colorwater');
  f30.add(controls, 'waterdepth', 0, 1).step(0.01);
  f30.add(controls, 'waterstrength', 0, 1).step(0.01);
  var f31 = f3.addFolder('Specular');
  f31.addColor(controls, 'specularwater');
  f31.add(controls, 'shineness', 0, 20).step(0.01);
  f31.add(controls, 'specularstrength', 0, 100).step(0.01);
  f31.add(controls, 'specularalpha', 0, 1).step(0.01);
  var f32 = f3.addFolder('Cloud');
  f32.addColor(controls, 'ccloudshadow2');
  f32.add(controls, 'cloudshadowstrength2', 0, 10).step(0.01);
  f32.add(controls, 'cloudshadowalpha', 0, 1).step(0.01);
  f32.add(controls, 'nightcloudappear', 0, 1).step(0.01);
  var f4 = gui.addFolder('Atomsphere');
  f4.addColor(controls, 'catomsphere2');
  f4.addColor(controls, 'catomsphere');
  f4.add(controls, 'atomspherestrength', 0, 5).step(0.01);
  f4.add(controls, 'atomspherepower', 0, 5).step(0.01);
  f4.addColor(controls, 'glowcolor');
  f4.add(controls, 'glowstrength', 0, 20).step(0.01);
  f4.add(controls, 'glowpower', 0, 20).step(0.01);
  f4.addColor(controls, 'glowcolor2');
  f4.add(controls, 'glowstrength2', 0, 20).step(0.01);
  f4.add(controls, 'glowpower2', 0, 20).step(0.01);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(20/255, 14/255, 0.1, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.cullFace(gl.FRONT);
  gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const fun = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/planet-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/planet-frag.glsl')),
  ]);

  const cloud = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/cloud-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/cloud-frag.glsl')),
  ]);

  const water = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/water-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/water-frag.glsl')),
  ]);

  const glow = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/glow-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/glow-frag.glsl')),
  ]);

  const glow2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/glow2-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/glow2-frag.glsl')),
  ]);

  var lastUpdate = Date.now();

  // This function will be called every frame
  function tick() {
    //loadScene();
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    let shader = lambert;
    let drawable = [cube];
    var now = Date.now();
    var dt = now - lastUpdate;
    //lastUpdate = now;
    if(controls.shader == 'fun')
    {
      shader = fun;
    }
    if(controls.drawable == 'square')
    {
      drawable = [square];
    }
    else if(controls.drawable == 'sphere')
    {
      drawable = [icosphere];
    }
    fun.setSize(controls.size);
    fun.setOctaves(controls.octaves);
    fun.setDepth(controls.depth);
    fun.setStrength(controls.strength);
    fun.setRotatespeed(controls.planetrotatespeed);

    fun.setLddwater(controls.lddwater);
    fun.setLdwater(controls.ldwater);
    fun.setLwater(controls.lwater);
    fun.setLshore(controls.lshore);
    fun.setLdirt(controls.ldirt);
    fun.setLrock(controls.lrock);
    fun.setLsnow(controls.lsnow);
    fun.setLtreestart(controls.ltreestart);
    fun.setLtreeend(controls.ltreeend);
    fun.setCddwater(vec4.fromValues(controls.cddwater[0]/255, controls.cddwater[1]/255, controls.cddwater[2]/255, 1.0));
    fun.setCdwater(vec4.fromValues(controls.cdwater[0]/255, controls.cdwater[1]/255, controls.cdwater[2]/255, 1.0));
    fun.setCwater(vec4.fromValues(controls.cwater[0]/255, controls.cwater[1]/255, controls.cwater[2]/255, 1.0));
    fun.setCshore(vec4.fromValues(controls.cshore[0]/255, controls.cshore[1]/255, controls.cshore[2]/255, 1.0));
    fun.setCdirt(vec4.fromValues(controls.cdirt[0]/255, controls.cdirt[1]/255, controls.cdirt[2]/255, 1.0));
    fun.setCrock(vec4.fromValues(controls.crock[0]/255, controls.crock[1]/255, controls.crock[2]/255, 1.0));
    fun.setCsnow(vec4.fromValues(controls.csnow[0]/255, controls.csnow[1]/255, controls.csnow[2]/255, 1.0));
    fun.setCtree(vec4.fromValues(controls.ctree[0]/255, controls.ctree[1]/255, controls.ctree[2]/255, 1.0));
    fun.setCcloudshadow(vec4.fromValues(controls.ccloudshadow[0]/255, controls.ccloudshadow[1]/255, controls.ccloudshadow[2]/255, 1.0));

    //tree
    fun.setSize2(controls.treesize);
    fun.setOctaves2(controls.treeoctaves);
    fun.setDepth2(controls.treedepth);
    fun.setStrength2(controls.treestrength);

    //blinnphong
    fun.setShineness(controls.planetshineness);
    fun.setSpecularcolor(vec4.fromValues(controls.specularplanet[0]/255, controls.specularplanet[1]/255, controls.specularplanet[2]/255, 1.0));
    fun.setSpecularstrength(controls.planetspecularstrength);

    //cloudshadow
    fun.setSize3(controls.size2);
    fun.setOctaves3(controls.octaves2);
    fun.setDepth3(controls.cloudcolordepth);
    fun.setStrength3(controls.cloudshadowstrength);
    fun.setTransspeed3(controls.cloudtransspeed);
    fun.setRotatespeed3(controls.cloudrotatespeed);

    //atomsphere
    fun.setAtomscolor(vec4.fromValues(controls.catomsphere[0]/255, controls.catomsphere[1]/255, controls.catomsphere[2]/255, 1.0));
    fun.setAtomspower(controls.atomspherepower);
    fun.setAtomsstrength(controls.atomspherestrength);

    fun.setChange(controls.change);

    cloud.setSize(controls.size2);
    cloud.setOctaves(controls.octaves2);
    cloud.setDepth(controls.cloudoffsetdepth);
    cloud.setStrength(controls.cloudoffsetstrength);
    cloud.setDepth2(controls.cloudcolordepth);
    cloud.setStrength2(controls.cloudcolorstrength);
    cloud.setTransspeed(controls.cloudtransspeed);
    cloud.setRotatespeed(controls.cloudrotatespeed);
    cloud.setLsnow(controls.nightcloudappear);

    water.setDepth2(controls.waterdepth);
    water.setStrength2(controls.waterstrength);
    water.setShineness(controls.shineness);
    water.setSpecularcolor(vec4.fromValues(controls.specularwater[0]/255, controls.specularwater[1]/255, controls.specularwater[2]/255, controls.specularalpha));
    water.setSpecularstrength(controls.specularstrength);
    
    //cloudshadow
    water.setSize3(controls.size2);
    water.setOctaves3(controls.octaves2);
    water.setDepth3(controls.cloudcolordepth);
    water.setStrength3(controls.cloudshadowstrength2);
    water.setTransspeed3(controls.cloudtransspeed);
    water.setRotatespeed3(controls.cloudrotatespeed);
    water.setCcloudshadow(vec4.fromValues(controls.ccloudshadow2[0]/255, controls.ccloudshadow2[1]/255, controls.ccloudshadow2[2]/255, controls.cloudshadowalpha));

    //atomsphere
    water.setAtomscolor(vec4.fromValues(controls.catomsphere[0]/255, controls.catomsphere[1]/255, controls.catomsphere[2]/255, 0.0));
    water.setAtomspower(controls.atomspherepower);
    water.setAtomsstrength(controls.atomspherestrength);

    //glow: outside the planet
    glow.setAtomscolor(vec4.fromValues(controls.glowcolor[0]/255, controls.glowcolor[1]/255, controls.glowcolor[2]/255, 0.0));
    glow.setAtomspower(controls.glowpower);
    glow.setAtomsstrength(controls.glowstrength);

    //glow: on the planet
    glow2.setAtomscolor(vec4.fromValues(controls.glowcolor2[0]/255, controls.glowcolor2[1]/255, controls.glowcolor2[2]/255, 0.0));
    glow2.setAtomspower(controls.glowpower2);
    glow2.setAtomsstrength(controls.glowstrength2);

    gl.cullFace(gl.BACK);
    renderer.render(camera, glow, [icosphere4], //[icosphere,//square,cube,], 
      //vec4.fromValues(35/255, 137/255, 218/255, 1), dt/1000.0);
      vec4.fromValues(controls.catomsphere2[0]/255, controls.catomsphere2[1]/255, controls.catomsphere2[2]/255, 0.5), dt/1000.0);
    gl.cullFace(gl.FRONT);
    renderer.render(camera, fun, drawable, //[icosphere,//square,cube,], 
      vec4.fromValues(controls.color[0]/255, controls.color[1]/255, controls.color[2]/255, 1), dt/1000.0);
    renderer.render(camera, water, [icosphere], //[icosphere,//square,cube,], 
      //vec4.fromValues(35/255, 137/255, 218/255, 1), dt/1000.0);
      vec4.fromValues(controls.colorwater[0]/255, controls.colorwater[1]/255, controls.colorwater[2]/255, 0.0), dt/1000.0);
    renderer.render(camera, cloud, [icosphere2], //[icosphere,//square,cube,], 
      //vec4.fromValues(35/255, 137/255, 218/255, 1), dt/1000.0);
      vec4.fromValues(15/255, 94/255, 156/255, 0.1), dt/1000.0);
    // renderer.render(camera, lambert, [icosphere3], 
    //   vec4.fromValues(controls.catomsphere2[0]/255, controls.catomsphere2[1]/255, controls.catomsphere2[2]/255, 0.1), dt/1000.0);
    renderer.render(camera, glow2, [icosphere3], 
      vec4.fromValues(controls.catomsphere2[0]/255, controls.catomsphere2[1]/255, controls.catomsphere2[2]/255, 0.1), dt/1000.0);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
