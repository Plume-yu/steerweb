/*==================================
    
       SteerError Scripts
        
====================================*/

var _SteerErrorCode = function () { this.Initialize(); }

_SteerErrorCode.prototype.Initialize = function ()
{
	this.SUCCESS = 0;
	this.CONNECTIONFAIL = 2;
	this.STEERLOGIC_SESSION_EXPIRED = 16778215;
	
	this.IsSuccess = function (returnCode)
	{
		if ((returnCode & 0x00ffffff) == 0)
			return true;
		else
			return false;
	};
}

_SteerErrorCode.prototype.GetErrorMsg = function (errorCode)
{
	var retText = l10nMsg["err_" + errorCode];
	
	if (retText == undefined || retText == null)
		retText = l10nMsg["err_nocode"];
		
	return retText + " [" + errorCode + "]";
}

var SteerErrorCode = new _SteerErrorCode();