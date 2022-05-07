"use strict";

let THREECAMERA = null;

// callback: launched if a face is detected or lost.
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback(): DETECTED');
  } else {
    console.log('INFO in detect_callback(): LOST');
  }
}

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec) {
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  

   // CREATE A CUBE
  const cubeGeometry = new THREE.BoxGeometry(1,1,1);
  const cubeMaterial = new THREE.MeshNormalMaterial();
  const threeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  threeCube.frustumCulled = false;

  const vtkloader = new THREE.VTKLoader();
  vtkloader.load("brain.vtk", function (geometry) {

    geometry.computeVertexNormals();
    geometry.center();
    
    const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.scale.multiplyScalar(0.01);

    // eye-balled transformation
    mesh.rotateX( -Math.PI / 2 );
    mesh.rotateZ( Math.PI);
    mesh.translateZ(1);
    mesh.translateX(-0.5);

    window.mesh = mesh; // to prototype in the console

    threeStuffs.faceObject.add(mesh);

  }); 

  const stlloader = new THREE.STLLoader();
  stlloader.load("coil.stl", function (geometry) {

    geometry.computeVertexNormals();
    geometry.center();
    
    const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.scale.multiplyScalar(0.03);

    mesh.position.set(0.1,0.1,-5);

    window.mesh2 = mesh; // to prototype in the console
    threeStuffs.scene.add(mesh);

    window.ts = threeStuffs; // to prototype in the console
  }); 





  //CREATE THE CAMERA
  THREECAMERA = JeelizThreeHelper.create_camera();
} // end init_threeScene()

// launched by body.onload():
function main(){
  JeelizResizer.size_canvas({
    canvasId: 'jeeFaceFilterCanvas',
    callback: function(isError, bestVideoSettings){
      init_faceFilter(bestVideoSettings);
    }
  })
}

function init_faceFilter(videoSettings){
  JEELIZFACEFILTER.init({
    followZRot: true,
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: '', // root of NN_DEFAULT.json file
    maxFacesDetected: 1,
    callbackReady: function(errCode, spec){
      if (errCode){
        console.log('AN ERROR HAPPENS. ERR =', errCode);
        return;
      }

      init_threeScene(spec);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function(detectState){
      JeelizThreeHelper.render(detectState, THREECAMERA);
    }
  }); //end JEELIZFACEFILTER.init call
}

