/**
 * This Javascript file acts as a template.
 */

console.log("CheckListwithComboBox.js - Loaded...");

function loadCheckListwithComboBox() {

		console.log("CheckListwithComboBox::loadCheckListwithComboBox called...");
		
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
				|| (!window.controls.CheckListwithComboBox)) {
				
			if (!window.controls) {
			
				window.controls = {};
			}
	
			
			window.controls.CheckListwithComboBox = (function GiantOakControlsNamespace() {
				
				console.log("CheckListwithComboBox::GiantOakControlsNamespace called...");
				
				/************************************************************************
				 *  Determine if the required modules are already loaded 
				 ***********************************************************************/
				
				if ((isEmpty(window.utilities))
						|| (!window.utilities)) {
						
					loadUtilitiesModule();
				}
				
				var component = null;
				
				var GoUtilities = window.utilities;
				var GoAbstractControls = window.utilities.controls;
				var GoControls = window.controls;
				
				var instanceData = {};
				
				var prefix = null;
//				var layoutConfiguration = null;
//				var svg = null;
//				var chartSelectionEventHandler = new GoAbstractControls.EventHandlerManagement();
//				var chartTypeSelectionEventHandler = new GoAbstractControls.EventHandlerManagement();
//				var dropDownContext = null;
				
				/*****************************************************************************************************************
				// TODO: Add public method to remove instanceData objects see ChartManger for implementation logic...
				*****************************************************************************************************************/			
				
				
				var addChartTypeSelectionChangedEventHandler = function addChartTypeSelectionChangedEventHandler(owner, handler) {
					
					instanceData[owner].chartTypeSelectionEventHandler.addHandler(handler);
					
					return;
				};
				
				var removeChartTypeSelectionChangedEventHandler = function removeChartTypeSelectionChangedEventHandler(owner, handler) {
					
					instanceData[owner].chartTypeSelectionEventHandler.removeHandler(handler);
					
					return;
				};
				
				var addDataSetSelectionChangedEventHandler = function addDataSetSelectionChangedEventHandler(owner, handler) {
					
					instanceData[owner].chartSelectionEventHandler.addHandler(handler);
					
					return;
				};
				
				var removeDataSetSelectionChangedEventHandler = function removeDataSetSelectionChangedEventHandler(owner, handler) {
					
					instanceData[owner].chartSelectionEventHandler.removeHandler(handler);
					
					return;
				};
				
				var fetchInstanceProperties = function fetchInstanceProperties(owner) {
					
					return instanceData[owner];
				};
				
				var onDropDown = function dropDownHandler() {
					
					console.log("CheckListwithComboBox::dropDownHandler called...");
					
					var datum = d3.select(this).datum();					
					var id = d3.select(this).attr("id");
					var owner = GoUtilities.FindInstanceData(GoUtilities.GenerateIdentifierSelector(id));
					var idSelector = GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(
									instanceData[owner].prefix, ("option_title_" + datum)));
					var selected = d3.select(idSelector).text();
					
					if (instanceData[owner].selectedCharts[selected]) {
						
						// Check if user has asked this instance to display a chart for the associated statistics 
						// If so, then display drop down menu
						var idSelector = GoUtilities.GenerateIdentifierSelector(
								GoUtilities.GenerateComponentSpecificIdentifiers(
										instanceData[owner].prefix, ("option_dropdown_" + datum)));
						var classSelector = GoUtilities.GenerateClassSelector(
												GoUtilities.GenerateComponentSpecificIdentifiers(
															instanceData[owner].prefix, "additionOptions")) 
												+  GoUtilities.GenerateClassSelector(
														GoUtilities.GenerateComponentSpecificIdentifiers(
																instanceData[owner].prefix, ("additionOptions_" + datum)));
										
						
						d3.selectAll(idSelector).attr("visibility", "visible")
												.attr("width", 
														instanceData[owner].layoutConfiguration
																	.optionProperties.comboBoxProperties
																	.dropDownMenuProperties.openWidth);
	
						d3.selectAll(classSelector).attr("visibility", "visible");

					} else {
						
						// else do thing...
						
					}

					return;
				};
				
				var onRollUp = function () {
					
					console.log("CheckListwithComboBox::onRollUp Called...");
					
					var owner =  GoUtilities.FindInstanceData(
										GoUtilities.GenerateIdentifierSelector(
													d3.select(this).attr("id")));
					var datum = d3.select(this).datum();
					
					rollUpHandler(owner, datum);
					
					return;
				};
				
				var rollUpHandler = function (owner, datum) {
					
					console.log("CheckListwithComboBox::onRollUpHandler called..." + datum);

					var idSelector = GoUtilities.GenerateIdentifierSelector(
											GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[owner].prefix, ("option_dropdown_" + datum)));
					var classSelector = GoUtilities.GenerateClassSelector(
											GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[owner].prefix, "additionOptions")) 
											+  GoUtilities.GenerateClassSelector(
													GoUtilities.GenerateComponentSpecificIdentifiers(
															instanceData[owner].prefix, 
																("additionOptions_" + datum)));
					
					d3.selectAll(idSelector).attr("visibility", "hidden")
																.attr("width", 
																		instanceData[owner].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.closedWidth);
					d3.selectAll(classSelector).attr("visibility", "hidden");
									
					return;
				};
				
				
				var onOptionSelected = function () {

					var datum = d3.select(this).datum();
					
					console.log("CheckListwithComboBox::onOptionSelected called...");

					var id = d3.select(this).attr("id");
					var owner = GoUtilities.FindInstanceData(GoUtilities.GenerateIdentifierSelector(id));
					var instance = d3.select(this);
					var idSelector = GoUtilities.GenerateIdentifierSelector(
											GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[owner].prefix, 
														("selected_option_"  + datum)));
					var selected = d3.select(idSelector);					
					var instanceOption = instance.text();
					var selectedOption = selected.text();
					var graphData = instanceData[owner].layoutConfiguration.dataSets[datum];
					
					console.log("CheckListwithComboBox::onOptionSelected User changed graph style for " + datum + " from: '" + selectedOption + "' to '" + instanceOption + "'");

					instance.text(selectedOption);
					selected.text(instanceOption);

					// needs to call event handler manager to update rest of 
					// graphs (Same Set Different Style)
					
					instanceData[owner].chartTypeSelectionEventHandler.fireHandlers(instanceData[owner], 
																				graphData, instanceOption);
					
					rollUpHandler(owner, datum);

					return;
				};
			
				var dataSetSelectorClicked = function (d) {

					var id = $(this).attr("id");
					var owner = GoUtilities.FindInstanceData(GoUtilities.GenerateIdentifierSelector(id));
					var instance = d3.select(this);
					var datum = instance.datum();
					var color = "none";
					var graphData = instanceData[owner].layoutConfiguration.dataSets[d];
					var idSelector = GoUtilities.GenerateIdentifierSelector(
										GoUtilities.GenerateComponentSpecificIdentifiers(
												instanceData[owner].prefix, ("selected_option_"  + datum)));
					var selected = d3.select(idSelector);	
					
					var titleSelector = GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(
									instanceData[owner].prefix, ("option_title_" + datum)));
					var selectedGraph = d3.select(titleSelector).text();

					
					if ("white" === instance.attr("fill")) {
						
						color = "cyan";
					} else {
						
						color = "white";
					}
					
					// Record the user's preferred state for this dataset
					instance.attr("fill", color);
					
					var chartActive = (color !== "white");

					instanceData[owner].selectedCharts[selectedGraph] = chartActive; 

					// Raise the notification event that a Data Set was select/unselected...
					// May need to reorganize logic so this occurs prior to updating 
					// the Page State (both visible and internal)
					instanceData[owner].chartSelectionEventHandler.fireHandlers(instanceData[owner], 
													graphData, chartActive, selected);
					
					return;
				};
				
				function generateDropDownOption (element, chartIndex) {
					
					var index = instanceData[prefix].dropDownContext.idx;
					var container = instanceData[prefix].dropDownContext.context;
					var visibility = (chartIndex 
										? "hidden" 
										: "visible");
					var cssClass = (chartIndex 
										?  GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, "additionOptions") 
												+ " "
												+  GoUtilities.GenerateComponentSpecificIdentifiers(
														instanceData[prefix].prefix, ("additionOptions_" + index)) 
										: GoUtilities.GenerateComponentSpecificIdentifiers(
												instanceData[prefix].prefix, "selected_option"));
					var id = (chartIndex 
										? GoUtilities.GenerateComponentSpecificIdentifiers(
												instanceData[prefix].prefix, ("additional_options_" + index + "_" + chartIndex))
										: GoUtilities.GenerateComponentSpecificIdentifiers(
												instanceData[prefix].prefix, ("selected_option_" + index)));
					var width = (chartIndex
										? instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.optionWidth
										: instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.itemWidth);
					
					container.append("text").text(element)
								.attr("x", ((width * chartIndex) 
											+ instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.xOffset) + "")
								.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.y)
								.attr("height", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.height)
								.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.strokeColor)
								.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.textColor)
								.style("font-family", instanceData[prefix].layoutConfiguration.optionProperties.fontFamily)
								.style("font-size", instanceData[prefix].layoutConfiguration.optionProperties.fontSize)
								.attr("class", cssClass)
								.attr("id", id)
								.attr("visibility",  visibility)
								.attr("width", width)
								.datum(index)
								.on("mouseover", onDropDown)
								.on("click", onOptionSelected);

					return;
				}
				
				function generateListItems(data, index) {
					
					var optionsContainerSelector = GoUtilities.GenerateIdentifierSelector(
													GoUtilities.GenerateComponentSpecificIdentifiers(
															prefix, "options"));
					
					instanceData[prefix].selectedCharts[data.name] = false;

					// Add the container for List Item
					var container = d3.select(optionsContainerSelector).append("g")
													.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
																	instanceData[prefix].prefix, ("option_" + index)))
													.attr("transform", "translate(" 
																			+ instanceData[prefix].layoutConfiguration.optionProperties.translate.x 
																			+ ", " 
																			+ instanceData[prefix].layoutConfiguration.optionProperties.translate.y(index)
																			+ ")");
					
					// Add the Item Container Background
					container.append("rect").attr("x", instanceData[prefix].layoutConfiguration.optionProperties.x)
											.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.y)
											.attr("width", instanceData[prefix].layoutConfiguration.optionProperties.width)
											.attr("height", instanceData[prefix].layoutConfiguration.optionProperties.height)
											.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.fillColor)
											.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.strokeColor)
											.attr("stroke-width", instanceData[prefix].layoutConfiguration.optionProperties.strokeWidth)
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, ("option_outline_" + index)));
					
					// Add the 'Checkbox' element to the Item
					container.append("rect").attr("x", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.x)
											.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.y)
											.attr("width", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.width)
											.attr("height", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.height)
											.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.fillColor)
											.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.strokeColor)
											.attr("stroke-width", instanceData[prefix].layoutConfiguration.optionProperties.checkBoxProperties.strokeWidth)
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, ("option_selector_" + index)))
											.attr("visibility", "visible")
											.datum(index)
											.on("click", dataSetSelectorClicked);
					
					// Add Item Label
					container.append("text").text(data.name)
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, ("option_title_" + index)))
											.attr("x", instanceData[prefix].layoutConfiguration.optionProperties.labelPosition.x)
											.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.labelPosition.y)
											.attr("visibility", "visible")
											.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.textColor)
											.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.strokeColor)
											.attr("font-family", instanceData[prefix].layoutConfiguration.optionProperties.fontFamily)
											.attr("font-size", instanceData[prefix].layoutConfiguration.optionProperties.fontSize);
					
					// Add Display Style Item Container
					container.append("rect").attr("x", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.x)
											.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.y)
											.attr("width", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.width)
											.attr("height", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.height)
											.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.fillColor)
											.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.strokeColor)
											.attr("stroke-width", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.strokeWidth)
											.attr("class", "option_item")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, ("option_item_" + index)))
											.attr("visibility", "visible")
											.datum(index);
					
					// Add Dropdown Trigger Widget
					container.append("rect").attr("x", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.x)
											.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.y)
											.attr("width", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.width)
											.attr("height", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.height)
											.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.fillColor)
											.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.strokeColor)
											.attr("stroke-width", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.strokeWidth)
											.attr("class", "option_styler")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, ("option_styler_" + index)))
											.attr("visibility", "visible")
											.datum(index)
											.on("mouseover", onDropDown)
											.on("click", onDropDown);
					
					// Add Dropdown Menu
					container.append("rect").attr("x", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.x)
											.attr("y", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.y)
											.attr("width", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.width)
											.attr("height", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.height)
											.attr("fill", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.fillColor)
											.attr("stroke", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.strokeColor)
											.attr("stroke-width", instanceData[prefix].layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.strokeWidth)
											.attr("class", "option_dropdown")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													instanceData[prefix].prefix, ("option_dropdown_" + index)))
											.attr("visibility", "hidden")
											.datum(index)
											.on("mouseout", onRollUp);
					
					instanceData[prefix].dropDownContext = {context: container, idx: index, data: data};
					
					instanceData[prefix].layoutConfiguration.chartTypes.forEach(generateDropDownOption);
											
					return;
				}
				
				function buildUI(instanceProperties, containerId) {
					
					console.log("CheckListwithComboBox::buildUI called...");
					
					var svgElementSelector = containerId + " svg";
					
					var container = d3.select(svgElementSelector).append("g")
											.attr("class", "GoControlContainer")
											.datum(instanceProperties.prefix)
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
															instanceProperties.prefix, "options"));
					
					// Create a background for the list
					container.append("rect").attr("x", instanceProperties.layoutConfiguration.containerProperties.x)
											.attr("y", instanceProperties.layoutConfiguration.containerProperties.y)
											.attr("width", instanceProperties.layoutConfiguration.containerProperties.width)
											.attr("height", (instanceProperties.layoutConfiguration.dataSets.length 
																	* instanceProperties.layoutConfiguration.optionProperties.height) + "")
											.attr("fill", instanceProperties.layoutConfiguration.containerProperties.backgroundColor)
											.attr("stroke", instanceProperties.layoutConfiguration.containerProperties.strokeColor)
											.attr("stroke-width", instanceProperties.layoutConfiguration.containerProperties.strokeWidth);
					
					instanceProperties.layoutConfiguration.dataSets.forEach(generateListItems);
					
					return;
				}
			
				
				/**************************************************************************************
				 * Define a new Giant Oak UI Control to be added to the Controls Global Collection
			     **************************************************************************************/
				var ctor = function CheckListwithComboBoxConstructor(instancePrefix, containerId, layout) {
			
								console.log("CheckListwithComboBox::CheckListwithComboBoxConstructor called...");
								
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
										chartSelectionEventHandler: new GoAbstractControls.EventHandlerManagement(),
										chartTypeSelectionEventHandler: new GoAbstractControls.EventHandlerManagement(),
										dropDownContext: null,
										selectedCharts: {}										
								};

								prefix = instancePrefix;
								
								buildUI(instanceData[instancePrefix], containerId);
						
								return;
							};
							
						var methods = {
								AddChartTypeSelectionChangedEventHandler : addChartTypeSelectionChangedEventHandler,
								RemoveChartTypeSelectionChangedEventHandler : removeChartTypeSelectionChangedEventHandler,
								AddDataSetSelectionChangedEventHandler : addDataSetSelectionChangedEventHandler,
								RemoveDataSetSelectionChangedEventHandler : removeDataSetSelectionChangedEventHandler,
								InstanceProperties: fetchInstanceProperties
						};
						var statics = {};
						
						var component = GoAbstractControls.AbstractUIControl.extend(ctor, methods, statics);	
							
						return component;
							
					}());
					
				console.log("CheckListwithComboBox::loadCheckListwithComboBox loaded declaration.");
				
			} else {
				
				console.log("CheckListwithComboBox::loadCheckListwithComboBox declaration already loaded.");
			}
				
		return;
	}	

/*************************************************
 * Explicitly call the CheckListwithComboBox Load function
*************************************************/
loadCheckListwithComboBox();