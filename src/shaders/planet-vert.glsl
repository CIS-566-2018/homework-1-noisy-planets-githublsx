#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTr;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    // The matrix that defines the camera's transformation.
                            // We've written a static matrix for you to use for HW2,
                            // but in HW3 you'll have to generate one yourself

in vec4 vs_Pos;             // The array of vertex positions passed to the shader

in vec4 vs_Nor;             // The array of vertex normals passed to the shader

in vec4 vs_Col;             // The array of vertex colors passed to the shader.

out vec4 fs_Nor;            // The array of normals that has been transformed by u_ModelInvTr. This is implicitly passed to the fragment shader.
out vec4 fs_LightVec;       // The direction in which our virtual light lies, relative to each vertex. This is implicitly passed to the fragment shader.
out vec4 fs_Col;            // The color of each vertex. This is implicitly passed to the fragment shader.
out vec3 fs_fragVertexEc;

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of
                                        //the geometry in the fragment shader.

uniform float u_Time;

uniform float u_size;
uniform float u_octaves;
uniform float u_depth;
uniform float u_strength;

uniform float u_size2;
uniform float u_octaves2;
uniform float u_depth2;
uniform float u_strength2;

uniform float u_rotatespeed;

uniform float u_size3;
uniform float u_octaves3;
uniform float u_depth3;
uniform float u_strength3;
uniform float u_rotatespeed3;
uniform float u_transspeed3;

uniform float l_treestart;
uniform float l_treeend;

uniform vec4 u_camerapos;
uniform float u_change;

out float fs_offset;
out float fs_treecover;
out float fs_cloud;
out vec4 fs_EyeVec;
out vec4 fs_Nor2;
#define M_PI 3.1415926535897932384626433832795

float gettreeh( float h, float start, float end)
{
    float treeh = clamp(h, start, end);
    treeh =  (treeh - start) * 2. * M_PI / (end - start) - M_PI;
    return (cos(treeh) + 1.0)/2.0;
}

//https://www.shadertoy.com/view/4djSRW
#define HASHSCALE1 .1031
float hash(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}


float Noise3d(vec3 p)
{
    vec3 i = floor(p);
	vec3 f = fract(p); 
	//https://www.shadertoy.com/view/4dS3Wd
	//For performance, compute the base input to a 1D hash from the integer part of the argument and the 
    //incremental change to the 1D based on the 3D -> 1D wrapping
	const vec3 step = vec3(110, 241, 171);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

float FBM(vec3 p, float Octaves)
{
	p *= .5;
    float f = 0.0;
	float amplitude = 0.5;
	for(int i = 0;i < int(Octaves);i++)
	{
		f += amplitude * abs(Noise3d(p));
		p *= 3.0;
		amplitude *= 0.5;
	}
    return 1.0 - f;
}

float FBM2(vec3 p, float Octaves)
{
	p *= .5;
    float f = 0.0;
	float amplitude = 0.45;
    vec3 ptemp = p;
	for(int i = 0;i < int(Octaves);i++)
	{
		f += amplitude * Noise3d(ptemp);
        ptemp = rotate(ptemp,vec3(0.0, 1.0, 0.0),u_Time * u_transspeed3*(1.0-amplitude));
		ptemp *= 2.0;
		amplitude *= 0.45;
	}
    return f;
}

vec3 computenormal(vec3 pos, float e)
{
    return normalize(vec3(FBM(pos - vec3(e, 0.0, 0.0), u_octaves) - FBM(pos + vec3(e, 0.0, 0.0), u_octaves), 
                FBM(pos - vec3(0.0, e, 0.0), u_octaves) - FBM(pos + vec3(0.0, e, 0.0), u_octaves),
                FBM(pos - vec3(0.0, 0.0, e), u_octaves) - FBM(pos + vec3(0.0, 0.0, e), u_octaves)));
}

void main()
{
    fs_Col = vs_Col;                         // Pass the vertex colors to the fragment shader for interpolation

    vec4 change = vec4(sin(u_Time + vs_Pos.x + M_PI) / 5., cos(u_Time + vs_Pos.y) / 5., sin(u_Time + vs_Pos.z) / 5., 1.0);
    float change2 = cos(u_Time / 10. + vs_Pos.y) / 2.0 + 0.5;
    float change3 = sin(u_Time / 5.+ M_PI + vs_Pos.x) / 2.0 + 1.0;
    vec3 changedpos = (vec3(vs_Pos) + change2 * vec3(vs_Nor) + vec3(change)) * max(u_size - 1.0, 0.1) * change3;
    changedpos = mix(vec3(vs_Pos) * u_size, changedpos, u_change);
    float h1 = FBM(changedpos, u_octaves);
    float h2 = FBM(vec3(vs_Pos * u_size2), u_octaves2);
    vec3 ori_pos = rotate(vec3(vs_Pos)+vec3(vs_Nor)*0.1, vec3(0.0, 1.0, 0.0), -u_Time * u_rotatespeed);
    float h3 = FBM2(vec3(rotate(ori_pos, vec3(0.0, 1.0, 0.0), u_Time * u_rotatespeed3) * u_size3), u_octaves3);
    //fs_offset = h1 * sin(u_Time + (h1 + 0.5) * 40.0);
    fs_offset = h1;
    fs_treecover = clamp((h2 - u_depth2) * u_strength2, 0.0, 1.0);
    fs_cloud = clamp((h3 - u_depth3) * u_strength3, 0.0, 1.0);

    //mat4 rotatematrix = rotationMatrix(vec3(0.0, 1.0, 0.0), u_Time );

    //vec4 modelposition = u_Model * rotatematrix * (vs_Pos + 0.5 * vs_Nor * sin(h1 + sin(u_Time)*3.1415));   // Temporarily store the transformed vertex positions for use below
    vec4 newpos = vs_Pos + vs_Nor * (h1 - u_depth) * u_strength;
    //nespos = nespos + vs_Nor * (h2 - u_depth2) * u_strength2;
    //vec4 nespos = vs_Pos + vs_Nor * h1;
    //vec4 modelposition = u_Model * nespos;

    vec4 modelposition = u_Model * vec4(rotate(vec3(newpos), vec3(0.0, 1.0, 0.0), -u_Time * u_rotatespeed), 1.0);

    //fs_offset *= 3.5;
    //fs_offset = h1 + 0.4;

/*Method 1*/
    vec3 newnor = computenormal(changedpos, 0.001);
    float treeh = gettreeh(h1, l_treestart, l_treeend);
    newnor = vec3(vs_Nor) + newnor * u_strength * max((1.0 - fs_treecover) , (1.0 - treeh));
    newnor = rotate(vec3(newnor), vec3(0.0, 1.0, 0.0), -u_Time * u_rotatespeed);
    mat3 invTranspose = mat3(u_ModelInvTr);
    newnor = invTranspose * newnor;
    fs_Nor = vec4(newnor, 0.0);
/*End*/

    //float p = 50.0;
    //float alpha = pow(1.0 - clamp(dot(modelposition.xyz -u_camerapos.xyz, normalize(newnor)), 0.0, 1.0), p);
    // float alpha = dot(vs_Pos.xyz -u_camerapos.xyz, vs_Nor.xyz);
    // fs_Col = vec4(vec3(alpha), 1.0);

    // vec3 normal = rotate(vec3(vs_Nor), vec3(0.0, 1.0, 0.0), -u_Time * u_rotatespeed);
    // mat3 invTranspose = mat3(u_ModelInvTr);
    // normal = invTranspose * normal;
    // vec3 tangent = cross(normal, vec3(0, 1, 0));
    // vec3 bitangent = cross(normal, tangent);
    // mat3 tbn = mat3(tangent, bitangent, normal);
    // vec3 newnor = computenormal(vec3(vs_Pos * u_size), 0.01);
    // newnor = tbn * newnor;

/*Method 2*/
    // vec4 newnor = vec4(rotate(vec3(vs_Nor), vec3(0.0, 1.0, 0.0), -u_Time * u_rotatespeed), 1.0);
    // mat3 invTranspose = mat3(u_ModelInvTr);
    // fs_Nor = vec4(invTranspose * vec3(newnor), 0);           // Pass the vertex normals to the fragment shader for interpolation.
                                                            // Transform the geometry's normals by the inverse transpose of the
                                                            // model matrix. This is necessary to ensure the normals remain
                                                            // perpendicular to the surface after the surface is transformed by
                                                            // the model matrix.

    fs_LightVec = lightPos - modelposition;  // Compute the direction in which the light source lies
    fs_EyeVec = u_camerapos - modelposition;
    fs_Nor2 = u_ViewProj * fs_Nor;
    gl_Position = u_ViewProj * modelposition;// gl_Position is a built-in variable of OpenGL which is
                                             // used to render the final positions of the geometry's vertices
    fs_fragVertexEc = modelposition.xyz;
}
