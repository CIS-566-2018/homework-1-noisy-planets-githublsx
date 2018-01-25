#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform float l_ddwater;
uniform float l_dwater;
uniform float l_water;
uniform float l_shore;
uniform float l_dirt;
uniform float l_rock;
uniform float l_snow;
uniform float l_treestart;
uniform float l_treeend;
uniform vec4 c_ddwater;
uniform vec4 c_dwater;
uniform vec4 c_water;
uniform vec4 c_shore;
uniform vec4 c_dirt;
uniform vec4 c_rock;
uniform vec4 c_snow;
uniform vec4 c_tree;
uniform vec4 c_cloudshadow;
uniform float u_shineness;
uniform vec4 u_specularcolor;
uniform float u_specularstrength;
uniform vec4 u_eyedirt;
uniform vec4 u_camerapos;
uniform float u_atomspower;
uniform float u_atomsstrength;
uniform vec4 u_atomscolor;
// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_Nor2;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec3 fs_fragVertexEc;
in float fs_offset;
in float fs_treecover;
in vec4 fs_EyeVec;
in float fs_cloud;
out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

#define M_PI 3.1415926535897932384626433832795

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

float gettreeh( float h, float start, float end)
{
    float treeh = clamp(h, start, end);
    treeh =  (treeh - start) * 2. * M_PI / (end - start) - M_PI;
    return (cos(treeh) + 1.0)/2.0;
}

vec3 terriancolor(float h)
{
    	// materials
	// #define c_water vec3(.015, .110, .455)
	// #define c_dirt vec3(.086, .132, .018)
	// #define c_shore vec3(.153, .172, .121)
	// #define c_rock  vec3(176./255., 113./255., 62./255.)
	// #define c_snow  vec3(.600, .600, .600)
    // #define c_tree  vec3(.0, .1, .0)

	// limits
    // float x = 0.3;
	// float l_water = .05+x;
	// float l_shore = .17+x;
	// float l_dirt = .211+x;
	// float l_rock = .351+x;

    //float l_treestart = 0.6;
    //float l_treeend = 0.75;

	//float s = smoothstep(.2, 1., h);
    vec3 snow = mix(vec3(c_snow), vec3(c_snow),smoothstep(l_snow, 1., h));
	vec3 rock = mix(vec3(c_rock), snow,smoothstep(l_rock, l_snow, h));
	vec3 dirt = mix(vec3(c_dirt), rock,smoothstep(l_dirt, l_rock, h));
	vec3 shore = mix(vec3(c_shore), dirt,smoothstep(l_shore, l_dirt, h));
	vec3 water = mix(vec3(c_water), shore,smoothstep(l_water, l_shore, h));
    vec3 dwater = mix(vec3(c_dwater), water,smoothstep(l_dwater, l_water, h));
    vec3 ddwater = mix(vec3(c_ddwater), dwater,smoothstep(l_ddwater, l_dwater, h));

    float treeh = gettreeh(h, l_treestart, l_treeend);
    vec3 tree = mix(vec3(c_tree), ddwater, 1.0 - treeh * fs_treecover);
    //tree = mix(vec3(c_tree), tree, smoothstep(l_treemiddle, l_treeend, h));

    // if(h>=l_dirt && h<=(l_rock - l_dirt)/2.0)
    // {
    //     ddwater = mix(vec3(c_tree), ddwater, fs_treecover);
    // }
    

    return vec3(tree);
}

void main()
{
    // Material base color (before shading)
        //vec4 newcolor = vec4(1.0 - u_Color.x, 1.0 - u_Color.y, 1.0 - u_Color.z, 1.0);
        //vec4 diffuseColor = mix(u_Color, newcolor, fs_offset);
        // vec3 a = vec3(0.5, 0.5, 0.5);
        // vec3 b = vec3(0.5, 0.5, 0.5);
        // vec3 c = vec3(1.0, 1.0, 0.5);
        // vec3 d = vec3(0.80, 0.90, 0.30);
        // vec4 diffuseColor = vec4(palette(1.0 - fs_offset, a, b, c, d), 1.0);
        vec4 diffuseColor = vec4(terriancolor(fs_offset), 1.0);

        // Calculate the diffuse term for Lambert shading
        vec3 X = dFdx(fs_fragVertexEc);
        vec3 Y = dFdy(fs_fragVertexEc);
        vec4 normal=vec4(normalize(cross(X,Y)), 0.0);
        float treeh = gettreeh(fs_offset, l_treestart, l_treeend);
        normal = mix(fs_Nor, normal, (1.0 - treeh * fs_treecover));

        normal = fs_Nor;

        float diffuseTerm = dot(normalize(normal), normalize(fs_LightVec));
        // Avoid negative lighting values
        diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

        float ambientTerm = 0.05;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.
        // float density = 0.05;
        // const float LOG2 = 1.442695;
        // float z = gl_FragCoord.z / gl_FragCoord.w *1.5;
        // float fogFactor = exp2( -density * density * z * z * LOG2 );
        // fogFactor = clamp(fogFactor, 0.0, 1.0);
        // vec4 fogColor = vec4(1.0, 1.0, 1.0, 1.0); 

        float cloudh = gettreeh(fs_offset, 0.0, 1.0);
        diffuseColor = mix(diffuseColor, c_cloudshadow, clamp(fs_cloud * (lightIntensity + 0.1), 0.0, 1.0) * cloudh);

        // Calculate Blinn-Phong power
        vec4 H = normalize(normalize(fs_EyeVec) + normalize(fs_LightVec));
        float power = u_specularstrength * pow(max(0.0, dot(normalize(normal), H)), u_shineness);
        //Atomsphere
        float alpha = 1.0 - dot(normalize(vec4(0.0, 0.0, -1.0, 0.0)), normalize(fs_Nor2));
        alpha =  clamp(alpha * u_atomsstrength, 0.0, 1.0);
        alpha =  pow(alpha, u_atomspower);
        //float alpha = pow(1.0 - clamp(dot(normalize(u_camerapos), normalize(normal)), 0.0, 1.0), p);
        // H = normalize(normalize(-u_eyedirt) + normalize(fs_LightVec));
        //alpha = 1.0 - clamp(dot(u_eyedirt, normalize(normal)), 0.0, 1.0);
        // Compute final shaded color

        out_Col = vec4(diffuseColor.rgb * lightIntensity, diffuseColor.a) + u_specularcolor * power * clamp((1.0 - fs_cloud * 2.5), 0.0, 1.0) + u_atomscolor * alpha;
}
