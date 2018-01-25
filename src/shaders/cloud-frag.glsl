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
uniform float l_snow;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

in float fs_offset;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 terriancolor(float h)
{
    	// materials
	#define c_water vec3(.015, .110, .455)
	#define c_grass vec3(.086, .132, .018)
	#define c_beach vec3(.153, .172, .121)
	#define c_rock  vec3(176./255., 113./255., 62./255.)
	#define c_snow  vec3(.600, .600, .600)

	// limits
    float x = 0.3;
	float l_water = .05+x;
	float l_shore = .17+x;
	float l_grass = .211+x;
	float l_rock = .351+x;

	//float s = smoothstep(.2, 1., h);
	vec3 rock = mix(c_rock, c_snow,smoothstep(l_rock, 1., h));

	vec3 grass = mix(c_grass, rock,smoothstep(l_grass, l_rock, h));
		
	vec3 shoreline = mix(c_beach, grass,smoothstep(l_shore, l_grass, h));

	vec3 water = mix(c_water / 2., c_water,smoothstep(0., l_water, h));

    return shoreline;
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
        vec4 diffuseColor = vec4(vec3(1.0, 1.0, 1.0), fs_offset);

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

        float ambientTerm = 0.0;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.
        float density = 0.05;
        const float LOG2 = 1.442695;
        float z = gl_FragCoord.z / gl_FragCoord.w *1.5;
        float fogFactor = exp2( -density * density * z * z * LOG2 );
        fogFactor = clamp(fogFactor, 0.0, 1.0);
        vec4 fogColor = vec4(1.0, 1.0, 1.0, 1.0); 
        // Compute final shaded color
        vec3 diffuse = mix(vec3(0.0), vec3(diffuseColor), lightIntensity);
        float alpha = clamp(0.0, 1.0, lightIntensity + l_snow);
        out_Col = vec4(vec3(diffuseColor) * lightIntensity, diffuseColor.a * alpha);
        //out_Col = mix(fogColor, vec4(0.1, 0.1, 0.1, 1.0), fogFactor);
}
