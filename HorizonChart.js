/**
 * Horizon Chart Control
 */

console.log("HorizonChart.js - Loaded...");

function loadHorizonChart() {

	console.log ("HorizonChart::loadHorizonChart called...");
	
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
			|| (!window.controls.TimeSeriesCharts.HorizonChart)) {
			
			if (!window.controls) {
			
				window.controls = {};
			}
			
			if (!window.controls.TimeSeriesCharts) {
				
				window.controls.TimeSeriesCharts = {};
			}
			
	
			// Explicitly define the contents of the namespace
			window.controls.TimeSeriesCharts.HorizonChart = (function GiantOakControlsNamespace() {
				
				console.log("HorizonChart::GiantOakControlsNamespace called...");
				
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
	
				// Define local alias to the Utilities Namespace.
				var GoUtilities = window.utilities;	
				var GoAbstractControls = window.utilities.controls;
				var prefix = null;
				var containerPrefix = null;
				var layoutConfiguration = null;
				var bandCount = 1;
				var mode = "offset";
				var interpolate = "linear";
				var xScale = null;
				var x = d3_horizonX;
				var y = d3_horizonY;
				var width = 960;
				var height = 40;
				var gap = 10;
				var color = null;
				var id = null;
				var duration = null;
				
				var idProperty = function idProperty(value) {
					
					var results = id;
					
					if (arguments.length) {
						
						id = value;
						
						results = this;
					}
					
					return results;
				};
				
				var durationProperty = function durationProperty(value) {
					
					var results = duration;
					
					if (arguments.length) {
						
						duration = +value;
						results = this;
					} 
					
					return results;
				};
				
				var bandsProperty = function bandsProperty(value) {
					
					var results = bandCount;
					
					if (arguments.length) {
						
						bandCount = +value;
						color.domain(new Array(-bandCount, 0, 0, bandCount));
						results = this;
					}
					
					return results;
				};
				
				var modeProperty = function modeProperty(value) {
					
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
				};
				
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
				
				var gapProperty = function gapProperty(value) {
					
					var results = gap;
					
					if (arguments.length) {
						
						gap = value;
						
						height -= value;
						
						results = this;
					}
					
					return results;
				};
				
				
			var d3_horizonArea = d3.svg.area();
			var d3_horizonId = 0;
			
			function d3_horizonX(d) {
				
				var value = (new Date(xValue(d))).getTime();
				var results = xScale(value);
				
				return results;
//				return d[0].getTime();
			}
			
			function d3_horizonY(d) {
				
				return d[1];
			}
			
			function d3_horizonTransform(bands, h, mode) {
				
				var results = (mode === "offset" 
							? function offsetTransform(d) { 
					
									var dy = ((d + (d < 0) - bands) * h);
//									var dy = ((d * bands) * h);
										
										return "translate(0, " 
												+ dy + ")"; 
									}
							: function nonOffsetTransform(d) {
								
										var dy = ((d - bands) * h);
										
										return (d < 0 ? "scale(1,-1)" : "") 
												+ "translate(0," + dy + ")"; 
									});
				
				return results;
			}
			
	
			function init(selection) {
					
					console.log("HorizonChart::buildUI called...");
					selection.each(function (d, i) {
						
						if ("horizon" === d.type) {
						
							var local = d3.select(this)
												.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, d.id));
//							var n = 2 * bandCount + 1;
							var xMin = Number.POSITIVE_INFINITY;
							var xMax = Number.NEGATIVE_INFINITY;
							var yMax = Number.NEGATIVE_INFINITY;
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
							var y1 = d3.scale.linear()
											.domain(new Array(0, yMax))
												.range(new Array(0, (height * bandCount)));
							var t1 = d3_horizonTransform(bandCount, height, mode);
							
							if (this.__chart__) {
								
								if (this.__chart__[d.id]
										&& !d.updated) {
									
									var alias = this.__chart__[d.id];
									
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
							} else {
								
								this.__chart__ = {};
								x0 = x1.copy();
								y0 = y1.copy();
								t0 = t1;
								id = ++d3_horizonId;
							}
							
							local.selectAll("*").remove();
							
							var defs = local.selectAll("defs").data(new Array(null));
							
							defs.enter().append("defs").append("clipPath")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, 
																	("d3_horizon_clip" + id)))
										.append("rect")
											.attr("width", width)
											.attr("height", height);
							
							defs.select("rect").transition()
									.transition()
										.duration(layoutConfiguration.graphRegion.duration)
											.attr("width", width)
											.attr("height", height);
							
							local.selectAll("g")
									.data(new Array(null))
								.enter().append("g")
									.attr("clip-path", "url(" + GoUtilities.GenerateIdentifierSelector(
																	GoUtilities.GenerateComponentSpecificIdentifiers(
																			prefix, ("d3_horizon_clip" + id))) + ")");
	
							var pathData = d3.range(-1, -bandCount-1, -1)
												.concat(
														d3.range(1, bandCount + 1));
							var groups = local.select("g");
							var path = groups.selectAll("path")
											.data(pathData, Number);
							
							var d0 = d3_horizonArea.interpolate(interpolate)
												.x(function (d) {
														var value = (new Date(d[0])).getTime();
														var results = x0(value);
														return results; 
													})
												.y0(height * bandCount)
												.y1(function(d) { 
														var value = d[1];
														var scaledValue = y0(value);
														var results = height * bandCount - scaledValue;
														return results; 
													})
												(data);
							
							var d1 = d3_horizonArea.x(function(d) { 
														var value = (new Date(d[0])).getTime();
														var results = x1(value);
														return results; 
													})
												.y1(function(d){ 
														var value = d[1];
														var scaledValue = y0(value);
														var results = height * bandCount - scaledValue;
														return results; 
													})
												(data);
							
							path.enter().append("path")
									.style("fill", color)
									.attr("transform", t0)
									.attr("d", d0);
							
							path.transition().duration(layoutConfiguration.graphRegion.duration)
									.style("fill", color)
									.attr("transform", t1)
									.attr("d", d1);
							
							path.exit().transition()
										.duration(layoutConfiguration.graphRegion.duration)
										.attr("transform", t0)
										.attr("d", d1)
										.remove();
							
							local.append("text").text(d.name)
									.attr("class", "legend")
									.attr("x", 10)
									.attr("y", 10);
	
							this.__chart__[d.id] = { x: x1, y: y1, t: t1, id: id };
							d.updated = false;
						}
					});
					
					d3.timer.flush();
					
				};
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function HorizonChart(instancePrefix, parentPrefix, layout) {
			
						console.log("HorizonChart::HorizonChart called...");
						
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
						
						color = d3.scale.linear()
										.domain(layoutConfiguration.horizon.domain)
										.range(layoutConfiguration.horizon.range);

						
						return;
					};
					
					var methods = {
							duration: durationProperty,
							bands: bandsProperty,
							mode: modeProperty,
							color: colors,
							interpolate: interpolateFunctor,
							x: xProperty,
							y: yProperty,
							width: widthProperty,
							height: heightProperty,
							timeScale: timeScaleProperty,
							gap: gapProperty,
							initialize: init,
							id: idProperty
					};
				var statics = {};
				
				component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
					
				return component;
					
			}());
			
			console.log("HorizonChart::HorizonChart loaded declaration.");
			
		} else {
			
			console.log("HorizonChart::HorizonChart declaration already loaded.");
		}
		
		return;
	}	

/*************************************************
 * Explicitly call the Namespace Load function
*************************************************/
loadHorizonChart();