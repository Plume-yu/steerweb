/*==================================
    
    YUI ProgressBar Wrapper
    By Daesup, Lee
    
====================================*/

YAHOO.log ("opProgressBar.js :: Script file start loading");
var OPProgressBar = function (id, targetDiv, config)
{
    //private:
    this._id = id;
    this._targetDiv = targetDiv;
    this._config = config;

    this._oProgressBar = new YAHOO.widget.ProgressBar(this._config);
    this._oProgressBar.render(this._targetDiv);
};

OPProgressBar.prototype.Destroy = function (){
	this._oProgressBar.destroy();
};

OPProgressBar.prototype.SetValue = function (value) {
	this._oProgressBar.set("value", Number(value));
};

OPProgressBar.prototype.SetMaxValue = function (value) {
	this._oProgressBar.set("maxValue", Number(value));
};

OPProgressBar.prototype.SetMinValue = function (value) {
	this._oProgressBar.set("minValue", Number(value));
};

OPProgressBar.prototype.SetMax = function () {
	this._oProgressBar.set("value", this._oProgressBar.get("maxValue"));
};


YAHOO.log ("opProgressBar.js :: Script file loading completed");