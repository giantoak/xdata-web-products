/**
 * This Javascript file acts as a template.
 */

console.log("NamespaceTest.js - Loaded...");

function loadNamespace() {

	/******************************************************
	 * isEmpty
	 * 
	 * Provides logic to determine if identified namespace
	 * object (the call parameter) has been defined.
	 * 
	*******************************************************/
	function isEmpty(obj) {
		for (var i in obj) {

			return i == null;
		}
		
		return true;
	}
	
	var logState = 'info';
	
	function logMessage(state, message) {
		
		// This implementation assumes that Giant Oak
		// Utilities.js patch to the jQuery Library 
		// has actually been applied...
		if ($.isInArray(state, logState)) {
			
			console.log(message);
		}
		
		return;
	} 

	if ((isEmpty(window.moduleNamespace))
			|| (!window.moduleNamespace)) {
			
		window.moduleNamespace = {};

		// Explicitly define the contents of the namespace
		window.moduleNamespace = (function namespace() {
			
			return {
				Property1: "Property1",
				Property2: "Property2"
				
				};
		}());
	}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadNamespace();