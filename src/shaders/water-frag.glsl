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
uniform float u_depth2;
uniform float u_strength2;
uniform float u_shineness;
uniform vec4 u_specularcolor;
uniform float u_specularstrength;
uniform vec4 c_cloudshadow;
uniform float u_atomspower;
uniform float u_atomsstrength;
uniform vec4 u_atomscolor;
// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_EyeVec;
in float fs_cloud;
in vec4 fs_Nor2;
out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.
void main()
{
    // Material base color (before shading)
        vec4 diffuseColor = u_Color;

        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
         diffuseTerm = clamp(diffuseTerm, 0.0, 1.0);

        float ambientTerm = 0.1;

        float lightIntensity = diffuseTerm + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.
        // Calculate Blinn-Phong power
        vec4 H = normalize(normalize(fs_EyeVec) + normalize(fs_LightVec));
        float power = u_specularstrength * pow(max(0.0, dot(normalize(fs_Nor), H)), u_shineness);
         diffuseColor = mix(diffuseColor, c_cloudshadow, clamp(fs_cloud * (lightIntensity + 0.1), 0.0, 1.0));
        //Atomsphere
        float alpha = 1.0 - dot(normalize(vec4(0.0, 0.0, -1.0, 0.0)), normalize(fs_Nor2));
        alpha =  clamp(alpha * u_atomsstrength, 0.0, 1.0);
        alpha =  pow(alpha, u_atomspower);
        // Compute final shaded color
        out_Col = vec4(diffuseColor.rgb * lightIntensity, //0.5);
        clamp(smoothstep(1.0, 0.0, lightIntensity * u_strength2) + u_depth2, 0.0, 1.0)) + u_specularcolor * power * (1.0 - fs_cloud) + u_atomscolor * alpha;
        //vec4 newc_cloudshadow = vec4(vec3)
        //out_Col = mix(out_Col, c_cloudshadow, fs_cloud * (lightIntensity - 0.1));
}
