/*==================================
    
    JSCruise Timer Manager
    By Daesup, Lee

====================================*/

// THIS IS SINGLETON OBJECT! Instanciation in opGlobal.js

YAHOO.log ("opTimer.js :: Script file start loading");
var _OPTimer = function () {
	this.baseDict = new Array();
};

_OPTimer.prototype.AddInterval = function (key, execFn, miliseconds, obj)
{
	this.RemoveInterval(key);
	var intervalID = window.setInterval (execFn, miliseconds, obj);
	this.baseDict.push({'key' : key, 'intervalID' : intervalID});
};

_OPTimer.prototype.AddTimeout = function (key, execFn, miliseconds, obj)
{
	var _execFn = function (timerObj)
	{
		execFn(obj);
		timerObj.RemoveInterval(key);
	};
	var intervalID = window.setTimeout (_execFn, miliseconds, this);
	this.baseDict.push({'key' : key, 'intervalID' : intervalID});
};

_OPTimer.prototype.Get = function (key)
{
	for (var i = 0; i < this.baseDict.length; i++)
	{
		if (this.baseDict[i]['key'] == key)
			return this.baseDict[i]['intervalID'];
	}
	return null;
};

_OPTimer.prototype.RemoveInterval = function (key)
{
	var intervalID = 0;
	var i = 0;
	var found = false;
	
	for (i = 0; i < this.baseDict.length; i++)
	{
		if (this.baseDict[i]['key'] == key)
		{
			intervalID = this.baseDict[i]['intervalID'];
			found = true;
			break;
		}
	}
	
	if (found){
		window.clearInterval(intervalID);
		this.baseDict[i] = null;
		this.baseDict.splice(i, 1);
	}

};

_OPTimer.prototype.RemoveAllInterval = function ()
{
	for (var i = 0; i < this.baseDict.length; i++)
	{
		window.clearInterval(this.baseDict[i]['intervalID']);
	}
	this.baseDict.splice(0, this.baseDict.length);
};

_OPTimer.prototype.GetDestroyInterface = function (key)
{
	this.Destroy = function ()
	{
		this.RemoveInterval (key);

	};
	return this;
};

YAHOO.log ("opTimer.js :: Script file loading completed");