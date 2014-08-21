/**
 * Temporal Node Graph Component provides the implementation to create a 
 * network node graph which can be scanned through a period of time.
 * 
 */

console.log("TemporalNodeGraph.js - Loaded...");

function loadTemporalNodeGraph() {

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
	
	if ((!window.controls)
			|| (!window.controls.TemporalNodeGraph)) {
		
		if (!window.controls) {
			
			window.controls = {};
			
			console.log("TemporalNodeGraph::loadTemporalNodeGraph loaded namespace.");
		}
		
		// Explicitly define the contents of the namespace
		window.controls.TemporalNodeGraph = (function GiantOakControlsNamespace() {
			
			console.log("TemporalNodeGraph::GiantOakControlsNamespace called...");
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
			
			if ((isEmpty(window.controls))
					|| (!window.controls.ComplexDropDown)) {
					
				loadComplexDropDown();
			}
			
			
			
			var GoUtilities = window.utilities;	
			var GoControls = window.utilities.controls;
			var GoCustomControls = window.controls;
			var prefix = null;
			var layoutConfiguration = null;
			var svg = null;
			var force = null;
			var link = null;
			var node = null;
			var eigCenColorMapper = null;
			var degreeColorMapper = null;
			var betweennessColorMapper = null;
			var additionalNodeDataURL = null;
			var periodLabel = "";
			var loadedData = null;
			var userSelectedColors = null;
			var linkDataDisplay = null;
			var nodeDataDisplay = null;
			var auxiliaryDataMapper = function (error, data) {
					
					if (error) {
						throw error;
					}
		
					
					console.log ("TemporalNodeGraph::auxiliaryDataMapper default functionality called, which does nothing.  \nHad you wanted something done assign a function to the AdditionalNodeDataMapper property of the Temporal Node Graph Control instance.");
					return;
				};
			
			var stepBackwardsEventManagement = new GoControls.EventHandlerManagement();
			var stepForwardsEventManagement = new GoControls.EventHandlerManagement();
			
			var linkToolTipActivated = new GoControls.EventHandlerManagement();
			var linkToolTipDeactivated = new GoControls.EventHandlerManagement();
			var nodeToolTipActivated = new GoControls.EventHandlerManagement();
			var nodeToolTipDeactivated = new GoControls.EventHandlerManagement();
			
			var addStepBackEventHandler = function addStepBackEventHandler(handler) {
				
				stepBackwardsEventManagement.addHandler(handler);
				
				return;
			};

			var removeStepBackEventHandler = function removeStepBackEventHandler(handler) {

				stepBackwardsEventManagement.removeHandler(handler);
				
				return;
			};
			
			var addStepForwardEventHandler = function addStepForwardEventHandler(handler) {

				stepForwardsEventManagement.addHandler(handler);
				
				return;
			};
			
			var removeStepForwardEventHandler = function removeStepForwardEventHandler(handler) {

				stepForwardsEventManagement.removeHandler(handler);

				return;
			};

			var addLinkToolTipActivatedEventHandler = function addLinkToolTipActivatedEventHandler(handler) {

				linkToolTipActivated.addHandler(handler);
				
				return;
			};
			
			var removeLinkToolTipActivatedEventHandler = function removeLinkToolTipActivatedEventHandler(handler) {

				linkToolTipActivated.removeHandler(handler);

				return;
			};


			var addNodeToolTipActivatedEventHandler = function addNodeToolTipActivatedEventHandler(handler) {

				nodeToolTipActivated.addHandler(handler);
				
				return;
			};
			
			var removeNodeToolTipActivatedEventHandler = function removeNodeToolTipActivatedEventHandler(handler) {

				linkNodeTipActivated.removeHandler(handler);

				return;
			};

			var addLinkToolTipDeactivatedEventHandler = function addLinkToolTipDeactivatedEventHandler(handler) {

				linkToolTipDeactivated.addHandler(handler);
				
				return;
			};
			
			var removeLinkToolTipDeactivatedEventHandler = function removeLinkToolTipDeactivatedEventHandler(handler) {

				linkToolTipDeactivated.removeHandler(handler);

				return;
			};


			var addNodeToolTipDeactivatedEventHandler = function addNodeToolTipDeactivatedEventHandler(handler) {

				nodeToolTipDeactivated.addHandler(handler);
				
				return;
			};
			
			var removeNodeToolTipDeactivatedEventHandler = function removeNodeToolTipDeactivatedEventHandler(handler) {

				linkNodeTipDeactivated.removeHandler(handler);

				return;
			};

			
			var statsOptions = new Array ( 
					{
						"label": "",
						"accessor": function (d) {
							
							return layoutConfiguration.graphProperties.baseNodeColor;
					}}, 
					{
						"label": "Eigenvector Centrality",
						"accessor": function (d) {
							
							console.log("Eigenvector Centrality - color selector");
							
							return eigCenColorMapper(d.eigcen);
					}}, 
					{	
						"label": "Betweenness",
						"accessor": function (d) {
							
							console.log("Betweenness - color selector");
							
							return betweennessColorMapper(d.betweenness);
						}}, 
					{
						"label": "Degree",
						"accessor": function (d) {
							
							console.log("Degree - color selector");
							
							return degreeColorMapper(d.degree);
						}});

			var setPeriodLabel = function setPeriodLabel(value) {
				
				console.log("TemporalNodeGraph::setPeriodLabel called with: '" + value + "'");
				
				periodLabel = value;
				
				var title = d3.select(GoUtilities.GenerateIdentifierSelector(GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "temporalnodegraph_title")));
				
				title.text(layoutConfiguration.titleProperties.labelPrefix + " " + periodLabel);
				
				return;
			};
			
			
			var updateNodeData = function updateNodeData() {
				
				console.log("TemporalNodeGraph::updateNodeData called...");
				
				if (additionalNodeDataURL 
						&& loadedData
							&& loadedData.nodes) {
					
					GoUtilities.FetchData(additionalNodeDataURL, 
											auxiliaryDataMapper, 
											null, 
											function (d) {
							
													return { id: d.V1, name: d.V2 }; 
												});

				}
				
				return;
			};
			
			var handleDoubleClick = function doubleClick(d) {
				
				console.log("TemporalNodeGraph::handleDoubleClick called...");
				
				var containerNode = d3.select(this); 
				
				containerNode.classed("fixed", d.fixed = false);
				
				containerNode.selectAll(".userSelection")
						.attr("stroke", function (d) {
							
								var nodeDatum =  d3.select(d3.select(this).node().parentNode).datum();
		
								return nodeDatum.stroke;
							});
						
				return;
			};
			
			var handleDragStart = function dragStart(d) {

				console.log("TemporalNodeGraph::handleDragStart called...");
				
				var containerNode = d3.select(this); 
				
				containerNode.classed("fixed", d.fixed = true);
				
				containerNode.selectAll(".userSelection")
						.attr("stroke", layoutConfiguration.graphProperties.fixedColor);
				
				return;
			};
			
			var betweennessAccessor = function (d) {
				
				return d.betweenness;
			};
			var eigCenAccessor = function (d) {
				
				return d.eigcen;
			};
			var degreeAccessor = function (d) {
				
				return d.degree;
			};
						
			var linkMouseOver = function (d) {
				
				console.log("mouseover link between " 
								+ d.source.id 
								+ ", at [" + d.source.x + ", " + d.source.y + "]"
								+ " and " 
								+ d.target.id
								+ ", at [" + d.target.x + ", " + d.target.y + "]");
				

				var lddSelector = GoUtilities.GenerateIdentifierSelector(GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
																				"temporalnodegraph_linkDisplay"));
				var ldd = d3.select(lddSelector);
				
				linkToolTipActivated.fireHandlers(svg, ldd, d);
				
				return;
			};
			
			var linkMouseOut = function (d) {
				
				console.log("mouseout link between " 
						+ d.source.id 
						+ ", at [" + d.source.x + ", " + d.source.y + "]"
						+ " and " 
						+ d.target.id
						+ ", at [" + d.target.x + ", " + d.target.y + "]");
		
				var lddSelector = GoUtilities.GenerateIdentifierSelector(GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
																			"temporalnodegraph_linkDisplay"));
				var ldd = d3.select(lddSelector);

				linkToolTipDeactivated.fireHandlers(svg, ldd, d);
				
				return;
			};
			
			var nodeMouseOver =  function (d) {
				
				console.log("Display Tool Tip for Node: '" + d.id 
								+ "', name: '" + d.name + "'"
								+ ", at [" + (d.x - 6) + ", " 
								+ (d.y - 6) + "]");
				
				var nddSelector = GoUtilities.GenerateIdentifierSelector(GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
																			"temporalnodegraph_nodeDisplay"));
				var ndd = d3.select(nddSelector);

				nodeToolTipActivated.fireHandlers(svg, ndd, d);
				
				return;
			};
			
			var nodeMouseOut =  function (d) {
				
				console.log("Close Tool Tip for Node: '" + d.id 
								+ "', name: '" + d.name + "'"
								+ ", at [" + (d.x - 6) + ", " 
								+ (d.y - 6) + "]");
				
				var nddSelector = GoUtilities.GenerateIdentifierSelector(GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
												"temporalnodegraph_nodeDisplay"));
				var ndd = d3.select(nddSelector);

				nodeToolTipDeactivated.fireHandlers(svg, ndd, d);
				
				return;
			};
			
						
			var ingestDataSet = function (error, graph) {
				
				console.log ("TemporalNodeGraph::ingestDataSet called....");
				
				if (error) {
					
					throw error;
				}
				
				loadedData = graph;
				
				eigCenColorMapper = GoUtilities.MapColors(layoutConfiguration.graphProperties.eigCenRange, 
																layoutConfiguration.graphProperties.eigCenScalingFunction,
																loadedData.nodes,
																eigCenAccessor);					

				degreeColorMapper = GoUtilities.MapColors(layoutConfiguration.graphProperties.degreeRange,
																	layoutConfiguration.graphProperties.degreeScalingFunction,
																	loadedData.nodes,
																	degreeAccessor);

				betweennessColorMapper = GoUtilities.MapColors(layoutConfiguration.graphProperties.betweennessRange,
																layoutConfiguration.graphProperties.betweennessScalingFunction,
																loadedData.nodes,
																betweennessAccessor);

				force.nodes(loadedData.nodes)
						.links(loadedData.links)
						.start();
				
				link = svg.selectAll(".link").data(loadedData.links, function (d) {
									return d.source.id + ":" + d.target.id;
								});
				
				link.attr("class", "link")
						.attr("id", function (d) {
							
								return d.source.id + "_" + d.target.id;
							})
						.on("mouseover", linkMouseOver)
						.on("mouseout", linkMouseOut);
				
				// Ensure that the added line elements are placed before node elements
				// so that the render under the nodes visually.  This is required to 
				// allow the Network Graph to be modified (nodes added and removed.)
				link.enter().insert("line", "g.nodeContainer")
									.attr("class", "link")
									.attr("id", function (d) {
											
											return d.source.id + "_"  + d.target.id;
										})
									.on("mouseover", linkMouseOver)
									.on("mouseout", linkMouseOut);
				
				link.exit().remove();
	
				var workingSet = svg.selectAll(".nodeContainer");
				
				workingSet = workingSet.data(loadedData.nodes, function (d) {
						
										return d.id;
									})						
								.attr("id", function (d) {
					
									return d.id;
								});
				
				workingSet.selectAll("g")
						.attr("class", function (d) {
								
								var results = "node";
								
								if (d.fixed) {
									
									results += " fixed";
								}
								
								return results;										
							})
						.on("dblclick", handleDoubleClick)
						.on("mouseover", nodeMouseOver)
						.on("mouseout", nodeMouseOut)
						.call(drag);
	
				workingSet.enter()
						.append("g")
							.attr("class", "nodeContainer")
							.attr("id", function (d) {
						
										return d.id;
									})
						.append("g")
							.attr("transform", function (d) {
									return "translate(" + (d.x - 6) + ", " + (d.y - 6)+ ")";
								})						
							.attr("class", function (d) {
									
									var nodeDatum = d3.select(d3.select(this).node().parentNode).datum();
									var results = "node";
									
									if (nodeDatum.fixed) {
										
										results += " fixed";
									}
									
									return results;										
								})
							.on("dblclick", handleDoubleClick)
							.on("mouseover", nodeMouseOver)
							.on("mouseout", nodeMouseOut)
							.call(drag);

				workingSet.exit().remove();
				
				var layout = new Array("circle", "circle");
				var layoutClasses = new Array("userSelection", "userStatistics");
				
				// Rebuild all the nodes
				node = workingSet.selectAll(".node");
				
				var nodeSymbols = svg.selectAll("g.node .userSelection"); 
				
				if (nodeSymbols.empty()) {
					
					node.selectAll(".symbol")
						.data(layout)
					.enter()
						.append("circle")
							.attr("fill", function (d, i) {
									var color = layoutConfiguration.graphProperties.baseNodeColor;
									
									if (!i) {
										
										var nodeDatum = d3.select(d3.select(this).node().parentNode).datum();
	
										color = nodeDatum.fill;
									}
						
									return color;
								})
							.attr("class", function (d, i) {
									
									return layoutClasses[i];
								})
							.attr("r", function (d, i) {
								
									return (layoutConfiguration.graphProperties.nodeRadius - (i*6));
								})
							.attr("stroke-width", function (d, i) {
									
									var width = 4;
									
									if (i) {
										
										width = 0;
									}
									
									return width;
								})
							.attr("stroke", function (d, i) {
									
									var nodeDatum = d3.select(d3.select(this).node().parentNode).datum();
									var stroke = "black";
									
									if (i) {
										
										stroke = nodeDatum.stroke;
										
									} else if (nodeDatum.fixed) {
										
										stroke = layoutConfiguration.graphProperties.fixedColor;
									}
									
									return stroke;
								})
							.attr("cx", 6)
							.attr("cy", 6);
			
				} else if (nodeSymbols.size() < graph.nodes.length) {
				
					// Build only the newly added
					console.log ("Define newly added node.");
					
					var emptyNodes = svg.selectAll("g.node").filter(function (d, i) {
						
						console.log("filter for empty instances of g.node");
						return 0 == this.childElementCount;
					});
					
					emptyNodes.selectAll(".symbol")
						.data(layout)
					.enter()
						.append("circle")
							.attr("fill", function (d, i) {
									var color = layoutConfiguration.graphProperties.baseNodeColor;
									
									if (!i) {
										
										var nodeDatum = d3.select(d3.select(this).node().parentNode).datum();
	
										color = nodeDatum.fill;
									}
						
									return color;
								})
							.attr("class", function (d, i) {
									
									return layoutClasses[i];
								})
							.attr("r", function (d, i) {
								
									return (layoutConfiguration.graphProperties.nodeRadius - (i*6));
								})
							.attr("stroke-width", function (d, i) {
									
									var width = 4;
									
									if (i) {
										
										width = 0;
									}
									
									return width;
								})
							.attr("stroke", function (d, i) {
									
									var nodeDatum = d3.select(d3.select(this).node().parentNode).datum();
									var stroke = "black";
									
									if (i) {
										
										stroke = nodeDatum.stroke;
										
									} else if (nodeDatum.fixed) {
										
										stroke = layoutConfiguration.graphProperties.fixedColor;
									}
									
									return stroke;
								})
							.attr("cx", 6)
							.attr("cy", 6);
	
					
				}
				
				var animatedNodes =  node.selectAll(".userStatistics");
				
				animatedNodes.transition()
						.delay(layoutConfiguration.graphProperties.transitionTiming)
							.attr("fill", function (d) {
									
									var nodeDatum = d3.select(d3.select(this).node().parentNode).datum();
									var color = layoutConfiguration.graphProperties.baseNodeColor;
									
									if (userSelectedColors) {
										 
										color = userSelectedColors(nodeDatum);
									}
									
									return color;
								});

				updateNodeData();
				
				return;
			};
			
			var updateData = function udpateData(dataSet) {
				
				console.log("TemporalNodeGraph::updateData called...");

				ingestDataSet(null, dataSet);

				return;
			};
			
			var tick = function tick() {
				
				
				link.attr("x1", function (d) {

						return d.source.x;
					})
				.attr("y1", function (d) {

						return d.source.y;
					})
				.attr("x2", function(d) {

						return d.target.x;
					})
				.attr("y2", function (d) {	

						return d.target.y;
					});

				node.attr("transform", function (d) {
					
					return "translate(" + (d.x - 6) + ", " + (d.y - 6) + ")";
				});
				
				return;
			};
			

			function buildUI(containerId) {
				
				console.log("TemporalNodeGraph::buildUI called...");
								
				var elementWidth = layoutConfiguration.containerProperties.width
										+ layoutConfiguration.margins.left
										+ layoutConfiguration.margins.right;
				
				var elementHeight = layoutConfiguration.containerProperties.height
										+ layoutConfiguration.margins.top
										+ layoutConfiguration.margins.bottom;				
				
				force = d3.layout.force()
							.size([elementWidth, elementHeight])
							.charge(layoutConfiguration.graphProperties.charge)
							.linkDistance(layoutConfiguration.graphProperties.linkDistance)
							.on("start", function (d) {
								
								console.log("force start called.");
								return;
							})
							.on("tick", tick)
							.on("end", function (d) {
								
								console.log("force end called.");
								return;
							});
				
				drag = force.drag()
							.on("dragstart", handleDragStart);
				
				var controlContainer = d3.select(containerId).append("div")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
																		prefix, "temporalnodegraph_container"))
											.style("position", "absolute")
											.style("top", layoutConfiguration.margins.top + "px")
											.style("left", layoutConfiguration.margins.left + "px")
											.style("border", layoutConfiguration.containerProperties.borders)
											.style("background-color", layoutConfiguration.containerProperties.backgroundColor); 

				svg = controlContainer.append("svg")
								.attr("height", elementHeight)
								.attr("width", elementWidth)
							.append("g")
								.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "temporalnodegraph_ui"));
				
				link = svg.selectAll(".link");
				node = svg.selectAll("g.nodeContainer g");

				var cddLayout = {
						containerProperties: {
								top: ((layoutConfiguration.containerProperties.height 
										+ layoutConfiguration.margins.verticalMargins) + "px"),
								left: (((layoutConfiguration.containerProperties.width 
										+ layoutConfiguration.margins.horizontalMargins) - 350) + "px"),
								width: "300px",
								height: "35px",
								padding: "5px",
								backgroundColor: "mintcream"
							},
						controlButton: {
							top: ((layoutConfiguration.containerProperties.height 
									+ layoutConfiguration.margins.verticalMargins) + "px"),
							left: (((layoutConfiguration.containerProperties.width 
									+ layoutConfiguration.margins.horizontalMargins) - 50) + "px"),
							width: "50px",
							height: "30px",
							padding: "5px",
							borders: "1px solid darkgray"
						},
						options: [
						          	{
						          		id: "selection_default",
						          		classes: "selected",
						          		gradientClass: "",
						          		label: "< Select Metrics >",
						          		value: ""
						          	},
						          	{
						          		id: "selection_betweenness",
						          		classes: "outlined",
						          		gradientClass: "betweennessGradient",
						          		label: "Betweenness",
						          		value: "Betweenness"
						          	},
						          	{
						          		id: "selection_eigCen",
						          		classes: "outlined",
						          		gradientClass: "eigCenGradient",
						          		label: "Eigenvector Centrality",
						          		value: "Eigenvector Centrality"
						          	},
						          	{
						          		id: "selection_degree",
						          		classes: "outlined",
						          		gradientClass: "degreeGradient",
						          		label: "Degree",
						          		value: "Degree"
						          	}
						          ]
				};
				
				var cdd = new GoCustomControls.ComplexDropDown(GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "cdd"),
														 	GoUtilities.GenerateIdentifierSelector(controlContainer.attr("id")), 
														 	cddLayout);
				
				cdd.AddSelectionChangedEventHandler(function (ctr, value) {

					console.log ("selection option changed to " + value);
					
					var selection = value;
					var v = statsOptions.filter(function (element) {
						
						var results = null;
						
						if (element.label === selection) {
							
							results = element.accessor;
						}
						
						return results;
					});

					if (v) {
						
						userSelectedColors = v[0].accessor;
						
						ingestDataSet(null, loadedData);
					}

					return;
					
				});

				var title = controlContainer.append("h2")
								.style("position", "absolute")
								.style("top", "0px")
								.style("left", "0px")
								.style("width", "100%")
								.style("text-align", "center")
								.attr("id", 
										GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
												"temporalnodegraph_title"));
						
				var offsetHeight = title.node().offsetHeight;
				
				linkDataDisplay = controlContainer.append("div")
											.style("position", "absolute")
											.style("top", (offsetHeight + layoutConfiguration.containerProperties.padding) + "px")
											.style("left", "0px")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
												"temporalnodegraph_linkDisplay"))
											.attr("class", "temporalNodeGraphDataDisplay");
				
				nodeDataDisplay = controlContainer.append("div")
											.style("position", "absolute")
											.style("top", (offsetHeight + layoutConfiguration.containerProperties.padding) + "px")
											.style("left", (((layoutConfiguration.containerProperties.width 
													+ layoutConfiguration.margins.horizontalMargins) - 150) + "px"))
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
												"temporalnodegraph_nodeDisplay"))
											.attr("class", "temporalNodeGraphDataDisplay");
							
				var scrubberWidth = (((layoutConfiguration.scrubberProperties.width + 2) * 2) 
										+ ((layoutConfiguration.scrubberProperties.padding 
													+ layoutConfiguration.scrubberProperties.margin) * 3));
				var scrubberHeight = (layoutConfiguration.scrubberProperties.height 
										+ ((layoutConfiguration.scrubberProperties.padding 
												+ layoutConfiguration.scrubberProperties.margin) * 4));

				
				var scrubber = controlContainer.append("div")
									.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "temporalnodegraph_scrubcontrols"))
									.style("cursor", "default")
									.style("position", "absolute")
									.style("padding", layoutConfiguration.scrubberProperties.padding + "px")
									.style("margin", layoutConfiguration.scrubberProperties.margin + "px")
									.style("top", (layoutConfiguration.containerProperties.height + layoutConfiguration.margins.horizontalMargins) + "px")
									.style("left", "0px")
									.style("border", layoutConfiguration.scrubberProperties.borders)
									.style("background-color", layoutConfiguration.scrubberProperties.backgroundColor)
									.style("width", scrubberWidth + "px")
									.style("height", scrubberHeight + "px");
				
				
				scrubber.append("div")
						.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "temporalnodegraph_back"))
						.style("position", "absolute")
						.style("top", "2px")
						.style("left", "2px")
						.style("padding", layoutConfiguration.scrubberProperties.padding + "px")
						.style("margin", layoutConfiguration.scrubberProperties.margin + "px")
						.style("border", layoutConfiguration.scrubberProperties.backBorders)
						.style("background-color", layoutConfiguration.scrubberProperties.backBackgroundColor)
						.style("width", layoutConfiguration.scrubberProperties.width + "px")
						.style("height", (layoutConfiguration.scrubberProperties.height 
											+ (layoutConfiguration.scrubberProperties.padding 
													+ layoutConfiguration.scrubberProperties.margin)) + "px")
						.on("click", function(d) {
								
								console.log("Time Scrubber Back Button clicked: '" + periodLabel + "'");
								
								stepBackwardsEventManagement.fireHandlers(periodLabel);
								
								return;
							})
					.append("span")
						.attr("class", "glyphicon glyphicon-chevron-left");

				scrubber.append("div")
						.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "temporalnodegraph_forward"))
						.style("position", "absolute")
						.style("top", "2px")
						.style("left", (layoutConfiguration.scrubberProperties.width + 6) + "px")
						.style("padding", "2px")
						.style("margin", "2px")
						.style("border", layoutConfiguration.scrubberProperties.forwardBorders)
						.style("background-color", layoutConfiguration.scrubberProperties.forwardBackgroundColor)
						.style("width", layoutConfiguration.scrubberProperties.width + "px")
						.style("height", (layoutConfiguration.scrubberProperties.height 
											+ (layoutConfiguration.scrubberProperties.padding 
													+ layoutConfiguration.scrubberProperties.margin)) + "px")
						.on("click", function(d) {
								
								console.log("Time Scrubber Forward Button clicked: '" + periodLabel + "'");
								
								stepForwardsEventManagement.fireHandlers(periodLabel);
								
								return;
							})
					.append("span")
						.attr("class", "glyphicon glyphicon-chevron-right");
	
				
				return;				
			}
			
			/**********************************************************************************
			 * TODO: 	Figure out how to manage stepping through the time series. 
			 * 		 	The issue is that this control does not need to understand
			 * 			how to advance through the time line only that the user has requested
			 * 			to step backwards in time and step forwards in time.  
			 * 
			 * 			Possibly these functions should track the current time, fetch the 
			 * 			appropriate set of nodes (calling UpdateData with the new set), 
			 * 			and as a side effect update the period label.
			 * 
			 * 			Add Events for mouse over Nodes and Links in the graph.
			 *********************************************************************************/

			/**************************************************************************************
			 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
		     **************************************************************************************/
			var ctor = function TemporalNodeGraph(instancePrefix, containerId, layout) {
		
					console.log("TemporalNodeGraph::TemporalNodeGraph called...");
					
					
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
					
					UpdateDataSet: updateData,
					UpdateNodeData: updateNodeData,
					
					AddStepBackEventHandler: addStepBackEventHandler,
					RemoveStepBackEventHandler: removeStepBackEventHandler,					
					AddStepForwardEventHandler: addStepForwardEventHandler,
					RemoveStepForwardEventHandler: removeStepForwardEventHandler,
					
					AddLinkToolTipActivatedEventHandler: addLinkToolTipActivatedEventHandler,
					RemoveLinkToolTipActivatedEventHandler: removeLinkToolTipActivatedEventHandler,
					AddLinkToolTipDeactivatedEventHandler: addLinkToolTipDeactivatedEventHandler,
					RemoveLinkToolTipDeactivatedEventHandler:  removeLinkToolTipDeactivatedEventHandler,
					
					AddNodeToolTipActivatedEventHandler: addNodeToolTipActivatedEventHandler,
					RemoveNodeToolTipActivatedEventHandler: removeNodeToolTipActivatedEventHandler,					
					AddNodeToolTipDeactivatedEventHandler: addNodeToolTipDeactivatedEventHandler,
					RemoveNodeToolTipDeactivatedEventHandler: removeNodeToolTipDeactivatedEventHandler 
				};

			var statics = {};
			
			var component = GoControls.AbstractUIControl.extend(ctor, methods, statics);	
			
			Object.defineProperty(component.prototype,
					"AdditionalNodeDataURL", 
					{

						enumerable: true,
						configurable: true,
						get: function() {
							return additionalNodeDataURL;
						},
						set: function (uri) {
							
							additionalNodeDataURL = uri;
							
							updateNodeData();
							
							return;
						}
					});

			Object.defineProperty(component.prototype,
					"PeriodLabel", 
					{

						enumerable: true,
						configurable: true,
						get: function() {
							return periodLabel;
						},
						set: setPeriodLabel
					});

			Object.defineProperty(component.prototype,
					"AdditionalNodeDataMapper",
					{
						enumerable: true,
						configurable: true,
						get: function () {
							
							return auxiliaryDataMapper;
						},
						set: function (functor) {
							
							auxiliaryDataMapper = functor;
							
							return;
						}
					});
					
			Object.defineProperty(component.prototype,
					"LoadedData",
					{
						enumerable: true,
						configurable: true,
						get: function () {
							
							return loadedData;
						}
					});
			
				return component;
				
		}());
	}
		
		return;
	}	

/*************************************************
 * Explicitly call the Load function
*************************************************/
loadTemporalNodeGraph();