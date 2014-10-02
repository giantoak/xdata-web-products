/**
 * Time Series Analog Chart Control
 */

console.log("AnalogChart.js - Loaded...");

function loadAnalogChart() {

	console.log ("AnalogChart::loadAnalogChart called...");
	
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
			|| (!window.controls.TimeSeriesCharts.AnalogChart)) {
			
			if (!window.controls) {
			
				window.controls = {};
			}
			
			if (!window.controls.TimeSeriesCharts) {
				
				window.controls.TimeSeriesCharts = {};
			}
			
	
			// Explicitly define the contents of the namespace
			window.controls.TimeSeriesCharts.AnalogChart = (function GiantOakControlsNamespace() {
				
				console.log("TimeSeriesCharts::GiantOakControlsNamespace called...");
				
				// Determining if Giant Oak Utilities namespace has been defined is a 
				// Special case and needs to come first as it provides a lot of basic
				// functionality used in the rest of libraries developed by Giant Oak.
				if ((isEmpty(window.utilities))
						|| (!window.utilities)) {
						
					loadUtilitiesModule();
				}				
				
				if ((isEmpty(window.controls.TimeSeriesCharts.ChartManager))
						|| (!window.controls.TimeSeriesCharts.ChartManager)) {
						
					loadChartManager();
				}				
				

				
				var component = null;
				// Define local alias to the Utilities Namespace.
				var GoUtilities = window.utilities;	
				var GoAbstractControls = window.utilities.controls;
				var prefix = null;
				var containerPrefix = null;
				var layoutConfiguration = null;
				var height = 100;
				var gap = 10;
				var xValue = function (d) { 
					return d[0].getTime(); 
					};
				var yDomain = null;
				var xScale = null;
				var color = d3.scale.category10();
				var yRangeAccessor = null;
				var id = null;

				function X(d) {
					
					var value = (new Date(xValue(d))).getTime();
					var results = xScale(value);
					
					return results;
				}
				
				var idProperty = function idProperty(value) {
					
					var results = id;
					
					if (arguments.length) {
						
						id = value;
						
						results = this;
					}
					
					return results;
				};
				
				var timeScaleProperty = function timeScale(value) {
					
					var results = xScale;
					
					if (arguments.length) {
						
						xScale = value;
						
						results = this;
					}
					
					return results;
				};
				
				var xProperty = function (value) {
					
					var results = xValue;
					
					if (arguments.length) {
						
						xValue = value;
						
						results = this;
					}
					
					return results;
				};
				
				var heightProperty = function (value) {
					
					var results = height;
					
					if (arguments.length) {
						
						height = value;
						
						results = this;
					}
					
					return results;
				};
				
				var gapProperty = function (value) {
					
					var results = gap;
					
					if (arguments.length) {
						
						gap = value;
						
						results = this;
					}
					
					return results;
				};
				
				var colors = function (value) {
					
					var results = color;
					
					if (arguments.length) {
						
						color = value;
						
						results = this;
					}
					
					return results;
				};
				
				function handleUninitialized(g, d) {
					
					var minY = d3.min(d.data, function (element) {
						// Scans all the elements in Data returning
						// an array of minimum values.
						return d3.min(d.yVal.map(function (c) { 
								// Returns all the important properties of the elements of Data
								return element[c]; 
							}));
					});
					
					var maxY = d3.max(d.data, function (element) {
						return d3.max(d.yVal.map(function (c) { 
								return element[c]; 
							}));
					});
					
					yDomain = new Array(minY, maxY);
					
					// Sets up the display area as 4th quadrant 
					yRangeAccessor = d3.scale.linear().domain(yDomain).range(new Array((height - gap), 0));
					
					var yAxis = d3.svg.axis().scale(yRangeAccessor).orient("left").ticks(5);
					
					// remove all the 'existing' children of the graph
					g.selectAll("g.y.axis").remove();
					
					g.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id))
						.append("g")
							.attr("class", "y axis")
							.attr("transform", "translate(-1, 0)")
							.call(yAxis);

					return { yDomain: yDomain, y: yRangeAccessor };
				}
				
				var init = function init(selection) {
					
					selection.each (function (d) {
						
						if ("analog" === d.type) {
							
							var g = d3.select(this);
							var chartConfig = this.__chart__;
							var config = null;
							
							if (chartConfig) {
								
								if (chartConfig[id]
									&& !d.updated) {
									
									config = { yDomain: chartConfig[id].yDomain, y: chartConfig[id].y };
								} else {
									
									config = handleUninitialized(g, d);
								}
							} else {
								
								this.__chart__ = {};
								config = handleUninitialized(g, d);
							}
							
							yDomain = config.yDomain;
							yRangeAccessor = config.y;
							
							d.yVal.forEach(function (c, i) {
								
								var valueLine = d3.svg.line()
													.x(function (a) {
															var results = X(a);
															return results;
														})
													.y(function (a) { 
															var results = yRangeAccessor(a[c]);
															return results; 
														});
								
								if (chartConfig) {
								
									g.select(".path." + c).transition()
											.duration(layoutConfiguration.graphRegion.duration)
												.attr("d", valueLine(d.data));
									
								} else {
									
									g.append("path")
										.attr("class", "path " + c)
										.attr("fill", "none")
										.attr("d", valueLine(d.data))
										.attr("clip-path", "url(" + GoUtilities.GenerateIdentifierSelector(
												GoUtilities.GenerateComponentSpecificIdentifiers(containerPrefix, "clip")) + ")")
										.style("stroke", color(d.id + i))
										.style("stroke-width", "1");
									
									g.append("text").text(d.name)
										.attr("class", "legend")
										.attr("x", 10)
										.attr("y", 10);
									
								}
							});
							
							this.__chart__[d.id] = config;
							d.updated = false;
						}		
					});
				};
				
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function AnalogChart(instancePrefix, parentPrefix, layout) {
			
						console.log("AnalogChart::AnalogChart called...");
						
						/**************************************************************************************
						 * Check that all required the call parameters are defined... 
					     **************************************************************************************/
						
						if (!instancePrefix) {
						
							throw new Error("Prefix argument not defined.");
						}
						
						
						if (!parentPrefix) {
						
							throw new Error("parentPrefix argument not defined.");
						}
	
						if (!layout) {
						
							throw new Error("Layout Configuration data argument not defined.");
						}
						
						prefix = instancePrefix;
						
						containerPrefix = parentPrefix;
						
						layoutConfiguration = layout;

						return;
					};
				var methods = {
						id: idProperty,						color: colors,
						x: xProperty,
						height: heightProperty,
						gap: gapProperty,
						timeScale: timeScaleProperty,
						initialize: init
				};
				var statics = {};
				
				component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
			
					
				return component;
					
			}());
			
			console.log("AnalogChart::loadAnalogChart loaded declaration.");
			
		} else {
			
			console.log("AnalogChart::loadAnalogChart declaration already loaded.");
		}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadAnalogChart();