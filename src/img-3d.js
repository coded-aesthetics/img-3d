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

    var numVertices = 3000;
    var w = 598/2;
    var h = 362/2;
    var vertices = [];
    var colors = [];

    for (var i = 0; i < numVertices; i++) {
        var x = Math.random() * w;
        var y = Math.random() * h;
        vertices.push([x, y]);
        colors.push(Math.round(Math.random() * 0xFFFFFF));
    }

    var triangles = Delaunay.triangulate(vertices);

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

        var texture1 = new THREE.ImageUtils.loadTexture( 'img/fraktak.png' );

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

            geom.vertices.push(new THREE.Vector3(p1[0], 0, p1[1]));
            geom.vertices.push(new THREE.Vector3(p2[0], 0, p2[1]));
            geom.vertices.push(new THREE.Vector3(p3[0], 0, p3[1]));

            var face = new THREE.Face3(1, 2, 0);
            face.normal.set(0, 0, 1); // normal
            geom.faces.push(face);
            geom.faceVertexUvs[0].push([new THREE.Vector2(p2[0]/w, p2[1]/h), new THREE.Vector2(p3[0]/w, p3[1]/h), new THREE.Vector2(p1[0]/w, p1[1]/h)]); // uvs

            face = new THREE.Face3(0, 2, 1);
            face.normal.set(0, 0, 1); // normal
            geom.faces.push(face);
            geom.faceVertexUvs[0].push([new THREE.Vector2(p1[0]/w, p1[1]/h), new THREE.Vector2(p3[0]/w, p3[1]/h), new THREE.Vector2(p2[0]/w, p2[1]/h)]); // uvs

            var tri = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture1 }));
            tri.doubleSided = true;
            tri.position.x -= w/2;
            tri.position.z -= h/2;
            scene.add(tri);

            vertices[triangles[i]].push(tri);
            vertices[triangles[i+1]].push(tri);
            vertices[triangles[i+2]].push(tri);

            tri.maxHeight = vertices[triangles[i]][2].position.y = Math.random() * 400;

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

    }

    function onDocumentMouseMove(event) {

        mouseX = ( event.clientX - windowHalfX );
        mouseY = ( event.clientY - windowHalfY );

    }

    function animate() {

        requestAnimationFrame( animate );

        for (var i = 0; i < triangles.length; i += 3) {
            var p1 = vertices[triangles[i]];
            var p2 = vertices[triangles[i + 1]];
            var p3 = vertices[triangles[i + 2]];
            p1[2].position.y = p1[2].maxHeight * mouseX / 800;
        }

        render();
        stats.update();

    }

    function render() {

        camera.position.x = 0;//+= ( mouseX - camera.position.x ) * .05;
        camera.position.y = 400;// THREE.Math.clamp( camera.position.y + ( - ( mouseY - 200 ) - camera.position.y ) * .05, 50, 1000 );
        camera.position.z = 400;

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