var SCENE = {

	canvas: {},
	scene: {},
	renderer: {},
	container: {},
	camera: {},
	orbit: {},

	axis:{x:{},y:{},z:{}},
	models: [],
	meshes: [],

	loaderLine: {},

	colors: ["#9b59b6", // Purple
			 "#bdc3c7", // Gray
			 "#e74c3c", // Red
			 "#e67e22", // Orange
			 "#f1c40f", // Yellow
			 "#2ecc71", // Green
			 "#3498db"], // Blue

	sizes: [
			{size:4, radius:10},
			{size:4, radius:20},
			{size:4, radius:40},
			{size:5, radius:50},
			{size:6, radius:60},
			{size:8, radius:80},
			{size:10, radius:100}
		],

	// Define the Maximum Depth of the world
	MAX_DEPTH: 1000,

	init: function(){
		// Axis
		this.axis.x = new THREE.Vector3(1,0,0);
		this.axis.y = new THREE.Vector3(0,1,0);
		this.axis.z = new THREE.Vector3(0,0,1);

	  	// Create Scene
		this.scene = new THREE.Scene();

		// Camera controls
	  	this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, this.MAX_DEPTH);
	  	this.camera.position.set(0,40,160);
	  	this.camera.lookAt(0,0,0);

		// Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor( 0x000000 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

		this.container = document.getElementById("mycanvas");
		this.container.appendChild( this.renderer.domElement );

		// Orbit Controls
		this.orbit = new THREE.OrbitControls(this.camera, document.getElementById("mycanvas"));
		this.orbit.maxDistance = this.MAX_DEPTH/2;

		// Create the field meshes
		this.createBackground( this.MAX_DEPTH / 2 );
		this.createField(100, 128, DATA.loopLength, DATA.subdivision);
		this.createLoaderLine(100);

		// Events
		window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

		// Animate the scene
		this.animate();
	},

	animate: function(){
		requestAnimationFrame( this.animate.bind(this) );
		this.update();
		this.render();
	},

	update: function(){
		// Update external modules
		DATA.update();
		CONTROLS.update();

		this.moveLineToAngle( DATA.currentAngle );

		// Update camera OrbitControls
		this.orbit.update();
	},

	render: function(){
		this.renderer.render( this.scene, this.camera );
	},

	/////////////////////////////////////////////////////////////

	createBackground: function(radius){
		var geom = new THREE.SphereGeometry( radius, 32, 32 );
		var mat = new THREE.MeshBasicMaterial();
		// load a texture, set wrap mode to repeat
		var texture = new THREE.TextureLoader().load("img/blue_gradient.jpg");
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 2, 2 );
		mat.map = texture;
		mat.side = THREE.BackSide;
		var backgroundMesh = new THREE.Mesh(geom, mat);
		this.scene.add(backgroundMesh);
	},

	createCube: function(side, color){
		if(color === undefined) color = 0x0000ff;
		var geom = new THREE.BoxGeometry( side, side, side );
		var mat = new THREE.MeshBasicMaterial( {color: color} );
		var cube = new THREE.Mesh( geom, mat );
		return cube;
	},

	createCone: function(side, color){
		if(color === undefined) color = 0x0000ff;
		var geom = new THREE.ConeGeometry( side/2, side, 32 );
		var mat = new THREE.MeshBasicMaterial( {color: color} );
		var cone = new THREE.Mesh( geom, mat );
		return cone;
	},

	createCylinder: function(side, color){
		if(color === undefined) color = 0x0000ff;
		var geom = new THREE.CylinderGeometry( side/2, side/2, side, 32 );
		var mat = new THREE.MeshBasicMaterial( {color: color} );
		var cylinder = new THREE.Mesh( geom, mat );
		return cylinder;
	},

	createField: function(radius, segments, length, division){
	    var material = new THREE.LineBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0.5 } );
	    var geometry = new THREE.CylinderGeometry( radius, radius, 0, segments );
	    var fieldMesh = new THREE.Mesh(geometry, material);
	    this.scene.add(fieldMesh);

	    for (var i = 0; i < length*division; i++) {
	    	var currentAngle = 2*Math.PI * i / (length*division);
	    	var position = this.pointFromAngle(currentAngle, radius);
	    	material = new THREE.LineBasicMaterial({color: 0x3498db, linewidth: 2});
			geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3( 0, 0, 0 ),
				new THREE.Vector3( position.x, position.y, position.z)
			);
			var helperLine = new THREE.Line( geometry, material );
			this.scene.add(helperLine);
	    }
	},

	createLoaderLine: function(radius){
		material = new THREE.LineBasicMaterial({color: 0xff00ff, linewidth: 8});
		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( 0, 0, -radius)
		);
		this.loaderLine = new THREE.Line( geometry, material );
		this.scene.add( this.loaderLine );
	},

	createSphere: function(side, color){
		if(color === undefined) color = 0x0000ff;
		var geom = new THREE.BoxGeometry( side, side, side );
		var mat = new THREE.MeshBasicMaterial( {color: color} );
		var sphere = new THREE.Mesh( geom, mat );
		return sphere;
	},

	createTorus: function(side, color){
		if(color === undefined) color = 0x0000ff;
		var geom = new THREE.TorusGeometry( side/2, side/4, 16, 32 );
		var mat = new THREE.MeshBasicMaterial( {color: color} );
		var torus = new THREE.Mesh( geom, mat );
		return torus;
	},

	insert: function(angle, radius, type, key){
		var mesh;
		var size = this.getSizeFromRadius(radius);
		var position = this.pointFromAngle( angle, radius );
		switch(type){
			case "kick": 
				mesh = this.createCylinder(size, "#2c3e50");
				break;
			case "snare":
				mesh = this.createTorus(size, "#7f8c8d");
				break;
			case "hihat":
				mesh = this.createCone(size, "#ecf0f1");
				break;
			default:
				mesh = this.createCube(size, this.getColorFromType(type)); // type = note_ + 'a'||'b'...
				break;
		}
		mesh.position.set(position.x, position.y, position.z);
		var temp = {
			mesh: mesh,
			key: key,
		}
		var origin = new THREE.Vector3(0,0,0);
		temp.mesh.lookAt(origin);

		temp.mesh.position.y = size/2;

		this.meshes.push(temp);
		this.scene.add(temp.mesh);
	},

	getColorFromType: function(type){
		var i = type.substring(5,6).charCodeAt() - "a".charCodeAt();
		return this.colors[i];
	},

	getMeshCenter: function(object){
		var objBbox = new THREE.Box3().setFromObject(object);
	    // Geometry vertices centering to world axis
	    var bboxCenter = objBbox.getCenter().clone();
	    bboxCenter.multiplyScalar(-1);
	    return bboxCenter;
	},

	getSizeFromRadius: function(radius){
		for (var i = 0; i < this.sizes.length; i++) {
			if(this.sizes[i].radius == radius) return this.sizes[i].size;
		}
	},

	moveLineToAngle: function(angle){
		var point = this.pointFromAngle( angle , 100 );
		this.loaderLine.geometry.vertices[1] = point;
		this.loaderLine.geometry.verticesNeedUpdate = true;
	},

	onWindowResize: function(){
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	},

	pointFromAngle: function(angle, radius){
		var pos = new THREE.Vector3();
		pos.x = radius * Math.sin(angle);
		pos.y = 0;
		pos.z = -radius * Math.cos(angle);
		return pos;
	},

	remove: function(obj){
		var key = obj.key;
		for (var i = 0; i < this.meshes.length; i++) {
			if(this.meshes[i].key == key){
				this.scene.remove(this.meshes[i].mesh);
				this.meshes.splice(i,1);
			}
		}
	},

	rotateObject: function(object, vector, angle){
		object.rotateOnAxis(vector, angle);
	},

	translateObject: function(object, position){
		object.translateOnAxis(this.axis.x, position.x);
		object.translateOnAxis(this.axis.y, position.y);
		object.translateOnAxis(this.axis.z, position.z);
	},
};
