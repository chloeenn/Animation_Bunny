// Template code for A2 Fall 2021 -- DO NOT DELETE THIS LINE

var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0);
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialShininess = 30.0;


var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix;
var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye = vec3(0.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
// var TIME = 0.0; // Realtime
var resetTimerFlag = true;
var animFlag = false;
var prevTime = 0.0;
var useTextures = 1;

//FPS 
let last = 0;
let fps = 0;
let frameCount = 0;
const fpsInterval = 2000; //2 sec
// ------------ Images for textures stuff --------------
var texSize = 64;

var image1 = new Array()
for (var i = 0; i < texSize; i++)  image1[i] = new Array();
for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        image1[i][j] = new Float32Array(4);
for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++) {
    var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
    image1[i][j] = [c, c, c, 1];
}

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4 * texSize * texSize);

for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        for (var k = 0; k < 4; k++)
            image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];


var textureArray = [];
class Vector3 {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}


function isLoaded(im) {
    if (im.complete) {
        console.log("loaded");
        return true;
    }
    else {
        console.log("still not loaded!!!!");
        return false;
    }
}

function loadFileTexture(tex, filename) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    tex.image.src = filename;
    tex.isTextureReady = false;
    tex.image.onload = function () { handleTextureLoaded(tex); }
}

function loadImageTexture(tex, image) {
    tex.textureWebGL = gl.createTexture();
    tex.image = new Image();
    gl.bindTexture(gl.TEXTURE_2D, tex.textureWebGL);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);

    tex.isTextureReady = true;

}

function initTextures() {

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/sonic.png");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/Grass.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/white.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/carrot.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/green.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/blue.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/metallic.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/snow.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/pixel.jpg");

    textureArray.push({});
    loadFileTexture(textureArray[textureArray.length - 1], "Texture/pixel.png");
}


function handleTextureLoaded(textureObj) {
    gl.bindTexture(gl.TEXTURE_2D, textureObj.textureWebGL);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // otherwise the image would be flipped upsdide down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image); //Set the texture image
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating)
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log(textureObj.image.src);

    textureObj.isTextureReady = true;
}

//----------------------------------------------------------------

function setColor(c) {
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);
}

function toggleTextures() {
    useTextures = 1 - useTextures;
    gl.uniform1i(gl.getUniformLocation(program,
        "useTextures"), useTextures);
}

function waitForTextures1(tex) {
    setTimeout(function () {
        console.log("Waiting for: " + tex.image.src);
        wtime = (new Date()).getTime();
        if (!tex.isTextureReady) {
            console.log(wtime + " not ready yet");
            waitForTextures1(tex);
        }
        else {
            console.log("ready to render");
            // window.requestAnimFrame(render);
        }
    }, 5);

}

// Takes an array of textures and calls render if the textures are created
function waitForTextures(texs) {
    setTimeout(function () {
        var n = 0;
        for (var i = 0; i < texs.length; i++) {
            console.log("boo" + texs[i].image.src);
            n = n + texs[i].isTextureReady;
        }
        wtime = (new Date()).getTime();
        if (n != texs.length) {
            console.log(wtime + " not ready yet");
            waitForTextures(texs);
        }
        else {
            console.log("ready to render");
            window.requestAnimFrame(render);
        }
    }, 5);

}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Load canonical objects and their attributes
    Cube.init(program);
    Cylinder.init(9, program);
    Cone.init(9, program);
    Sphere.init(36, program);

    gl.uniform1i(gl.getUniformLocation(program, "useTextures"), useTextures);

    // record the locations of the matrices that are used in the shaders
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    // set a default material
    setColor(materialDiffuse);



    // set the callbacks for the UI elements
    document.getElementById("sliderXi").oninput = function () {
        RX = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderYi").oninput = function () {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function () {
        RZ = this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function () {
        if (animFlag) {
            animFlag = false;
        } else {
            animFlag = true;
            resetTimerFlag = true;
            // window.requestAnimFrame(render);
        }
    };

    document.getElementById("textureToggleButton").onclick = function () {
        toggleTextures();
        // window.requestAnimFrame(render);
    };

    var controller = new CameraController(canvas);
    controller.onchange = function (xRot, yRot) {
        RX = xRot;
        RY = yRot;
        // window.requestAnimFrame(render);
    };

    // load and initialize the textures
    initTextures();

    // Recursive wait for the textures to load
    waitForTextures(textureArray);
    //setTimeout (render, 100) ;
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix, modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    setMV();
}

function drawCube(texture, name, value, activate) {
    setMV();
    gl.activeTexture(activate);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, name), value);
    Cube.draw();
}

function drawSphere(texture, name, value, activate) {
    setMV();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, name), 0);
    Sphere.draw();
}

function drawCylinder(texture, name) {
    setMV();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, name), 0);
    Cylinder.draw();
}

function drawCone(texture, name) {
    setMV();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture.textureWebGL);
    gl.uniform1i(gl.getUniformLocation(program, name), 0);
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modelview matrix with the result
function gTranslate(x, y, z) {
    modelMatrix = mult(modelMatrix, translate([x, y, z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modelview matrix with the result
function gRotate(theta, x, y, z) {
    modelMatrix = mult(modelMatrix, rotate(theta, [x, y, z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modelview matrix with the result
function gScale(sx, sy, sz) {
    modelMatrix = mult(modelMatrix, scale(sx, sy, sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    at = vec3(at[0], at[1], at[2]);
    eye = vec3(eye[0], eye[1], eye[2]);
    eye[1] = eye[1] + 0;
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // set the camera matrix
    viewMatrix = lookAt(eye, at, up);

    // initialize the modeling matrix stack
    MS = [];
    modelMatrix = mat4();

    // apply the slider rotations
    gRotate(RZ, 0, 0, 1);
    gRotate(RY, 0, 1, 0);
    gRotate(RX, 1, 0, 0);

    // send all the matrices to the shaders
    setAllMatrices();

    // get real time
    var curTime;
    if (animFlag) {
        curTime = (new Date()).getTime() / 1000;
        if (resetTimerFlag) {
            prevTime = curTime;
            resetTimerFlag = false;
        }
        TIME = TIME + curTime - prevTime;
        prevTime = curTime;
    }

    drawBackground();
    bunny.renderBunny();
    if (TIME >= 0) {
        bunny.position.x = 2 + 2 * TIME;
        bunny.position.y = Math.sin(TIME * 3);
        bunny.rotation.y = 90;
        at = vec3(5, 0, -4);
        eye = vec3(-2, 3, 40);
    }
    //Bunny see the carrot
    if (TIME >= 3 && TIME < 10) {
        eye = vec3(-2 + 15 * TIME, 3 + 1 * TIME, 25);
        carrot.position.x = 16;
        carrot.position.y = Math.sin(5 * 3) - 4;
        carrot.position.z = bunny.position.z - 1;
        carrot.renderCarrot();
        
    }
    //UFO steals the carrot
    if (TIME >= 6 && TIME < 21) {
        bunny.position.x = 2 + 2 * 6;
        bunny.position.y = Math.sin(5 * 6);

        ufo.position.x = Math.min(-2 + 15 * (TIME - 8), 18);
        ufo.position.y = 4;
        ufo.rotation.y = 90 * TIME;
        ufo.renderUFO();
        // at = vec3(bunny.position.x -3, 0, 0);
        eye = vec3(88, 8, 25);
    }
    if (TIME >= 10 && TIME < 14) {
        carrot.rotation.y = 90 * TIME * 2;
        carrot.position.x = 17;
        carrot.position.y = Math.min(carrot.position.y + 2 * (TIME - 10), 3.8);
        carrot.position.z = ufo.position.z - 1;
        carrot.renderCarrot();

        at = vec3(bunny.position.x, -1.1, 0);
        eye = vec3(6 + 5 * TIME, 8, 25);
    }
    //Bunny gets mad
    //Spawn gun
    if (TIME >= 14) {
        bunny.bunnyMad();
        bunny.useGun();

        at = vec3(bunny.position.x, -1.1, 0);
        eye = vec3(6 + 5 * TIME, 8, 25);
    }
    //Spawn rocket
    if (TIME >= 16 && TIME < 21) {
        rocket.position.x = Math.min(2 + 15 * (TIME - 16), 14);
        rocket.position.y = ufo.position.y - 8;
        rocket.position.z = 2;
        rocket.renderRocket();
        at = vec3(rocket.position.x, -1, 0);
        eye = vec3(rocket.position.x + 20, 8, 25);
    }
    //Bunny jumps onto the rocket
    if (TIME >= 18) {
        let hopDuration = 3;
        let hopStartTime = 18;
        let progress = (TIME - hopStartTime) / hopDuration;
        let halfProgress = Math.min(progress, 0.5);
        let quarterParabola = 4 * (halfProgress * (1 - halfProgress));

        bunny.position.x = bunny.position.x + ((rocket.position.x + 2) - bunny.position.x) * progress;
        bunny.position.y = bunny.position.y + ((rocket.position.y + 4.8) - bunny.position.y) * quarterParabola;
        bunny.position.z = bunny.position.z + ((rocket.position.z + 2) - bunny.position.z) * progress;
        if (TIME >= hopStartTime + hopDuration) {
            bunny.position.x = rocket.position.x + 2;
            bunny.position.y = rocket.position.y + 4.8;
            bunny.position.z = rocket.position.z + 2;
        }
        at = vec3(bunny.position.x - 2, -1.1, 0);
        eye = vec3(6 + 5 * 15, 8, 50);
    }
    //Bunny chases the UFO in circular motion
    if (TIME >= 21 && TIME < 35) {
        bunny.rotation.y = 30 * TIME * 0.5;
        const radius = 20;
        rocket.position.x = 15 + radius * Math.cos(TIME * 0.5);
        rocket.position.z = radius * Math.sin(TIME * 0.5);
        rocket.renderRocket();

        ufo.position.x = 20 + radius * Math.cos(TIME * 0.5);
        ufo.position.y = 3;
        ufo.position.z = radius * Math.sin(TIME * 0.5);
        ufo.rotation.y = 90 * TIME;
        ufo.renderUFO();
        at = vec3(ufo.position.x, -1, ufo.position.z);
        eye = vec3(ufo.position.x + 10, 6, 50);
    }
    //End Scene
    //UFO returns the carrot
    //The heart is for aesthetic
    if (TIME >= 35) {
        ufo.position.x = 25;
        ufo.position.y = 4;
        ufo.position.z = 0;
        ufo.rotation.y = 90 * TIME;
        ufo.renderUFO();

        carrot.position.x = ufo.position.x;
        carrot.position.y = Math.max(4 - 2 * (TIME - 35), -2);
        carrot.position.z = ufo.position.z - 1;
        carrot.rotation.y = 90 * TIME;
        carrot.renderCarrot();

        heart.rotation.y = ufo.position.x;
        heart.position.x = ufo.position.x;
        heart.position.y = Math.max(4 - 2 * (TIME - 38), -1);
        heart.position.z = ufo.position.z;
        carrot.rotation.y = 90 * TIME;
        heart.renderHeart();

        heart.rotation.y = ufo.position.x + 5;
        heart.position.x = ufo.position.x;
        heart.position.y = Math.max(4 - 2 * (TIME - 43), 0.6);
        heart.position.z = ufo.position.z -4;
        carrot.rotation.y = 90 * TIME;
        heart.renderHeart();

        bunny.position.x = rocket.position.x + 2;
        bunny.position.y = rocket.position.y + 4.8;
        bunny.position.z = rocket.position.z + 2;
        rocket.position.x = 17;
        rocket.position.y = Math.max(4 - 2 * (TIME - 40), -4);
        rocket.position.z = 0;
        rocket.renderRocket();

        bunny.bunnyHappy();

        at = vec3(ufo.position.x - 2, 1, 0);
        eye = vec3(80, 8, 30);
    }

    displayFPS();

    window.requestAnimFrame(render);
}
function rotate360(centerOfRot, radius) {
    return function theController(time) {
        // Calculate angle in radians (complete circle over time 0 to 1)
        const angle = 2 * Math.PI * time;

        // Update the camera position (eye) to circle around centerOfRot
        eye[0] = centerOfRot[0] + radius * Math.cos(angle);
        eye[1] = centerOfRot[1]; // Maintain same y-level as centerOfRot
        eye[2] = centerOfRot[2] + radius * Math.sin(angle);

        // Set 'at' to always look at the center of rotation
        at[0] = centerOfRot[0];
        at[1] = centerOfRot[1];
        at[2] = centerOfRot[2];

        // Keep 'up' pointing in the y-direction
        up[0] = 0;
        up[1] = 1;
        up[2] = 0;
    };
}
function displayFPS() {
    let now = Date.now();
    let delta = now - last;
    frameCount++;
    if (delta >= fpsInterval) {
        fps = Math.round(frameCount / (delta / 1000));
        last = now;
        frameCount = 0;
        document.getElementById('fps-display').innerHTML = "FPS: " + fps;
    }
}

function drawBackground() {
    //Grass background
    gPush();
    {
        gTranslate(0, -4.5, -50);
        gScale(80, 1, 80);
        drawSphere(textureArray[1], "texture1", 1, gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    gPop();

    //Cloud background
    let cloudPositions = [
        { x: 10, y: 3, z: -5 },
        { x: -2, y: 2.6, z: -1 },
        { x: 5, y: 2, z: -5 },
        { x: -8, y: 1.6, z: 0 },
        { x: -5, y: 1, z: 0 },
        { x: 10, y: 3, z: -10 },
        { x: -2, y: 2.6, z: -15 },
        { x: 5, y: 2, z: -12 },
        { x: -8, y: 1.6, z: -13 },
    ];
    for (let i = 0; i < cloudPositions.length; i++) {
        gPush(); // Save the current transformation state
        {
            cloud.position.x = cloudPositions[i].x;
            cloud.position.y = cloudPositions[i].y;
            cloud.position.z = cloudPositions[i].z;
            cloud.renderCloud(); // Render each cloud at the specified position
        }
        gPop(); // Restore the previous transformation state
    }
    let candyPositions = [
        { x: 8, y: 0, z: -4 },
        { x: -20, y: 1, z: 0 },
        { x: -8, y: -3, z: 0 },
        { x: 0, y: 1, z: -5 },
        { x: -18, y: -1, z: 4 },
    ];
    for (let i = 0; i < candyPositions.length; i++) {
        gPush(); // Save the current transformation state
        {
            candy.position.x = candyPositions[i].x;
            candy.position.y = candyPositions[i].y;
            candy.position.z = candyPositions[i].z;
            candy.renderCandy(); // Render each candy at the specified position
        }
        gPop();
    }
}
var candy = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderCandy: function () {
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gPush();
            {
                gScale(0.5, 0.5, 0.5);
                drawSphere(textureArray[9], "texture9", 0, gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();

        }
    }
}
var cloud = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderCloud: function () {
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gScale(0.5, 0.5, 0.5);
            drawSphere(textureArray[7], "texture7", 7, gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gPush();
            {
                gTranslate(-1.2, 0, 0);
                gScale(0.8, 0.8, 0.8);
                drawSphere(textureArray[7], "texture7", 7, gl.TEXTURE7);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();
            gPush();
            {
                gTranslate(1.2, 0, 0);
                gScale(0.8, 0.8, 0.8);
                drawSphere(textureArray[7], "texture7", 7, gl.TEXTURE7);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();
        }
        gPop();
    }
}
var rocket = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderRocket: function () {
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gPush(); //Rocker Body
            {
                gTranslate(2, 2, 2);
                gRotate(90, 0, 1, 0);
                gScale(1.2, 1, 2.5);
                drawCylinder(textureArray[6], "texture6");
                gl.bindTexture(gl.TEXTURE_2D, null);
                gPush(); //Rocket Head
                {
                    gTranslate(0, 0, 0.75);
                    gScale(0.5, 0.5, 0.5);
                    setColor(vec4(0.0, 1.0, 0.0, 1.0));
                    drawCone(textureArray[6], "texture6");
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                gPop();
                gPush(); //Rocket Tail
                {
                    gTranslate(0, 0, -0.45);
                    gScale(0.5, 0.7, 0.5);
                    setColor(vec4(0.0, 1.0, 0.0, 1.0));
                    drawCone(textureArray[6], "texture6");
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                gPop();
            }
            gPop();
        }
        gPop();
    }
}
var heart = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderHeart: function () {
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gPush();
            {
                gTranslate(-0.33, 1, 0);  
                gScale(0.5, 0.5, 0.2);  
                drawSphere(textureArray[8], "texture8", 0, gl.TEXTURE0);
            }
            gPop();

            gPush();
            {
                gTranslate(0.33, 1, 0);
                gScale(0.5, 0.5, 0.2);  
                drawSphere(textureArray[8], "texture8", 0, gl.TEXTURE0);
            }
            gPop();

            // Bottom part (cone)
            gPush();
            {
                gRotate(90, 0, 1, 0);
                gRotate(90, 1, 0, 0);
                gTranslate(0, 0, -0.42);  // Position the base of the cone
                gScale(0.2, 0.85, 0.85);  // Scale for cone shape
                drawCone(textureArray[8], "texture8", 0, gl.TEXTURE0);
            }

            gPop();
        }
        gPop();
    }
}
var gun = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderGun: function () {
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gPush();
            {
                gRotate(90, 0, 1, 0);
                gRotate(90, 1, 0, 0);
                gScale(0.2, 0.5, 0.2);
                drawCube(textureArray[6], "texture6", 6, gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);


            }
            gPop();
            gPush();
            {
                gScale(0.2, 0.5, 0.1);
                gTranslate(-1.4, -0.8, 0);
                setColor(vec4(0.0, 1.0, 0.0, 1.0));
                drawCube(textureArray[6], "texture6", 6, gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();
        }
        gPop();
    }
}
var ufo = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderUFO: function () {
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gScale(1.5, 1, 1.5);
            gRotate(90, 0, 1, 0);
            gRotate(90, 1, 0, 0);
            drawSphere(textureArray[5], "texture5", 5, gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gPush();
            {
                gScale(1.6, 1.5, 0.3);
                setColor(vec4(0.0, 1.0, 0.0, 1.0));
                drawSphere(textureArray[6], "texture6", 6, gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();
        }
        gPop();
    }
}

var carrot = {
    position: new Vector3(),
    rotation: new Vector3(),
    renderCarrot: function () {

        //Carrot body
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gScale(0.3, 0.8, 0.3);
            setColor(vec4(1.0, 0.5, 0.0, 1.0));
            drawSphere(textureArray[3], "texture3", 3, gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, null);
            //Leaf 1
            gPush();
            {
                gScale(0.3, 0.5, 0.3);
                gTranslate(-0.8, 1.4, 0)
                setColor(vec4(0.0, 1.0, 0.0, 1.0));
                drawSphere(textureArray[4], "texture4", 4, gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();
            //Leaf 2
            gPush();
            {
                gScale(0.3, 0.5, 0.3);
                gTranslate(0.8, 1.4, 0)
                setColor(vec4(0.0, 1.0, 0.0, 1.0));
                drawSphere(textureArray[4], "texture4", 4, gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();
        }
        gPop();

    }
}

var bunny = {
    position: new Vector3(),
    rotation: new Vector3(),
    armRotation: new Vector3(),
    armPosition: new Vector3(),
    // rotateTheta: 10,
    renderBunny: function () {
        // Bunny Head
        gPush();
        {
            gTranslate(this.position.x, this.position.y, this.position.z);
            gRotate(this.rotation.x, 1, 0, 0);
            gRotate(this.rotation.y, 0, 1, 0);
            gRotate(this.rotation.z, 0, 0, 1);
            gScale(1, 0.9, 0.9);
            setColor(vec4(0.4, 0.4, 0.4, 1.0));
            drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, null);
            // Bunny nose
            gPush();
            {
                gTranslate(0, -0.3, 0.9);
                gScale(0.3, 0.2, 0.1);
                setColor(vec4(0.5, 0.5, 0.5, 1.0));
                drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, null);
                let blink = 1.0;  //Eye fully open
                let blinkDuration = 0.2;  // Minimum scale for closed eyes 
                if (TIME % 6 < 1) {
                    blink = blinkDuration;  // Eyes are closed for 1 second
                } else {
                    blink = 1.0;  // Eye fully open for 5 seconds
                }
                // Bunny eye left
                gPush();
                {
                    gTranslate(-0.6, 2, 0.8);
                    gScale(0.3, blink, 0.5);
                    setColor(vec4(0.5, 0.5, 0.5, 1.0));
                    drawSphere(textureArray[0], "texture0", 0, gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    if (this.isMad === 1) {
                        gPush(); //Bunny eyebrow
                        {
                            gScale(1 / 0.3, 1 / blink, 1 / 0.5);
                            gTranslate(-0.5, 1.7, 0);
                            gRotate(150, 0, 0, 1);
                            gScale(0.7, 0.2, 0.2);
                            drawCube(textureArray[0], "texture0", 0, gl.TEXTURE0);
                            gl.bindTexture(gl.TEXTURE_2D, null);
                        }
                        gPop();
                    }
                }
                gPop();

                // Bunny eye right
                gPush();
                {
                    gTranslate(0.6, 2, 0.8);
                    gScale(0.3, blink, 0.5);
                    setColor(vec4(0.5, 0.5, 0.5, 1.0));
                    drawSphere(textureArray[0], "texture0", 0, gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    if (this.isMad === 1) {
                        gPush(); //Bunny eyebrow
                        {
                            gScale(1 / 0.3, 1 / blink, 1 / 0.5);
                            gTranslate(0.5, 1.7, 0);
                            gRotate(-150, 0, 0, 1);
                            gScale(0.7, 0.2, 0.2);
                            drawCube(textureArray[0], "texture0", 0, gl.TEXTURE0);
                            gl.bindTexture(gl.TEXTURE_2D, null);
                        }
                        gPop();
                    }
                }
                gPop();
            }
            gPop();
            //Bunny Arm Right
            gPush();
            {
                gTranslate(this.armPosition.x, this.armPosition.y, this.armPosition.z);
                gRotate(this.armRotation.x, 1, 0, 0);
                gRotate(this.armRotation.y, 0, 1, 0);
                gRotate(this.armRotation.z, 0, 0, 1);
                gTranslate(0.6, -1.5, 0.5);
                gScale(0.2, 0.2, 0.5);
                drawSphere(textureArray[0], "texture0", 0, gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gScale(1 / 0.2, 1 / 0.2, 1 / 0.5);
                if (this.usingGun === 1) {
                    gun.position.x = 0;
                    gun.position.y = 0.7;
                    gun.position.z = 0.9;
                    gun.rotation.y = -90;
                    gun.renderGun();
                }
                if (this.isShooting === 1) {
                    this.armRotation.x = -15;
                }
            }
            gPop();
            //Bunny Arm Left
            gPush();
            {
                gTranslate(-0.6, -1.5, 0.5);
                gScale(0.2, 0.2, 0.5);
                drawSphere(textureArray[0], "texture0", 0, gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gPop();

            // Bunny body
            gPush();
            {
                gTranslate(0, -1.8, 0);
                gScale(0.8, 0.9, 1);
                drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, null);

                // Bunny leg Left
                gPush();
                {
                    gTranslate(-0.5, -1, 0.3);
                    gScale(0.4, 0.3, 0.5);
                    setColor(vec4(0.5, 0.5, 0.5, 1.0));
                    drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                gPop();

                // Bunny leg Right 
                gPush();
                {
                    gTranslate(0.5, -1, 0.3);
                    gScale(0.4, 0.3, 0.5);
                    setColor(vec4(0.5, 0.5, 0.5, 1.0));
                    drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                gPop();
            }
            gPop();

            // Bunny ear left
            gPush();
            {
                gTranslate(-0.4, 1.5, -0.1);
                gScale(0.3, 0.6, 0.3);
                drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, null);

                // Inner ear
                gPush();
                {
                    gTranslate(0, -0.5, 1, 1.3);
                    gScale(0.6, 0.7, 0.3);
                    setColor(vec4(0.5, 0.5, 0.5, 1.0));
                    drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                gPop();
            }
            gPop();

            // Bunny ear right
            gPush();
            {
                gTranslate(0.4, 1.5, -0.1);
                gScale(0.3, 0.6, 0.3);
                drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, null);
                // Inner ear
                gPush();
                {
                    gTranslate(0, -0.5, 1, 1.3);
                    gScale(0.6, 0.7, 0.3);
                    setColor(vec4(0.5, 0.5, 0.5, 1.0));
                    drawSphere(textureArray[2], "texture2", 2, gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                gPop();
            }
            gPop();
        }
        gPop();
    },
    bunnyMad: function () {
        this.isMad = 1;
    },
    useGun: function () {
        this.usingGun = 1;
    },
    bunnyHappy: function () {
        this.isHappy = 1;
        this.isMad = 0;
        this.usingGun = 0;
    },
    bunnyShooting: function () {
        this.isShooting = 1;
    }

}
function setRotation(xRotation, yRotation, zRotation, interval) {
    xRotation = Math.sin(interval * xRotation) * 20;
    return { x: xRotation, y: yRotation, z: zRotation };
}
function CameraController(element) {
    var controller = this;
    this.onchange = null;
    this.xRot = 0;
    this.yRot = 0;
    this.scaleFactor = 3.0;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;

    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function (ev) {
        controller.dragging = true;
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
    };

    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function (ev) {
        controller.dragging = false;
    };

    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function (ev) {
        if (controller.dragging) {
            // Determine how far we have moved since the last mouse move
            // event.
            var curX = ev.clientX;
            var curY = ev.clientY;
            var deltaX = (controller.curX - curX) / controller.scaleFactor;
            var deltaY = (controller.curY - curY) / controller.scaleFactor;
            controller.curX = curX;
            controller.curY = curY;
            // Update the X and Y rotation angles based on the mouse motion.
            controller.yRot = (controller.yRot + deltaX) % 360;
            controller.xRot = (controller.xRot + deltaY);
            // Clamp the X rotation to prevent the camera from going upside
            // down.
            if (controller.xRot < -90) {
                controller.xRot = -90;
            } else if (controller.xRot > 90) {
                controller.xRot = 90;
            }
            // Send the onchange event to any listener.
            if (controller.onchange != null) {
                controller.onchange(controller.xRot, controller.yRot);
            }
        }
    };
}