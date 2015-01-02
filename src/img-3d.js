(function () {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;

    var container,stats;

    var camera, scene, renderer;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var triangles;

    var numVertices = 500;
    var w = 598/2;
    var h = 362/2;
    var vertices = [];
    var colors = [];
    var meshes = [];

    for (var i = 0; i < numVertices; i++) {
        var x = Math.random() * w;
        var y = Math.random() * h;
        vertices.push([x, y]);
        colors.push(Math.round(Math.random() * 0xFFFFFF));
    }

    var triangles = Delaunay.triangulate(vertices);

    function triangleCenter(v) {
        var x2 = v[0][0] + 1/2*(v[1][0]-v[0][0]);
        var x1 = v[2][0];
        var y2 = v[0][1] + 1/2*(v[1][1]-v[0][1]);
        var y1 = v[2][1];
        return [x1 + 2/3 * (x2 - x1), y1 + 2/3*(y2 - y1)];
    }

    function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        renderer = new THREE.WebGLRenderer( { antialias: true } );

        camera = new THREE.PerspectiveCamera( 35, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 25000 );
        camera.position.z = 200;

        scene = new THREE.Scene();

        var light = new THREE.DirectionalLight( 0xffffff, 2 );
        light.position.set( 1, 1, 1 );
        scene.add( light );

        var texture1 = new THREE.ImageUtils.loadTexture( 'img/earth-clouds-art.jpg' );

        // add box 1 - grey8 texture
        var material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1 } );

        var geometry = new THREE.PlaneGeometry(598/2,362/2,1,1);
        var mesh1 = new THREE.Mesh( geometry, material1 );
        mesh1.rotation.x = -Math.PI / 2;
        mesh1.position.x = 0;

       //scene.add( mesh1 );

        for (var i = 0; i < triangles.length; i += 3) {
            var geom = new THREE.Geometry();
            var p1 = vertices[triangles[i]];
            var p2 = vertices[triangles[i+1]];
            var p3 = vertices[triangles[i+2]];

            var tri = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture1 }));
            tri.triangleCenter = triangleCenter([p1, p2, p3]);

            geom.vertices.push(new THREE.Vector3(p1[0]-tri.triangleCenter[0], 0, p1[1]-tri.triangleCenter[1]));
            geom.vertices.push(new THREE.Vector3(p2[0]-tri.triangleCenter[0], 0, p2[1]-tri.triangleCenter[1]));
            geom.vertices.push(new THREE.Vector3(p3[0]-tri.triangleCenter[0], 0, p3[1]-tri.triangleCenter[1]));

            var face = new THREE.Face3(1, 2, 0);
            face.normal.set(0, 0, 1); // normal
            geom.faces.push(face);
            geom.faceVertexUvs[0].push([new THREE.Vector2(p2[0]/w, p2[1]/h), new THREE.Vector2(p3[0]/w, p3[1]/h), new THREE.Vector2(p1[0]/w, p1[1]/h)]); // uvs

            face = new THREE.Face3(0, 2, 1);
            face.normal.set(0, 0, 1); // normal
            geom.faces.push(face);
            geom.faceVertexUvs[0].push([new THREE.Vector2(p1[0]/w, p1[1]/h), new THREE.Vector2(p3[0]/w, p3[1]/h), new THREE.Vector2(p2[0]/w, p2[1]/h)]); // uvs

            tri.doubleSided = true;

            var dummy = new THREE.Object3D();
            dummy.position.x = tri.triangleCenter[0];
            dummy.position.z = tri.triangleCenter[1];
            dummy.position.x -= w/2;
            dummy.position.z -= h/2;
            scene.add( dummy );

            dummy.add(tri);

            vertices[triangles[i]].push(tri);
            vertices[triangles[i+1]].push(tri);
            vertices[triangles[i+2]].push(tri);

            tri.maxHeight = vertices[triangles[i]][2].position.y = Math.random() * 400;

            tri.speed = Math.random() * 5;
            tri.rot = 0;
            tri.dummy = dummy;
            tri.trans = 0;

            tri.direc = new THREE.Vector3(Math.random(),Math.random(),Math.random());

            meshes.push(tri);
        }

        // RENDERER
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        renderer.setClearColor( 0xf2f7ff, 1 );
        renderer.autoClear = false;

        renderer.domElement.style.position = "relative";
        container.appendChild( renderer.domElement );

        // STATS1
        stats = new Stats();
        container.appendChild( stats.domElement );

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );

        lastTime = new Date().getTime();
    }

    function onDocumentMouseMove(event) {

        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );

    }

    // Rotate an object around an arbitrary axis in object space
    var rotObjectMatrix;
    function rotateAroundObjectAxis(object, axis, radians) {
        rotObjectMatrix = new THREE.Matrix4();
        rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

        // old code for Three.JS pre r54:
        // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
        // new code for Three.JS r55+:
        object.matrix.multiply(rotObjectMatrix);

        // old code for Three.js pre r49:
        // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
        // old code for Three.js r50-r58:
        // object.rotation.setEulerFromRotationMatrix(object.matrix);
        // new code for Three.js r59+:
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space
    function rotateAroundWorldAxis(object, axis, radians) {
        rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

        // old code for Three.JS pre r54:
        //  rotWorldMatrix.multiply(object.matrix);
        // new code for Three.JS r55+:
        rotWorldMatrix.multiply(object.matrix);                // pre-multiply

        object.matrix = rotWorldMatrix;

        // old code for Three.js pre r49:
        // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
        // old code for Three.js pre r59:
        // object.rotation.setEulerFromRotationMatrix(object.matrix);
        // code for r59+:
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    var lastTime;
    var timePassed = 0;

    function animate() {
        var thisTime = new Date().getTime();
        var deltaTime = thisTime - lastTime;
        timePassed += deltaTime;

        requestAnimationFrame( animate );

        for (var i = 0; i < triangles.length; i += 3) {
            var p1 = vertices[triangles[i]];
            var p2 = vertices[triangles[i + 1]];
            var p3 = vertices[triangles[i + 2]];
            //p1[2].position.y = p1[2].maxHeight * mouseX / 800;

        }

        var sinus = Math.sin(thisTime/1000);

        for (var i = 0; i < meshes.length; i++) {
            //meshes[i].position.y = meshes[i].triangleCenter[0]*Math.sin(thisTime/10)/10;// * sinus;
            var x = meshes[i].triangleCenter[0];
            var y = meshes[i].triangleCenter[1];

            meshes[i].position.y = Math.sin((x+thisTime/40)/40)*10
            + Math.cos((y+thisTime/50)/15)*1.5
            + Math.cos((x+thisTime/20)/40)*3
                + Math.sin((y+thisTime/37)/27)*2.5
                + Math.cos((x+(200+thisTime)/11)/80)*4
                + Math.sin((y+3.9+thisTime/61)/12)*1;// * sinus;

            var axis2 = new THREE.Vector3(x,0,y);//tilted a bit on x and y - feel free to plug your different axis here
//in your update/draw function
            var axis = new THREE.Vector3(0,1,0);

            //var euler = new THREE.Euler( meshes[i].rot, 0, 0, 'XYZ' );
            //meshes[i].position.applyEuler(euler);
            //meshes[i].geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, -y ) );
            rotateAroundWorldAxis(meshes[i].dummy, axis,meshes[i].rot-mouseX / 50);
            //meshes[i].geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, y ) );
            meshes[i].rot = mouseX / 50;
            //meshes[i].rotateOnAxis(axis,);
            /*meshes[i].dummy.position.x += meshes[i].direc.x * (meshes[i].trans-mouseX);
            meshes[i].dummy.position.y += meshes[i].direc.y * (meshes[i].trans-mouseX);
            meshes[i].dummy.position.z += meshes[i].direc.z * (meshes[i].trans-mouseX);
*/
            meshes[i].trans = mouseX;
        }
        render();
        stats.update();
        lastTime = thisTime;
    }

    function render() {

        camera.position.x = 0;//+= ( mouseX - camera.position.x ) * .05;
        camera.position.y = 200;// THREE.Math.clamp( camera.position.y + ( - ( mouseY - 200 ) - camera.position.y ) * .05, 50, 1000 );
        camera.position.z = 200;

        camera.lookAt( scene.position );

        renderer.enableScissorTest( false );
        renderer.clear();
        renderer.enableScissorTest( true );

        renderer.setScissor( 0, 0, SCREEN_WIDTH - 2, SCREEN_HEIGHT );
        renderer.render( scene, camera );

    }

    document.addEventListener("DOMContentLoaded", function(event) {
        init();
        animate();
    });
})();