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
		
//		var logState = 'info';
//		
//		function logMessage(state, message) {
//			
//			// This implementation assumes that Giant Oak
//			// Utilities.js patch to the jQuery Library 
//			// has actually been applied...
//			if ($.isInArray(state, logState)) {
//				
//				console.log(message);
//			}
//			
//			return;
//		} 
		
		if ((!window.namespace)
				|| (!window.namespace.component)) {
				
			if (!window.namespace) {
			
				window.namespace = {};
			}
	
			
			windows.namespace.component = (function GiantOakNamespace() {
				
				/************************************************************************
				 *  Determine if the required modules are already loaded 
				 ***********************************************************************/
				
				if ((isEmpty(window.moduleNamespace))
						|| (!window.moduleNamespace)) {
						
					window.moduleNamespace = {};
				}
				
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function ComponentNameConstructor(instancePrefix, containerId, layout) {
			
								console.log("NamespaceTemplate::ComponentName called...");
								
								/**************************************************************************************
								 * Check that all required the call parameters are defined... 
							     **************************************************************************************/
								
								if (!instancePrefix) {
								
									throw new Error("Prefix argument not defined.");
								}
								
								
								if (!containerId) {
								
									throw new Error("ContainerId argument not defined.");
								}
		
								if (!layout) {
								
									throw new Error("Layout Configuration data argument not defined.");
								}
								
								prefix = instancePrefix;
								
								layoutConfiguration = layout;
								
								buildUI(containerId);
						
								return;
							};
							
						var methods = {};
						var statics = {};
						
						var component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
							
						return component;
							
					}());
					
				console.log("NamespaceTemplate::loadNamespace loaded declaration.");
				
			} else {
				
				console.log("NamespaceTemplate::loadNamespace declaration already loaded.");
			}
				
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadNamespace();