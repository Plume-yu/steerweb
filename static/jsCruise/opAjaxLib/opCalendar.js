/*==================================
    
    JSCruise Calendar Wrapper
    By Daesup, Lee

====================================*/

YAHOO.log ("opCalendar.js :: Script file start loading");
var OPCalendarType = { Normal : 1, Button : 2 };
var OPCalendar = function (type, id, targetDiv, selectCallback, config)
{
    //private:
	this._type = type;
    this._id = id;
    this._targetDiv = targetDiv;
    this._panelDiv = null;
    this._config = config;
    this._callback = selectCallback;
    
	var Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;
	
    if (this._type == OPCalendarType.Button){
    	this._panelDiv = CruiseGlobal.CreateElement("DIV", "calendarPanel_" + this._id);
		this._oCalendarPanel = new YAHOO.widget.Panel(this._panelDiv,
													{
														height: "245px",
									    				constraintoviewport: true,
									    				close: true,
									    				draggable: false,
									    				modal: false,
									    				visible: false,
									    				effect:{effect:YAHOO.widget.ContainerEffect.FADE,duration:0.15}
													});
		this._oCalendarPanel.setHeader((this._config && this._config.headerLabel) ? this._config.headerLabel : "Choose a date");
		this._oCalendarPanel.setBody("<div id='overlaybody_" + this._id + "'></div>");
		this._oCalendarPanel.render(document.body);
		
		this._oCalendar = new YAHOO.widget.Calendar(this._id, "overlaybody_" + this._id, this._config);
		
		if (this._callback)
			this._oCalendar.selectEvent.subscribe(this._callback, this._oCalendar, true);
		
		this._oCalendar.render();
		
		var focusDay = function () {
			var oCalendarTBody = Dom.get(this._id).tBodies[0],
				aElements = oCalendarTBody.getElementsByTagName("a"),
				oAnchor;
			
			if (aElements.length > 0) {
				Dom.batch(aElements, function (element) {
					if (Dom.hasClass(element.parentNode, "today")) {
					oAnchor = element;
				}
			});
			
			if (!oAnchor) {
				oAnchor = aElements[0];
			}
			
			YAHOO.lang.later(0, oAnchor, function () {
				try {
					oAnchor.focus();
				}
				catch(e) {}
				});
			}
		};	
		
		this._oCalendarPanel.subscribe("show", focusDay);
		this._oCalendar.renderEvent.subscribe(focusDay, this._oCalendar, true);
		focusDay.call(this);
		
		this.onButtonClick = function(event, args){
    		Event.on(args._oCalendarPanel.element, "keydown", function (p_oEvent) {
    			if (Event.getCharCode(p_oEvent) === 27) {
    			args._oCalendarPanel.hide();
    			this.focus();
    			}
    		}, null, this);
			
    		if (args._config && args._config.UpdateDateElementArray){
    			arrDate = args._config.UpdateDateElementArray;
    			args.Update(arrDate[0].value, arrDate[1].value, arrDate[2].value);
    		}
    		
    		var obj = args._targetDiv;
    		var x = obj.offsetLeft;
    		var y = obj.offsetTop;
    		while (obj.offsetParent && obj != document.body){
    			x += obj.offsetParent.offsetLeft;
    			y += obj.offsetParent.offsetTop;
    			obj = obj.offsetParent;
    		}
    		args._oCalendarPanel.cfg.setProperty("xy", [x,y]);
    		args._oCalendarPanel.show();
    	};
    	
    	this.oButton = new YAHOO.widget.Button({
									    		id: "calendarButtonPicker",
									    		label: (this._config && this._config.headerLabel) ? this._config.headerLabel : "Choose a date",
									    		container: this._targetDiv
									    	});

    	this.oButton.on("click", this.onButtonClick, this);
    }
    else
    {
		this._oCalendar = new YAHOO.widget.Calendar(this._id, this._targetDiv, this._config);
		
		if (this._callback)
			this._oCalendar.selectEvent.subscribe(this._callback, this._oCalendar, true);
		
		this._oCalendar.render();
    }

    this._oCalendar.wrapper = this;
};


OPCalendar.prototype.Hide = function (){
    if (this._type == OPCalendarType.Button){
    	this._oCalendarPanel.hide();
    };
};

OPCalendar.prototype.Destroy = function (){
	this._oCalendar.destroy();
	this._oCalendarPanel.destroy();
};

OPCalendar.prototype.Update = function (year, month, day){
	if (!isNaN(parseInt(year)) && !isNaN(parseInt(month)) && !isNaN(parseInt(day))){
		var date = month + "/" + day + "/" + year;
		
		this._oCalendar.select(date);
		this._oCalendar.cfg.setProperty("pagedate", month + "/" + year);
		this._oCalendar.render();
	}
	else
		YAHOO.log ("OPCalendar.Update failed: Invalid Date: " + year + "/" + month + "/" + day , "error");
};

// Static Date Picker Function
OPCalendar.MakeDatePicker = function (id, elTargetDiv, elButtonDiv, configs){
	var yearBeforeInterval = 5;
	var yearAfterInterval = 5;
	var headerLabel = "Choose a date";
	var nowDate = new Date();
	
	if (configs){
		if (configs.addYear != null)
			nowDate.setYear(nowDate.getFullYear() + configs.addYear);
		if (configs.addMonth != null)
			nowDate.setMonth(nowDate.getMonth() + configs.addMonth);
		if (configs.addDay != null)
			nowDate.setDate(nowDate.getDate() + configs.addDay);
	}
	
	var initYear = nowDate.getFullYear();
	var initMonth = nowDate.getMonth() + 1;
	var initDay = nowDate.getDate();
	
	if (configs){
		if (configs.yearBeforeInterval != null)
			yearBeforeInterval = configs.yearBeforeInterval;
		if (configs.yearAfterInterval != null)
			yearAfterInterval = configs.yearAfterInterval;
		if (configs.headerLabel != null)
			headerLabel = configs.headerLabel;
		if (configs.initYear != null)
			initYear = configs.initYear;
		if (configs.initMonth != null)
			initMonth = configs.initMonth;
		if (configs.initDay != null)
			initDay = configs.initDay;
	}
	
	// Year
	var elYear = CruiseGlobal.CreateElement("SELECT", "inputYear_" + id, elTargetDiv);
	var year = initYear;
	for (var i = year - yearBeforeInterval; i <= year + yearAfterInterval; i++)
		CruiseGlobal.CreateElement("OPTION", null, elYear, null, {value: i, body: i});
	elYear.value = year;
	// Month
	var elMonth = CruiseGlobal.CreateElement("SELECT", "inputMonth_" + id, elTargetDiv);
	var month = initMonth;
	for (var i = 1 ; i <= 12; i++)
		CruiseGlobal.CreateElement("OPTION", null, elMonth, null, {value: i, body: (i < 10) ? "0" + i : i});
	elMonth.value = month;
	// Day
	var elDay = CruiseGlobal.CreateElement("SELECT", "inputDay_" + id, elTargetDiv);
	var day = initDay;
	for (var i = 1 ; i <= 31; i++)
		CruiseGlobal.CreateElement("OPTION", null, elDay, null, {value: i, body: (i < 10) ? "0" + i : i});
	elDay.value = day;
	
	var OnDateClick = function (event, args){
		var aDate;
		if (args) {
			aDate = args[0][0];
			elYear.value = aDate[0];
			elMonth.value = aDate[1];
			elDay.value = aDate[2];
		}
		this.wrapper.Hide();
	};
	
	var minDate = month.toString() + "/" + day.toString() + "/" + (year - yearBeforeInterval).toString();
	var maxDate = month.toString() + "/" + day.toString() + "/" + (year + yearAfterInterval).toString();
	
	var calendar = new OPCalendar(OPCalendarType.Button, "OPCalendar_" + id, elButtonDiv, OnDateClick,
									{ headerLabel : headerLabel,
									  UpdateDateElementArray : [elYear, elMonth, elDay],
									  mindate : minDate,
									  maxdate : maxDate});
	
	return { objCalendar : calendar, elementYear : elYear, elementMonth: elMonth, elementDay : elDay };
};

//Static Time Picker Function
OPCalendar.MakeTimePicker = function (id, elTargetDiv, configs){
	var isUseMinutes = true;
	var isUseSeconds = true;
	var hour = null;
	var minutes = null;
	var seconds = null;
	
	var elMinute = null;
	var elSecond = null;
	
	if (configs){
		if (configs.isUseMinutes != null)
			isUseMinutes = configs.isUseMinutes;
		if (configs.isUseSeconds != null)
			isUseSeconds = configs.isUseSeconds;
		if (configs.hour != null)
			hour = configs.hour;
		if (configs.minutes != null)
			minutes = configs.minutes;
		if (configs.seconds != null)
			seconds = configs.seconds;
	}
	
	var elHour = CruiseGlobal.CreateElement("SELECT", "inputHour_" + id, elTargetDiv);
	
	if (hour == null) {
		hour = (new Date()).getHours();
	}
	
	for (var i = 0 ; i <= 23; i++)
		CruiseGlobal.CreateElement("OPTION", null, elHour, null, {value: i, body: (i < 10) ? "0" + i : i});
	elHour.value = hour;
	
	if (isUseMinutes){
		elMinute = CruiseGlobal.CreateElement("SELECT", "inputMinutes_" + id, elTargetDiv);
		
		if (minutes == null) {
			minutes = (new Date()).getMinutes();
		}
		
		for (var i = 0 ; i <= 59; i++)
			CruiseGlobal.CreateElement("OPTION", null, elMinute, null, {value: i, body: (i < 10) ? "0" + i : i});
		elMinute.value = minutes;
	}

	if (isUseSeconds){
		elSecond = CruiseGlobal.CreateElement("SELECT", "inputSeconds_" + id, elTargetDiv);
		
		if (seconds == null) {
			seconds = (new Date()).getSeconds();
		}
		
		for (var i = 0 ; i <= 59; i++)
			CruiseGlobal.CreateElement("OPTION", null, elSecond, null, {value: i, body: (i < 10) ? "0" + i : i});
		elSecond.value = seconds;
	}
	return { elementHour : elHour, elementMinute : elMinute, elementSecond : elSecond };
};

YAHOO.log ("opCalendar.js :: Script file loading completed");