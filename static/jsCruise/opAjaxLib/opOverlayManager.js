/*==================================
    
    YUI Overlay Manager (Panel)
    By Daesup, Lee
    
====================================*/

// THIS IS SINGLETON OBJECT! Instanciation in opGlobal.js

YAHOO.log ("opOverlayManager.js :: Script file start loading");
var _OPOverlayManager = function ()
{
	this._yuiManager = new YAHOO.widget.OverlayManager();
	this.lastXY = [100, 100];
};

_OPOverlayManager.prototype.Register = function (panelName, panelConfig, showCallbackConfig, hideCallbackConfig)
{
	if (panelConfig.xy == null)
	{
		panelConfig.xy = (this.lastXY[0] > 500 || this.lastXY[1] > 500) ? [100, 100] : [this.lastXY[0] + 20, this.lastXY[1] + 20];
		this.lastXY = panelConfig.xy;
	}
	var newPanel = new YAHOO.widget.Panel(panelName, panelConfig);
	this._yuiManager.register (newPanel);
	newPanel.render(document.body);
	newPanel.focus();
	
	if (showCallbackConfig)
		newPanel.subscribe("show", function () { showCallbackConfig.fn(showCallbackConfig.objs);});
	
	if (hideCallbackConfig)
		newPanel.subscribe("hide", function () { hideCallbackConfig.fn(hideCallbackConfig.objs);});

	return newPanel;
};

_OPOverlayManager.prototype.Count = function ()
{
	return this._yuiManager.overlays.length;
};

_OPOverlayManager.prototype.Remove = function (id_or_ins)
{
	this._yuiManager.remove(id_or_ins);
};

_OPOverlayManager.prototype.Get = function (index)
{
	return this._yuiManager.overlays[index];
};

_OPOverlayManager.prototype.GetActive = function ()
{
	return this._yuiManager.getActive();
};

_OPOverlayManager.prototype.Find = function (id_or_ins)
{
	return this._yuiManager.find(id_or_ins);
};

_OPOverlayManager.prototype.BlurAll = function ()
{
	this._yuiManager.blurAll();
};

_OPOverlayManager.prototype.BringToTop = function ()
{
	this._yuiManager.bringToTop();
};

_OPOverlayManager.prototype.Focus = function ()
{
	this._yuiManager.focus();
};

_OPOverlayManager.prototype.ShowAll = function ()
{
	this._yuiManager.showAll();
};

_OPOverlayManager.prototype.HideAll = function ()
{
	this._yuiManager.hideAll();
};
YAHOO.log ("opOverlayManager.js :: Script file loading completed");