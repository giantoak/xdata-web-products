/**
 * Time Series Chart Chart Manager Control
 */

console.log("ChartManager.js - Loaded...");

function loadChartManager() {

	console.log ("ChartManager::loadChartManager called...");
	
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
			|| (!window.controls.TimeSeriesCharts)
			|| (!window.controls.TimeSeriesCharts.ChartManager)) {
			
			if (!window.controls) {
			
				window.controls = {};
			}
			
			if (!window.controls.TimeSeriesCharts) {
				
				window.controls.TimeSeriesCharts = {};
			}
			
	
			// Explicitly define the contents of the namespace
			window.controls.TimeSeriesCharts.ChartManager = (function GiantOakControlsNamespace() {
				
				console.log("ChartManager::GiantOakControlsNamespace called...");
				
				// Determining if Giant Oak Utilities namespace has been defined is a 
				// Special case and needs to come first as it provides a lot of basic
				// functionality used in the rest of libraries developed by Giant Oak.
				if ((isEmpty(window.utilities))
						|| (!window.utilities)) {
						
					loadUtilitiesModule();
				}				
				
				var component = null;
				// Define local alias to the Utilities Namespace.
				var GoUtilities = window.utilities;	
				var GoAbstractControls = window.utilities.controls;
				var GoChartControls = window.controls.TimeSeriesCharts;
				var prefix = null;
				var layoutConfiguration = null;
				var svg = null;
				var chartCanvas = null;
				var xScale = null;
				var xDomain = new Array(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
				var hoverLine = null;
				var graphs = new Array();
				var monthNames = new Array ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
				var activePlayHead = false;
				var elementWidth = null;
				var elementHeight = null;
				var logChartHeight = 100;
				var diChartHeight = 20;
				var color = d3.scale.category10();
				var timeLegend = null;
				var brush = null;
				
				var chartClickedEventManagement = new GoAbstractControls.EventHandlerManagement();
				
				var addChartClickedEventHandler = function addChartClickEventHandler(handler) {
					
					chartClickedEventManagement.addHandler(handler);
					
					return;
				};
				
				var removeChartClickeEventHandler = function removeChartClickedEventHandler(handler) {
					
					chartClickedEventManagement.removeHandler(handler);
					
					return;
				};
				
				var chartClickHandler = function chartClickHandler(d) {
					
					console.log("ChartManager::chartClickHandler called...");
					
					var actualActivePlayHead = activePlayHead;
					
					activePlayHead = true;
					
					positionPlayHead(this, true);
					
					activePlayHead = actualActivePlayHead;
					
					return;
				};
				
				var chartMouseHoverHandler = function chartMouseHoverHandler() {
					
					console.log("ChartManager::chartMouseHoverHandler called...");
					
					if (0 != graphs.length) {
						
						var mouse = d3.mouse(this);
						
						var mX = mouse[0] + layoutConfiguration.margins.left;
						var mY = mouse[1] + layoutConfiguration.margins.top;
						
						if ((mX > 0)
								&& (mY > 0)
									&& (mX < layoutConfiguration.graphRegion.width)) {
							
							hoverLine.attr("opacity", layoutConfiguration.graphRegion.hoverLine.displayedOpacity);
							
							activePlayHead = true;
							
						} else {
							
							hoverLine.attr("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
							
							activePlayHead = false;
						}
						
						console.log("ChartManager::chartMouseHoverHandler called with graphs defined with playhead: " 
								+ (activePlayHead ? "active" : "hidden") + ".");
						
					} else {
						
						console.log("ChartManager::chartMouseHoverHandler called without any graphs defined.");
						
						hoverLine.attr("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
						
						activePlayHead = false;
					}
					
					return;
				};
				
				var chartMouseOutHandler = function chartMouseOutHandler() {
					
					console.log("ChartManager::chartMouseOutHandler called...");
					
					hoverLine.attr("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
					
					activePlayHead = false;
					
					return;
				};
				
				function minDistanceDate(dates, dt) {
					var results = null;
					var distance = Number.POSITIVE_INFINITY;
					
					dates.forEach(function (d) {

						var dtValue = dt.getTime();
						var dValue = (new Date(d)).getTime();
						var newDistance = Math.abs(dValue-dtValue);
						
						if (distance > newDistance) {
							
							distance = newDistance;
							results = d;
						}
					});
					
					return results;
				}
				
				function positionPlayHead(container, triggerEvent) {
					
					console.log("ChartManager::positionPlayHead(" + triggerEvent + ", " + activePlayHead + ")");
					
					if (activePlayHead) {
						
						var mouse = d3.mouse(container);
						
						var mX = mouse[0];
						var mY = mouse[1];
						
						hoverLine.attr("x1", mX).attr("x2", mX);
						
						if ((mX > 0)
								&& (mY > 0)
									&& (mX < layoutConfiguration.graphRegion.width)) {
					
							var dt = xScale.invert(mX);
							var mapped = graphs.map(function mapper(element, index, arr) {
								
								var results = element.map[mX] 
										? element.map[mX].date 
												: null;
								
								return results;
							});
							var nearestDateValue = minDistanceDate(mapped, dt);
							var graphIdsWithDataAtNearestDate = graphs.filter(function filter(element, index) {
								
								var mappedData = element.map[mX];
								var flag = (mappedData 
												&& (mappedData.date == nearestDateValue));
								return flag;
							}).map(function map(filteredData, index) {
								
								var mappedData = filteredData.map[mX]; 
								
								return mappedData.idx;
							});
							
							if (null != nearestDateValue) {
								
								d3.selectAll(".graph").data(graphs, function (d) {
									
									return d.id;
								}).each (function (d) {
									
									var g = d3.select(this);
									var str = "";
									
									if (0 <= graphIdsWithDataAtNearestDate.indexOf(d.id)) {
										
										var v = d.data[d.map[mX].idx];
										
										d.yVal.forEach(function (yDim, i) {
										
											str += d.yVal.length == 1 ? v[yDim] : ((0 < i ? ", " : " ") + yDim + ":" + v[yDim]);
										});
									}
									
									g.select('.legend').text(d.id + " : " + str);
								});

								var ndv = new Date(nearestDateValue);
								var date = ndv.getDate();
								var month = ndv.getMonth();
								timeLegend.text(date + " " + monthNames[month]);
								hoverLine.attr("x1", mX).attr("x2",mX);
								
							} else {
								
								console.log("No 'Nearest Date Value' found...");
							}
						
							if (triggerEvent) {
								
								chartClickedEventManagement.fireHandlers(component, mX, graphIdsWithDataAtNearestDate);
							}

						} else {
							// Off the chart...
						}
					} else {
						// Play head not active... (most likely no charts
					}
					
					return;
				}
				
				var chartMouseMoveHandler = function chartMouseMoveHandler() {
					
					console.log("ChartManager::chartMouseMoveHandler called...");
					
					positionPlayHead(this, false);
					
					return;
				};
				
			function selectChart(d) {
				
				var chart = null;
				var width = layoutConfiguration.containerProperties.width;
				
				if ("analog" === d.type) {
				
					chart = new GoChartControls.AnalogChart(
													GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
															(d.id + "_" + graphs.length)), prefix,
															layoutConfiguration); 
					
					chart.id(d.id)
							.height(layoutConfiguration.analog.chartHeight)
							.gap(layoutConfiguration.analog.gap)
							.color(color);
					
					width = layoutConfiguration.analog.width();
					
				} else if ("digital" === d.type) {
					

					chart = new GoChartControls.DigitalChart(
													GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
															(d.id + "_"  + graphs.length)), prefix,
															layoutConfiguration);
					
					var h = graphHeight(d, layoutConfiguration.digital.chartHeight 
									+ layoutConfiguration.containerProperties.padding);
					
					chart.id(d.id)
							.height(h)
							.color(color)
							.y(function (t) { 
									return t.State ? 1 : 0; 
								});
					
					width = layoutConfiguration.digit.width();

				} else if ("horizon" === d.type) {
					
					var mean = d.data.map(function (t) { return t.Value; } )
										.reduce(function (p, v) { return p + v; }, 0) / d.data.length;
					
					chart = new GoChartControls.HorizonChart(
													GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
															(d.id + "_"  + graphs.length)), prefix,
															layoutConfiguration);
					
					chart.id(d.id)
							.height(layoutConfiguration.horizon.chartHeight)
							.gap(layoutConfiguration.horizon.gap)
							.y(function (t) { 
									return t.Value - mean; 
								})
							.bands(layoutConfiguration.horizon.bands)
							.mode("offset");
					
					width = layoutConfiguration.horizon.width();
					
				} else if ("scatter" === d.type) {
					
					chart = new GoChartControls.ScatterChart(
												GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
														(d.id + "_"  + graphs.length)), prefix,
														layoutConfiguration);
					
					chart.id(d.id)
							.height(layoutConfiguration.scatter.chartHeight)
							.gap(layoutConfiguration.scatter.gap)
							.color(color);
					
					width = layoutConfiguration.scatter.width();
				}
				
				if (chart) {
					
					
					chart.timeScale(xScale).x(function (t) { 
							return (new Date(t.DateTime)).getTime(); 
						});
				}
				
				return chart.initialize;
			}
			
			function graphHeight(d, height) {
				
				var results = height;
				
				if ("analog" === d.type) {
					results = layoutConfiguration.analog.chartHeight;
				} else if ("digital" === d.type) {
					var unique = {};
					var distinct = new Array();
					
					d.data.forEach(function (i) {
						
					     if( typeof(unique[i.Channel]) === "undefined"){
						      distinct.push(i.Channel);
						     }
						     unique[i.Channel] = true;
					});
					
					var cnt = distinct.length;
					
					results = (layoutConfiguration.digital.chartHeight 
									+ layoutConfiguration.containerProperties.padding) 
										* cnt;
				} else if ("horizon" === d.type) {
					
					resutls = layoutConfiguration.horizon.chartHeight;
				}
				
				return results;
			}

	
			function buildUI(containerId) {
					
					console.log("ChartManager::buildUI called...");
					
					elementWidth = layoutConfiguration.containerProperties.width 
											+ layoutConfiguration.margins.verticalMargins
											+ layoutConfiguration.containerProperties.padding;
					elementHeight = layoutConfiguration.containerProperties.height
											+ layoutConfiguration.margins.horizontalMargins
											+ layoutConfiguration.containerProperties.padding;
					
					var controlContainer = d3.select(containerId).append("div")
														.attr("id", GoUtilities
																	.GenerateComponentSpecificIdentifiers(prefix, 
																			"timeserieschart_container"))
														.style("position", "absolute")
														.style("border", layoutConfiguration.containerProperties.borders)
														.style("background-color", layoutConfiguration.containerProperties.backgroundColor);
					
					svg = controlContainer.append("svg")
											.attr("height", elementHeight)
											.attr("width", elementWidth);

					
					svg.append("defs").append("clipPath")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "clip"))
						.append("rect")
							.attr("width", layoutConfiguration.graphRegion.width) 
							.attr("height", layoutConfiguration.graphRegion.height);
					
					chartCanvas = svg.append("g")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "timeserieschart_ui"))
							.attr("tansform", "translate(" + layoutConfiguration.margins.left 
														+ ", " 
														+ layoutConfiguration.margins.top 
														+ ")");
					
					xScale = d3.time.scale().range(new Array(0, elementWidth));
					
					hoverLine = chartCanvas.append("svg:line")
											.attr("class", "hover-line")
											.attr("x1", layoutConfiguration.graphRegion.hoverLine.x1)
											.attr("x2", layoutConfiguration.graphRegion.hoverLine.x2)
											.attr("y1", layoutConfiguration.graphRegion.hoverLine.y1)
											.attr("y2", layoutConfiguration.graphRegion.hoverLine.y2)
											.attr("stroke-width", layoutConfiguration.graphRegion.hoverLine.strokeWidth)
											.attr("stroke", layoutConfiguration.graphRegion.hoverLine.strokeColor)
											.attr("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
					
					chartCanvas.append("g")
									.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "xAxis"))
									.attr("transform", "translate(" 
															+ layoutConfiguration.graphRegion.xAxisXTranslate()
															+ ", "
															+ (layoutConfiguration.margins.top * 1.5) 
															+ ")")
									.attr("class", "brush");
					
					chartCanvas.select(GoUtilities.GenerateIdentifierSelector(
											GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "xAxis")))
							.append("g")
								.attr("class", "x axis");
					
					timeLegend = chartCanvas.append("text")
											.attr("class", "legend-time")
											.attr("x",  (layoutConfiguration.graphRegion.width 
															+ layoutConfiguration.margins.verticalMargins))
											.attr("y", layoutConfiguration.graphRegion.legendOffset)
											.attr("text-anchor", layoutConfiguration.graphRegion.textAnchor)
											.text("time:");

					svg.on("mouseover", chartMouseHoverHandler)
							.on("mouseout", chartMouseOutHandler)
							.on("mousemove", chartMouseMoveHandler)
							.on("click", chartClickHandler);

					return;
				};
				
				function adjustChartHeight() {
					
					console.log ("ChartManager::adjustChartHeight called...");
					
					var height = 0;
					
					graphs.forEach(function (element) {
						
						height += graphHeight(element, layoutConfiguration.graphRegion.defaultChartHeight);
					});
					
					var containerHeight = height + layoutConfiguration.margins.horizontalMargins 
												+ layoutConfiguration.containerProperties.height;
					
					svg.attr("height", containerHeight);
					
					d3.select("#clip").select("rect")
							.attr("height", height);
					
					chartCanvas.select(".hover-line")
								.attr("y2", containerHeight); 
					
					return;
				}
				
				function zoomAsynchronously(callback) {
					
					console.log("ChartManager::zoomAsynchronously called...");
					
					setTimeout(function () {
						
						graphs.forEach(function (element) {
							
								element.map = getLookupMap(element, xScale);
							});
						
						callback();
						
						return;
					}, 30);
					
					return;
				}
				
				var dateComparer = function (a, b) {
					
					var aValue = (new Date(a)).getTime();
					var bValue = (new Date(b)).getTime();
					
					return (aValue  > bValue);
				};
				
				function getLookupMap(graph, scaling) {
					
					console.log("ChartManager::getLookupMap called...");
				
					var cursorIndex = 0;
					var map = new Array();
					var startIndex = GoUtilities.FindSortedInsertionPointWithKey(graph.data, 
													"DateTime", scaling.domain()[0], dateComparer);  // Determine last index where graph's data's order property is less than scaling.domain[0]
					var endIndex = GoUtilities.FindSortedInsertionPointWithKey(graph.data, 
													"DateTime", scaling.domain()[1], dateComparer); // Determine last index where graph's data's order property is less than scaling.domain[1]

					var data = null;
					if (endIndex) {
						
						data = graph.data.splice(0, endIndex).splice(startIndex);
						
					} else {
						
						data = graph.data.splice(startIndex);
					}
					
					graph.data = data;
					
					var dates = data.map(function(element) {
									
									return { DateTime: (new Date(element.DateTime)).getTime()}; 
								});
					
					d3.range(layoutConfiguration.graphRegion.width).forEach(function(px) {
						
						var dt = scaling.invert(px);
						var foundIndex = (GoUtilities.FindSortedInsertionPointWithKey(
												dates.slice(cursorIndex), "DateTime", 
												dt, dateComparer) || 0);
						var dataIndex = cursorIndex + foundIndex;
						
						if (dataIndex < data.length) {
							
							if (dataIndex > 0) {
								var left = (new Date(data[dataIndex - 1].DateTime)).getTime();
								var right = (new Date(data[dataIndex].DateTime)).getTime();
								
								if ((dt-left) < (right-dt)) {
									
									--dataIndex;
								}
								
								map.push({date: data[dataIndex].DateTime, idx: dataIndex});
							}
							
							cursorIndex = dataIndex;
						}
						
						return;
					});
					
					
					return map;
				};
				
				
				var addGraph = function addGraph(graph) {
					
					console.log("ChartManager::addGraph called...");
					
					var dates = graph.data.map(function mapper(element, index, arr) {
						var results = element.DateTime ? element.DateTime : null;
						
						return results;
					});
					
					var min = (new Date(dates[0])).getTime();
					var max = (new Date(dates[dates.length - 1])).getTime();
					
					var stretched = false;
					
					if ((min < xDomain[0]) 
							|| (xDomain[0] == Number.POSITIVE_INFINITY)){
						
						xDomain[0] =  min;
						
						stretched = true;
					}
					if ((max > xDomain[1])
							|| (xDomain[1] == Number.NEGATIVE_INFINITY)) {
					
						xDomain[1] = max;
						
						stretched = true;
					}
					
					xScale.domain(xDomain);
					
					graph.order = graphs.length;
					
					graphs.push(graph);
					
					if (stretched) {
						
						graphs.forEach(function (g) {
							
							g.map = getLookupMap(g, xScale);
						});
					} else {
						
						graph.map = getLookupMap(graph, xScale);
					}
					

					var zoomScale = d3.time.scale().range([0, elementWidth]).domain(xScale.domain());
					brush = d3.svg.brush()
									.x(zoomScale)
									.on('brushend', function () {
										
										xScale.domain(brush.empty() ? xDomain : brush.extent());
										
										zoomAsynchronously(function () {
											
											render();
											return;
										});
									});
					
					d3.select(GoUtilities.GenerateIdentifierSelector(
									GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "xAxis")))
										.call(brush)
										.selectAll("rect")
										.attr("y", -10)
										.attr("height", 20);
					
					adjustChartHeight();
					
					if (graph.render) {
						render();
					}
					
					return;
				};
				
				var removeGraph = function removeGraph(graphId) {
					
					console.log("ChartManager::removeGraph called...");
					
					graphs = graphs.filter(function (element) {
										
										return element.id !== graphId;
									})
								.sort(function (a, b) {
										
										return a.order - b.order;
									})
								.forEach(function (element, i) {
									
										element.order = i;
										
										return;
									});
					
					adjustChartHeight();
					
					render();
					
					return;
				};
				
				var reorderGraph = function reoderGraph(graphId, direction) {
					
					console.log ("ChartManager::reorderGraph called....");
					
					var index = GoUtilites.FindIndexByKeyValue(graphs, "id", graphId);
					
					if (null != index) {
						
						if ("up" === direction) {
							
							var reorderedPosition = (graphs[index].order - 1);
							
							if (0 <= reorderedPosition) {
								
								var prv = GoUtilities.FindIndexByKeyValue(graphs, "order", reorderedPosition, dateComparer);
								
								// This conditional may be optional.  It depends on if the order value is 
								// correctly maintained with each add/remove call...
								if (null != prv) {
									
									graphs[prv].order++;
								}
								
								graphs[index].order = reorderedPosition;
							}
							
						} else if ("down" === direction ) {
							
							var reorderedPosition = (graphs[index].order + 1);
							
							// See comment in the 'up' direction handler conditional.
							if (reorderedPosition < graphs.length) {
							
								var nt = GoUtilities.FindIndexByKeyValue(graphs, "order", reorderedPosition, dateComparer);
								
								if (null != nt) {
									
									graphs[nt].order--;
								}
								
								graphs[index].order = reorderedPosition;
							}
							
						} else {
							
							console.log("ChartManager::reorderGraph called with invalid 'direction' parameter: '" 
									+ direction  + "'");
							
							throw new TypeError("ReorderGraph call parameter 'direction' (" 
													+ direction + ") invalid", "TimeSeriesCharts");
						}
						
					} else {
						
						console.log("ChartManager::reorderGraph passed a non-existing graph with id: " + graphId);
					}
					
					return;
				};
				
				var render = function render(component) {
					
					console.log("ChartManager::render called...");
					
					var graphsComponents = chartCanvas.selectAll(".graph")
													.data(graphs, function (d) {
														
															return d.id;
														});
					
					var xAxis = d3.svg.axis().scale(xScale).orient("top").ticks(5);
					d3.select(".x.axis").call(xAxis);
					
					graphsComponents.exit().remove();
					
					graphsComponents.each(function (d) {
						
						var g = d3.select(this);
												
						g.transition().duration(layoutConfiguration.graphRegion.duration)
										.attr("transform", function (d) {
												
												var tx = layoutConfiguration.margins.left 
																- layoutConfiguration.containerProperties.padding;
												
												if ("analog" === d.type) {
													
													tx = layoutConfiguration.analog.graphTransform();
													
												} else if ("digital" === d.type) {
													
													tx = layoutConfiguration.digital.graphTransform();
													
												} else if ("horizon" === d.type) {
													
													tx = layoutConfiguration.horizon.graphTransform();
												} else if ("scatter" === d.type) {
													
													tx = layoutConfiguration.scatter.graphTransform();
												}
												
												var ty = layoutConfiguration.margins.horizontalMargins 
															+ layoutConfiguration.containerProperties.top;
												
												graphs.filter(function (t) {
													
															return t.order < d.order;
															
														}).forEach(function (w) {
																
																ty += graphHeight(w, 
																		layoutConfiguration.graphRegion.defaultChartHeight);
															});
												
												return "translate(" + tx + ", " + ty + ")";
											});
		
						g.call(selectChart(d));
					});
					
					var newGraphs = graphsComponents.enter()
										.insert("g", ".hover-line")
										.attr("class", "graph")
										.attr("transform", function (d) {
												
												var tx = layoutConfiguration.margins.left 
																- layoutConfiguration.containerProperties.padding;
												
												if ("analog" === d.type) {
													
													tx = layoutConfiguration.analog.graphTransform();
													
												} else if ("digital" === d.type) {
													
													tx = layoutConfiguration.digital.graphTransform();
													
												} else if ("horizon" === d.type) {
													
													tx = layoutConfiguration.horizon.graphTransform();
												} else if ("scatter" === d.type) {
													
													tx = layoutConfiguration.scatter.graphTransform();
												}
												

												var ty = layoutConfiguration.margins.horizontalMargins 
															+ layoutConfiguration.containerProperties.top;
												
												graphs.filter(function (t) {
													
															return t.order < d.order;
														}).forEach(function (w) {
																
																ty += graphHeight(w, 
																		layoutConfiguration.graphRegion.defaultChartHeight);
															});
												
												return "translate(" + tx + ", " + ty + ")";
											});
					
					newGraphs.each(function (d) {

							d3.select(this).call(function () { 
								
								selectChart(d)(this); 
	
								return;
							}); 
							
							return;
						});
					
					return;
				};
				
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function ChartManager(instancePrefix, containerId, layout) {
			
						console.log("ChartManager::ChartManager called...");
						
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
					};
					
				var methods = {
						addGraph: addGraph,
						removeGraph: removeGraph,
						reorderGraph: reorderGraph,
						render: render,
						AddChartClickedEventHandler: addChartClickedEventHandler,
						RemoveChartClickeEventHandler: removeChartClickeEventHandler
				};
				var statics = {};
				
				component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
			
					
				return component;
					
			}());
			
			console.log("ChartManager::loadChartManager loaded declaration.");
			
		} else {
			
			console.log("ChartManager::loadChartManager declaration already loaded.");
		}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadChartManager();