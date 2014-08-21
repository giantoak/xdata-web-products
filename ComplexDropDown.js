/**
 * 
 * Complex Drop Down Component provides the implementation to create a 
 * DropDown control with a region to display a gradient associated with
 * the user selection.
 * 
 */

console.log("ComplexDropDown.js - Loaded...");

function loadComplexDropDown() {

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

	if ((!(window.controls))
			|| (!window.controls.ComplexDropDown)) {
			
		if (!window.controls) {
			
			window.controls = {};
			
			console.log("ComplexDropDown::loadComplexDropDown loaded namespace.");
		}
		

		// Explicitly define the contents of the namespace
		window.controls.ComplexDropDown = (function GiantOakControlsNamespace() {
			
			console.log("ComplexDropDown::GiantOakControlsNamespace called...");
			
			/**************************************************************************************
			 * Confirm that dependencies have been declared prior to attempting to create class
			**************************************************************************************/

			// Determining if Giant Oak Utilities namespace has been defined is a 
			// Special case and needs to come first as it provides a lot of basic
			// functionality used in the rest of libraries developed by Giant Oak.
			if ((isEmpty(window.utilities))
					|| (!window.utilities)) {
					
				loadUtilitiesModule();
			}
			
			var GoUtilities = window.utilities;	
			var GoControls = window.utilities.controls;
			var prefix = null;
			var layoutConfiguration = null;

			var dropDownShowing = false;
			var selectionId = "selection_default";
			
			var selectionChangedEventHandler = new GoControls.EventHandlerManagement();

			var addSelectionChangedEventHandler = function addSelectionChangedEventHandler(handler) {
				
				selectionChangedEventHandler.addHandler(handler);
				
				return;
			};

			var removeSelectionChangedEventHandler = function removeSelectionChangedEventHandler(handler) {
				
				selectionChangedEventHandler.removeHandler(handler);
				
				return;
			};


		
			var showDropDown = function showDropDown() {
				
				console.log("ComplexDropDown::ShowDropDown called...");
				
				var selector = "[id^=" +  GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "selection_") + "]";
				
				var options = $(selector);
				
				options.removeClass("highlight");
				options.addClass("outlined");
				
				options.css("display", (dropDownShowing ? "none" : "block"));
				
				dropDownShowing = !dropDownShowing;
				
				if (!dropDownShowing) {
				
					$("#" + selectionId).css("display", "block")
											.css("top", "0px")
											.addClass("selected")
											.removeClass("outlined");
				
				} else {
				
					options = $(".outlined");
					
					options.each(function (i, element) {
						
						var top = ((i + 1) * 30);
						
						console.log("repositioning element[" + i + "] id: " + element.id + " top: " +  top);
						
						$(element).css("top", (top + "px"));
					});									
				}
				
				console.log("ComplexDropDown::ShowDropDown completed.");
				
				return;
			};
			
			var highlightOption = function highlightOption(ctr) {
				
				var opt = $(this);
				
				console.log("ComplexDropDown::HighlightOption called, while over: " + this.id);

				var options = $(".highlight");
				
				options.toggleClass("highlight outlined");
				
				opt.toggleClass("outlined highlight");
				
				console.log("ComplexDropDown::HighlightOption completed.");
				
			};
			
			var selectedOption = function selectedOption(ctr) {
				
				var opt = $(this);
				
				console.log("ComplexDropDown::SelectedOption called, while over: " + this.id);
				
				var options = $(".selected");
				
				options.toggleClass("selected outlined");
				 
				opt.toggleClass("highlight selected");
				
				selectionId = this.id;
				
				showDropDown();
				
				selectionChangedEventHandler.fireHandlers(this, ctr.value);
				
				console.log("ComplexDropDown::SelectedOption completed.");
				
			};
			
			
			
			function buildUI(containerId) {
				
				console.log("ComplexDropDown::buildUI called...");
				
				var containerControl = d3.select(containerId).append("div")
													.style("position", "absolute")
													.style("width", layoutConfiguration.containerProperties.width)
													.style("height", layoutConfiguration.containerProperties.height)
													.style("top", layoutConfiguration.containerProperties.top)
													.style("left", layoutConfiguration.containerProperties.left)
													.style("background-color", layoutConfiguration.containerProperties.backgroundColor);
				
				containerControl.selectAll("div").data(layoutConfiguration.options)
								.enter().append("div")
									.style("position", "absolute")
									.style("top", function (d, i) {
											
											var len = layoutConfiguration.containerProperties.height.length - 2;
											var height = parseInt(layoutConfiguration.containerProperties.height.substring(0, len));
											
											return (i * (height + 5)) + "px";
										})
									.style("left", "0px")
									.style("width", layoutConfiguration.containerProperties.width)
									.attr("class", function (d) {

											return "options " + d.classes;
	 									})
									.attr("id", function (d) {
										
											return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id);
										})
									.on("mouseover", highlightOption)
									.on("click", selectedOption)
									.text(function (d) {
											
											return d.label;
										})
									.append("div")
										.style("position", "absolute")
										.style("top", "0px")
										.style("left", "200px")
										.attr("class", function (d) {
											
												return "gradientSampler " + d.gradientClass;
											});
									
				d3.select(containerId).append("div")
								.on("click", showDropDown)
								.style("border", layoutConfiguration.controlButton.borders)
								.style("padding", layoutConfiguration.controlButton.padding)
								.style("position", "absolute")
								.style("top", layoutConfiguration.controlButton.top)
								.style("left", layoutConfiguration.controlButton.left)
								.style("width", layoutConfiguration.controlButton.width)
								.style("height", layoutConfiguration.controlButton.height)
								.style("background-color", layoutConfiguration.containerProperties.backgroundColor)
							.append("span")
								.attr("class", "glyphicon glyphicon-chevron-down");
				
				return;
			}

			/**************************************************************************************
			 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
		     **************************************************************************************/
			var ctor = function ComplexDropDown(instancePrefix, containerId, layout) {
		
					console.log("ComplexDropDown::ComplexDropDown called...");
					
					
					/**************************************************************************************
					 * Check that all required the call parameters are defined... 
				     **************************************************************************************/
					
					if (!instancePrefix) {
						throw new Error("InstancePrefix argument not defined.");
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
				};
			var methods = {

					AddSelectionChangedEventHandler: addSelectionChangedEventHandler,
					RemoveSelectionChangedEventHandler: removeSelectionChangedEventHandler					
				};

			var statics = {};
			
			var component = GoControls.AbstractUIControl.extend(ctor, methods, statics);	
			
//			Object.defineProperty(component.prototype,
//					"AdditionalNodeDataURL", 
//					{
//
//						enumerable: true,
//						configurable: true,
//						get: function() {
//							return additionalNodeDataURL;
//						},
//						set: function (uri) {
//							
//							additionalNodeDataURL = uri;
//							
//							updateNodeData();
//							
//							return;
//						}
//					});
//
			
				return component;
			
		}());
	}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadComplexDropDown();