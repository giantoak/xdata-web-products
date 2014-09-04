/**
 * Digital Time Series Chart Control
 */

console.log("DigitalChart.js - Loaded...");

function loadDigitalChart() {

	console.log ("DigitalChart::loadDigitalChart called...");
	
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
			|| (!window.controls.TimeSeriesCharts.DigitalChart)) {
			
			if (!window.controls) {
			
				window.controls = {};
			}
			
			if (!window.controls.TimeSeriesCharts) {
				
				window.controls.TimeSeriesCharts = {};
			}
			
	
			// Explicitly define the contents of the namespace
			window.controls.TimeSeriesCharts.DigitalChart = (function GiantOakControlsNamespace() {
				
				console.log("DigitalChart::GiantOakControlsNamespace called...");
				
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
				var xValue = function (d) { return (new Date(d[0])).getTime(); };
				var yValue = function (d) { return d[1]; };
				var xScale = null;
				var yScale = d3.scale.linear().domain(new Array(0, 1));
				var color = d3.scale.category10();
				var line = d3.svg.line().interpolate('step-after').x(X).y(Y);
				var id = null;
				
				function X(d) {
					
					return xScale(xValue(d));
				}
				
				function Y(d) {
					
					return yScale(yValue(d));
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
				
				
				var yProperty = function (value) {
					
					var results = yValue;
					
					if(arguments.length) {
						
						yValue = value;
						
						results = this;
					}
					
					return results;
				};
				
				var colors = function (value) {
				
					var results =  color;
					
					if (arguments.length) {
						
						color = value;
						
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
				
			function handleUninitialized(g, d, data, channel, i, txHeight, yHeight) {
				
				g.append("path")
					.attr("class", "path di_" + channel)
					.attr("d", line(data))
					.attr("clip-path", "url(" + GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(containerPrefix, "chart")) + ")")
					.style("stroke", color(d.id + channel))
					.attr("transform", "translate(0, " + (i * txHeight) + ")");
				
				g.append("svg:text")
					.text(channel)
					.attr("class", "inputLabel" + channel)
					.attr("text-anchor", "end")
					.attr("transform", "translate(0, " + (i++ * txHeight + (yHeight / 2)) + ")");
			
				return i;
			}
				
			var init = function initialize(selection) {
					
					console.log("DigitalChart::initialize called...");

					selection.each(function (d) {
						
						if ("digital" === d.type) {
						
							var g = d3.select(this)
										.attr("id", d.id);
							var chartConfig = this.__chart__;						
							var noChannels = 0;
							var diGroups = {};
							d.data.forEach(function (element) {
								
								if (!(diGroups[element.Channel])) {
									
									diGroups[element.Channel] = new Array();
									
									++noChannels;
								}
								
								diGroups[element.Channel].push(element);
							});
							
							var gh = height;
							var yHeight = gh / noChannels - 5;
							yScale.range(new Array(yHeight, 0));
							var txHeight = gh / noChannels;
							
							var mapping = function (chartConfig, data, channel, i) {
	
								if (chartConfig) {
									
									if (chartConfig[d.id]) {
										
										g.select(".path.di_" + channel)
										.transition().duration(layoutConfiguration.graphRegion.duration)
											.attr("d", line(data))
											.attr("transform", "translate(0," + (i * txHeight) + ")");
								
										g.select(".inputLabel" + channel)
												.transition().duration(layoutConfiguration.graphRegion.duration)
													.attr("transform", "translate(0," + (i++ * txHeight + (yHeight / 2)) + ")");
										
									} else {
										
										i = handleUninitialized(g, d, data, channel, i, txHeight, yHeight);
									}								
								} else {
	
									chartConfig = {};
									
									i = handleUninitialized(g, d, data, channel, i, txHeight, yHeight);
								}
								
								return i;
							};
							
							if (!chartConfig) {
								
								this.__chart__ = {};
							}
								
							var i = 0;
							for (var channel in diGroups) {
								
								i = mapping(chartConfig, diGroups[channel], channel, i);
							}
															
							this.__chart__[d.id] = { update: true };
							
						}
					});

					return;
				};
				
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function DigitalChart(instancePrefix, parentPrefix, layout) {
			
						console.log("DigitalChart::DigitalChart called...");
						
						/**************************************************************************************
						 * Check that all required the call parameters are defined... 
					     **************************************************************************************/
						
						if (!instancePrefix) {
						
							throw new Error("Prefix argument not defined.");
						}						
						
						if (!parentPrefix) {
							
							throw new Error("ParentPrefix argument not defined.");
						}
						
						if (!layout) {
						
							throw new Error("Layout Configuration data argument not defined.");
						}
						
						prefix = instancePrefix;
						
						containerPrefix = parentPrefix;
						
						layoutConfiguration = layout;
						
					};
				var methods = {
						id: idProperty,
						color: colors,
						x: xProperty,
						y: yProperty,
						height: heightProperty,
						timeScale: timeScaleProperty,
						initialize: init
				};
				var statics = {};
				
				component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
			
					
				return component;
					
			}());
			
			console.log("DigitalChart::loadDigitalChart loaded declaration.");
			
		} else {
			
			console.log("DigitalChart::loadDigitalChart declaration already loaded.");
		}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadDigitalChart();