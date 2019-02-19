# 3D Rythm Sequencer
Why not using a 3D environment to compose music, in a collaborative way? The aim of this project is to experiment with a 3D world based on Three.js where every geometric shape has an associated sound.

## Mechanics
The world cosists of a circular table divided in sections, each representing one metronome tick. When the needle spins around this circle, every shape it touches will produce its own sound. This behavior is performed in a loop so that the contents of the full circle are repeated and can be changed live.

## Code structure
The application is divided in different JavaScript modules, each performing a specific functionality as described below:
```
application.js   Initializes all other modules of the application.

audio.js         Defines the class of SoundObject and the metronome, as well as the sounds that are used and their location.

chat.js          Define all the necessary elements for the communication of the whole application where it integrates all the commands to                  be used by the client.

controls.js      Manages the user interface and button clicks events, each associated with an action.

data.js          Stores all the data of the scene and the objects that compose it.

login.js         Initialize the application in case the validation of the fields of the login form is satisfactory.

scene.js         Manages the graphics of the application, based on THREE.js and a 3D canvas.

server.js        Defines all the events of the server instance as well as the initialization of this and manages the logic of the                          communication between clients. It is based on sillyServer.js.
```
# External libraries
```
bootstrap.js		  (Style)
jquery.js	 	      (Popovers)
three.js		      (3D Graphics)
orbitControls.js	(Camera drag)
sillyServer.js		(Communication Server side)
```
