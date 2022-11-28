/*==================================
    
    YUI Logger Wrapper
    By Daesup, Lee
        
====================================*/

YAHOO.log ("opLog.js :: Script file start loading", "info");
function OPLog(panelDiv, innerLogDiv, isCenter, width, height, isClose) {
                                                                         
    //private:
    var _id = "GlobalLog";
    var _panelDiv = panelDiv;
   	var _innerLogDiv = innerLogDiv;
   	var _isCenter = isCenter;
    var _width = width;
    var _height = height;
        
    var _isClose = isClose;
    var _panelHeaderString = "Log Panel";
    var _logHeaderString = "Global Logger";
    
    var _logWidth = width;
    var _logHeight = height;
    
    var _isShow = false;

    var _panelConfig = {    
    						width: "100%",
                            height: "100%",
                            constraintoviewport: true, 
                            visible: true, 
                            draggable: true,
                            fixedcenter: isCenter,
                            close: (_isClose) ? _isClose : false,
                            zIndex: 999
                        };
    var _logConfig = {  
                        verboseOutput: false, 
                        width: _logWidth + "px", 
                        height: _logHeight + "px"
                      };

    var _oLogReader = new YAHOO.widget.LogReader(_innerLogDiv, _logConfig);
    _oLogReader.setTitle(_logHeaderString);
    
	var _oPanel = new YAHOO.widget.Panel(_panelDiv, _panelConfig);
    _oPanel.setHeader(_panelHeaderString);
    _oPanel.render(document.body);
    _oPanel.focusFirst();

	//public:
    this.SetPanelHeader = function (headerString) { _oPanel.setHeader(headerString); };
    this.SetLogTitle = function (headerString) { _oLogReader.setTitle(headerString); };
    
    this.Destroy = function () {
        _oPanel.destroy();
        _oLogReader.destroy();
    };
    this.Show = function () {
        _isShow = true;
        _oPanel.show();
    };
    this.Hide = function () {
        _isShow = false;
        _oPanel.hide();
    };
	this.IsShow = function () {
		return _isShow;
	};
}
YAHOO.log ("opLog.js :: Script file loading completed", "info");

//Log
function YAHOOLogWrapper ()
{
	this.Debug = function (str) {
		YAHOO.log (str, "debug");
	};
	this.Info = function (str) {
		YAHOO.log (str, "info");
	};
	this.Error = function (str) {
		YAHOO.log (str, "error");
	};
}

//# Singleton instances object
function OPLogSingletonInit()
{
    opGlobalLogDiv = document.createElement("div");
    opGlobalLogDiv.id = "opGlobalLogDiv";
    opGlobalLogDiv.innerHTML = "<div id=\"opGlobalLogInnerDiv\"></div>";
    document.body.appendChild(opGlobalLogDiv);
    
    document.globalLogView = new OPLog("opGlobalLogDiv", "opGlobalLogInnerDiv", false, 500 , 300);
    document.globalLogView.Hide();

    YAHOO.log ("opLog.js :: OPLogSingletonInit, Instance created", "debug");
    
    function LogControl()
    {
      if (document.globalLogView.IsShow()){
          document.globalLogView.Hide();
      }
      else{
          document.globalLogView.Show();
      }
    }
    
    var keyListener = new YAHOO.util.KeyListener(document, { ctrl: true, alt: true, keys: 80 }, 
                                                   { fn:LogControl, 
                                                     scope:this,
                                                     correctScope:true } );
    keyListener.enable();
    YAHOO.log ("opLog.js :: OPLogSingletonInit, Key Enabled: ctrl+alt+80 (p)", "debug");
}

YAHOO.util.Event.onDOMReady(function() {
    OPLogSingletonInit();
});
