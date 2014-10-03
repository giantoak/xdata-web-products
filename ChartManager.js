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
				
				if ((isEmpty(window.controls))
						|| (!window.controls)
						|| (!window.controls.CheckListwithComboBox)) {
					
					loadCheckListwithComboBox();
				}
				
				
				// These can be 'class' variables
				var monthNames = new Array ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
				var component = null;
				// Define local alias to the Utilities Namespace.
				var GoUtilities = window.utilities;	
				var GoAbstractControls = window.utilities.controls;
				var GoChartControls = window.controls.TimeSeriesCharts;
				var GoControls = window.controls;

				// These need to be instance scoped
				var instanceData = {};
				
//				var prefix = null;
//				var layoutConfiguration = null;
//				var svg = null;
//				var chartCanvas = null;
//				var xScale = null;
//				var xDomain = new Array(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
//				var hoverLine = null;
//				var graphs = new Array();
//				var activePlayHead = false;
//				var elementWidth = null;
//				var elementHeight = null;
//				var logChartHeight = 100;
//				var diChartHeight = 20;
//				var color = d3.scale.category10();
//				var timeLegend = null;
//				var brush = null;
//				var dataSet = null;				
//				var chartClickedEventManagement = new GoAbstractControls.EventHandlerManagement();
//				
				
				var removeChart = function removeChart(owner) {
				
					console.log("ChartManager::removeChart called with " 
							+ owner);
								
					delete instanceData[owner];
					
					return;
				};
				
				var addDataSet = function addDataSet(owner, d) {
					
					console.log("ChartManager::addDataSet property setter called with " + owner + ", displaying: " + instanceData[owner].graphs.length + " graphs.");								
					console.log(d);
					console.log(instanceData[owner].graphs);
					
					instanceData[owner].dataSet = d.slice(0);
					
					if (instanceData[owner].graphs.length) {
						
						dups = instanceData[owner].graphs.slice(0);
						instanceData[owner].graphs = new Array();
						instanceData[owner].xDomain[0] = Number.POSITIVE_INFINITY;
						instanceData[owner].xDomain[1] = Number.NEGATIVE_INFINITY;		
						
						dups.forEach(function (graph) {
							
								graph.data = d.slice(0);
								graph.updated = true;

								addGraph(owner, graph);
							});
						
						render(owner);
					}
					
					return;
				};
				
				var addRangeId = function addRangeId(owner, rangeId) {
					
					console.log("ChartManager::addRangeId property setter called: " + rangeId);
					
					instanceData[owner]["rangeId"] = rangeId;
					
					return;
				};
				
				var addChartClickedEventHandler = function addChartClickEventHandler(owner, handler) {
					
					instanceData[owner].chartClickedEventManagement.addHandler(handler);
					
					return;
				};
				
				var removeChartClickeEventHandler = function removeChartClickedEventHandler(owner, handler) {
					
					instanceData[owner].chartClickedEventManagement.removeHandler(handler);
					
					return;
				};

				var chartTypeChangedHandler = function chartChangedHandler(sender, data, selectedOption) {
					
					console.log("ChartManager::chartChangedHandler called...");
					console.log(sender);
					console.log(data);
					console.log(selectedOption);
					
					var owner = sender.owner;

					removeGraph(owner, data.name);

					var chartConfiguration = { 
							id: data.name, 
							type: selectedOption, 
							name: data.name + "_" + selectedOption, 
							dataId: data.dataId, 
							yVal: data.yValue, 
							data: instanceData[owner].dataSet.slice(0),
							updated: true
						};

					addGraph(owner, chartConfiguration);
					
					render(owner);
					
					return;
				};
				
				var dataSetChangedHandler = function dataSetChangedHandler(sender, data, isActive, chartType) {
										
					console.log("ChartManager::dataSetChangedHandler called...");
					console.log(sender);
					console.log(data);
					console.log(isActive);
					console.log(chartType);
				
					var owner = sender.owner;
			
					if (isActive) {
						
						// Make sure the Chart Manager is actually working with the latest
						// range of data
						var rangeData = instanceData[owner].layoutConfiguration
															.subrangeSelector
															.RangeValues(instanceData[owner].rangeId);
						
						var request = "./ss_dump?start=" + Math.floor(rangeData.startOffset) 
											+ "&end=" + Math.floor(rangeData.endOffset);
							
							console.log("ChartManager::dataSetChangedHandler about to request: '" + request + "'");
							
							d3.json(request, function (error, subrange) {
								
								if (error) {
									
									console.warn(error);
								} else {
									
									console.log("ChartManager::dataSetChangedHandler::json-callback called...");
									
									instanceData[owner].dataSet = subrange.slice(0);
									
									var ext = d3.extent(instanceData[owner].dataSet, function (d) { 
														return d.date; 
													});
									
									console.log("ChartManager::dataSetChangedHandler::json-callback dataSet Range of Dates: " 
														+ ext[0] 
														+ " thru " 
														+ ext[1] 
														+ " for " 
														+ instanceData[owner].dataSet.length 
														+ " records.");
												
									// Add the Graph to the chart;
									var chartConfiguration = { 
																id: data.name, 
																type: chartType.text(), 
																name: data.name + "_" + chartType.text(), 
																dataId: data.dataId, 
																yVal: data.yValue, 
																data: instanceData[owner].dataSet.slice(0),
																updated: true
															};
									
									addGraph(owner, chartConfiguration);
									
									// force an update
									render(owner);
								}
								
								return;
							});
					} else {
						// Remove the Graph from the chart
						
						removeGraph(owner, data.name);
						
						// force an update
						render(owner);						
					}
					
					return;
				};

				var chartClickHandler = function chartClickHandler(d) {
					
					console.log("ChartManager::chartClickHandler called...");

					var owner = GoUtilities.FindInstanceData(this);
					
					var actualActivePlayHead = instanceData[owner].activePlayHead;
					
					instanceData[owner].activePlayHead = true;
					
					positionPlayHead(this, true);
					
					instanceData[owner].activePlayHead = actualActivePlayHead;
					
					return;
				};
				
				var chartMouseHoverHandler = function chartMouseHoverHandler() {
					
//					console.log("ChartManager::chartMouseHoverHandler called...");
					
					var owner = GoUtilities.FindInstanceData(this);
					
					if (0 != instanceData[owner].graphs.length) {
						
						var mouse = d3.mouse(this);
						
						var mX = mouse[0] + instanceData[owner].layoutConfiguration.margins.left;
						var mY = mouse[1] + instanceData[owner].layoutConfiguration.margins.top;
						var maxX = (instanceData[owner].layoutConfiguration.containerProperties.left 
								+ instanceData[owner].layoutConfiguration.graphRegion.width
								+ instanceData[owner].layoutConfiguration.checkListProperties.containerProperties.width);
			

						
						if ((mX > instanceData[owner].layoutConfiguration.containerProperties.left)
								&& (mY > 0)
									&& (mX < maxX)) {
							
							instanceData[owner].hoverLine.attr("opacity", instanceData[owner].layoutConfiguration.graphRegion.hoverLine.displayedOpacity);
							
							instanceData[owner].activePlayHead = true;
							
						} else {
							
							instanceData[owner].hoverLine.attr("opacity", instanceData[owner].layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
							
							instanceData[owner].activePlayHead = false;
						}
						
//						console.log("ChartManager::chartMouseHoverHandler called with graphs defined with playhead: " 
//								+ (instanceData[owner].activePlayHead ? "active" : "hidden") + ".");
						
					} else {
						
//						console.log("ChartManager::chartMouseHoverHandler called without any graphs defined.");
						
						instanceData[owner].hoverLine.attr("opacity", instanceData[owner].layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
						
						instanceData[owner].activePlayHead = false;
					}
					
					return;
				};
				
				var chartMouseOutHandler = function chartMouseOutHandler() {
					
//					console.log("ChartManager::chartMouseOutHandler called...");
					
					var owner = GoUtilities.FindInstanceData(this);
					
					instanceData[owner].hoverLine.attr("opacity", instanceData[owner].layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
					
					instanceData[owner].activePlayHead = false;
					
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
					
					var owner =  d3.select(container).datum();
					
//					console.log("ChartManager::positionPlayHead(" + triggerEvent + ", " + instanceData[owner].activePlayHead + ")");
					
					if (instanceData[owner].activePlayHead) {
						
						var mouse = d3.mouse(container);
						
						var mX = mouse[0];
						var mY = mouse[1];
						var maxX = (instanceData[owner].layoutConfiguration.containerProperties.left 
											+ instanceData[owner].layoutConfiguration.graphRegion.width
											+ instanceData[owner].layoutConfiguration.checkListProperties.containerProperties.width);
						
						instanceData[owner].hoverLine.attr("x1", mX).attr("x2", mX);
						
						if ((mX > instanceData[owner].layoutConfiguration.containerProperties.left)
								&& (mY > 0)
									&& (mX < maxX)) {
					
							var dt = instanceData[owner].xScale.invert(mX);
							var mapped = instanceData[owner].graphs.map(function mapper(element, index, arr) {
											
											var results = element.map[mX] 
															? element.map[mX].x
																	: 0;
													
											return results;
										});
							var nearestDateValue = minDistanceDate(mapped, dt);
							var nearestDateIndex = d3.min(instanceData[owner].graphs.filter(function filter(element, index) {
											
											var mappedData = element.map[mX];
											var flag = (mappedData 
															&& (mappedData.x == nearestDateValue));
											return flag;
										}).map(function map(filteredData, index) {
											
											var mappedData = filteredData.map[mX]; 
											
											return mappedData.idx;
										}));
							
							if ((null != nearestDateValue)
									&& ((nearestDateIndex
											|| (nearestDateIndex == 0)))) {
								
								d3.selectAll(".graph").data(instanceData[owner].graphs, function (d) {
									
									return d.id;
								}).each (function (d) {
									
									var g = d3.select(this);
									var str = "";
									
									if (instanceData[owner].dataSet.length != d.data.length) {
										
										instanceData[owner].dataSet = d.data.slice(0);
									}
									
									var v = d.data[nearestDateIndex];
									
									if (v) {
										
										d.yVal.forEach(function (yDim, i) {
											
											str += ((d.yVal.length == 1) 
														? (" " + v[yDim]) 
														: ((0 < i ? ", " : " ") + yDim + ": " + v[yDim]));
										});
									}
								
									g.select('.legend').text(d.id + ": " + str);
									
									return;
								});

								var ndv = new Date(nearestDateValue);
								var date = ndv.getDate();
								var month = ndv.getMonth();
								instanceData[owner].timeLegend.text(date + " " + monthNames[month]);
								instanceData[owner].hoverLine.attr("x1", mX).attr("x2",mX);
								
							} else {
								
								console.log("No 'Nearest Date Value' found Nearest Date Value:  " 
										+ (nearestDateValue ? nearestDateValue : "null???") 
										+ ", Nearest Date Index: " 
										+ ((nearestDateIndex || (nearestDateIndex == 0)) 
												? nearestDateIndex 
														: "null???" ));
								
							}						
							if (triggerEvent
									&& ((nearestDateIndex
											|| (nearestDateIndex == 0)))) {
								
								instanceData[owner].chartClickedEventManagement.fireHandlers(instanceData[owner], mX, nearestDateIndex);
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
					
//					console.log("ChartManager::chartMouseMoveHandler called...");
					
					positionPlayHead(this, false);
					
					return;
				};
				
			function selectChart(owner, d) {
				
				var chart = null;
				var width = instanceData[owner].layoutConfiguration.containerProperties.width;
				
				if ("analog" === d.type) {
				
					chart = new GoChartControls.AnalogChart(
													GoUtilities.GenerateComponentSpecificIdentifiers(instanceData[owner].prefix, 
															(d.id + "_" + instanceData[owner].graphs.length)), instanceData[owner].prefix,
															instanceData[owner].layoutConfiguration); 
					
					chart.id(d.id)
							.height(instanceData[owner].layoutConfiguration.analog.chartHeight)
							.gap(instanceData[owner].layoutConfiguration.analog.gap)
							.color(instanceData[owner].color);
					
					width = instanceData[owner].layoutConfiguration.analog.width();
					
				} else if ("digital" === d.type) {
					

					chart = new GoChartControls.DigitalChart(
													GoUtilities.GenerateComponentSpecificIdentifiers(instanceData[owner].prefix, 
															(d.id + "_"  + instanceData[owner].graphs.length)), 
																instanceData[owner].prefix,
																	instanceData[owner].layoutConfiguration);
					
					var h = graphHeight(owner, d, instanceData[owner].layoutConfiguration.digital.chartHeight 
									+ instanceData[owner].layoutConfiguration.containerProperties.padding);
					
					chart.id(d.id)
							.height(h)
							.color(instanceData[owner].color)
							.y(function (dataObject) { 
								var results = d.yVal.map(function (c) {
									
											var results = dataObject[c] ? 1 : 0;
											return results; 
										});
									
									return results;
								});
					
					width = instanceData[owner].layoutConfiguration.digital.width();

				} else if ("horizon" === d.type) {
					
					var mapped = d.data.map(function (dataObject) {
						
													var values = d.yVal.map(function (property) {
																		
																		var results = dataObject[property];
																		return results;
																	});
													var value = values.reduce(function (p, v) {
														var results = p + v;
														return results;
													});
													
													return value;
												});
					var sum = mapped.reduce(function (p, v) {
						
																var results = p + v;
																return results;
															});
					var mean = sum / d.data.length;
					
					chart = new GoChartControls.HorizonChart(
													GoUtilities.GenerateComponentSpecificIdentifiers(instanceData[owner].prefix, 
															(d.id + "_"  + instanceData[owner].graphs.length)), instanceData[owner].prefix,
															instanceData[owner].layoutConfiguration);
					
					chart.id(d.id)
							.height(instanceData[owner].layoutConfiguration.horizon.chartHeight)
							.gap(instanceData[owner].layoutConfiguration.horizon.gap)
							.y(function (dataObject) {
														var values = d.yVal.map(function (property) {
															
															var results = dataObject[property];
															return results;
														});
														var value = values.reduce(function (p, v) {
															var results = p + v;
															return results;
														});
														
														return value - mean;
												})
							.bands(instanceData[owner].layoutConfiguration.horizon.bands)
							.mode("offset");
					
					width = instanceData[owner].layoutConfiguration.horizon.width();
					
				} else if ("scatter" === d.type) {
					
					chart = new GoChartControls.ScatterChart(
												GoUtilities.GenerateComponentSpecificIdentifiers(instanceData[owner].prefix, 
														(d.id + "_"  + instanceData[owner].graphs.length)), instanceData[owner].prefix,
														instanceData[owner].layoutConfiguration);

					chart.id(d.id)
							.height(instanceData[owner].layoutConfiguration.scatter.chartHeight)
							.gap(instanceData[owner].layoutConfiguration.scatter.gap)
							.color(instanceData[owner].color);
					
					width = instanceData[owner].layoutConfiguration.scatter.width();
				}
				
				if (chart) {
					
					
					chart.timeScale(instanceData[owner].xScale).x(function (t) { 
							return t.date; 
						});
				}
				
				return chart.initialize;
			}
			
			function graphHeight(owner, d, height) {
				
				var results = height;
				
				if ("analog" === d.type) {
					results = instanceData[owner].layoutConfiguration.analog.chartHeight;
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
					
					results = (instanceData[owner].layoutConfiguration.digital.chartHeight 
									+ instanceData[owner].layoutConfiguration.containerProperties.padding) 
										* cnt;
				} else if ("horizon" === d.type) {
					
					resutls = instanceData[owner].layoutConfiguration.horizon.chartHeight;
				} else if ("scatter" === d.type) {
					resutls = instanceData[owner].layoutConfiguration.scatter.chartHeight;
				}
				
				return results;
			}

	
			function buildUI(instanceProperties, containerId) {
					
					console.log("ChartManager::buildUI called...");
					
					instanceProperties.elementWidth = layoutConfiguration.containerProperties.width 
											+ layoutConfiguration.margins.verticalMargins
											+ layoutConfiguration.containerProperties.padding;
					instanceProperties.elementHeight = layoutConfiguration.containerProperties.height
											+ layoutConfiguration.margins.horizontalMargins
											+ layoutConfiguration.containerProperties.padding;
					
					var controlContainer = d3.select(containerId).append("div")
														.attr("id", GoUtilities
																	.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, 
																			"timeserieschart_container"))
														.attr("class", "GoControlContainer")
														.datum(instanceProperties.prefix)
														.style("position", "absolute")
														.style("border", instanceProperties.layoutConfiguration.containerProperties.borders)
														.style("background-color", instanceProperties.layoutConfiguration.containerProperties.backgroundColor);
					
					instanceProperties.svg = controlContainer.append("svg")
//											.datum(instanceProperties.layoutConfiguration.iterationId)
											.attr("height", instanceProperties.elementHeight)
											.attr("width", instanceProperties.elementWidth);
					
					
					instanceProperties.svg.append("defs")
										.datum(instanceProperties.layoutConfiguration.iterationId)
									.append("clipPath")
										.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, "clip"))
									.append("rect")
										.attr("x", "0")
										.attr("y", "0")
										.attr("width", (instanceProperties.layoutConfiguration.containerProperties.left 
															+ instanceProperties.layoutConfiguration.graphRegion.width)) 
										.attr("height", instanceProperties.layoutConfiguration.graphRegion.height);
								
					instanceProperties.chartCanvas = instanceProperties.svg.append("g")
							.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, "timeserieschart_ui"))
							.attr("tansform", "translate(" + instanceProperties.layoutConfiguration.margins.left 
														+ ", " 
														+ instanceProperties.layoutConfiguration.margins.top 
														+ ")");
					
					instanceProperties.timeLegend = instanceProperties.chartCanvas.append("text")
															.attr("class", "legend_time")
															.attr("x",  ((instanceProperties.layoutConfiguration.margins.verticalMargins * 2)
																			+ instanceProperties.layoutConfiguration.checkListProperties.containerProperties.width))
															.attr("y", instanceProperties.layoutConfiguration.graphRegion.legendOffset)
															.attr("text-anchor", instanceProperties.layoutConfiguration.graphRegion.textAnchor)
															.text("time:");
										
					instanceProperties.xScale = d3.time.scale()
													.range(new Array(0,
															(instanceProperties.layoutConfiguration.containerProperties.left 
																	+ instanceProperties.layoutConfiguration.graphRegion.width))); 
					
					instanceProperties.hoverLine = instanceProperties.chartCanvas.append("svg:line")
											.attr("class", "hover-line")
											.attr("x1", instanceProperties.layoutConfiguration.graphRegion.hoverLine.x1)
											.attr("x2", instanceProperties.layoutConfiguration.graphRegion.hoverLine.x2)
											.attr("y1", instanceProperties.layoutConfiguration.graphRegion.hoverLine.y1)
											.attr("y2", instanceProperties.layoutConfiguration.graphRegion.hoverLine.y2)
											.attr("stroke-width", instanceProperties.layoutConfiguration.graphRegion.hoverLine.strokeWidth)
											.attr("stroke", instanceProperties.layoutConfiguration.graphRegion.hoverLine.strokeColor)
											.attr("opacity", instanceProperties.layoutConfiguration.graphRegion.hoverLine.hiddenOpacity);
					
					instanceProperties.chartCanvas.append("g")
									.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, "xAxis"))
									.attr("transform", "translate(" 
															+ instanceProperties.layoutConfiguration.graphRegion.xAxisXTranslate()
															+ ", "
															+ (instanceProperties.layoutConfiguration.margins.top * 1.5) 
															+ ")");
					
					instanceProperties.chartCanvas.select(GoUtilities.GenerateIdentifierSelector(
											GoUtilities.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, "xAxis")))
							.append("g")
								.attr("class", GoUtilities.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, "xAxis"));
					
					instanceProperties.svg.on("mouseover", chartMouseHoverHandler)
							.on("mouseout", chartMouseOutHandler)
							.on("mousemove", chartMouseMoveHandler)
							.on("click", chartClickHandler);

					var list = GoControls.CheckListwithComboBox;
					var listPrefix = GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceProperties.prefix, "checklistselection");
					var controls = new list(listPrefix, 
												GoUtilities.GenerateIdentifierSelector(
														GoUtilities.GenerateComponentSpecificIdentifiers(instanceProperties.prefix, 
																"timeserieschart_container")),
																instanceProperties.layoutConfiguration.checkListProperties);
					
					controls.AddChartTypeSelectionChangedEventHandler(listPrefix, chartTypeChangedHandler);
					controls.AddDataSetSelectionChangedEventHandler(listPrefix, dataSetChangedHandler);
					
					instanceProperties.checkListProperties = controls.InstanceProperties(listPrefix);
					
					instanceProperties.checkListProperties["owner"] = instanceProperties.prefix;

					return;
				};
				
				function adjustChartHeight(owner) {
					
					console.log ("ChartManager::adjustChartHeight called...");
				
					var height = 0;
					
					instanceData[owner].graphs.forEach(function (element) {
						
						height += graphHeight(owner, element, instanceData[owner].layoutConfiguration.graphRegion.defaultChartHeight);
					});
					
					var containerHeight = height + instanceData[owner].layoutConfiguration.margins.horizontalMargins 
												+ instanceData[owner].layoutConfiguration.containerProperties.height;
					
					instanceData[owner].svg.attr("height", containerHeight);
					
					d3.select("#clip").select("rect")
							.attr("height", height);
					
					instanceData[owner].chartCanvas.select(".hover-line")
								.attr("y2", containerHeight); 
					
					return;
				}
				
				function zoomAsynchronously(callback) {
					
					console.log("ChartManager::zoomAsynchronously called...");
					
					var owner = GoUtilities.FindInstanceData(this);
					
					setTimeout(function () {
						
						instanceData[owner].graphs.forEach(function (element) {
							
								element.map = getLookupMap(owner, element, instanceData[owner].xScale);
							});
						
						callback();
						
						return;
					}, 30);
					
					return;
				}
				
				var dateComparer = function (a, b) {
					
					var aValue = (new Date(a)).getTime();
					var bValue = b.getTime();
					var results = bValue - aValue;
					
					return results == 0;
				};
				
				function getLookupMap(owner, graph, scaling) {
					
					console.log("ChartManager::getLookupMap called...");
				
					var cursorIndex = 0;
					var map = new Array();
					var scale0 = scaling.domain()[0];
					var scale1 = scaling.domain()[1];
					
					console.log("scale0: " + scale0 + ", scale1: " + scale1);
					
					var startIndex = GoUtilities.FindSortedInsertionPointWithKey(graph.data, "date", 
												scale0, dateComparer);  
					var endIndex = GoUtilities.FindSortedInsertionPointWithKey(graph.data, "date", 
												scale1, dateComparer); 

					var data = null;
					if (endIndex) {
						
						data = graph.data.splice(0, endIndex).splice(startIndex);
						
					} else {
						
						data = graph.data.splice(startIndex);
					}
					
					graph.data = data;
					
					var dates = data.map(function(element) {
									
									return { date: element.date }; 
								});
					
					var maxWidth = instanceData[owner].layoutConfiguration.graphRegion.width; 
//					var maxWidth = (instanceData[owner].layoutConfiguration.containerProperties.left 
//							+ instanceData[owner].layoutConfiguration.graphRegion.width); 
					d3.range(0, maxWidth).forEach(function(px) {
						
						var dt = scaling.invert(px);
						var foundIndex = (GoUtilities.FindSortedInsertionPointWithKey(
												dates.slice(cursorIndex), "date", 
												dt, dateComparer) || 0);
						var dataIndex = cursorIndex + foundIndex;
						
						if (dataIndex < data.length) {
							
							if (dataIndex > 0) {
								var left = data[dataIndex - 1].date;
								var right = data[dataIndex].date;
								
								var leftDelta = Math.abs(dt-left);
								var rightDelta = Math.abs(dt-right);
								
								if (leftDelta < rightDelta) {
									
									--dataIndex;
								}
							}
							
							var mapping = {
												x: data[dataIndex].date, 
												idx: dataIndex
											};
							
							map.push(mapping);
						}
						
						cursorIndex = dataIndex;
						return;
					});
					
					
					return map;
				};
				
				
				var addGraph = function addGraph(owner, graph) {
					
					console.log("ChartManager::addGraph called...");
					
					var dates = graph.data.map(function mapper(element, index, arr) {
						var results = element.date ? element.date : null;
						
						return results;
					});
					
					var min = dates[0];
					var max = dates[dates.length - 1];
					
					var stretched = false;
					
					if ((min < instanceData[owner].xDomain[0]) 
							|| (instanceData[owner].xDomain[0] == Number.POSITIVE_INFINITY)){
						
						instanceData[owner].xDomain[0] =  (new Date(min)).getTime();
						
						stretched = true;
					}
					if ((max > instanceData[owner].xDomain[1])
							|| (instanceData[owner].xDomain[1] == Number.NEGATIVE_INFINITY)) {
					
						instanceData[owner].xDomain[1] = (new Date(max)).getTime();
						
						stretched = true;
					}
					
					console.log ("xDomain[0]: " + instanceData[owner].xDomain[0] + ", xDomain[1]: " + instanceData[owner].xDomain[1]);
					instanceData[owner].xScale.domain(instanceData[owner].xDomain);
					
					graph.order = instanceData[owner].graphs.length;
					
					instanceData[owner].graphs.push(graph);
					
					if (stretched) {
						
						instanceData[owner].graphs.forEach(function (g) {
							
							g.map = getLookupMap(owner, g, instanceData[owner].xScale);
						});
					} else {
						
						graph.map = getLookupMap(owner, graph, instanceData[owner].xScale);
					}
					
//					Subrange Selector provides brushing & Zooming functionality
//					var zoomScale = d3.time.scale()
//										.range([0, instanceData[owner].elementWidth])
//										.domain(instanceData[owner].xScale.domain());
//					instanceData[owner].brush = d3.svg.brush()
//									.x(zoomScale)
//									.on('brushend', function () {
//										
//										instanceData[owner].xScale.domain(instanceData[owner].brush.empty() 
//																			? xDomain 
//																				: instanceData[owner].brush.extent());
//										
//										zoomAsynchronously(function () {
//											
//											render(owner);
//											return;
//										});
//									});
//					
//					d3.select(GoUtilities.GenerateIdentifierSelector(
//									GoUtilities.GenerateComponentSpecificIdentifiers(instanceData[owner].prefix, "xAxis")))
//										.call(instanceData[owner].brush)
//										.selectAll("rect")
//										.attr("y", -10)
//										.attr("height", 20);
//					
					adjustChartHeight(owner);
					
					if (graph.render) {
						render(owner);
					}
					
					return;
				};
				
				var removeGraph = function removeGraph(owner, graphId) {
					
					console.log("ChartManager::removeGraph called...");
					
					instanceData[owner].graphs = instanceData[owner].graphs.filter(function (element) {
										
										return element.id !== graphId;
									})
								.sort(function (a, b) {
										
										return a.order - b.order;
									});
					
					instanceData[owner].graphs.forEach(function (element, i) {
									
										element.order = i;
										
										return;
									});
					
					adjustChartHeight(owner);
					
					render(owner);
					
					return;
				};
				
				var reorderGraph = function reoderGraph(owner, graphId, direction) {
					
					console.log ("ChartManager::reorderGraph called....");
					
					var index = GoUtilites.FindIndexByKeyValue(instanceData[owner].graphs, "id", graphId);
					
					if (null != index) {
						
						if ("up" === direction) {
							
							var reorderedPosition = (instanceData[owner].graphs[index].order - 1);
							
							if (0 <= reorderedPosition) {
								
								var prv = GoUtilities.FindIndexByKeyValue(instanceData[owner].graphs, "order", reorderedPosition, dateComparer);
								
								// This conditional may be optional.  It depends on if the order value is 
								// correctly maintained with each add/remove call...
								if (null != prv) {
									
									instanceData[owner].graphs[prv].order++;
								}
								
								instanceData[owner].graphs[index].order = reorderedPosition;
							}
							
						} else if ("down" === direction ) {
							
							var reorderedPosition = (instanceData[owner].graphs[index].order + 1);
							
							// See comment in the 'up' direction handler conditional.
							if (reorderedPosition < instanceData[owner].graphs.length) {
							
								var nt = GoUtilities.FindIndexByKeyValue(instanceData[owner].graphs, "order", reorderedPosition, dateComparer);
								
								if (null != nt) {
									
									instanceData[owner].graphs[nt].order--;
								}
								
								instanceData[owner].graphs[index].order = reorderedPosition;
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
				
				var render = function render(owner) {
					
					console.log("ChartManager::render called..." + instanceData[owner]);
					
					var graphsComponents = instanceData[owner].chartCanvas.selectAll(".graph")
													.data(instanceData[owner].graphs, function (d) {
														
															return d.id;
														});
					
					var xAxis = d3.svg.axis().scale(instanceData[owner].xScale).orient("top").ticks(5);
					d3.select(GoUtilities.GenerateClassSelector(
									GoUtilities.GenerateComponentSpecificIdentifiers(instanceData[owner].prefix, 
											"xAxis"))).call(xAxis);
					
					graphsComponents.exit().remove();
					
					graphsComponents.each(function (d) {
						
						var g = d3.select(this);
												
						g.transition().duration(instanceData[owner].layoutConfiguration.graphRegion.duration)
										.attr("transform", function (d) {
												
												var tx = instanceData[owner].layoutConfiguration.containerProperties.left 
																+ instanceData[owner].layoutConfiguration.margins.left 
																- instanceData[owner].layoutConfiguration.containerProperties.padding;
												
												if ("analog" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.analog.graphTransform();
													
												} else if ("digital" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.digital.graphTransform();
													
												} else if ("horizon" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.horizon.graphTransform();
												} else if ("scatter" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.scatter.graphTransform();
												}
												
												var ty = instanceData[owner].layoutConfiguration.margins.horizontalMargins 
															+ instanceData[owner].layoutConfiguration.containerProperties.top;
												
												instanceData[owner].graphs.filter(function (t) {
													
															return t.order < d.order;
															
														}).forEach(function (w) {
																
																ty += graphHeight(owner, w, 
																		instanceData[owner].layoutConfiguration.graphRegion.defaultChartHeight);
															});
												
												return "translate(" + tx + ", " + ty + ")";
											});
		
						g.call(selectChart(owner, d));
					});
					
					var newGraphs = graphsComponents.enter()
										.insert("g", ".hover-line")
										.attr("class", "graph")
										.attr("transform", function (d) {
												
												var tx = instanceData[owner].layoutConfiguration.margins.left 
																- instanceData[owner].layoutConfiguration.containerProperties.padding;
												
												if ("analog" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.analog.graphTransform();
													
												} else if ("digital" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.digital.graphTransform();
													
												} else if ("horizon" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.horizon.graphTransform();
												} else if ("scatter" === d.type) {
													
													tx = instanceData[owner].layoutConfiguration.scatter.graphTransform();
												}
												

												var ty = instanceData[owner].layoutConfiguration.margins.horizontalMargins 
															+ instanceData[owner].layoutConfiguration.containerProperties.top;
												
												instanceData[owner].graphs.filter(function (t) {
													
															return t.order < d.order;
														}).forEach(function (w) {
																
																ty += graphHeight(owner, w, 
																		instanceData[owner].layoutConfiguration.graphRegion.defaultChartHeight);
															});
												
												return "translate(" + tx + ", " + ty + ")";
											});
					
					newGraphs.each(function (d) {

							d3.select(this).call(function () { 
								
								selectChart(owner, d)(this); 
	
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
						
						instanceData[instancePrefix] = { 
															prefix: instancePrefix,
															layoutConfiguration: layout,
															svg: null,
															chartCanvas: null,
															xScale: null,
															xDomain: new Array(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
															hoverLine: null,
															graphs: new Array(),
															activePlayHead: false,
															elementWidth: null,
															elementHeight: null,
															logChartHeight: 100,
															diChartHeight: 20,
															color: d3.scale.category10(),
															timeLegend: null,
//															brush: null,
															dataSet: null,
															chartClickedEventManagement: new GoAbstractControls.EventHandlerManagement()
														};
						
						prefix = instancePrefix;
						
						layoutConfiguration = layout;
						
						buildUI(instanceData[prefix], containerId);

					};
					
				var methods = {
						addGraph: addGraph,
						removeGraph: removeGraph,
						reorderGraph: reorderGraph,
						render: render,
						AddChartClickedEventHandler: addChartClickedEventHandler,
						RemoveChartClickeEventHandler: removeChartClickeEventHandler,
						AddDataSet: addDataSet,
						AddRangeId: addRangeId,
						RemoveChart: removeChart
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