/**
 * Time Series Scatter Chart Control
 */

console.log("ScatterChart.js - Loaded...");

function loadScatterChart() {

	console.log ("ScatterChart::loadScatterChart called...");
	
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
			|| (!window.controls.TimeSeriesCharts.ScatterChart)) {
			
			if (!window.controls) {
			
				window.controls = {};
			}
			
			if (!window.controls.TimeSeriesCharts) {
				
				window.controls.TimeSeriesCharts = {};
			}
			
	
			// Explicitly define the contents of the namespace
			window.controls.TimeSeriesCharts.ScatterChart = (function GiantOakControlsNamespace() {
				
				console.log("ScatterChart::GiantOakControlsNamespace called...");
				
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
				var xScale = null;
                var height = 100;
                var gap=10;
                var xValue = function(d) { 
                					return d[0]; 
                				};
                var  color = d3.scale.category10();
                
				var id = null;

				function X(d) {
					
					var intermediate = xValue(d);
					var results = xScale(intermediate);
					
					return results;
					
//					return xScale(xValue(d));
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
						return d3.min(d.yVal.map(function (c) { 
								return element[c]; 
							}));
					});
					
					var maxY = d3.max(d.data, function (element) {
						return d3.max(d.yVal.map(function (c) { 
								return element[c]; 
							}));
					});
					
					yDomain = new Array(minY, maxY);
					
					y = d3.scale.linear().domain(yDomain).range(new Array((height - gap), 0));
					
					var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
					
					g.attr("id", d.id)
						.append("g")
							.attr("class", "y axis")
							.attr("transform", "translate(-1, 0)")
							.call(yAxis);

					return { yDomain: yDomain, y: y };
					
				}
				
				var init = function init(selection) {
					
					selection.each (function (d) {
						
						if ("scatter" === d.type) {							
							
							var g = d3.select(this)
										.attr("id", d.id);
							var chartConfig = this.__chart__;
							var config = null;
						
							if (chartConfig) {
								
								if (chartConfig[d.id]) {
									
									config = { yDomain: chartConfig[d.id].yDomain, y: chartConfig[d.id].y };
									
								} else {
									
									config = handleUninitialized(g, d);
									
								}
							} else {
								
								this.__chart__ = {};
								config = handleUninitialized(g, d);
							}
							
							yDomain = config.yDomain;
							y = config.y;
							
							d.yVal.forEach(function (c, i) {
								
								var circleGroup = null;
								
								if (chartConfig) {
								
									circleGroup = g.selectAll("circle").transition()
														.duration(layoutConfiguration.graphRegion.duration)
															.attr("cx", function (d) {
																
																	return X(d);
																})
															.attr("cy", function (d) {
																
																	return y(d.Value);
																});
								} else {
									
									g.append("text").text(d.name)
										.attr("class", "legend")
										.attr("x", 10)
										.attr("y", 10);
									
									circleGroup = g.selectAll("circle")
															.data(d.data)
														.enter()
															.append("circle")
																.attr("cx", function (d) {
																	
																		return X(d);
																	})
																.attr("cy", function (d) {
																	
																		return y(d.Value);
																	})
																.attr("class", "dots")
																.attr("r", layoutConfiguration.scatter.radius)
																.attr("color", color(d.id + i));
								}
							});
							
							this.__chart__[d.id] = config;
						}		
					});
				};


				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function ScatterChart(instancePrefix, parentPrefix, layout) {
			
						console.log("ScatterChart::ScatterChart called...");
						
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
						
						gap = layoutConfiguration.scatter.gap;
						height = layoutConfiguration.scatter.chartHeight;
						
						return;
					};
				var methods = {
						id: idProperty,
						color: colors,
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
			
			console.log("ScatterChart::loadScatterChart loaded declaration.");
			
		} else {
			
			console.log("ScatterChart::loadScatterChart declaration already loaded.");
		}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadScatterChart();