/**
 * Time Series Chart Control
 */

console.log("TimeSeriesCharts.js - Loaded...");

function loadTimeSeriesCharts() {

	console.log ("TimeSeriesCharts::loadTimeSeriesCharts called...");
	
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
			|| (!window.controls.TimeSeriesCharts)) {
			
			if (!window.controls) {
			
				window.controls = {};
			}
			
	
			// Explicitly define the contents of the namespace
			window.controls.TimeSeriesCharts = (function GiantOakControlsNamespace() {
				
				console.log("TimeSeriesCharts::GiantOakControlsNamespace called...");
				
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
				var prefix = null;
				var layoutConfiguration = null;
				var svg = null;
				var chartCanvas = null;
				var xScale = null;
				var xDomain = new Array(Infinity, -Infinity);
				var hoverLine = null;
				var graphs = new Array();
				var monthNames = new Array ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
				var activePlayHead = false;
				
				var horizon = function horizon() {
					
					console.log("TimeSeriesCharts::Horizon 'class constructor' called....");
					
					var bandCount = 1;
					var mode = "offset";
					var interpolate = "linear";
					var xScale = null;
					var x = d3_horizonX;
					var y = d3_horizonY;
					var w = 960;
					var h = 40;
					var gap = 10;
					var timeOut = 0;
					
					var color = d3.scale.linear()
									.domain(layoutConfiguration.horizon.domain)
									.range(layoutConfiguration.horizon.range);
					
					var duration = function duration(value) {
						
						var results = timeOut;
						
						if (arguments.length) {
							
							duration = +value;
							results = this;
						} 
						
						return results;
					};
					
					var bands = function bands(value) {
						
						var results = bandCount;
						
						if (arguments.length) {
							
							bandCount = +value;
							color.domain(new Array(-bandCount, 0, 0, bandCount));
							results = this;
						}
						
						return results;
					};
					
					var modeProperty = function mode(value) {
						
						var results = mode;
						
						if (arguments.length) {
							
							mode = value + "";
							
							results = this;
						}
						
						return results;
					};
					
					var colors = function colors(value) {
						
						var results = color.range();
						
						if (arguments.length) {
							
							color.range(value);
							
							results = this;
						}
						
						return results;
					}
					
					var interpolateFunctor = function interpolate(value) {
						
						var results = interpolate;
						
						if (arguments.length) {
							
							interpolate = value + "";
							
							results = this;
						}
						
						return results;
					};
					
					var xProperty = function xProperty(value) {
						
						var results = x;
						
						if (arguments.length) {
						
							x = value;
							
							results = this;
						}
						
						return results;
					};
					
					var yProperty = function yProperty(value) {
						
						var results = y;
						
						if (arguments.length) {
							
							y = value;
							
							results = this;
						}
						
						return results;
					};
					
					var widthProperty = function widthProperty(value) {
						
						var results = width;
						
						if (arguments.length) {
							
							width = value;
							
							results = this;
						}
						
						return results;
					};
					
					var heightProperty = function heightProperty(value) {
					
						var results = height;
						
						if (arguments.length) {
							
							height = value;
							
							results = this;
						}
						
						return results;
					};
					
					var timeScaleProperty = function timeScaleProperty (value) {
						
						var results = xScale;
						
						if (arguments.length) {
							
							xScale = value;
							
							results = this;
						}
						
						return results;
					};
					
					var gapProperties = function gapProperties(value) {
						
						var results = gap;
						
						if (arguments.length) {
							
							gap = value;
							
							h = h - value;
							
							results = this;
						}
						
						return results;
					};
					
					
					
					/**************************************************************************************
					 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
				     **************************************************************************************/
					var ctor = function HorizonTimeSeriesCharts(g) {
				
							console.log("TimeSeriesCharts::Horizon::HorizonTimeSeriesCharts called...");
							
							/**************************************************************************************
							 * Check that all required the call parameters are defined... 
						     **************************************************************************************/
							
							g.each(function (d, i) {
								
								var local = d3.select(this);
								var n = 2 * bandCount + 1;
								var xMin = Infinity;
								var xMax = -Infinity;
								var yMax = -Infinity;
								var x0 = null;
								var y0 = null;
								var id = null;
								
								var data = d.data.map(function (d, i) {
									
									var xv = x.call(this, d, i);
									var yv = y.call(this, d, i);
									
									if (xv < xMin) {
										
										xMin = xv;
									}
									
									if (xv > xMax) {
										
										xMax = xv;
									}
									
									if (-yv > yMax) {
										
										yMax = -yv;
									}
									
									if (yv > yMax) {
										
										yMax = yv;
									}
									
									return new Array(xv, yv);									
								});
								
								var x1 = xScale;
								var y1 = d3.scale.linear().domain(new Array(0, yMax)).range(new Array(0, (h * bandCount)));
								var t1 = d3_horizonTransform(bandCount, h, mode);
								
								if (this.__chart__) {
									var alias = this.__chart__;
									
									x0 = alias.x;
									y0 = alias.y;
									t0 = alias.t;
									id = alias.id;
								} else {
									x0 = x1.copy();
									y0 = y1.copy();
									t0 = t1;
									id = ++d3_horizonId;
								}
								
								var defs = g.selectAll("defs").data(new Array());
								
								defs.eneter().append("defs").append("clipPath")
												.attr("id", "d3_horizon_clip" + id)
											.append("rect")
												.attr("width", w)
												.attr("height", h);
								
								defs.select("rect").transition()
										.transition()
											.duartion(duration)
												.attr("width", w)
												.attr("height", h);
								
								g.selectAll("g")
										.data(new Array())
									.enter().append("g")
											.attr("clip-path", "url(#d3_horizon_clip" + id + ")");
								
								var path = g.select("g").selectAll("path")
												.data(d3.range(-1, -bandCount-1, -1).concat(d3.range(1, bandCount + 1)), Number);
								
								var d0 = d3_horizonArea.iterpolate(interpolate)
													.x(function (d) { return x0(d[0]); })
													.y0(h * bandCount)
													.y1(function(d) { return h * bandCount - y0(d[1])})
													(data);
								
								var d1 = d3_horizonArea.x(function(d) { return x1(d[0]); })
													.y1(function(d){ return h * bandCount - y0(d[1])})
													(data);
								
								path.enter().append("path")
										.style("fill", color)
										.style("transform", t0)
										.style("d", d0);
								
								path.transition().duration(duration)
										.style("fill", color)
										.style("transform", t1)
										.style("d", d1);
								
								path.exit().transition()
											.duration(duration)
											.attr("transform", t0)
											.attr("d", d1)
											.remove();
								
								g.append("text").text(d.name)
										.attr("class", "legend")
										.attr("x", 10)
										.attr("y", 10);

								this.__chart__ = { x: x1, y: y1, t: t1, id: id };
							});
							
							d3.timer.flush();
						};
						
					var methods = {
							duration: duration,
							bands: bands,
							mode: modeProperty,
							colors: colors,
							interpolate: interpolateFunctor,
							x: xProperty,
							y: yProperty,
							width: widthProperty,
							height: heightProperty,
							timeScale: timeScaleProperty,
							gap: gapProperty
					};
					var statics = {};
					
					var component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
				
						
					return component;					
				};

				var chartMouseHoverHandler = function chartMouseHoverHandler() {
					
					console.log("TimeSeriesCharts::chartMouseHoverHandler called...");
					
					if (0 != graphs.length) {
						
						console.log("TimeSeriesCharts::chartMouseHoverHandler called with graphs defined.");
						
						var mouse = d3.mouse(this);
						
						var mX = mouse[0] - layoutConfiguration.margins.left;
						var mY = mouse[1] - layoutConfiguration.margins.top;
						
						if ((mX > 0)
								&& (mY > 0)
									&& (mX < layoutConfiguration.graphRegion.width)) {
							
							hoverLine.style("opacity", layoutConfiguration.graphRegion.hoverLine.displayedOpacity);
							
							activePlayHead = true;
							
						} else {
							
							hoverLine.style("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
							
							activePlayHead = false;
						}
						
					} else {
						
						console.log("TimeSeriesCharts::chartMouseHoverHandler called without any graphs defined.");
						
						hoverLine.style("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
						
						activePlayHead = false;
					}
					
					return;
				};
				
				var chartMouseOutHandler = function chartMouseOutHandler() {
					
					console.log("TimeSeriesCharts::chartMouseOutHandler called...");
					
					hoverLine.style("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
					
					activePlayHead = false;
					
					return;
				};
				
				function minDistanceDate(dates, dt) {
					var results = null;
					var distance = Infinity;
					
					dates.forEach(function (d) {
						
						if (distance > Math.abs(m-dt)) {
							
							distance = Math.abs(m-dt);
							results = d;
						}
					});
					
					return results;
				}
				
				var chartMouseMoveHandler = function chartMouseMoveHandler() {
					
					console.log("TimeSeriesCharts::chartMouseMoveHandler called...");
					
					if (activePlayHead) {
						
						var mouse = d3.mouse(this);
						
						var mX = mouse[0] - layoutConfiguration.margins.left;
						var mY = mouse[1] - layoutConfiguration.margins.top;
						
						hoverLine.attr("x1", mX).attr("x2", mX);
						
						if ((mX > 0)
								&& (mY > 0)
									&& (mX < layoutConfiguration.graphRegion.width)) {
					
							var dt = xScale.invert(mX);
							var mapped = graphs.map(function mapper(element, index, arr) {
								var results = element.map[mX] ? element.map[dX].date : null;
								
								return results;
							});
							var nearestDateValue = minDistanceDate(mapped, dt);
							var graphIdsWithDataAtNearestDate = graphs.filter(function filter(element, index, arr) {
								
								var results = null;
								var flag = (d.map[mX] && (d.map[mX].date == nearestDateValue));
								
								if (flag) {
									
									results = d.map[mX].id;
								}
								
								return results;
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
								
								timeLegend.text(nearestDateValue.getDate() + " " + monthNames[nearestDateValue.getMonth()]);
								hoverLine.attr("x1", mX).attr("x2",mX);
							}						
							
						} else {
							
						}
					}
					
					return;
				};
				
			function selectChart(d) {
				
				var chart = null;
				
				if ("analog" === d.type) {
				
					
				} else if ("digital" === d.type) {
					
				} else if ("horizon" === d.type) {
					
				}
				
				if (chart) {
					
					chart.timeScale(xScale).x(function (t) { return t.DateTime.toDate(); });
				}
				
				return chart;
			}
			
			function graphHeight(d) {
				
				var results = 100;
				
				if ("analog" === d.type) {
					results = layoutConfiguration.analog.chartHeight;
				} else if ("digital" === d.type) {
					var unique = {};
					var distinct = new Array();
					
					for( var i in d.data ){
					     if( typeof(unique[i.Channel]) === "undefined"){
					      distinct.push(i.Channel);
					     }
					     unique[i.Channel] = true;
					}
					    
					var cnt = distinct.length;
					
					results = layoutConfiguration.digital.chartHeight * cnt;
				} else if ("horizontal" === d.type) {
					
					resutls = layoutConfiguration.horizontal.chartHeight;
				}
				
				return results;
			}

	
			function buildUI(containerId) {
					
					console.log("TimeSeriesCharts::buildUI called...");
					
					var elementWidth = layoutConfiguration.containerProperties.width 
											+ layoutConfiguration.margins.verticalMargins
											+ layoutConfiguration.containerProperties.padding;
					var elementHeight = layoutConfiguration.containerProperties.height
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
//											+ (2 * layoutConfiguration.containerProperties.padding))
							.attr("height", layoutConfiguration.graphRegion.height);
//											+ (2 * layoutConfiguration.containerProperties.padding));
					
					chartCanvas = svg.append("g")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "timeserieschart_ui"))
							.attr("tansform", "translate(" + layoutConfiguration.margins.left 
														+ ", " 
														+ layoutConfiguration.margins.top 
														+ ")");
					
					xScale = d3.time.scale().range([0, layoutConfiguration.graphRegion.width]);
					
					hoverLine = chartCanvas.append("svg:line")
											.attr("class", "hover-line")
											.attr("x1", layoutConfiguration.graphRegion.hoverLine.x1)
											.attr("x2", layoutConfiguration.graphRegion.hoverLine.x2)
											.attr("y1", layoutConfiguration.graphRegion.hoverLine.y1)
											.attr("y2", layoutConfiguration.graphRegion.hoverLine.y2)
//											.attr("transform", "translate(0, " 
//																	+ (layoutConfiguration.graphRegion.hoverLine.x1 * -1) 
//																	+ ")")
											.attr("stroke-width", layoutConfiguration.graphRegion.hoverLine.strokeWidth)
											.attr("stroke", layoutConfiguration.graphRegion.hoverLine.strokeColor)
											.attr("opacity", layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
					
					chartCanvas.append("g")
									.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "xAxis"))
									.attr("transform", "translate(" 
//									.attr("transform", "translate(0, " 
//											+ (layoutConfiguration.graphRegion.hoverLine.x1 * -1)
															+ (layoutConfiguration.margins.left 
																	- layoutConfiguration.containerProperties.padding)
															+ ", "
															+ (layoutConfiguration.margins.top * 1.5) 
															+ ")")
									.attr("class", "brush");
					
					chartCanvas.select(GoUtilities.GenerateIdentifierSelector(
											GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "xAxis")))
							.append("g")
								.attr("class", "x axis");
					
					var timeLegend = chartCanvas.append("text")
											.attr("class", "legend-time")
											.attr("x",  (layoutConfiguration.graphRegion.width 
															+ layoutConfiguration.margins.verticalMargins))
											.attr("y", layoutConfiguration.graphRegion.legendOffset)
											.attr("text-anchor", layoutConfiguration.graphRegion.textAnchor)
											.text("time:");

					svg.on("mouseover", chartMouseHoverHandler)
							.on("mouseout", chartMouseOutHandler)
							.on("mousemove", chartMouseMoveHandler);
				

					
					return;
				};
				
				function adjustChartHeight() {
					
					console.log ("TimeSeriesCharts::adjustChartHeight called...");
					
					var height = 0;
					
					graphs.forEach(function (element) {
						
						height += graphHeight(t);
					});
					
					var containerHeight = height + layoutConfiguration.margins.horizontalMargins;
					
					svg.attr("height", containerHeight);
					
					d3.select("#clip").select("rect")
							.attr("height", height);
					
					chartCanvas.select(".hover-line")
								.attr("y2", height + layoutConfiguration.margins.bottom); 
					
					return;
				}
				
				function zoomAsynchronously(callback) {
					
					console.log("TimeSeriesCharts::zoomAsynchronously called...");
					
					setTimeout(function () {
						
						graphs.forEach(function (element) {
							
								element.map = getLookupMap(g, xScale);
							});
						
						callback();
						
						return;
					}, 30);
					
					return;
				}
				
				function getLookupMap(graph, scaling) {
					
					console.log("TimeSeriesCharts::getLookupMap called...");
				
					var cursorIndex = 0;
					var map = new Array();
					var startIndex = GoUtilities.FindSortedInsertionPointWithKey(graph.data, "DateTime", scaling.domain()[0]);  // Determine last index where graph's data's order property is less than scaling.domain[0]
					var endIndex = GoUtilities.FindSortedInsertionPointWithKey(graph.data, "DateTime", scaling.domain()[1]); // Determine last index where graph's data's order property is less than scaling.domain[1]
					
					var data = graph.data.splice(startIndex, endIndex);
					var dates = data.map(function(element) {
									
									return d.DateTime; 
								});

					d3.range(layoutConfiguration.graphRegion.width).forEach(function(px) {
						
						var dt = scaling.invert(px);
						var dataIndex = cursorIndex + (GoUtilities.FindSortedInsertionPointWithKey(dates.slice(cursorIndex), "DateTime", dt) || 0);
						
						if (dataIndex < data.length) {
							
							if (dataIndex > 0) {
								var left = data[dataIndex - 1].DateTime;
								var right = data[dataIndex].DateTime;
								
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
					
					console.log("TimeSeriesCharts::addGraph called...");
					
					var dates = graph.data.map(function mapper(element, index, arr) {
						var results = element.DateTime ? element.DateTime : null;
						
						return results;
					});
					
					var min = dates[0];
					var max = dates[dates.length - 1];
					var stretched = false;
					
					if (min < xDomain[0]) {
						
						xDomain[0] =  min;
						
						stretched = true;
					}
					if (max > xDomain[1]) {
					
						xDomain[1] = max;
						
						stretched = true;
					}
					
					
					graph.order = graphs.length;
					
					graphs.push(graph);
					
					if (stretched) {
						
						_xScale.domain(xDomain);
						
						graphs.forEach(function (g) {
							
							g.map = getLookupMap(g, xScale);
						});
					} else {
						
						graph.map = getLookupMap(g, xScale);
					}
					
					var zoomScale = d3.time.scale().range([0, width]).domain(xDomain);
					var brush = d3.svg.brush()
									.x(zoomScale)
									.on('brushend', function () {
										
										xScale.domain(brush.empty() ? xDomain : brush.extent());
										
										d3.select(GoUtilities
														.GenerateClassSelector(
																GoUtilities
																	.GenerateComponentSpecificIdentifiers(prefix, 
																			"loader")))
											.attr("display", "block");
										
										zoomAsynchronously(function () {
											
											render();
											d3.select(GoUtilities
													.GenerateClassSelector(
															GoUtilities
																.GenerateComponentSpecificIdentifiers(prefix, 
																		"loader")))
												.attr("display", "none");
									
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
					
					console.log("TimeSeriesCharts::removeGraph called...");
					
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
					
					console.log ("TimeSeriesCharts::reorderGraph called....");
					
					var index = GoUtilites.FindIndexByKeyValue(graphs, "id", graphId);
					
					if (null != index) {
						
						if ("up" === direction) {
							
							var reorderedPosition = (graphs[index].order - 1);
							
							if (0 <= reorderedPosition) {
								
								var prv = GoUtilities.FindIndexByKeyValue(graphs, "order", reorderedPosition);
								
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
							
								var nt = GoUtilities.FindIndexByKeyValue(graphs, "order", reorderedPosition);
								
								if (null != nt) {
									
									graphs[nt].order--;
								}
								
								graphs[index].order = reorderedPosition;
							}
							
						} else {
							
							console.log("TimeSeriesCharts::reorderGraph called with invalid 'direction' parameter: '" + direction  + "'");
							
							throw new TypeError("ReorderGraph call parameter 'direction' (" + direction + ") invalid", "TimeSeriesCharts");
						}
						
					} else {
						
						console.log("TimeSeriesCharts::reorderGraph passed a non-existing graph with id: " + graphId);
					}
					
					return;
				};
				
				var render = function render() {
					
					console.log("TimeSeriesCharts::render called...");
					
					var graphsComponents = chartCanvas.selectAll(".graph")
													.data(graphs, function (d) {
														
															return d.id;
														});
					
					var xAxis = d3.svg.axis().scale(xScale).orient("top").ticks(5);
					d3.select(".x.axis").call(xAxis);
					
					graphsComponents.exit().remove();
					
					graphsComponents.each(function (d) {
						
						var g = d3.select(this);
						var tx = 0;
						
						graphs.filter(function (t) {
							
										return t.order < d.order;
									}).each(function (t) {
										tx += graphHeight(t);
									});
						
						g.transition().duration(layoutConfiguration.graphRegion.duration);
		
//						g.transition().duration(layoutConfiguration.graphRegion.duration)
//						.attr("transform", function (d) { return "translate(0, " + tx + ")"; });
//		
						g.call(selectChart(d));
					});
					
					var newGraphs = graphsComponents.enter()
										.insert("g", ".hover-line")
										.attr("class", "graph")
										;
//										.attr("transform", function (d) {
//											
//											var tx = 0;
//											
//											graphsComponents.filter(function (t) {
//												
//													return t.order < d.order;
//											}).each( function (t) {
//												
//												tx += graphHeight(t);
//											});
//											
//											return "translate(0, " + tx + ")";
//										});
					
					newGraphs.each(function (d) {
						
						d3.select(this).call(selectChart(d));
					});
					
					return;
				};
				
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function TimeSeriesCharts(instancePrefix, containerId, layout) {
			
						console.log("TimeSeriesCharts::TimeSeriesCharts called...");
						
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
						Horizon: horizon
				};
				var statics = {};
				
				var component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
			
					
				return component;
					
			}());
			
			console.log("TimeSeriesCharts::loadTimeSeriesCharts loaded declaration.");
			
		} else {
			
			console.log("TimeSeriesCharts::loadTimeSeriesCharts declaration already loaded.");
		}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadTimeSeriesCharts();