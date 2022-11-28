/*==================================
    
    YUI Tab View Wrapper
    By Daesup, Lee
    
====================================*/

YAHOO.log ("opTabView.js :: Script file start loading");
var OPTabView = function (id, targetDiv, config)
{
    //private:
    this._id = id;
    this._targetDiv = targetDiv;
    this._config = config;

    this._tabView = new YAHOO.widget.TabView();
    this._tabView.appendTo(this._targetDiv);
};

OPTabView.prototype.AddTab = function (textLabel, contentDiv, isActive) {
	this._tabView.addTab( new YAHOO.widget.Tab({
		label: textLabel,
		contentEl: contentDiv,
		active: isActive
	}));
};

OPTabView.prototype.RemoveTab = function (tabIndex) {
	this._tabView.removeTab (this.GetTab(tabIndex));
};

OPTabView.prototype.SelectTab = function (tabIndex) {
	this._tabView.selectTab (tabIndex);
};

OPTabView.prototype.GetTab = function (tabIndex) {
	return this._tabView.getTab(tabIndex);
};

OPTabView.prototype.EventActiveTabChange = function (eventFunc) {
	this._tabView.subscribe("activeTabChange", eventFunc);
};

OPTabView.prototype.EventBeforeTabsChange = function (eventFunc) {
	this._tabView.subscribe("beforeTabsChange", eventFunc);
};

YAHOO.log ("opTabView.js :: Script file loading completed");