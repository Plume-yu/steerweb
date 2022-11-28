	/*==================================
    
    YUI Button Wrapper
    By Daesup, Lee

====================================*/

YAHOO.log ("opButtons.js :: Script file start loading");

//====================================
var OPButton = function (_id, _label, _parentElement, _callback, _objs)
{
	this.buttonLabel = _label;
	this.id = _id;
	this.container = this.id;
	
	this.clickCallback = _callback;
	
    if (_parentElement)
    {
	    var span = document.createElement("span");
		span.id = this.container;
		_parentElement.appendChild(span);
    }
    
	this.buttonInstance = new YAHOO.widget.Button({	label: this.buttonLabel,
													id: this.id,
													container: this.container,
													onclick: {
														fn: this.clickCallback,
														obj: _objs
													}
	});
	this.buttonInstance.wrapper = this;
};

OPButton.prototype.Destroy = function (){
	this.buttonInstance.setStyle("display", "none");
	this.buttonInstance.destroy();
};

OPButton.prototype.SetText = function (text){
	this.buttonInstance.set("label", text);
};

OPButton.prototype.Disabled = function (isDisabled){
	this.buttonInstance.set("disabled", isDisabled);
};

OPButton.prototype.SetWidth = function (width){
	this.buttonInstance._button.style.width = width + "px";	
};

OPButton.prototype.SetHeight = function (height){
	this.buttonInstance._button.style.height = height + "px";
};

OPButton.prototype.SetFontBold = function (){
	this.buttonInstance._button.style.fontWeight = "bold";
};

OPButton.prototype.SetFontSize = function (size){
	this.buttonInstance._button.style.fontSize = size + "px";
};

OPButton.prototype.SetFontColor = function (color){
	this.buttonInstance._button.style.color = color;
};

OPButton.prototype.SetSize = function (width, height){
	this.SetWidth(width);
	this.SetHeight(height);
};
//====================================


//====================================							
var OPCheckedButton = function (_id, _label, _name, _parentElement, _checked, _callback, _objs)
{
	this.buttonLabel = _label;
	this.id = _id;
	this.name = _name;
	this.container = this.id;
	this.checked = _checked;
	this.checkedText = null;
	
	this.checkedCallback = _callback;
	this.objs = _objs;

    if (_parentElement)
    {
	    var span = document.createElement("span");
		span.id = this.container;
		_parentElement.appendChild(span);
    }
    
	this.buttonInstance = new YAHOO.widget.Button({	
													type: "checkbox",
													label: this.buttonLabel,
													id: this.id,
													name: this.name,
													container: this.container,
													checked: this.checked
	});
	
	this.buttonInstance.OPCheckedButton = this;
	this.buttonInstance.subscribe("checkedChange", function (event) { 
														this.OPCheckedButton.checked = event.newValue;
														var obj = this.OPCheckedButton.checkedText;
														if (obj)
														{
															if (this.OPCheckedButton.checked)
																this.set("label", obj.trueText);
															else
																this.set("label", obj.falseText);
														}
														this.OPCheckedButton.checkedCallback (event.newValue, this.OPCheckedButton.objs);
													});
};

OPCheckedButton.prototype.Destroy = function (){
	this.buttonInstance.setStyle("display", "none");
	this.buttonInstance.destroy();
};

OPCheckedButton.prototype.SetText = function (text){
	this.buttonInstance.set("label", text);
};

OPCheckedButton.prototype.SetCheckedText = function (trueText, falseText){
	this.checkedText = { trueText : trueText, falseText : falseText };
	if (this.buttonInstance.get("checked"))
		this.buttonInstance.set("label", trueText);
	else
		this.buttonInstance.set("label", falseText);
};


OPCheckedButton.prototype.Disabled = function (isDisabled){
	this.buttonInstance.set("disabled", isDisabled);
};

OPCheckedButton.prototype.GetChecked = function (){
	return this.buttonInstance.get("checked");
};

OPCheckedButton.prototype.SetChecked = function (checked) {
	this.buttonInstance.set("checked", checked);
	
};

OPCheckedButton.prototype.SetWidth = function (width){
	this.buttonInstance._button.style.width = width + "px";	
};

OPCheckedButton.prototype.SetHeight = function (height){
	this.buttonInstance._button.style.height = height + "px";
};

OPCheckedButton.prototype.SetFontBold = function (){
	this.buttonInstance._button.style.fontWeight = "bold";
};

OPCheckedButton.prototype.SetFontSize = function (size){
	this.buttonInstance._button.style.fontSize = size + "px";
};

OPCheckedButton.prototype.SetFontColor = function (color){
	this.buttonInstance._button.style.color = color;
};

OPCheckedButton.prototype.SetSize = function (width, height){
	this.SetWidth(width);
	this.SetHeight(height);
};
//====================================

//====================================
//
//	Example of _menuList
//
//	var aMenuButton5Menu = [
//
//		{ text: "One", value: 1, onclick: { fn: onMenuItemClick } },
//		{ text: "Two", value: 2, onclick: { fn: onMenuItemClick } },
//		{ text: "Three", value: 3, onclick: { fn: onMenuItemClick } }
//
//	];
//
//====================================
var OPMenuButton = function (_id, _label, _name, _parentElement, _menuObject, _menuClickCallback, _objs, opConfig)
{
	this.buttonLabel = _label;
	this.id = _id;
	this.name = _name;
	this.container = this.id + "_span";
	
	this.menuObject =_menuObject;
	this.menuClickCallback = _menuClickCallback;
	this.objs = _objs;
	this.menuMaxHeight = (opConfig && opConfig.menuMaxHeight) ? opConfig.menuMaxHeight : 0;
    
    if (_parentElement)
    {
	    var span = document.createElement("span");
		span.id = this.container;
		_parentElement.appendChild(span);
    }
		
	for (var i = 0; i < this.menuObject.length; i++)
		this.menuObject[i].onclick = { fn: function (p_sType, p_aArgs, p_oItem)	{ _menuClickCallback(p_oItem.id, p_oItem.cfg.getProperty("text"), p_oItem.value, _objs);}};
	
	this.buttonInstance = new YAHOO.widget.Button({	
													type: "menu",
													label: this.buttonLabel,
													id: this.id,
													name: this.name,
													container: this.container,										
													menu: this.menuObject,
													menumaxheight: eval(this.menuMaxHeight)
	});
};

OPMenuButton.prototype.Destroy = function (){
	this.buttonInstance.setStyle("display", "none");
	this.buttonInstance.destroy();
};

OPMenuButton.prototype.SetText = function (text){
	this.buttonInstance.set("label", text);
};

OPMenuButton.prototype.Disabled = function (isDisabled){
	this.buttonInstance.set("disabled", isDisabled);
};

OPMenuButton.prototype.SetValue = function (value){
	this.buttonInstance.set("value", value);
};

OPMenuButton.prototype.GetText = function (){
	return this.buttonInstance.get("label");
};

OPMenuButton.prototype.GetValue = function (){
	return this.buttonInstance.get("value");
};

OPMenuButton.prototype.SetWidth = function (width){
	this.buttonInstance._button.style.width = width + "px";	
};

OPMenuButton.prototype.SetHeight = function (height){
	this.buttonInstance._button.style.height = height + "px";
};

OPMenuButton.prototype.SetFontBold = function (){
	this.buttonInstance._button.style.fontWeight = "bold";
};

OPMenuButton.prototype.SetFontSize = function (size){
	this.buttonInstance._button.style.fontSize = size + "px";
};

OPMenuButton.prototype.SetFontColor = function (color){
	this.buttonInstance._button.style.color = color;
};

OPMenuButton.prototype.SetSize = function (width, height){
	this.SetWidth(width);
	this.SetHeight(height);
};
//====================================

//====================================
//
//	Example of _menuList
//
//	var aSplitButton5Menu = [
//
//		{ text: "One", value: 1, onclick: { fn: onMenuItemClick } },
//		{ text: "Two", value: 2, onclick: { fn: onMenuItemClick } },
//		{ text: "Three", value: 3, onclick: { fn: onMenuItemClick } }
//
//	];
//
//====================================
var OPSplitButton = function (_id, _label, _name, _parentElement, _callback, _menuObject, _menuClickCallback, _objs, configs)
{
	this.buttonLabel = _label;
	this.id = _id;
	this.name = _name;
	this.container = this.id + "_span";
	
	this.clickCallback = _callback;
	this.menuObject =_menuObject;
	this.menuClickCallback = _menuClickCallback;
	this.objs = _objs;
    
    if (_parentElement)
    {
	    var span = document.createElement("span");
		span.id = this.container;
		_parentElement.appendChild(span);
    }
		
	for (var i = 0; i < this.menuObject.length; i++)
		this.menuObject[i].onclick = { fn: function (p_sType, p_aArgs, p_oItem)	{ _menuClickCallback(p_oItem.id, p_oItem.cfg.getProperty("text"), p_oItem.value, _objs);}};
	
	this.buttonInstance = new YAHOO.widget.Button({	
													type: "split",
													label: this.buttonLabel,
													id: this.id,
													name: this.name,
													container: this.container,
													onclick: {
														fn: this.clickCallback,
														obj: _objs
													},										
													menu: this.menuObject
	});
};

OPSplitButton.prototype.Destroy = function (){
	this.buttonInstance.setStyle("display", "none");
	this.buttonInstance.destroy();
};

OPSplitButton.prototype.SetText = function (text){
	this.buttonInstance.set("label", text);
};

OPSplitButton.prototype.Disabled = function (isDisabled){
	this.buttonInstance.set("disabled", isDisabled);
};

OPSplitButton.prototype.SetValue = function (value){
	this.buttonInstance.set("value", value);
};

OPSplitButton.prototype.GetText = function (){
	return this.buttonInstance.get("label");
};

OPSplitButton.prototype.GetValue = function (){
	return this.buttonInstance.get("value");
};

OPSplitButton.prototype.SetWidth = function (width){
	this.buttonInstance._button.style.width = width + "px";	
};

OPSplitButton.prototype.SetHeight = function (height){
	this.buttonInstance._button.style.height = height + "px";
};

OPSplitButton.prototype.SetFontBold = function (){
	this.buttonInstance._button.style.fontWeight = "bold";
};

OPSplitButton.prototype.SetFontSize = function (size){
	this.buttonInstance._button.style.fontSize = size + "px";
};

OPSplitButton.prototype.SetFontColor = function (color){
	this.buttonInstance._button.style.color = color;
};

OPSplitButton.prototype.SetSize = function (width, height){
	this.SetWidth(width);
	this.SetHeight(height);
};
//====================================
YAHOO.log ("opButtons.js :: Script file loading completed");