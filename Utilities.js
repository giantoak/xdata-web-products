/**
 * 
 */

// Define Namespace Properties in the Global Scope

console.log ("Utilities.js - Loaded....");


// Patch JQuery Selectors to added exists check to query results.
if (!($.fn.exists)) {
	
	$.fn.exists = function exists() {
		return this.length !== 0;
	};
}

if (!($.fn.isInArray)) {
	
	$.fn.isInArray = function isInArray(obj) {
		
		return this.inArray(obj) != -1;
	};
}

function loadUtilitiesModule() {
	
	console.log("Utilities::loadUtilitiesModule called...");
	
	function isEmpty(obj) {
		
		for (var i in obj) {
			
			return i == null;
		}
		
		return true;
	}
	
	if ((isEmpty(window.utilities))
			|| (!window.utilities)) {
			
			window.utilities = {};

		/******************************************************************************
		 * 
		 * TODO: 
		 * Determine if the global object should be scoped to support Giant 
		 * Oak's own identity as in go_utilities or something similar.
		 * 
		******************************************************************************/
		// Populate and provide the implementations for the Utilities Namespace
		window.utilities = (function GiantOakUtilitiesNamespace() {
			
			console.log("Utilities::loadUtilitiesModule::GiantOakUtilitiesNamespace called...");
		
			/******************************************************************
			 * Define Class Hierarchy building methods.
			 ******************************************************************/
			
			// Defines a function for cloning properties of on object to another
			var extend = function extend(o, p) {
				
								for (var prop in p) {
									
									o[prop] = p[prop];
								}
								
								return o;
							};
							
			// Define a function for extending one 'class' from another.
			var inherit = function inherit(p) {
				
								var results = null;
								if (p == null) {
									
									throw TypeError("Class Hierarchy implementation requires a superclass definition.");
								}
								
								if (Object.create) {
									
									results = Object.create(p);
								}
								
								if (null == results) {
									
									var t = typeof p;
									
									if ((t !== "object")
											&& (t !== 'function')) {
										
										throw TypeError ("Class Hierarchy implementation requires an appropriate superclass definition.");
									}
									
									function f() {};
									
									f.prototype = p;
									
									results = new f();
								}
								
								return results;
		
							};
			
			// Define a function implementing class derivation
			var defineSubclass = function defineSubclass(superclass, constructor, methods, statics) {
										
										constructor.prototype = inherit(superclass.prototype);
										constructor.prototype.constructor = constructor;
										
										if (methods) {
											extend(constructor.prototype, methods);
										}
										
										if (statics) {
											extend(constructor.prototype, statics);
										}
										
										return constructor;
									};
									
			var isExternalLibraryLoaded = function checkExternalLibraryLoaded(regEx, warningMsg) {
				
				var filtered = $("script").filter(function () {
					
					var re = new RegExp(regEx);
					var results = re.test($(this).prop("src"));
					
					console.log("script>src: '" + $(this).prop("src") + "' " 
									+ (results ? "is" : "is not") 
									+ " the required script file.");
					
					return results;
				});
		
				if (!filtered.exists()) {
					
					throw Error(warningMsg);
				}
			
				return;
			}; 
			
			var isModuleLoaded = function checkModuleLoaded(moduleNamespace, load) {
				
				if ((!moduleNamespace)
						|| (isEmpty(moduleNamespace))) {
						
					load();
				}
				
				return;
			};
			
			
			var mapColors = function mapColorsFactory(colors, scalingFunction, dataSet, accessor) {
				
				var mapperSteps = (1.0 / (colors.length - 1));
				var mapperDomain = d3.range(0, 1, mapperSteps);
				
				var mapper = d3.scale.linear().domain(mapperDomain)
									.range(colors);
				
				var localExtent = d3.extent(dataSet, accessor);
				var localRange = new Array(0,1);
				var scaler = scalingFunction.domain(localExtent).range(localRange);
				
				return function colorMapper(value) { 
					
						var s = scaler(value);
						
						var m = mapper(s);
					
						return m;
					};
				
			};
			
			var argumentChecker = function argumentChecker(arg, defaultValue) {
				
				return ((typeof arg === "undefined") ? defaultValue : arg);
			};
			
			var fetchJumpTable = {
					"txt": {
								fetch: function textFetch(url, callback, mime, accessor) { 
										
											d3.text(url, mime, callback);
											return;
										},
								mimeTypeDefault: "text/plain",
								accessorDefault: function (d) { return d;}
							},
					"json": {
								fetch: function jsonFetch(url, callback, mime, accessor) { 
									
										d3.json(url, callback);
										return;
									},
								mimeTypeDefault: "application/json",
								accessorDefault: function (d) { return d; }
							}, 
					"xml": {
								fetch: function xmlFetch(url, callback, mime, accessor) {
									
									d3.xml(url, mime, callback);
									return;
								},
								mimeTypeDefault: "application/xml",
								accessorDefault: function (d) { return d; }
							}, 
					"html": {
								fetch: function htmlFetch(url, callback, mime, accessor) {
									
									d3.html(url, callback);
									return;
								},
								mimeTypeDefault: "text/html",
								accessorDefault: function (d) { return d; }
							}, 								
					"csv": {
								fetch: function csvFetch(url, callback, mime, accessor) { 
									
									d3.csv(url, accessor, callback);
									return;
								},
								mimeTypeDefault: "text/csv",
								accessorDefault: function (d) { return d; } 
							}, 								
					"tsv": {
								fetch: function tsvFetch(url, callback, mime, accessor) { 
									
									d3.tsv(url, accessor, callback);
									return;
								},
								mimeTypeDefault: "text/tab-separated-values",
								accessorDefault: function (d) { return d; }
							}
			};
			
			var fetchData = function fetchData(uri, callback, mime, accessor) {
				
				var offset = uri.lastIndexOf(".");
				
				if (-1 != offset) {

					++offset;
					var extension = uri.slice(offset);
					var fetcher = fetchJumpTable[extension]; 
					
					fetcher.fetch(uri, callback, 
									argumentChecker(mime, fetcher.mimeTypeDefault),
									argumentChecker(accessor, fetcher.accessorDefault));
					
				} else {
					throw new Error("URL does not include expected extension.");
				}
				return;
			};
			
			var findIndexByKeyValue = function findIndexByKeyValue(obj, key, value){
	                for (var i = 0; i < obj.length; i++) {
	                    if (obj[i][key] == value) {
	                        return i;
	                    }
	                }
	                return null;
	            };
	            
	        var findSortedInsertionPointWithKey = function findSortedInsertionPointWithKey(obj, key, value) {
	        	
	        	var results = null;
	        	
	        	for (var i = 0; i < obj.length; i++) {
	        		
	        		if (obj[i][key] > value) {
	        			
	        			results = i;
	        			break;
	        		}
	        	}
	        	
	        	return results;	        	
	        };
	

	        var generateComponentSpecificIdentifiers = function generateComponentSpecificIdentifiers(prefix, identifier) {
	        	
	        	return prefix + "_" + identifier;
	        };
	        
	        var generateClassSelector = function generateClassSelector (identifier) {
	        	
	        	return "." + identifer;
	        };
	        
	        var generateIdentifierSelector = function generateIdentifierSelector(identifier) {
	        	
	        	return "#" + identifier;
	        };

			
			/******************************************************************************
			 * 
			 * TODO: 
			 * Determine if it is a good idea to actually patch the Function Type.
			 * 
			******************************************************************************/
			// Patch Function Prototype
		//	Function.prototype.extend = function(constructor, methods, statics) { 
		//										return defineSubclass(this, constructor, methods, statics); 
		//									};
		
			/******************************************************************
			 * Define Additional utilities here
			 ******************************************************************/
			/******************************************************************************
			 * 
			 * TODO: 
			 * If additional 'types' of utility functions are defined then a additional
			 * substructures need to be defined in the returned object defined below.
			 * 
			 * This definition is accomplished by adding a comma, and property name and 
			 * the subcomponent's object declaration, such as
			 * 
			 * formatters: {
			 * 					UTCFormat : utcFormatter,
			 * 					USCurrencyFormat: usCashFormatter 
			 * 				}
			 * 
			******************************************************************************/
									
			function abstractMethod() { throw new Error("abstract method"); };
		
			function AbstractUIControl () { throw new Error("can't instantiate abstract class."); };
					
			Object.defineProperty(AbstractUIControl,
					"extend", 
					{
						writable: true,
						enumerable: true,
						configurable: true,
						value: function(constructor, methods, statics) {
							return defineSubclass(this, constructor, methods, statics);
						}
					});

		
			console.log("Utilities::AbstractUIControl contains: ");
			for (var prop in AbstractUIControl) {
				
				console.log("Utilities::AbstractUIControl." + prop);
			}
			
			var ctor = function eventHandlerManagement () {
				
				this.handlers = new Array();				
			};
			
			var methods = {
				addHandler: function addHandler(handler) {
								
								var t = typeof handler;
								
								if (t !== 'function') {
									
									throw TypeError ("Handler parameter needs to be of type function.");
								}
								
								this.handlers.push(handler);
								
								return;
							},
				removeHandler: function removeHandler(handler) {
								var index = this.handlers.indexOf(handler);
								
								if (-1 != index) {
									
									this.handlers.splice(index, 1);
								} else {
									
									throw Error("Handler parameter not present.");
								}
								
								return;
							},
				fireHandlers: function fireHandlers(/*...*/) {
					
								var args = new Array();
								
								for (var i = 0; i < arguments.length; i++) {
									
									if (arguments[i] != "fireHandlers") {
										
										args.push(arguments[i]);
										
									} else {
										break;
									}
								}
			
								this.handlers.forEach(function(handler) {
									
									try {
									
										handler.apply(handler, args);
										
									} catch (e) {
										
										console.log("EventHandlerManagement caught exception thrown by : " 
														+ handler.name 
														+ ", Message was: '"
														+ e.message 
														+ "'"); 
									}
									
									
									return;
								});
								return;
							}
			};
						
			var EventHandlerManagement = AbstractUIControl.extend(ctor, methods, null);
			
			return {
						classInfrastructure: {
							Extend: extend,
							Inherit: inherit,
							DefineSubclass: defineSubclass
						},
						controls: {
							AbstractMethod: abstractMethod,
							AbstractUIControl: AbstractUIControl,
							EventHandlerManagement: EventHandlerManagement
						},
						IsExternalLibraryLoaded: isExternalLibraryLoaded,
						IsModuleLoaded: isModuleLoaded,
						MapColors: mapColors,
						FetchData: fetchData,
						FindIndexByKeyValue: findIndexByKeyValue,
						FindSortedInsertionPointWithKey: findSortedInsertionPointWithKey,
						GenerateComponentSpecificIdentifiers: generateComponentSpecificIdentifiers,
						GenerateClassSelector: generateClassSelector,
						GenerateIdentifierSelector: generateIdentifierSelector

				};
		}());
		
		console.log("Utilities::loadUtilitiesModule loaded namespace.");

	} else {
		
		console.log("Utilities::loadUtilitiesModule namespace already loaded.");
	}
	
	return;
}

loadUtilitiesModule();

