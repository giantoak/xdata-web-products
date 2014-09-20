/**
 * Multiple Subrange Selector Control
 */


console.log("MultipleSubrangeSelector.js - Loaded...");

function loadMultipleSubrangeSelector() {

	console.log("MultipleSubrangeSelector::loadMultipleSubrangeSelector called...");

	function isEmpty(obj) {
		
		for (var i in obj) {
			
			return i == null;
		}
		
		return true;
	}
	
	var updateButtonId = "updateButton";
	var deleteButtonId = "deleteButton";

	var addEventLabelId = "addEventButton";
	var deleteEventLabelId = "deleteEventButton";
		
	if ((!window.controls)
			|| (!window.controls.MultipleSubrangeSelector)) {
		
		if (!window.controls) {
			
			window.controls = {};
			
			console.log("MultipleSubrangeSelector::loadMultipleSubrangeSelector loaded namespace.");
		}
		
		/**************************************************************************************
		 * Define the Constructor function to added to the Global Controls Collection
		**************************************************************************************/
		window.controls.MultipleSubrangeSelector = (function GiantOakControlsNamespace() {
			
			console.log("MultipleSubrangeSelector::GiantOakControlsNamespace called...");
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
			
			// Define local alias to the Utilities Namespace.
			var GoUtilities = window.utilities;	
			var GoAbstractControls = window.utilities.controls;
			var timeSeriesScale = null;
			var timeSeriesAxis = null;
			var toolTip = null;
			var updateForm = null;
			var eventEditor = null;
			var rectangles = new Array();
			var events = new Array();
			var layoutConfiguration = null;
			var svg = null;
			var elementWidth = 850;
			var elementHeight = 135; 
			var prefix = null;
			
			
			var subrangeCreationEventManagement = new GoAbstractControls.EventHandlerManagement();
			var subrangeDeletedEventManagement = new GoAbstractControls.EventHandlerManagement();
			
			var seriesEventCreationEventManagement = new GoAbstractControls.EventHandlerManagement();
			var seriesEventDeletedEventManagement = new GoAbstractControls.EventHandlerManagement();
			
			
			// Presuppose that the JQuery Javascript Library has been loaded
			// Used to enforce D3.JS library is loaded.
			
			GoUtilities.IsExternalLibraryLoaded(".*d3\.[.*\.]?js", "igm", "D3.js Library not loaded.");

			
			// Add Required Giant Oak Module loaded checks here using
			// GoUtilitities.IsModuleLoaded(windows.gonamespace, loadGoNamespace);
			
			
			/**************************************************************************************
			 * Define functions that will be bound to the class thereby becoming publicly scoped. 
			**************************************************************************************/
			
			function convertIdToIdSelector(id) { return  GoUtilities.GenerateIdentifierSelector(
															GoUtilities.GenerateComponentSpecificIdentifiers(prefix, id)); }

			function convertCoordinatesToSeriesOffset(coord) {
				
				return timeSeriesScale.invert(coord);
			}
			
			function convertSeriesOffsetToCoordinate(offset) {
				
//				return timeSeriesScale(offset) - layoutConfiguration.margins.left;
				return timeSeriesScale(offset);
			}
			
			
			/*************************************************************************
			 * TODO: Create a better algorithm for figuring out unique identifiers 
			 *		 for the new subrange.  Also, consider moving to Utilities namespace.
			 ************************************************************************/
			
			var idComparer = function (a, b) {
				return a == b;
			};

			function createNewUniqueId(candidateId, len, selectorPrefix, idPrefix) {
				
				while ($(convertIdToIdSelector(selectorPrefix + candidateId)).exists()) {
					
					++len;
					
					candidateId = idPrefix + len;
				}
				
				return candidateId;
			}
			
			function createNewSubrange(x) {
				
				console.log("MultipleSubrangeSelector::createNewSubrange called...");
				
				var rect = {
						"display": "visible",
						"x": x,
						"y": 0,
						"width": layoutConfiguration.rangeBrush.width,
						"height": layoutConfiguration.rangeBrush.height,
						"atOffset": convertCoordinatesToSeriesOffset(x - layoutConfiguration.margins.left),
						"id": GoUtilities.GenerateComponentSpecificIdentifiers(prefix, ("rect_" + rectangles.length)),
						"onPositionUpdated": new GoAbstractControls.EventHandlerManagement(),
						startOffset: convertCoordinatesToSeriesOffset(x - layoutConfiguration.margins.left),
						endOffset: convertCoordinatesToSeriesOffset(x - layoutConfiguration.margins.left + layoutConfiguration.rangeBrush.width)
					};
				
				var len = rectangles.length;
				
				rect.id = createNewUniqueId(rect.id, len, "rangeSelections_", "rect_" + len); 

				return rect;
			}
			
			function createNewEvent(x) {

				console.log("MultipleSubrangeSelector::createNewEvent called...");
				
				var event = {
						"id": GoUtilities.GenerateComponentSpecificIdentifiers(prefix, ("evt_" + events.length)),
						"x": x,
						"atOffset": convertCoordinatesToSeriesOffset(x),
						"eventLabel": "New User Event"
					};				
				
				var len = events.length;
				
				event.id = createNewUniqueId(event.id, len, "eventMarkers_", "evt_");
				
				return event;
			}
			
			
			var moveRange = function moveRange(d, range, event) {
				
//				var x = event.x  - layoutConfiguration.margins.left;
				var x = event.x;
				var y = 0;
				
				var transform = "translate(" + x + ", " + y + ")";
				
				d.atOffset = convertCoordinatesToSeriesOffset(x);
				d.transform = transform;
				d.startOffset = d.atOffset;
				d.endOffset = convertCoordinatesToSeriesOffset(x+d.width);
				
				range.attr("transform", transform);
				
				d.x = x;
				
				d.onPositionUpdated.fireHandlers(d);
				
				return;
			};
						
			var fixToolTipMessage = function(d) {
				
				toolTip.select(convertIdToIdSelector("rangeToolTip")).text(d.id);
				
//				var x = d.x - layoutConfiguration.margins.left;
				var x = d.x;
				var width = x + d.width;
				var endValue = convertCoordinatesToSeriesOffset(width);
				
				toolTip.select(convertIdToIdSelector("startTipValue"))
							.text("" + layoutConfiguration.toolTip.valueFormatter(d.atOffset, 
												layoutConfiguration.toolTip.formatPrecision));
				
				toolTip.select(convertIdToIdSelector("endTipValue"))
							.text("" + layoutConfiguration.toolTip.valueFormatter(endValue, 
												layoutConfiguration.toolTip.formatPrecision));				

				return;
			};			
			
			var addNewSubrangeHandler = function addNewSubrangeHandler(handler) {
				
				subrangeCreationEventManagement.addHandler(handler);
				
				return;
			};

			var removeNewSubrangeHandler = function removeNewSubrangeHandler(handler) {

				subrangeCreationEventManagement.removeHandler(handler);
				
				return;
			};
			
			var addDeletedSubrangeHandler = function addDeletedSubrangeHandler(handler) {

				subrangeDeletedEventManagement.addHandler(handler);
				
				return;
			};
			
			var removeDeletedSubrangeHandler = function removeDeletedSubrangeHandler(handler) {

				subrangeDeletedEventManagement.removeHandler(handler);

				return;
			};

			var addNewSeriesEventCreatedHandler = function addNewSeriesEventCreatedHandler(handler) { 
			
				seriesEventCreationEventManagement.addHandler(handler);
				
				return;
			};

			var removeNewSeriesEventCreatedHandler = function removeNewSeriesEventCreatedHandler(handler) {
			
				seriesEventCreationEventManagement.removeHandler(handler);
				
				return;
			};
			
			var addDeletedSeriesEventHandler = function addDeletedSeriesEventHandler(handler) { 
			
				seriesEventDeletedEventManagement.addHandler(handler);
				
				return;
			};

			var removeDeletedSeriesEventHanlder = function removeDeletedSeriesEventHanlder(handler) {
			
				seriesEventDeletedEventManagement.removeHandler(handler);
							
				return;
			};

			var updateRangeClicked = function updateRangeClicked() {
				
				console.log("MultipleSubrangeSelector::updateRangeClicked called...");
				var updateButton = d3.select(convertIdToIdSelector(updateButtonId));
				
				// Translate SVG to accommodate newly displayed menu 
				var rangeEditorOptions = d3.select(convertIdToIdSelector("rangeEditorOptions")); 
				
				if ("none" !== rangeEditorOptions.style("display")) {
					
					if ("<NEW>" == rangeEditorOptions.property("value")) {
	
						var rect = createNewSubrange(0);
						
						updateButton.datum(rect);
						
						rectangles.push(rect);
					}
				}
				
				var updatedData = false;
				var d = updateButton.datum();
				var x = d.x;
				var width = d.width;
				
				var formWidth = Number(d3.select(convertIdToIdSelector("widthValue")).property("value"));
				var formX = Number(d3.select(convertIdToIdSelector("startValue")).property("value"));
				var updatedWidth = timeSeriesScale(formWidth);
				var updatedX = timeSeriesScale(formX);
				
				if (layoutConfiguration.updateMenu.valueFormatter(x, layoutConfiguration.updateMenu.formatPrecision) 
						!= layoutConfiguration.updateMenu.valueFormatter(updatedX, layoutConfiguration.updateMenu.formatPrecision)) {
					
					d.x = updatedX;
					
//					d.atOffset = convertCoordinatesToSeriesOffset(d.x - layoutConfiguration.margins.left);
					d.atOffset = convertCoordinatesToSeriesOffset(d.x);
					d.startOffset = d.atOffset;
					d.endOffset = convertCoordinatesToSeriesOffset(d.x+d.width);

					
					updatedData = true;
				}
				
				if (layoutConfiguration.updateMenu.valueFormatter(width, layoutConfiguration.updateMenu.formatPrecision) 
						!= layoutConfiguration.updateMenu.valueFormatter(updatedWidth, layoutConfiguration.updateMenu.formatPrecision)) {
					
					d.width = updatedWidth;
					d.startOffset = d.atOffset;
					d.endOffset = convertCoordinatesToSeriesOffset(d.x+d.width);

					
					updatedData = true;
				}
				
				if (updatedData) {
					
					d.transform = null;
				}
				
				updateSubrange();
				
				d.onPositionUpdated.fireHandlers(d);
				
				var closeThese = new Array(updateForm, toolTip, eventEditor);
				
				rollOutEditor(null, closeThese);

				d3.select(convertIdToIdSelector("rangeEditorOptions")).style("display", "none");
				d3.select(convertIdToIdSelector("rangeEditorLabel")).style("display", "none");
				
				return;
			};
			
			var deleteRangeClicked = function deleteRangeClicked() {

				console.log("MultipleSubrangeSelector::deleteRangeClicked called...");
								
				var deleteButton = d3.select(convertIdToIdSelector(deleteButtonId));
				// Translate SVG to accommodate newly displayed menu 
				
				var index = rectangles.indexOf(deleteButton.datum());
				
				var deleted = null;
				
				if (-1 < index) {
					
					deleted = rectangles[index];
					
					rectangles.splice(index, 1);
				}
				
				updateSubrange();

				var closeThese = new Array(updateForm, toolTip, eventEditor);
				
				rollOutEditor(null, closeThese);

				d3.select(convertIdToIdSelector("rangeEditorOptions")).style("display", "none");
				d3.select(convertIdToIdSelector("rangeEditorLabel")).style("display", "none");
				
				if (deleted) {
					
					subrangeDeletedEventManagement.fireHandlers(deleted);

				}
				
				return;
			};
			
			var updateEventClicked = function updateEventClicked() {
				
				console.log("MultipleSubrangeSelector::updateEventClicked called...");
				var updateButton = d3.select(convertIdToIdSelector(addEventLabelId));
				// Translate SVG to accommodate newly displayed menu 
				
				var eventEditorOptions = d3.select(convertIdToIdSelector("eventEditorOptions")); 
				
				if ("none" !== eventEditorOptions.style("display")) {
					
					if ("<NEW>" == eventEditorOptions.property("value")) {
	
						var event = createNewEvent(0);
						
						updateButton.datum(event);
						
						events.push(event);
					} else {
					}
				}
				
				var d = updateButton.datum();
				var eventDate = Number(d3.select(convertIdToIdSelector("eventDate")).property("value"));
				var eventLabel = d3.select(convertIdToIdSelector("labelValue")).property("value");
				
				console.log("MultipleSubrangeSelector::updateEventClicked eventDate: "
						+ eventDate + ", eventLabel: " + eventLabel);
		
				if (layoutConfiguration.updateMenu.valueFormatter(d.atOffset, layoutConfiguration.updateMenu.formatPrecision) 
						!= layoutConfiguration.updateMenu.valueFormatter(eventDate, layoutConfiguration.updateMenu.formatPrecision)) {
					
					d.atOffset = eventDate;
				}
				
				if (eventLabel != d.eventLabel) {
					
					d.eventLabel = eventLabel;
				}
				
				updateEvents();
				
				var closeThese = new Array(updateForm, toolTip, eventEditor);
				
				rollOutEditor(null, closeThese);

				d3.select(convertIdToIdSelector("eventEditorOptions")).style("display", "none");
				d3.select(convertIdToIdSelector("eventEditorLabel")).style("display", "none");

				return;
			};
			
			var deleteEventClicked = function deleteEventClicked() {

				console.log("MultipleSubrangeSelector::deleteEventClicked called...");
								
				var deleteButton = d3.select(convertIdToIdSelector(deleteEventLabelId));
				// Translate SVG to accommodate newly displayed menu 
				
				var datum = deleteButton.datum();
				var index = events.indexOf(datum);
				
				var deleted = null;
				
				if (-1 < index) {
					
					deleted = events[index];
					
					events.splice(index, 1);
				}
				
				updateEvents();

				var closeThese = new Array(updateForm, toolTip, eventEditor);
				
				rollOutEditor(null, closeThese);

				d3.select(convertIdToIdSelector("eventEditorOptions")).style("display", "none");
				d3.select(convertIdToIdSelector("eventEditorLabel")).style("display", "none");
				
				if (deleted) {
					
					eventDeletedEventManagement.fireHandlers(deleted);
				}
				
				return;

			};

			var rollOutEditor = function(open, close) {
				
				close.forEach(function (element) {
						
						element.transition()
									.duration(layoutConfiguration.updateMenu.outDuration)
										.style("display", "none")
										.style("opacity", 0);
						
						return;
					});
				
				if (open) {
					
					open.transition()
						.duration(layoutConfiguration.updateMenu.inDuration)
							.style("display", "block")
							.style("opacity", 1);
	
				} else {
				}
				
				return;
			};
			
			var rollOutEventEditor = function() {
				
				console.log("MultipleSubrangeSelector::rollOutEventEditor called...");
				if (d3.event && d3.mouse(this)) {
						
					console.log("MultipleSubrangeSelector::rollOutEventEditor Mouse is over: " 
									+ this.id + " at [" + d3.mouse(this)[0] + ", " + d3.mouse(this)[1] + "]");

					var eeo = d3.select(convertIdToIdSelector("eventEditorOptions"));
	
					if ("none" === eventEditor.style("display")) {
						
						eeo.style("display", "block")
								.selectAll("option").remove();
						
						var eventOptions = new Array("<NEW>");

						events.forEach(function (element) {
							
							eventOptions.push(element.id);
						});
						
						eeo.selectAll("option").data(eventOptions)
									.enter()
										.append("option")
											.property("value", function(d) {
													return d;
												})
											.text(function(d) {
													return d;
												});
						
						var closeThese = new Array(updateForm, toolTip);
						
						rollOutEditor(eventEditor, closeThese);

					} else {
						
						eeo.style("display", "none");
						
						d3.select(convertIdToIdSelector("eventEditorLabel")).style("display", "none");
						var throwOut = d3.select(convertIdToIdSelector("eventEditorLabel")).selectAll("text");
						
						throwOut.remove();
						
						var closeThese = new Array(eventEditor);
						
						rollOutEditor(null, closeThese);

					}
				} else {
					console.log("MultipleSubrangeSelector::rollOutEventEditor called by click but either no d3.event or d3.mouse(this) value....");
				}
				
				return;				
			};
			
			var rollOutRangeEditor = function() {
				
				console.log("MultipleSubrangeSelector::rollOutRangeEditor called...");
				if (d3.event && d3.mouse(this)) {
					console.log("MultipleSubrangeSelector::rollOutRangeEditor Mouse is over: " 
									+ this.id + " at [" + d3.mouse(this)[0] + ", " + d3.mouse(this)[1] + "]");
	
					var reo = d3.select(convertIdToIdSelector("rangeEditorOptions"));
					
					if ("none" === updateForm.style("display")) {

						reo.style("display", "block")
							.selectAll("option").remove();
						
						var rangeOptions = new Array("<NEW>");
						
						rectangles.forEach(function (element) {
							
								rangeOptions.push(element.id);
							});
						
						reo.selectAll("option").data(rangeOptions)
									.enter()
										.append("option")
											.property("value", function(d) {
													return d;
												})
											.text(function(d) {
													return d;
												});
						
						var closeThese = new Array(eventEditor, toolTip);
						
						rollOutEditor(updateForm, closeThese);

					} else {
						
						reo.style("display", "none");
						d3.select(convertIdToIdSelector("rangeEditorLabel")).style("display", "none");
						var throwOut = d3.select(convertIdToIdSelector("rangeEditorLabel")).selectAll("text");
						
						throwOut.remove();
						
						var closeThese = new Array(updateForm);
						
						rollOutEditor(null, closeThese);

					}
					
				} else {
					console.log("MultipleSubrangeSelector::rollOutRangeEditor called by click but either no d3.event or d3.mouse(this) value....");					
				}
				
				return;
			};
			
			var activateEventEditor = function (d) {
				
				var closeThese = new Array(updateForm, toolTip);
				
				rollOutEditor(eventEditor, closeThese);

				d3.select(convertIdToIdSelector("eventEditorLabel")).style("display", "inline").text(d.id);
				d3.select(convertIdToIdSelector("eventDate")).property("value", d.atOffset);
				d3.select(convertIdToIdSelector("labelValue")).property("value", d.eventLabel);

				d3.select(convertIdToIdSelector(addEventLabelId)).datum(d);
				d3.select(convertIdToIdSelector(deleteEventLabelId)).datum(d);
				
				return;
			};
			
			var supportManualInput = function(d) {
				
				var closeThese = new Array(eventEditor, toolTip);
				
				rollOutEditor(updateForm, closeThese);
				
				d3.select(convertIdToIdSelector("rangeEditorOptions")).style("display", "none");
				
				d3.select(convertIdToIdSelector("rangeEditorLabel")).style("display", "inline").text(d.id);
				d3.select(convertIdToIdSelector("startValue")).property("value", layoutConfiguration.updateMenu.valueFormatter(d.atOffset, 2));
				d3.select(convertIdToIdSelector("widthValue")).property("value", layoutConfiguration.updateMenu.valueFormatter(convertCoordinatesToSeriesOffset(d.width), 2));

				d3.select(convertIdToIdSelector("updateButton")).datum(d);
				d3.select(convertIdToIdSelector("deleteButton")).datum(d);				
			
				return;
			};
			
			var dragMove = function dragMove(d) {
				
				var range = d3.select(convertIdToIdSelector("rangeSelections_" + d.id));
				var resizing = (range.attr("resizing") == "true");
				
				if (resizing) {
					
					d.resizeRange(d, range, d3.event);
				} else {
					
					moveRange(d, range, d3.event);
				}
				
				fixToolTipMessage(d);
				
				return;
			};
			
			var moveBehavior = d3.behavior.drag()
									.origin(function(d) {
											var t = d3.select(this);
											var point = {
													x: (t.attr("x") + d3.transform(t.attr("transform")).translate[0]),
													y: (t.attr("y") + d3.transform(t.attr("transform")).translate[1])
											};
											
											d.originalWidth = d.width;
											d.originPoint = point;
											
											return point;
										})
									.on("drag", dragMove)
									.on("dragstart", function(d) {
											
											d3.event.sourceEvent.stopPropagation();

											toolTip.transition()
													.style("display", "block")
													.duration(layoutConfiguration.toolTip.inDuration)
														.style("opacity", layoutConfiguration.toolTip.inOpacity);
											
											var range = d3.select(convertIdToIdSelector("rangeSelections_" + d.id));
											moveRange(d, range, d.originPoint);
											
											d.atOffset = convertCoordinatesToSeriesOffset(d.x);
//											d.atOffset = convertCoordinatesToSeriesOffset(d.x - layoutConfiguration.margins.left);
											fixToolTipMessage(d);
											
											return;
										})
									.on("dragend", function (d) {
										
										var t = d3.select(this);
										
										t.attr("resizing", false);
				
										d3.selectAll(convertIdToIdSelector("wr_"+d.id))
													.attr("fill", layoutConfiguration.rangeBrush.rangeColor)
													.attr("fill-opacity", layoutConfiguration.rangeBrush.rangeOpacity);
										
										d3.selectAll(convertIdToIdSelector("er_"+d.id))
													.attr("fill", layoutConfiguration.rangeBrush.rangeColor)
													.attr("fill-opacity", layoutConfiguration.rangeBrush.rangeOpacity);
										
										toolTip.transition()
													.duration(layoutConfiguration.toolTip.outDuration)
														.style("display", "none")
														.style("opacity", layoutConfiguration.toolTip.outOpacity);
										
										return;
									});

			var updateEvents = function () {
				
				var throwOut = d3.selectAll("g.events");
				
				throwOut.remove();
				
				var reload = d3.select(convertIdToIdSelector("multiplesubrangeselector_ui")).selectAll("g.events");
				
				reload = reload.data(events)
							.enter()
								.append("g")
									.style("pointer-events", "all")
									.attr("class", "events")
									.attr("transform", function (d){
											
											var transform = "translate("
																+ (layoutConfiguration.margins.left 
																		+ convertSeriesOffsetToCoordinate(d.atOffset))
																+ ", 0)";
																
											return transform;
										})
									.attr("id", function (d) {
												
												return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "eventMarkers_" + d.id);
											});
				
				events.forEach(function(element, index, array) {
					
					var localArray = new Array();
					localArray.push(element);
					
					d3.select(convertIdToIdSelector("eventMarkers_" + element.id))
						.selectAll("line").data(localArray)
							.enter()
								.append("line")
								.attr("x1", 0)
								.attr("x2", 0)
								.attr("y1", function(d) {
										
										return 0; 
									})
								.attr("y2", function(d) {
									
										return 	elementHeight 
													+ layoutConfiguration.eventLabels.height 
													- layoutConfiguration.margins.top
													+ 5;
									})
								.attr("stroke-width", function (d) {
									
										return layoutConfiguration.eventLabels.strokeWidth;
									})
								.attr("stroke", function (d) {
									
										return layoutConfiguration.eventLabels.strokeColor;
									});
					
					d3.select(convertIdToIdSelector("eventMarkers_" + element.id))
					.selectAll("rect").data(localArray)
						.enter()
							.append("rect")
								.attr("stroke", function (d) {
									
										return layoutConfiguration.eventLabels.strokeColor;
									})
								.attr("stroke-width", function (d) {
										
										return layoutConfiguration.eventLabels.strokeWidht;
									})
								.attr("transform", function (d) {

									/**********************************************************************
									 * TODO: Look at this algorithm figure a better way....
									 *********************************************************************/
										var translate = "translate(0, " 
															+ (elementHeight 
																	+ layoutConfiguration.eventLabels.height 
																	- layoutConfiguration.margins.top
																	+ 5)
															+ ")";
										
										var rotate = "rotate(45)";
										
										return translate + " " + rotate;										
									})
								.attr("fill", "none")
								.attr("width", function (d) {
									
										var results = (layoutConfiguration.eventLabels.height/3) + "px";
										
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);									
										return results;
									})
								.attr("height", function (d) {
									
										var results = (layoutConfiguration.eventLabels.height/3) + "px";
										
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.on("mouseover", function (d) {
										
										var tag = d3.select(this).node().getBoundingClientRect();
							
										/*************************************************
										 * TODO: Rethink the HTML method.
										 ************************************************/
										d3.select(convertIdToIdSelector("eventLabel"))
											.style("display", function (d) {
													var results = "block";
													
													return results;
												})
											.style("left", function (d) {
	
													
													var left = (tag.left 
																+ layoutConfiguration.eventLabels.xOffset);
													
													console.log("Event Label Tool Tip: left = " + left);
													return (left + "px");
												})
											.style("top", function (d) {
										
												
													var top = (tag.top 
																+ layoutConfiguration.eventLabels.yOffset);
													
													console.log("Event Label Tool Tip: top = " + top);											
													return (top + "px");
											}).html("<strong>At: </strong>" 
														+ d.atOffset 
														+ "<br><strong>" 
														+ d.eventLabel 
														+ "</strong>");
										
										return;
				
									})
								.on("mouseout", function (d) {
										
										d3.select(convertIdToIdSelector("eventLabel"))
											.style("display", "none");
										
										return;
									})
								.on("dblclick", function(d) {
									
									if (!d3.event.defaultPrevented) {
										
										activateEventEditor(d);
									} 

									return;
								});

				});

				return;
										
			};
			
			var updateSubrange = function() {
			
				// Remove/replace the throwOut - reload calls with the example detailed at
				var throwOut = d3.selectAll("g.ranges");
				
				throwOut.remove();
				
				var reload = d3.select(convertIdToIdSelector("multiplesubrangeselector_ui")).selectAll("g.ranges");
				
				reload = reload.data(rectangles)
						.enter()
							.append("g")
								.style("pointer-events", "all")
								.attr("class", "ranges")
								.attr("id", function(d) {
									
										return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
																	"rangeSelections_" + d.id);
									})
								.attr("transform", function (d) {
									
										var transform = "translate(" 
															+ (layoutConfiguration.margins.left + d.x) 
															+ ", 0)";
										
										if (d.transform) {
											transform = d.transform;	
										}
										
										return transform;
									})
								.call(moveBehavior);
				
				rectangles.forEach(function(element, index, array) {
					
					var localArray = new Array();
					localArray.push(element);
					
					d3.selectAll(convertIdToIdSelector("rangeSelections_" + element.id))
							.selectAll("g.wr")
									.data(localArray)
								.enter()
									.append("g")
										.attr("class", "wr")
										.attr("transform", "translate(0,0)")
							.selectAll("rect.wr")
									.data(localArray)
								.enter()
									.append("rect")
										.attr("class", "wr")
										.attr("id", function(d) { 
												return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "wr_" + d.id); 
											})
										.attr("x", function (d) { 
												return 0; 
											})
										.attr("y", function (d) { 
												return layoutConfiguration.margins.top; 
											})
										.attr("width", function (d) { 
												var results = layoutConfiguration.rangeBrush.resizeHandleWidth + "px";
//												console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);												
												return results; 
											})
										.attr("height", function (d) { 
												var results = d.height + "px";
//												console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
												return results;
											})
										.attr("fill", layoutConfiguration.rangeBrush.rangeColor)
										.attr("fill-opacity", layoutConfiguration.rangeBrush.rangeOpacity)	            											
										.style("cursor", "ew-resize")
										.on("mousedown", function(d) {
												var t = d3.select(convertIdToIdSelector("rangeSelections_" + element.id));
												
												t.attr("resizing", true);
												
												d3.select(this).attr("fill", 
																		layoutConfiguration.rangeBrush.activeResizeHandlerColor)
																.attr("fill-opacity", 
																		layoutConfiguration.rangeBrush.activeResizeOpacity);
												
												d.resize = function(originX, delta) {
																												
													return originX - delta;
												}; 
												
												d.resizeRange = function resizeRange(d, range, event) {
													
													var resizedWidth = d.resize(d.originalWidth, (event.x - d.originPoint.x));
													
													d.width = (( layoutConfiguration.rangeBrush.minimumRangeWidth < resizedWidth ) 
																		? resizedWidth 
																			: layoutConfiguration.rangeBrush.minimumRangeWidth);
													
													d3.select(convertIdToIdSelector("block_" + d.id))
																	.attr("width", function (a) {
																		var results = d.width + "px";
//																		console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
																		return results;
																	});
													
													var eastResizeContainer = d3.select(convertIdToIdSelector(
																				"er_" + d.id)).node().parentNode;
													d3.select(eastResizeContainer).attr("transform", "translate(" 
																				+ (d.width 
																					+ layoutConfiguration.rangeBrush.resizeHandleWidth) 
																				+ ", 0)"); 
			
													moveRange(d, range, event);
													
													return;
												};
												
												return;
												
											})
										.on("mouseup", function(d){
											
											d3.select(this).attr("fill", 
													layoutConfiguration.rangeBrush.rangeColor)
											.attr("fill-opacity", 
													layoutConfiguration.rangeBrush.rangeOpacity);
							
												return;
											});
				
			
					d3.selectAll(convertIdToIdSelector("rangeSelections_" + element.id))
						          				.selectAll("g.block")
						          						.data(localArray)
						          					.enter()
						          						.append("g")
						          							.attr("class", "block")
						          							.attr("transform", "translate(3,0)")
												.selectAll("rect.block")
														.data(localArray)
													.enter()
														.append("rect")
			    											.attr("class", "block")
			    											.attr("id", function(d) { 
			    													return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "block_" + d.id); 
			    												})
			    											.attr("x", function (d) { 
			    													return 0; 
			    												})
			    											.attr("y", function (d) { 
			    													return layoutConfiguration.margins.top; 
			    												})
			    											.attr("width", function (d) { 
			    													var results = d.width + "px";
//			    													console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
			    													return results;
			    												})
			    											.attr("height", function (d) { 
			    													var results = d.height + "px";
//			    													console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
			    													return results; 
			    												})
			    											.attr("fill", layoutConfiguration.rangeBrush.rangeColor)
			    											.attr("fill-opacity", layoutConfiguration.rangeBrush.rangeOpacity)
			    											.style("cursor", "move")
			    											.on("dblclick", function(d) {
			        												console.log("Rect#block>dblclick("+ this.id + ") called....");
			        												
			        												if (!d3.event.defaultPrevented) {
			        													
			        													supportManualInput(d);
			        												} 
			        			
			        												return;
			        											})
			    											.on("mousedown", function(d) {
			
			        												var t = d3.select(convertIdToIdSelector("rangeSelections_" + element.id));								
			
			        												t.attr("resizing", false);
			        												
			        												d.resize = function(originX, delta) {
			        													
			        													return originX;
			        												};
			        												
			        												return;
			        												
			        											});
			    	            	
					d3.selectAll(convertIdToIdSelector("rangeSelections_" + element.id))
					            				.selectAll("g.er")
					            						.data(localArray)
					            					.enter()
					            						.append("g")
					            							.attr("class", "er")
					            							.attr("transform", function(d) {
					            									return "translate(" 
					            											+ (layoutConfiguration.rangeBrush.resizeHandleWidth + d.width) 
					            											+ ", 0)";
					            								})
												.selectAll("rect.er")
														.data(localArray)
													.enter()
														.append("rect")
															.attr("class", "er")
															.attr("id", function(d) { 
																	return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "er_" + d.id); 
																})
															.attr("x", function (d) { 
																	return 0; 
																})
															.attr("y", function (d) { 
																	return layoutConfiguration.margins.top; 
																})
															.attr("width", function (d) { 
																	var results = layoutConfiguration.rangeBrush.resizeHandleWidth + "px";
//																	console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
																	return results; 
																})
															.attr("height", function (d) { 
																	var results = d.height + "px";
//																	console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
																	return results; 
																})
															.attr("fill", layoutConfiguration.rangeBrush.rangeColor)
															.attr("fill-opacity", layoutConfiguration.rangeBrush.rangeOpacity)
			    											.style("cursor", "ew-resize")
															.on("mousedown", function(d) {
																
																	var t = d3.select(convertIdToIdSelector("rangeSelections_" + element.id));
			
			        												t.attr("resizing", true);
			        												
			        												d3.select(this).attr("fill", 
			        																		layoutConfiguration.rangeBrush.activeResizeHandlerColor)
			        																.attr("fill-opacity", 
			        																		layoutConfiguration.rangeBrush.activeResizeOpacity);
			        												
			        												d.resize = function(originX, delta) {
			
			        													return originX + delta;
			        												}; 
			        												
			        												d.resizeRange = function resizeRange(d, range, event) {
			        													
			        													var resizedWidth = d.resize(d.originalWidth, 
			        																					(event.x - d.originPoint.x));
			        													
			        													d.width = (( layoutConfiguration.rangeBrush.minimumRangeWidth < resizedWidth ) 
			        																	? resizedWidth : layoutConfiguration.rangeBrush.minimumRangeWidth);
			        													
			        													d3.select(convertIdToIdSelector("block_" + d.id)).attr("width", function(a) {
					        													
					        														var results = d.width + "px";
//					        														console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
					        														return results;
					        													});
			        													var eastResizeContainer = d3.select(convertIdToIdSelector("er_" + d.id)).node().parentNode;
			        													d3.select(eastResizeContainer).attr("transform", "translate(" 
			        																		+ (d.width 
			        																				+ layoutConfiguration.rangeBrush.resizeHandleWidth) 
			        																		+ ", 0)"); 
			
			        													return;
			        												};
			        												
			        												return;
																})
														.on("mouseup", function(d){
																
																d3.select(this).attr("fill", 
																		layoutConfiguration.rangeBrush.rangeColor)
																.attr("fill-opacity", 
																		layoutConfiguration.rangeBrush.rangeOpacity);
												
																	return;
																});
;
					
					return;
				});
				
							
				return;
				
			};
			
			/**************************************************************************************
			 * NON-Public variables and Methods.
			**************************************************************************************/
			
			function addInternalFormTable(containerId, tableHeaders, tableBody) {
				
				console.log("MultipleSubrangeSelector::addInternalTable called...");
			
				var table = d3.select(containerId).append("table");
		
				if (tableHeaders) {
					
					table.selectAll("thead")
							.data(tableHeaders)
						.enter()							
							.append("thead").selectAll("tr")
								.data(function(d) { return [d]; })
							.enter()
								.append("tr").selectAll("th")
									.data(function(d) { return [d]; })
								.enter()
									.append("th")
										.attr("colspan", function(d) { return d.colspan; })
										.attr("id", function(d) { return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id); })
										.style("text-align", function (d) { return d.textAlign; });
						
				}
				
				if (tableBody) {
						
					var tBody = table.append("tbody");
					
					tBody.selectAll("tr")
						.data(tableBody)
					.enter().append("tr")
							.call(function (selection){
											
								var data = this.datum();
								
								var headerColumns = function (data) {
									
										var results = new Array();
										
										data.forEach( function (val) {
											
												if (val.cellType === "th") {
													
													results.push(val);
												}
											}); 
										
										return results;
									};
								
								var dataColumns = function (data) {
									
										var results = new Array();
										
										data.forEach(function (val) {
											
												if (val.cellType === "td") {
													
													results.push(val);
												}
											});
										
										return results;
									};
									
								selection.selectAll("th")
											.data(headerColumns) 
										.enter().append("th")
												.style("text-align", function (d) { return d.textAlign; })
											.text(function (d) { return d.text; });
								
								selection.selectAll("td")
												.data(dataColumns)
										.enter().append("td").selectAll("input")
													.data(function (d) { 
															var results = new Array();
															
															results.push(d);
															
															return results;
													})
											.enter().append("input")
													.attr("id", function (d) { return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id); })
													.attr("type", function (d) { return d.type; })
													.attr("value", function (d) { 
														var results = d.text;
														
														if (!results) {
															results = "";
														}
														
														return results;
													})
													.style("width", function (d) { 
														
															var results = d.width; 
//															console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
															return results;
														});
								
									return;
								});
					
				}

				return;
			}
			
			function addInternalTable(containerId, tableHeaders, tableBody) {
					
					console.log("MultipleSubrangeSelector::addInternalTable called...");
				
					var table = d3.select(containerId)
									.append("table");
//									.on("mousemove", mouseMovement);
			
					if (tableHeaders) {
						
						table.selectAll("thead")
								.data(tableHeaders)
							.enter()
								.append("thead").selectAll("tr")
									.data(function(d) { return [d]; })
								.enter()
									.append("tr").selectAll("th")
										.data(function(d) { return [d]; })
									.enter()
										.append("th")
											.attr("colspan", function(d) { return d.colspan; })
											.attr("id", function(d) { return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id); })
											.style("text-align", function (d) { return d.textAlign; });
							
					}
					
					if (tableBody) {
							
						var tBody = table.append("tbody");
						
						tBody.selectAll("tr")
							.data(tableBody)
						.enter().append("tr")
								.call(function (selection){
												
									var data = this.datum();
									
									var headerColumns = function (data) {
										
											var results = new Array();
											
											data.forEach( function (val) {
												
													if (val.cellType === "th") {
														
														results.push(val);
													}
												}); 
											
											return results;
										};
									
									var dataColumns = function (data) {
										
											var results = new Array();
											
											data.forEach(function (val) {
												
													if (val.cellType === "td") {
														
														results.push(val);
													}
												});
											
											return results;
										};
										
									selection.selectAll("th")
												.data(headerColumns) 
											.enter().append("th")
													.style("text-align", function (d) { return d.textAlign; })
												.text(function (d) { return d.text; });
									
									selection.selectAll("td")
													.data(dataColumns)
											.enter().append("td").selectAll("span")
														.data(function (d) { 
																var results = new Array();
																
																results.push(d);
																
																return results;
														})
												.enter().append("span")
														.attr("id", function (d) { return GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id); })
														.text(function (d) { 
																var results = d.text;
																
																if (!results) {
																	results = "";
																}
																
																return results;
															})
														.style("width", function (d) {
																var results = d.width;
//																console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
																return results; 
															});
									
										return;
									});
						
					}
			
					return;
				}
			
			function buildDetailsForms(containerId) {
	
				console.log("MultipleSubrangeSelector::buildDetailsForms called...");
				
				var width = layoutConfiguration.margins.left/2;
				var height = elementHeight/2;
				var host = d3.select(containerId);
				
				var menuRollout = host.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
						 									"menurollout"))
										.style("width", function(d) {
											
												var results = width + "px";
//												console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
												return results;											
											})
										.style("height", function(a) {
											
												var results = elementHeight + "px";
//												console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
												return results;
											})
										.style("position", "absolute");
				
				menuRollout.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
														"eventMenuTrigger"))
								.style("background-color", layoutConfiguration.eventMenu.backgroundColor)
								.style("border", "1px solid black")
								.style("position", "absolute")
								.style("top", "0px")
								.style("left", function(a) {
										var results = ((layoutConfiguration.margins.left * 1.25)
													+ layoutConfiguration.eventMenu.width) + "px";
										return results; 
									})
								.style("width", function (a) {
										
										var results = width + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.style("height", function (a) {
										var results = height + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.on("click", rollOutEventEditor);
				
				menuRollout.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
														"rangeMenuTrigger"))
								.style("background-color", layoutConfiguration.updateMenu.backgroundColor)
								.style("border", "1px solid black")
								.style("position", "absolute")
								.style("top", function (a) { 
											var results = height + "px";
											return results;
										})
								.style("left", function (a) {
									
										var results = ((layoutConfiguration.margins.left * 1.25) 
														+ layoutConfiguration.eventMenu.width) + "px";
										return results;
									})
								.style("width", function(a) {
									
										var results = width + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.style("height", function (a) {
									
										var results = height + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.on("click", rollOutRangeEditor);

				host.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
													"updateForm"))
								.attr("class", "updater")
								.style("border", "1px black solid")
								.style("background-color", layoutConfiguration.updateMenu.backgroundColor)
								.style("position", "absolute")
								.style("top", "0px")
								.style("width", function (a) {
										var results = layoutConfiguration.updateMenu.width + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.style("left", function(a) {
										var results = layoutConfiguration.margins.left + "px";
										return results;
									});
				
				host.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
														"eventForm"))
								.attr("class", "eventeditor")
								.style("border", "1px black solid")
								.style("position", "absolute")
								.style("background-color", layoutConfiguration.eventMenu.backgroundColor)
								.style("top", "0px")
								.style("width", function(a) {
										var results = layoutConfiguration.eventMenu.width + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									})
								.style("left", function (a) {
										var results = layoutConfiguration.margins.left + "px";
										return results;
									});
	
				host.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
													"toolTip"))
							.attr("class", "tooltip")
							.style("border", "1px black solid")
							.style("background-color", "beige")
							.style("opacity", "0.75")
							.style("position", "absolute")
							.style("top", "0px")
							.style("left", function (a) { 
								var results = elementWidth + "px";
								return results;
							});
				
				host.append("div").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
														"eventLabel"))
							.attr("class", "tooltip")
							.style("border", "1px black solid")
							.style("position", "absolute")
							.style("left", layoutConfiguration.eventMenu.width + "px")
							.style("background-color", layoutConfiguration.eventMenu.dataDisplayColor)
							.style("display", function(a) {
									var results = "none";
//									console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
									return results;
								}); 
				
				host.append("span").attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
													"lengthScratchPad"))
									.style("display", function(a) {
											var results = "none";
//											console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
											return results;
										});
								
				var tableHeader = new Array({ 
					colspan: 2, 
					id: "rangeEditor", 
					textAlign: "center"
				});
	
				var tableBody = new Array ( new Array({ 
												textAlign: "right", 
												cellType: "th", 
												text: "Start: "},
											{ 
												cellType: "td", 
												id: "startValue", 
												type: "text", 
												width: "100px"}),
									new Array({
												textAlign: "right", 
												cellType: "th", 
												text: "Width: "},
											{
												cellType: "td", 
												id: "widthValue", 
												type: "text", 
												width: "100px"}),
									new Array({
												cellType: "td", 
												id: updateButtonId, 
												type: "button", 
												width: "100px", 
												text: "Update"},
											{
												cellType: "td", 
												id: deleteButtonId, 
												type: "button", 
												width: "100px", 
												text: "Delete"})													
									);
				
				addInternalFormTable(convertIdToIdSelector("updateForm"), tableHeader, tableBody);
				
				d3.select(convertIdToIdSelector("rangeEditor")).append("select")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "rangeEditorOptions"))
							.style("display", function(a) {
									var results = "none";
//									console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
									return results;
								})
							.on("change", function (d) {
								
								console.log("MutlipleSubrangeSelector::RangeEditor onChange called...");
								
								var selected = d3.select(convertIdToIdSelector("rangeEditorOptions")).node().value;
								
								var index = GoUtilities.FindIndexByKeyValue(rectangles, "id", selected, idComparer);
								
								if (-1 != index) {
								
									var datum = rectangles[index];
									d3.select(convertIdToIdSelector(updateButtonId)).datum(datum);
									d3.select(convertIdToIdSelector(deleteButtonId)).datum(datum);	
									
									d3.select(convertIdToIdSelector("startValue")).property("value", 
												layoutConfiguration.updateMenu.valueFormatter(datum.atOffset, 2));
									d3.select(convertIdToIdSelector("widthValue")).property("value", 
												layoutConfiguration.updateMenu.valueFormatter(convertCoordinatesToSeriesOffset(datum.width), 2));
								}

								return;
							});
				
				d3.select(convertIdToIdSelector("rangeEditor")).append("span")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "rangeEditorLabel"))
							.style("display", function(a) {
									var results = "none";
//									console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
									return results;
								});
				
				d3.select(convertIdToIdSelector(updateButtonId)).on("click", updateRangeClicked);
				d3.select(convertIdToIdSelector(deleteButtonId)).on("click", deleteRangeClicked);	
				
				
				var tableHeader = new Array({ 
					colspan: 2, 
					id: "eventEditor", 
					textAlign: "center"
				});
	
				var tableBody = new Array ( new Array({ 
												textAlign: "right", 
												cellType: "th", 
												text: "Date: "},
											{ 
												cellType: "td", 
												id: "eventDate", 
												type: "text", 
												width: "100px"}),
									new Array({
												textAlign: "right", 
												cellType: "th", 
												text: "Label: "},
											{
												cellType: "td", 
												id: "labelValue", 
												type: "text", 
												width: "100px"}),
									new Array({
												cellType: "td", 
												id: addEventLabelId, 
												type: "button", 
												width: "100px", 
												text: "Add Label"},
											{
												cellType: "td", 
												id: deleteEventLabelId, 
												type: "button", 
												width: "100px", 
												text: "Delete Label"})													
									);

				addInternalFormTable(convertIdToIdSelector("eventForm"), tableHeader, tableBody);
				
				d3.select(convertIdToIdSelector("eventEditor")).append("select")
						.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "eventEditorOptions"))
						.style("display",  function(a) {
							var results = "none";
//							console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
							return results;
						})
						.on("change", function(d) {
							
							console.log("MultipleSubrangeSelector::eventEditor onChange called...");
							
							var selected = d3.select(convertIdToIdSelector("eventEditorOptions")).node().value;
							
							var index = GoUtilities.FindIndexByKeyValue(events, "id", selected, idComparer);
							
							if (-1 != index) {
							
								var datum = events[index];
								d3.select(convertIdToIdSelector(addEventLabelId)).datum(datum);
								d3.select(convertIdToIdSelector(deleteEventLabelId)).datum(datum);
								
								d3.select(convertIdToIdSelector("eventDate")).property("value", datum.atOffset);
								d3.select(convertIdToIdSelector("labelValue")).property("value", datum.eventLabel);

							}

							return;
						});

				
				d3.select(convertIdToIdSelector("eventEditor")).append("span")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "eventEditorLabel"))
							.style("display", function(a) {
									var results = "none";
//									console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
									return results;
								});
				
				d3.select(convertIdToIdSelector(addEventLabelId)).on("click", updateEventClicked);
				d3.select(convertIdToIdSelector(deleteEventLabelId)).on("click", deleteEventClicked);	
				
				var tableHeader = new Array({ 
					colspan: 2, 
					id: "rangeToolTip", 
					textAlign: "center"
				});
	
				var tableBody = new Array ( new Array({ 
												textAlign: "right", 
												cellType: "th", 
												text: "Start: "},
											{ 
												cellType: "td", 
												id: "startTipValue", 
												type: "text", 
												width: "100px"}),
									new Array({
												textAlign: "right", 
												cellType: "th", 
												text: "End: "},
											{
												cellType: "td", 
												id: "endTipValue", 
												type: "text", 
												width: "100px"})													
									);
				
				addInternalTable(convertIdToIdSelector("toolTip"), tableHeader, tableBody);
			
				// Make sure both are hidden.
				d3.select(convertIdToIdSelector("updateForm")).style("display", function(a) {
						var results = "none";
//						console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
						return results;
					});
				d3.select(convertIdToIdSelector("toolTip")).style("display", function(a) {
						var results = "none";
//						console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
						return results;
					});
				d3.select(convertIdToIdSelector("eventForm")).style("display", function(a) {
						var results = "none";
//						console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
						return results;
					});
	
				// Initialize non-public scoped variables.
				toolTip = d3.select("div.tooltip");
				updateForm = d3.select("div.updater");
				eventEditor = d3.select("div.eventeditor");
				
				return;
			}
			
			function buildVisualizationElements(containerId, timeSeriesDomain) {
				
				console.log("MultipleSubrangeSelector::buildVisualizationElements called...");
				
				// Range is function of the controls width
				// Domain is function of the data set being displayed.
				var timeSeriesRange = new Array(0, layoutConfiguration.width);
				timeSeriesScale = d3.scale.linear().range(timeSeriesRange)
												.domain(d3.extent(timeSeriesDomain, 
															layoutConfiguration.domainAccessor)); 
				
				timeSeriesAxis = d3.svg.axis()
										.scale(timeSeriesScale)
										.orient("bottom");
				
										
				svg = d3.select(containerId).append("div")
								.style("position", "absolute")
								.style("top", function (a) {
										var results = layoutConfiguration.margins.top + "px";
										return results;
									})
								.style("left", function(a) {
										var results = ((layoutConfiguration.margins.left * 1.25) 
													+ layoutConfiguration.eventMenu.width) + "px";
										return results; 
									})
							.append("svg")
								.attr("width", function (a) { 
										var results = elementWidth + "px"; 
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results; 
									})
								.attr("height", function (a) { 
										var results = (elementHeight 
														+ layoutConfiguration.margins.bottom 
														+ layoutConfiguration.eventLabels.height) + "px"; 
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results; 
									});

				svg.append("defs").append("clipPath")
								.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "clip"))
								.append("rect")
									.attr("x", function (a) {
											var results = layoutConfiguration.margins.left + "px";
											return results;
										})
									.attr("y", function (a) {
										var results = "0px";
										return results;
										})
									.attr("width", function (a) { 
											var results = elementWidth + "px"; 
//											console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
											return results; 
										})
									.attr("height", function (a) { 
											var results = elementHeight + "px";
//											console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
											return results;
										});
					
				svg = svg.append("g")
								.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
													"multiplesubrangeselector_ui"))
								.attr("transform", function (a) { 
									
									var results = "translate(" + layoutConfiguration.margins.left 
															+ ", 0)";
									return results;
								});
				
				var yScale = d3.scale.linear()
								.range(new Array(0, elementHeight))
								.domain(d3.extent(timeSeriesDomain, layoutConfiguration.rangeAccessor));
				var line0 = d3.svg.line()
								.interpolate("linear")
									.x(function (d) {
										
											var results = timeSeriesScale(d.x); 
											return results; 
										})
									.y(function (d) {
										
											var results = yScale(d.us); 
//											console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning (y): " + results + " for: " + d.us);
											return results;
										});
				
		
				svg.append("path")
						.datum(timeSeriesDomain)
						.attr("clip-path", "url(" 
											+ GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "clip")
											+ ")")
						.attr("class", "line line 0")
						.attr("d", line0);
				
				svg.append("rect")
						.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
										"multiplesubrangeselector_target"))
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", function (a) { 
								var results = layoutConfiguration.width + "px";
//								console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
								return results;
							})
						.attr("height", function (a) { 
								var results = elementHeight + "px";
//								console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
								return results;
							})
						.attr("transform", function (a) { 
//							var results = "translate(" 
//								+ layoutConfiguration.margins.left 
//								+ ", 0)";
								var results = "translate(0, 0)";
								return results;
							})
						.attr("fill", "none")
						.style("pointer-events", "all")
						.style("cursor", "crosshair")
						.on("mousedown", function (d, i) {
							
							var xCoor = d3.mouse(this)[0] - layoutConfiguration.margins.left;
//							var xCoor = d3.mouse(this)[0];
							var rect = createNewSubrange(xCoor);
							
							rectangles.push(rect);
							
							updateSubrange();
							
							subrangeCreationEventManagement.fireHandlers(rect.id, rect);
							
							return;
						});
										
				svg.append("g")
						.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
											"multiplesubrangeselector_xAxis"))
						.attr("class", "x axis")
						.attr("transform", function (a) { 
							var results = "translate(0, " + elementHeight + ")";
//							var results = "translate(" 
//								+ layoutConfiguration.margins.left 
//								+ ", " + elementHeight + ")";
								return results;
							})
						.call(timeSeriesAxis)
						.selectAll("text")
							.style("text-anchor", layoutConfiguration.axisLabels.anchor)
							.attr("dx", layoutConfiguration.axisLabels.dx)
							.attr("dy", layoutConfiguration.axisLabels.dy)
							.attr("transform", function (a) { 
									var results = "rotate(" + layoutConfiguration.axisLabels.angle + ")";
									return results; 
								});

				svg.append("g")
				.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
											"eventTarget"))
				.attr("transform", function (a) { 
					var results = "translate(0, " + elementHeight + ")";
//						var results = "translate(" + layoutConfiguration.margins.left 
//							+ ", " + elementHeight + ")";
						return results; 
					})
				.append("rect")
					.attr("width", function (a) { 
							var results = layoutConfiguration.width + "px";
//							console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
							return results;
						})
					.attr("height", function (a) { 
							var results = layoutConfiguration.eventLabels.height + "px";
//							console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
							return results;
						})
					.attr("fill", "cyan")
					.style("opacity", 0.25)
					.style("pointer-events", "all")
					.style("cursor", "cell")
					.on("mousedown", function (d) {
						
//						var xCoor = d3.mouse(this)[0];
						var xCoor = d3.mouse(this)[0] - layoutConfiguration.margins.left;
							
							console.log ("Add Event of Interest element @T(" 
										+ timeSeriesScale.invert(xCoor) 
										+ ")");
							
							// Create Event
							var seriesEvent = createNewEvent(xCoor);
							
							events.push(seriesEvent);
									
							updateEvents();
						
							seriesEventCreationEventManagement.fireHandlers(seriesEvent);
							
							return;
						});
				
				return;
			}
					
			function buildUI(containerId, prefix, timeSeriesDomain) {
				
				console.log("MultipleSubrangeSelector::buildUI called...");
				
				elementWidth = layoutConfiguration.width 
									+ layoutConfiguration.margins.right 
									+ layoutConfiguration.margins.left;
									
				elementHeight = layoutConfiguration.height 
									+ layoutConfiguration.margins.top 
									+ layoutConfiguration.margins.bottom;
									
				d3.select(containerId).style("position", "absolute")
								.style("top", function (a) {
										var results = layoutConfiguration.containerPosition.top + "px";
										return results;
									})
								.style("left", function (a) {
										var results = layoutConfiguration.containerPosition.left + "px";
										return results;
									})
								.style("height", function (a) { 
										var results = (elementHeight + layoutConfiguration.height 
															+ layoutConfiguration.margins.bottom + 5) + "px";
										return results;
									})
								.style("width", function (a) { 
										var results = elementWidth + layoutConfiguration.margins.left + "px";
//										console.log("MultipleSubrangeSelector[" + new Error().lineNumber + "] returning: " + results);
										return results;
									});

				// Adds SVG Elements and Time Line Selector
				buildVisualizationElements(containerId, timeSeriesDomain);
				
				// Adds Tool Tip, Event Editor and Update Form Containers 
				buildDetailsForms(containerId);
				
				
			}
			
			/**************************************************************************************
			 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
		     **************************************************************************************/
			var ctor = function MultipleSubrangeSelector(instancePrefix, containerId, timeSeriesDomain, layout) {
		
					console.log("MultipleSubrangeSelector::MultipleSubrangeSelector called...");
					
					/**************************************************************************************
					 * Check that all required the call parameters are defined... 
				     **************************************************************************************/
					
					if (!instancePrefix) {
					
						throw new Error("Prefix argument not defined.");
					}
					
					
					if (!containerId) {
					
						throw new Error("ContainerId argument not defined.");
					}
					
					if (!timeSeriesDomain) {
					
						throw new Error("Time Series Domain argument not defined.");
					}
					
					if (!layout) {
					
						throw new Error("Layout Configuration data argument not defined.");
					}
					
					prefix = instancePrefix;
					
					layoutConfiguration = layout;
					
					buildUI(containerId, prefix, timeSeriesDomain);
			
								
				};
			var methods = {
					UpdateClicked: updateRangeClicked,
					DeleteClicked: deleteRangeClicked,	
									
					AddOnNewSubrangeCreatedHandler: addNewSubrangeHandler,
					RemoveOnNewSubrangeCreatedHandler: removeNewSubrangeHandler,
					AddDeletedSubrangeHandler: addDeletedSubrangeHandler,
					RemoveDeletedSubrangeHandler: removeDeletedSubrangeHandler,
					
					AddNewSeriesEventCreatedHandler: addNewSeriesEventCreatedHandler,
					RemoveNewSeriesEventCreatedHandler: removeNewSeriesEventCreatedHandler,
					AddDeletedSeriesEventHandler: addDeletedSeriesEventHandler,
					RemoveDeletedSeriesEventHandler: removeDeletedSeriesEventHanlder,		
					
					MoveRange: moveRange,
					FixToolTipMessage: fixToolTipMessage,
					SupportManualInput: supportManualInput,
					DragMove: dragMove,
					ActivateEventEditor: rollOutEventEditor,
					ActivateRangeEditor: rollOutRangeEditor,
					UpdateSubrange: updateSubrange
				};
			var statics = {};
			
			console.log ("MultipleSubrangeSelector::GoAbstractControls.AbstractUIControl contains: ");
			
			for (var prop in GoAbstractControls.AbstractUIControl) {
				
				console.log("MultipleSubrangeSelector::GoAbstractControls.AbstractUIControl." + prop);
			}
			
			var MultipleSubrangeSelector = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
		
				
			return MultipleSubrangeSelector;
				
		}());
	
		console.log("MultipleSubrangeSelector::loadMultipleSubrangeSelector loaded declaration.");

	} else {
		
		console.log("MultipleSubrangeSelector::loadMultipleSubrangeSelector declaration already loaded.");
	}
	
	return;
}


/**************************************************************************************
 * Explicitly call the function to declare the Multiple Subrange Selector Control
**************************************************************************************/
loadMultipleSubrangeSelector();