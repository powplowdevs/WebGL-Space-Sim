//Setup
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
const deltaTime = 0.0000001;

//Check for compatability
if(!gl){
    alert("WebGL is not supported! ):");
    throw new Error("WebGL not supported! ):");
}

//Get color data for each planet
function getColorData(amt){
    let colors = [];
    for(let i=0; i<amt; i++){
        // colors.push(...[Math.random(),Math.random(),Math.random()])
        if(i==10){
            colors.push(...[0,1,0]);
        }
        else{
            colors.push(...[0.5,0.5,0.5]);
        }
    }
    return colors;
}

//Get magnitude of 3d vector
function getMagnitudeOf3dVector(vec){
    return Math.sqrt(vec.reduce((acc, curV) => acc+(curV**2), 0));
}
//Subtract 3d vecotrs
function subtract3dVector(v1,v2){
    return [v1[0]-v2[0],v1[1]-v2[1],v1[2]-v2[2]];
}
//Divide 3d vecotrs by x
function divide3dVector(vec,x){
    return [vec[0]/x,vec[1]/x,vec[2]/x];
}
//Multiply 3d vector by v
function multiply3dVector(vec,v){
    return [vec[0]*v,vec[1]*v,vec[2]*v];
}
//Normalize 3d vector
function norm3dVector(vec){
    let normVec = [];
    let magVec = getMagnitudeOf3dVector(vec);
    
    normVec.push(...divide3dVector(vec,magVec));
    
    return normVec;
}
//Calculate gravity force
function getGravForce(p1,p2){
    let G = 1; // Change to 6.67e-11 to use real-world values.
    //Get distance vector
    //Vector that shows distance from p1 to p2 and direction from p1 to p2
    let distVec = subtract3dVector(p1.getPosition(),p2.getPosition());
    //Get dist vector magnitude
    //Int that shows distance from p1 to p2
    let magVec = getMagnitudeOf3dVector(distVec);
    //Get unit vector od dist vector
    //Vector that shows direction from p1 to p2
    let unitVec = divide3dVector(distVec,magVec);
    //Calculate force magnitude.
    let forceMag = G*p1.getMass()*p2.getMass()/magVec**2;
    //Calculate force vector.
    let forceVec = multiply3dVector(unitVec,-forceMag);

    return forceVec;
}
//Calculate gravity force with pre passed vars
function getGravForceEx(p1,p2,dv, mv){
    let G = 1; // Change to 6.67e-11 to use real-world values.
    //Get distance vector
    //Vector that shows distance from p1 to p2 and direction from p1 to p2
    let distVec = dv;
    //Get dist vector magnitude
    //Int that shows distance from p1 to p2
    let magVec = mv;
    //Get unit vector od dist vector
    //Vector that shows direction from p1 to p2
    let unitVec = divide3dVector(distVec,magVec);
    //Calculate force magnitude.
    let forceMag = G*p1.getMass()*p2.getMass()/magVec**2;
    //Calculate force vector.
    let forceVec = multiply3dVector(unitVec,-forceMag);

    return forceVec;
}
//Calculate acceleration force
function getAccelerationForce(mass, force){
    return [force[0]/mass,force[1]/mass,force[2]/mass];
}
//Edit vector by acceleration force
function editVectorByAccelerationForce(vec, force){
    return [vec[0]+(force[0]*deltaTime),vec[1]+(force[1]*deltaTime),vec[2]+(force[2]*deltaTime)];
}
function scaleValue(value, minInput, maxInput, minOutput, maxOutput) {
    let ratio = (value - minInput) / (maxInput - minInput);
    let scaledValue = ratio * (maxOutput - minOutput) + minOutput;
    return scaledValue;
}

//Planet class
class Planet{
    constructor(name, size, mass, position, index){
        this.name = name;
        this.size = size;
        this.mass = mass;
        this.position = position;
        this.index = index;
    }

    getName(){
        return this.name;
    }
    getSize(){
        return this.size;
    }
    getMass(){
        return this.mass;
    }
    getPosition(){
        return this.position;
    }
    getIndex(){
        return this.index;
    }
}

//Planets list
let planets = [];
//Create sphere around planet center
function createSphere(xCord,yCord,zCord,step,density){
    let theta = 0;
    let radius = 0;
    let index = 0;
    let x;
    let y;
    let z;
    let points = [];

    //Create points
    while(true){
        if(index > 2){
            break;
        }

        if(radius != 0){
            //Generate points
            for(let i=0; i<360/density; i++){
                x = xCord + Math.cos(theta)*radius;
                y = yCord + Math.sin(theta)*radius;
                z = zCord + x*y*radius;
                points.push(...[x,y,z]);
                theta+=step
            }
        }
        else{
            //single point at ends of sphere
            points.push(...[x,y,z]);
        }

        index+=step;
        if(index>=1)
            radius-=step;
        else
            radius+=step;
        
        theta=0;
    }

    return points;
    
}

//Create planet
function createPlanets(amt){
    let vData = [];
    let index = 0;
    for(let i=0; i<amt; i++){
        if(i == 10){
            let pos = [Math.random()-0.5,Math.random()-0.5,Math.random()-0.5];
            let sPoints = createSphere(pos[0],pos[1],pos[2],0.1,20);
            vData.push(...pos);
            let mass = 1000000000000;
            let size = scaleValue(mass,0,mass*2,0,10);
            planets.push(new Planet(Math.random().toString(), size, mass, pos, index));
            sizeData.push(size);
            index+=3;
        }
        else{
            let pos = [Math.random()-0.5,Math.random()-0.5,Math.random()-0.5];
            let sPoints = createSphere(pos[0],pos[1],pos[2],0.1,20);
            vData.push(...pos);
            let mass = Math.random()*500000000;
            let size = scaleValue(mass, 0,900000000,0,20);
            planets.push(new Planet(Math.random().toString(), size, mass, pos, index));
            sizeData.push(size);
            index+=3;
        }
    }
    return vData;
}

//Vertex and color data
let amt = 2500;
let sizeData = [];
let vertexData = createPlanets(amt);
let colorData = getColorData(amt);

//Create buffers
const positionBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const sizeBuffer = gl.createBuffer();

//Load vertex data into buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
//Load color data into buffer
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
//Load size data
gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizeData), gl.STATIC_DRAW);


//Create veretx shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);

//Program shader
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
attribute float size;

varying vec3 vColor;

uniform mat4 matrix;

void main() {
    vColor = vec3(color);
    
    gl_Position = matrix * vec4(position, 1);
    gl_PointSize = size;
}
`);
gl.compileShader(vertexShader);

//Create fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;

varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1);
}
`);
gl.compileShader(fragmentShader);

//Create program
const program = gl.createProgram();

//Attach shaders to program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

//Enable vertex attributes
const positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

//Enable color attributes
const colorLocation = gl.getAttribLocation(program, 'color');
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

//Enable size attributes
const sizeLocation = gl.getAttribLocation(program, 'size');
gl.enableVertexAttribArray(sizeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);


//Draw
gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const uniformLocation = {
    matrix: gl.getUniformLocation(program, 'matrix'),
}
  

//Create perspective matrix
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

// ARGS:         Matrix,          FOV (angle/radians),    Aspect ratio,       Near cull, far cull
mat4.perspective(projectionMatrix, 75*(Math.PI/180), canvas.width/canvas.height, 1e-0, 1e4)

const modleViewMatrix = mat4.create();
const mvpMatrix = mat4.create();

mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
mat4.invert(viewMatrix, viewMatrix);

let frameCount = 0;
let lastTime = performance.now();
let fpsDisplay = document.getElementById('fps-display');

function updateFPS() {
    let currentTime = performance.now();
    let deltaTimeF = currentTime - lastTime;
    frameCount++;

    if (deltaTimeF >= 1000) {
        let fps = Math.round((frameCount * 1000) / deltaTimeF);
        fpsDisplay.innerText = 'FPS: ' + fps;
        frameCount = 0;
        lastTime = currentTime;
    }
}

// Variables to store camera position
let cameraX = 0;
let cameraY = 0.1;
let cameraZ = 2;
let yaw = 3.1;
let pitch = 0;

//Cam movement
function handleKeyPress(event) {
    const rotationSpeed = 0.03;
    const pitchSpeed = 0.03;
    const stepSize = 0.01;
    const forwardDirection = vec3.create();
    vec3.set(forwardDirection, Math.sin(yaw), Math.sin(pitch), Math.cos(yaw));

    switch(event.key) {
        case 'w':
            cameraX += forwardDirection[0] * stepSize;
            cameraY += forwardDirection[1] * stepSize;
            cameraZ += forwardDirection[2] * stepSize;
            break;
        case 's':
            cameraX -= forwardDirection[0] * stepSize;
            cameraY -= forwardDirection[1] * stepSize;
            cameraZ -= forwardDirection[2] * stepSize;
            break;
        case 'a':
            yaw += rotationSpeed;
            break;
        case 'd':
            yaw -= rotationSpeed;
            break;
        case 'ArrowUp':
            pitch += pitchSpeed;
            break;
        case 'ArrowDown':
            pitch -= pitchSpeed;
            break;
    }
}

// Add event listener for key press
document.addEventListener('keydown', handleKeyPress);


function animate(){
    updateFPS();
    requestAnimationFrame(animate);
    
    // mat4.rotateY(modelMatrix, modelMatrix, 0.003);
    // mat4.rotateZ(modelMatrix, modelMatrix, 0.05);
    // mat4.rotateX(modelMatrix, modelMatrix, 0.01);

    //Handle camera movement
    document.addEventListener('keydown', handleKeyPress);
    //Adjust view matrix with camera position
    //Calculate camera forward direction
    const lookDirection = vec3.create();
    vec3.set(lookDirection, Math.sin(yaw), Math.sin(pitch), Math.cos(yaw));
    //Calculate camera target position based on forward direction
    const targetPosition = vec3.create();
    vec3.add(targetPosition, [cameraX, cameraY, cameraZ], lookDirection);
    //View matrix
    mat4.lookAt(viewMatrix, [cameraX, cameraY, cameraZ], targetPosition, [0, 1, 0]);

    //Move planets
    for(let currIndex=0; currIndex<planets.length; currIndex++){
        let currPlanet = planets[currIndex];
        for(let compareIndex=0; compareIndex<planets.length; compareIndex++){
            let comparePlanet = planets[compareIndex];
            let distVec = subtract3dVector(currPlanet.getPosition(),comparePlanet.getPosition());
            let magVec = getMagnitudeOf3dVector(distVec);
            if(compareIndex!=currIndex && magVec < 0.5){
                //Grav Force
                let gForce = getGravForceEx(currPlanet, comparePlanet, distVec,magVec);
                //Acceleration Force
                let aForce = getAccelerationForce(currPlanet.mass, gForce)
                //New pos
                let newVec = editVectorByAccelerationForce(currPlanet.getPosition(), aForce)
                // newVec = norm3dVector(newVec);
                
                //Edit pos in vertex data
                for(let i=0; i<3; i++){
                    vertexData[currPlanet.getIndex()+i] += newVec[i]*deltaTime;
                }            
            }
            //Check collistion
            if(compareIndex!=currIndex && magVec < 0.01){
                //change color of both planets to red
                colorData[currPlanet.getIndex()] = 1;//r
                colorData[currPlanet.getIndex()+1] = 0;//g
                colorData[currPlanet.getIndex()+2] = 0;//b
                colorData[comparePlanet.getIndex()] = 1;//r
                colorData[comparePlanet.getIndex()+1] = 0;//g
                colorData[comparePlanet.getIndex()+2] = 0;//b
                // planets.pop(comparePlanet);
            }
        }
    }

    //Scale objects based on distance from camera
    for (let i = 0; i < planets.length; i++) {
        let planet = planets[i];
        let distVec = subtract3dVector(planet.getPosition(), [cameraX, cameraY, cameraZ]);
        let distance = getMagnitudeOf3dVector(distVec);

        let unitVec = divide3dVector(distVec, distance);

        let dotProduct = unitVec[0] * Math.sin(yaw) + unitVec[1] * Math.sin(pitch) + unitVec[2] * Math.cos(yaw);

        let scaleFactor = dotProduct < 0 ? -1 / distance : 1 / distance;

        sizeData[planet.getIndex() / 3] = planet.getSize() * scaleFactor;
    }

    //bind vertex and color data
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizeData), gl.STATIC_DRAW);

    mat4.multiply(modleViewMatrix, viewMatrix, modelMatrix);
    mat4.multiply(mvpMatrix, projectionMatrix, modleViewMatrix);
    
    gl.uniformMatrix4fv(uniformLocation.matrix, false, mvpMatrix);
    gl.drawArrays(gl.POINTS, 0, vertexData.length/3);
    
}

animate();