/*==================================
    
    YUI Global Objects
    By Daesup, Lee
    
====================================*/

YAHOO.log ("opGlobal.js :: Script file start loading");
var CruiseGlobal = {
	ValueContainer : {},
	SetValue : function (key, value)
	{
		CruiseGlobal.ValueContainer[key] = value;
	},
	GetValue : function (key)
	{
		return CruiseGlobal.ValueContainer[key];
	},
	SHOWINFO : function (header, body, submitText, rtnFocusID){
		var msgBox = new OPMsgBox ("msgBox",
									body, 
									header,
									{isFixedCenter: true,
									isDraggable: true,
									isClose: false,
									isModal: true,
									rtnFocusID: (rtnFocusID) ? rtnFocusID : null
		         					});
		msgBox.SetButtons([	{ text: submitText, handler:function(){msgBox.OK();}, isDefault:true }]);
		msgBox.SetICON("info");
		msgBox.Show();
	},
	SHOWLOADING : null,
	SetShowLoading : function (header, innerBody) {
		CruiseGlobal.SHOWLOADING = new YAHOO.widget.Panel("showLoading_Panel",
														{ width: "240px",
														constraintoviewport: true,
														fixedcenter: true,
														close: false,
														draggable: false,
														zIndex: 500,
														modal: true,
														visible: false
														});
		CruiseGlobal.SHOWLOADING.setHeader(header);
		CruiseGlobal.SHOWLOADING.setBody(innerBody);
		CruiseGlobal.SHOWLOADING.render(document.body);
	},
	NOWLOADING : null,
	SetNowLoading : function (innerBody) {
		CruiseGlobal.NOWLOADING = new YAHOO.widget.Panel("nowLoading_Panel",
														{
														constraintoviewport: true,
														fixedcenter: false,
														close: false,
														draggable: false,
														zIndex: 500,
														modal: false,
														visible: false
														});
		CruiseGlobal.NOWLOADING.setBody(innerBody);
		CruiseGlobal.NOWLOADING.render(document.body);
		CruiseGlobal.NOWLOADING.hideMask();
	},
	IsUserAgentIE : function ()
	{
		if (YAHOO.env.ua.ie > 0)
			return true;
		else
			return false;
	},
	ExtractNumberValue : function (obj)
	{
		obj.value = CruiseGlobal.ExtractNumberString(obj.value);
	},
	ExtractASCIIValue : function (obj)
	{
		obj.value = CruiseGlobal.ExtractASCIIString(obj.value);
	},
	ExtractNumberString : function (val)
	{
		var re = /[^0-9]/gi;
		return val.replace(re, "");
	},
	ExtractASCIIString : function (val)
	{
		var re = /[^a-zA-Z0-9\-_]/gi;
		return val.replace(re, "");
	},
	Trim : function (strVal)
	{
		return YAHOO.lang.trim(strVal);
	},
	MakeItShort : function (text, len, addText)
	{
		addText = (addText == null) ? "..." : addText;
		objSub = CruiseGlobal.SubString(text, len);
		return objSub.ShortenString + ((objSub.Length > len) ? addText : "");
	},
	SubString : function (userVal, len)
	{
		var i, j = 0;
		var retVal = "";
		
		for (i = 0; i < userVal.length; i++)
		{
			val = userVal.charAt(i);
			valLen = escape(val).length;
			if (valLen > 4)
				j++;
			j++;
			
			if (j <= len)
				retVal += val;
			else
				break;
		}
		return { ShortenString : retVal, Length : j };
	},
	InjectString : function (userVal, len, injStr)
	{
		if (userVal == null)
			return userVal;
		
		var i, j = 0;
		var retVal = "";
		
		for (i = 0; i < userVal.length; i++)
		{
			val = userVal.charAt(i);
			valLen = escape(val).length;
			if (valLen > 4)
				j++;
			j++;
			
			if (j <= len)
				retVal += val;
			else{
				retVal += injStr;
				i--;
				j = 0;
			}
		}
		return retVal;
	},
	SetSaveCookieVal : function (key, value, expireDays)
	{
		var today = new Date();
		today.setDate( today.getDate() + expireDays);
		document.cookie = key + "=" + escape(value) + "; path=/; expires=" + today.toGMTString() + ";";	
	},
	GetSaveCookieVal : function (key)
	{
		var search = key + "=";
		if (document.cookie.length > 0) {
			var offset = document.cookie.indexOf(search);
			if (offset != -1) {
				offset += search.length;
				end = document.cookie.indexOf(";", offset);
				if (end == -1)
					end = document.cookie.length;
				return unescape (document.cookie.substring(offset, end));
			}
		}
		return null;
	},
	ArrayHasValue : function (array, value)
	{
		for (arrHasValIdx in array)
		{
			if (array[arrHasValIdx] == value)
				return true;
		}
		return false;
	},
	CreateElement : function (tagName, id, parentElement, className, configs)
	{
		var newElement = document.createElement(tagName);
		
		if (configs)
		{
			// Tags
			if (configs.type != null)
				newElement.type = configs.type;
			if (configs.name != null)
				newElement.name = configs.name;
			if (configs.body != null)
				newElement.innerHTML = configs.body;
			if (configs.maxlength != null)
				newElement.setAttribute("maxlength", configs.maxlength);
			if (configs.size != null)
				newElement.setAttribute("size", configs.size);
			if (configs.value != null)
				newElement.setAttribute("value", configs.value);
			if (configs.target != null)
				newElement.setAttribute("target", configs.target);
			if (configs.href != null)
				newElement.setAttribute("href", configs.href);
			if (configs.eventOnBlur != null)
				newElement.setAttribute("onBlur", configs.eventOnBlur);
			if (configs.eventOnFocus != null)
				newElement.setAttribute("onFocus", configs.eventOnFocus);
			if (configs.eventOnKeyUp != null)
				newElement.setAttribute("onkeyup", configs.eventOnKeyUp);
			if (configs.eventOnSelectStart != null)
				newElement.setAttribute("onselectstart", configs.eventOnSelectStart);
				
			// Styles
			if (configs.width != null)
				newElement.style.width = configs.width;
			if (configs.height != null)
				newElement.style.height = configs.height;
			if (configs.textAlign != null)
				newElement.style.textAlign = configs.textAlign;
			if (configs.padding != null)
				newElement.style.padding = configs.padding;
			if (configs.paddingLeft != null)
				newElement.style.paddingLeft = configs.paddingLeft;
			if (configs.paddingRight != null)
				newElement.style.paddingRight = configs.paddingRight;
			if (configs.paddingTop != null)
				newElement.style.paddingTop = configs.paddingTop;
			if (configs.paddingBottom != null)
				newElement.style.paddingBottom = configs.paddingBottom;
			if (configs.border != null)
				newElement.style.border = configs.border;
			if (configs.overflow != null)
				newElement.style.overflow = configs.overflow;
			if (configs.display != null)
				newElement.style.display = configs.display;
		}
		
		if (id)
			newElement.id = id;
		if (className)
			newElement.className = className;
			
		if (!parentElement)
			document.body.appendChild(newElement);
		else
			parentElement.appendChild(newElement);
			
		return newElement;
	},
	RemoveElement : function (id, parentElement)
	{
		var el = document.getElementById(id);
		if (!parentElement)
			document.body.removeChild(el);
		else
			parentElement.removeChild(el);
	},
	GetElementValue : function (id)
	{
		var el = document.getElementById(id);
		return (el) ? el.value : null; 
	},
	SetElementValue : function (id, value)
	{
		var el = document.getElementById(id);
		el.value = value;
	},
	GetEl : function (id)
	{
		return document.getElementById(id);
	},
	SetHTML : function (id, contents, isForcedFlush)
	{
		var el = document.getElementById(id);
		if (isForcedFlush)
			el.innerHTML = '';

		if (el.innerHTML == null || el.innerHTML == '')
			el.innerHTML = contents;
		else
			el.innerHTML += contents;
		
		return el;
	},
	AddNewLineHTML : function (id, contents, isAdd)
	{
		var el = document.getElementById(id);
		
		if (isAdd == null)
			isAdd = false;

		if (el.innerHTML == null || el.innerHTML == '')
			el.innerHTML = contents + ((isAdd) ? "<BR>" : "");
		else
			el.innerHTML += "<BR>" + contents + ((isAdd) ? "<BR>" : "");
		
		return el;
	},
	ToL10NMsg : function (msg, replaceArray)
	{
		if (replaceArray == null)
			return msg;
		
		if (replaceArray.length >= 11)
			return msg;
	
		if (replaceArray.length >= 1)
			msg = msg.replace(/\{0\}/gi, replaceArray[0])
		if (replaceArray.length >= 2)
			msg = msg.replace(/\{1\}/gi, replaceArray[1])
		if (replaceArray.length >= 3)
			msg = msg.replace(/\{2\}/gi, replaceArray[2])
		if (replaceArray.length >= 4)
			msg = msg.replace(/\{3\}/gi, replaceArray[3])
		if (replaceArray.length >= 5)
			msg = msg.replace(/\{4\}/gi, replaceArray[4])
		if (replaceArray.length >= 6)
			msg = msg.replace(/\{5\}/gi, replaceArray[5])
		if (replaceArray.length >= 7)
			msg = msg.replace(/\{6\}/gi, replaceArray[6])
		if (replaceArray.length >= 8)
			msg = msg.replace(/\{7\}/gi, replaceArray[7])
		if (replaceArray.length >= 9)
			msg = msg.replace(/\{8\}/gi, replaceArray[8])
		if (replaceArray.length >= 10)
			msg = msg.replace(/\{9\}/gi, replaceArray[9])
			
		return msg;
	},
	SetElShow : function (id)
	{
		document.getElementById(id).style.display = "inline";
	},
	SetElHide : function (id)
	{
		document.getElementById(id).style.display = "None";
	},
	Flush : function (id)
	{
		var el = document.getElementById(id);
		el.value = null;
		el.innerHTML = '';
	},
	ConvertToLocalTimeString : function (UTCTimeString)
	{
		var currentDateTime = new Date();
		var currentYear = currentDateTime.getFullYear();
		var currentMonth = currentDateTime.getMonth() + 1;
		var currentDay = currentDateTime.getDate();
		
		var currentDateTimeString = "" + currentYear + "-" + currentMonth + "-" + currentDay + " " + UTCTimeString;
		
		var targetDate = new Date(currentDateTimeString.replace(/-/gi,'/'));
		var timeZoneOffset = ((new Date()).getTimezoneOffset() * -1 ) / 60;
		targetDate.setHours(targetDate.getHours() + timeZoneOffset);
		
		var hour = (targetDate.getHours() < 10) ? "0" + targetDate.getHours() : targetDate.getHours();
		var minute = (targetDate.getMinutes() < 10) ? "0" + targetDate.getMinutes() : targetDate.getMinutes();
		var second = (targetDate.getSeconds() < 10) ? "0" + targetDate.getSeconds() : targetDate.getSeconds();

		return '' + hour + ':' + minute + ':' + second;
	},
	ConvertToUTCTimeString : function (LocalTimeString)
	{
		var currentDateTime = new Date();
		var currentYear = currentDateTime.getFullYear();
		var currentMonth = currentDateTime.getMonth() + 1;
		var currentDay = currentDateTime.getDate();
		
		var currentDateTimeString = "" + currentYear + "-" + currentMonth + "-" + currentDay + " " + LocalTimeString;
		
		var targetDate = new Date(currentDateTimeString.replace(/-/gi,'/'));
		var timeZoneOffset = ((new Date()).getTimezoneOffset() * -1 ) / 60;
		targetDate.setHours(targetDate.getHours() - timeZoneOffset);
		
		var hour = (targetDate.getHours() < 10) ? "0" + targetDate.getHours() : targetDate.getHours();
		var minute = (targetDate.getMinutes() < 10) ? "0" + targetDate.getMinutes() : targetDate.getMinutes();
		var second = (targetDate.getSeconds() < 10) ? "0" + targetDate.getSeconds() : targetDate.getSeconds();

		return '' + hour + ':' + minute + ':' + second;
	},
	GetLocalTimeString : function (UTCString)
	{
		if (UTCString == null || UTCString == NaN || UTCString == "" || UTCString == "None" || String(UTCString).match(/\(/g) != null)
			return UTCString;
		
		var targetDate = new Date(UTCString.replace(/-/gi,'/'));
		var timeZoneOffset = ((new Date()).getTimezoneOffset() * -1 ) / 60;
		targetDate.setHours(targetDate.getHours() + timeZoneOffset);

		var year = targetDate.getFullYear();
		var month = (targetDate.getMonth() + 1 < 10) ? "0" + (targetDate.getMonth() + 1) : targetDate.getMonth() + 1;
		var day = (targetDate.getDate() < 10) ? "0" + targetDate.getDate() : targetDate.getDate();
		
		var hour = (targetDate.getHours() < 10) ? "0" + targetDate.getHours() : targetDate.getHours();
		var minute = (targetDate.getMinutes() < 10) ? "0" + targetDate.getMinutes() : targetDate.getMinutes();
		var second = (targetDate.getSeconds() < 10) ? "0" + targetDate.getSeconds() : targetDate.getSeconds();

		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + " (" + CruiseGlobal.GetTimeZoneString(timeZoneOffset) + ")";
	},
	GetLocalDateTime : function (UTCString)
	{
		if (UTCString == null || UTCString == NaN || UTCString == "" || UTCString == "None" || String(UTCString).match(/\(/g) != null)
			return UTCString;
		
		var targetDate = new Date(UTCString.replace(/-/gi,'/'));
		var timeZoneOffset = ((new Date()).getTimezoneOffset() * -1 ) / 60;
		targetDate.setHours(targetDate.getHours() + timeZoneOffset);
		
		return targetDate;
	},
	GetTimeZoneString : function (timeZoneOffset){
		//starts -12 to -1, 0 and +1 to +14
		var arrTimeZoneString = ["BIT", "SST", "HST", "AKST", "PST", "MST/PDT", "CST/MDT", "EST/CDT", "AST/EDT", "BRT", "GST", "AZOST",
		                         "GMT",
		                         "CET", "EET", "MSK", "GET/MSD", "PKT", "BST", "THA", "CST", "KST", "AEST", "AEDT", "FJT", "PHOT", "LINT"];
		
		switch (timeZoneOffset){
		case -2.5:
			return "NDT";
		case -3.5:
			return "NST";
		case -4.5:
			return "VET";
		case -9.5:
			return "MIT";
		case 3.5:
			return "IRST";
		case 4.5:
			return "AFT";
		case 5.5:
			return "IST";
		case 5.75:
			return "NPT";
		case 6.5:
			return "MST";
		case 8.75:
			return "CWT";
		case 9.5:
			return "ACST";
		case 10.5:
			return "ACDT";
		case 11.5:
			return "NFT";
		case 12.75:
			return "CHAST";
		};
		return arrTimeZoneString[timeZoneOffset + 12];
		
	},
	ToUTCString : function (LocalTimeString)
	{
		if (LocalTimeString == null || LocalTimeString == NaN || LocalTimeString == "" || LocalTimeString == "None" || String(LocalTimeString).match(/\(/g) != null)
			return LocalTimeString;
		
		var targetDate = new Date(LocalTimeString.replace(/-/gi,'/'));
		var timeZoneOffset = ((new Date()).getTimezoneOffset() * -1 ) / 60;
		targetDate.setHours(targetDate.getHours() - timeZoneOffset);
		
		var year = targetDate.getFullYear();
		var month = (targetDate.getMonth() + 1 < 10) ? "0" + (targetDate.getMonth() + 1) : targetDate.getMonth() + 1;
		var day = (targetDate.getDate() < 10) ? "0" + targetDate.getDate() : targetDate.getDate();
		
		var hour = (targetDate.getHours() < 10) ? "0" + targetDate.getHours() : targetDate.getHours();
		var minute = (targetDate.getMinutes() < 10) ? "0" + targetDate.getMinutes() : targetDate.getMinutes();
		var second = (targetDate.getSeconds() < 10) ? "0" + targetDate.getSeconds() : targetDate.getSeconds();

		return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
	},
	ToTimeFormatString : function (yearVal, monthVal, dayVal, hourVal, minuteVal, secondVal, dateDelimiter)
	{
		if (dateDelimiter == null)
			dateDelimiter = '-';
				
		var year = yearVal;
		var month = (monthVal < 10) ? "0" + (monthVal) : monthVal;
		var day = (dayVal < 10) ? "0" + dayVal : dayVal;
		
		var hour = (hourVal < 10) ? "0" + hourVal : hourVal;
		var minute = (minuteVal < 10) ? "0" + minuteVal : minuteVal;
		var second = (secondVal < 10) ? "0" + secondVal : secondVal;
	
		return year + dateDelimiter + month + dateDelimiter + day + ' ' + hour + ':' + minute + ':' + second;
	},
	ToJsonString : function (obj)
	{
		return YAHOO.lang.JSON.stringify(obj);
	},
	ToDumpString : function (obj)
	{
		return YAHOO.lang.dump(obj);
	},
	GetSpaces : function (num)
	{
		str = "";
		for (var i = 0; i < num; i++){
			str += "&nbsp;";
		}
		return str;
	},
	ReplaceToSpecialChar : function (val)
	{
		val = val.replace(/[%]/gi,'%25');
		val = val.replace(/[!]/gi,'%21');
		val = val.replace(/["]/gi,'%22');
		val = val.replace(/[#]/gi,'%23');
		val = val.replace(/[$]/gi,'%24');
		val = val.replace(/[&]/gi,'%26');
		val = val.replace(/[']/gi,'%27');
		val = val.replace(/[(]/gi,'%28');
		val = val.replace(/[)]/gi,'%29');
		val = val.replace(/[*]/gi,'%2A');
		val = val.replace(/[+]/gi,'%2B');
		val = val.replace(/[,]/gi,'%2C');
		val = val.replace(/[-]/gi,'%2D');
		val = val.replace(/[.]/gi,'%2E');
		val = val.replace(/[\/]/gi,'%2F');
		
		val = val.replace(/[:]/gi,'%3A');
		val = val.replace(/[;]/gi,'%3B');
		val = val.replace(/[<]/gi,'%3C');
		val = val.replace(/[=]/gi,'%3D');
		val = val.replace(/[>]/gi,'%3E');
		val = val.replace(/[?]/gi,'%3F');
		val = val.replace(/[@]/gi,'%40');
		
		val = val.replace(/[\[]/gi,'%5B');
		val = val.replace(/[\\]/gi,'%5C');
		val = val.replace(/[\]]/gi,'%5D');
		return val;
	},
	GetCruiseTimerInstance : function ()
	{
		return new _OPTimer();
	}
};

var CruiseLog = new YAHOOLogWrapper();
var CruiseEvent = new OPEvent();
var CruiseTimer = new _OPTimer();
var CruiseOverlay = new _OPOverlayManager();
var CruiseValidation = new _OPValidation();

YAHOO.log ("opGlobal.js :: Script file loading completed");