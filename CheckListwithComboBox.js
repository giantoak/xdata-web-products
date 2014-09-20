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
				
				var prefix = null;
				var layoutConfiguration = null;
				var svg = null;
				var chartSelectionEventHandler = new GoAbstractControls.EventHandlerManagement();
				var chartTypeSelectionEventHandler = new GoAbstractControls.EventHandlerManagement();
				var dropDownContext = null;
				
				var addChartTypeSelectionChangedEventHandler = function addChartTypeSelectionChangedEventHandler(handler) {
					
					chartTypeSelectionEventHandler.addHandler(handler);
					
					return;
				};
				
				var removeChartTypeSelectionChangedEventHandler = function removeChartTypeSelectionChangedEventHandler(handler) {
					
					chartTypeSelectionEventHandler.removeHandler(handler);
					
					return;
				};
				
				var addDataSetSelectionChangedEventHandler = function addDataSetSelectionChangedEventHandler(handler) {
					
					chartSelectionEventHandler.addHandler(handler);
					
					return;
				};
				
				var removeDataSetSelectionChangedEventHandler = function removeDataSetSelectionChangedEventHandler(handler) {
					
					
					chartSelectionEventHandler.removeHandler(handler);
					
					return;
				};
				
				var onDropDown = function dropDownHandler() {
					
					var datum = d3.select(this).datum();
					
					console.log("CheckListwithComboBox::dropDownHandler called...");
					var idSelector = GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(
									prefix, ("option_dropdown_" + datum)));
					var classSelector = GoUtilities.GenerateClassSelector(GoUtilities.GenerateComponentSpecificIdentifiers(
							prefix, "additionOptions")) 
							+  GoUtilities.GenerateClassSelector(GoUtilities.GenerateComponentSpecificIdentifiers(
									prefix, ("additionOptions_" + datum)));
					
					
					d3.selectAll(idSelector).attr("visibility", "visible")
																.attr("width", 
																			layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.openWidth);
					
					d3.selectAll(classSelector).attr("visibility", "visible");
					
					return;
				};
				
				var onRollUp = function () {
					
					console.log("CheckListwithComboBox::onRollUp Called...");
					
					var datum = d3.select(this).datum();
					
					rollUpHandler(datum);
					
					return;
				}
				
				var rollUpHandler = function (datum) {
					
					console.log("CheckListwithComboBox::onRollUpHandler called..." + datum);
					
					var idSelector = GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(
									prefix, ("option_dropdown_" + datum)));
					var classSelector = GoUtilities.GenerateClassSelector(GoUtilities.GenerateComponentSpecificIdentifiers(
							prefix, "additionOptions")) 
							+  GoUtilities.GenerateClassSelector(GoUtilities.GenerateComponentSpecificIdentifiers(
									prefix, ("additionOptions_" + datum)));
					
					d3.selectAll(idSelector).attr("visibility", "hidden")
																.attr("width", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.closedWidth);
					d3.selectAll(classSelector).attr("visibility", "hidden");
									
					return;
				};
				
				
				var onOptionSelected = function () {

					var datum = d3.select(this).datum();
					
					console.log("CheckListwithComboBox::onOptionSelected called...");

					
					var instance = d3.select(this);
					var idSelector = GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(
									prefix, ("selected_option_"  + datum)));
					var selected = d3.select(idSelector);					
					var instanceOption = instance.text();
					var selectedOption = selected.text();
					var dataSet = layoutConfiguration.dataSets[datum];
					
					console.log("CheckListwithComboBox::onOptionSelected User changed graph style for " + datum + " from: '" + selectedOption + "' to '" + instanceOption + "'");

					instance.text(selectedOption);
					selected.text(instanceOption);

					// needs to call event handler manager to update rest of 
					// graphs (Same Set Different Style)
					
					chartTypeSelectionEventHandler.fireHandlers(component, dataSet, selectedOption);
					
					rollUpHandler(datum);

					return;
				};
				
				
				
				var dataSetSelectorClicked = function (d) {
					
					var instance = d3.select(this);
					var datum = d3.select(this).datum();
					var color = "none";
					var dataSet = layoutConfiguration.dataSets[d];
					var idSelector = GoUtilities.GenerateIdentifierSelector(
							GoUtilities.GenerateComponentSpecificIdentifiers(
									prefix, ("selected_option_"  + datum)));
					var selected = d3.select(idSelector);					
					
					if ("white" === instance.attr("fill")) {
						
						color = "cyan";
					} else {
						
						color = "white";
					}
					
					// Record the user's preferred state for this dataset
					instance.attr("fill", color);

					// Raise the notification event that a Data Set was select/unselected...
					chartSelectionEventHandler.fireHandlers(component, 
													dataSet, (color !== "white"),
													selected);
					
					return;
				};
				
				function generateDropDownOption (element, chartIndex) {
					
					var index = dropDownContext.idx;
					var container = dropDownContext.context;
					var visibility = (chartIndex 
										? "hidden" 
										: "visible");
					var cssClass = (chartIndex 
										?  GoUtilities.GenerateComponentSpecificIdentifiers(
														prefix, "additionOptions") 
												+ " "
												+  GoUtilities.GenerateComponentSpecificIdentifiers(
														prefix, ("additionOptions_" + index)) 
										: GoUtilities.GenerateComponentSpecificIdentifiers(
												prefix, "selected_option"));
					var id = (chartIndex 
										? GoUtilities.GenerateComponentSpecificIdentifiers(
												prefix, ("additional_options_" + index + "_" + chartIndex))
										: GoUtilities.GenerateComponentSpecificIdentifiers(
												prefix, ("selected_option_" + index)));
					var width = (chartIndex
										? layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.optionWidth
										: layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.itemWidth);
					
					container.append("text").text(element)
								.attr("x", ((width * chartIndex) 
											+ layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.xOffset) + "")
								.attr("y", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.y)
								.attr("height", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.height)
								.attr("stroke", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuOptionsProperties.strokeColor)
								.attr("fill", layoutConfiguration.optionProperties.textColor)
								.style("font-family", layoutConfiguration.optionProperties.fontFamily)
								.style("font-size", layoutConfiguration.optionProperties.fontSize)
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
					
					// Add the container for List Item
					var container = d3.select(optionsContainerSelector).append("g")
													.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
																								prefix, ("option_" + index)))
													.attr("transform", "translate(" 
																			+ layoutConfiguration.optionProperties.translate.x 
																			+ ", " 
																			+ layoutConfiguration.optionProperties.translate.y(index)
																			+ ")");
					
					// Add the Item Container Background
					container.append("rect").attr("x", layoutConfiguration.optionProperties.x)
											.attr("y", layoutConfiguration.optionProperties.y)
											.attr("width", layoutConfiguration.optionProperties.width)
											.attr("height", layoutConfiguration.optionProperties.height)
											.attr("fill", layoutConfiguration.optionProperties.fillColor)
											.attr("stroke", layoutConfiguration.optionProperties.strokeColor)
											.attr("stroke-width", layoutConfiguration.optionProperties.strokeWidth)
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													prefix, ("option_outline_" + index)));
					
					// Add the 'Checkbox' element to the Item
					container.append("rect").attr("x", layoutConfiguration.optionProperties.checkBoxProperties.x)
											.attr("y", layoutConfiguration.optionProperties.checkBoxProperties.y)
											.attr("width", layoutConfiguration.optionProperties.checkBoxProperties.width)
											.attr("height", layoutConfiguration.optionProperties.checkBoxProperties.height)
											.attr("fill", layoutConfiguration.optionProperties.checkBoxProperties.fillColor)
											.attr("stroke", layoutConfiguration.optionProperties.checkBoxProperties.strokeColor)
											.attr("stroke-width", layoutConfiguration.optionProperties.checkBoxProperties.strokeWidth)
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													prefix, ("option_selector_" + index)))
											.attr("visibility", "visible")
											.datum(index)
											.on("click", dataSetSelectorClicked);
					
					// Add Item Label
					container.append("text").text(data)
											.attr("x", layoutConfiguration.optionProperties.labelPosition.x)
											.attr("y", layoutConfiguration.optionProperties.labelPosition.y)
											.attr("visibility", "visible")
											.attr("fill", layoutConfiguration.optionProperties.textColor)
											.attr("stroke", layoutConfiguration.optionProperties.strokeColor)
											.attr("font-family", layoutConfiguration.optionProperties.fontFamily)
											.attr("font-size", layoutConfiguration.optionProperties.fontSize);
					
					// Add Display Style Item Container
					container.append("rect").attr("x", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.x)
											.attr("y", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.y)
											.attr("width", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.width)
											.attr("height", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.height)
											.attr("fill", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.fillColor)
											.attr("stroke", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.strokeColor)
											.attr("stroke-width", layoutConfiguration.optionProperties.comboBoxProperties.itemsContainerProperties.strokeWidth)
											.attr("class", "option_item")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													prefix, ("option_item_" + index)))
											.attr("visibility", "visible")
											.datum(index);
					
					// Add Dropdown Trigger Widget
					container.append("rect").attr("x", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.x)
											.attr("y", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.y)
											.attr("width", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.width)
											.attr("height", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.height)
											.attr("fill", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.fillColor)
											.attr("stroke", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.strokeColor)
											.attr("stroke-width", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuButtonProperties.strokeWidth)
											.attr("class", "option_styler")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													prefix, ("option_styler_" + index)))
											.attr("visibility", "visible")
											.datum(index)
											.on("mouseover", onDropDown)
											.on("click", onDropDown);
					
					// Add Dropdown Menu
					container.append("rect").attr("x", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.x)
											.attr("y", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.y)
											.attr("width", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.width)
											.attr("height", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.height)
											.attr("fill", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.fillColor)
											.attr("stroke", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.strokeColor)
											.attr("stroke-width", layoutConfiguration.optionProperties.comboBoxProperties.dropDownMenuProperties.strokeWidth)
											.attr("class", "option_dropdown")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(
													prefix, ("option_dropdown_" + index)))
											.attr("visibility", "hidden")
											.datum(index)
											.on("mouseout", onRollUp);
					
					dropDownContext = {context: container, idx: index};
					
					layoutConfiguration.chartTypes.forEach(generateDropDownOption);
											
											
					
					return;
				}
				
				function buildUI(containerId) {
					
					console.log("CheckListwithComboBox::buildUI called...");
					
					var svgElementSelector = containerId + " svg";
					
					var container = d3.select(svgElementSelector).append("g")
											.attr("id", GoUtilities.GenerateComponentSpecificIdentifiers(prefix, "options"));
					
					// Create a background for the list
					container.append("rect").attr("x", layoutConfiguration.containerProperties.x)
											.attr("y", layoutConfiguration.containerProperties.y)
											.attr("width", layoutConfiguration.containerProperties.width)
											.attr("height", (layoutConfiguration.dataSets.length 
																	* layoutConfiguration.optionProperties.height) + "")
											.attr("fill", layoutConfiguration.containerProperties.backgroundColor)
											.attr("stroke", layoutConfiguration.containerProperties.strokeColor)
											.attr("stroke-width", layoutConfiguration.containerProperties.strokeWidth);
					
					layoutConfiguration.dataSets.forEach(generateListItems);
					
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
								
								prefix = instancePrefix;
								
								layoutConfiguration = layout;
								
								buildUI(containerId);
						
								return;
							};
							
						var methods = {
								AddChartTypeSelectionChangedEventHandler : addChartTypeSelectionChangedEventHandler,
								RemoveChartTypeSelectionChangedEventHandler : removeChartTypeSelectionChangedEventHandler,
								AddDataSetSelectionChangedEventHandler : addDataSetSelectionChangedEventHandler,
								RemoveDataSetSelectionChangedEventHandler : removeDataSetSelectionChangedEventHandler
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