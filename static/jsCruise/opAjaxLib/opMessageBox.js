/*==================================
    
    YUI MesssageBox Wrapper
    By Daesup, Lee
    
    - MessageBox Example:
    --------------------------------------------------------
        function MessageInfo (action, objEvent, objArg){
            var msgBox = new OPMsgBox ("globalMessageBox", objArg[0], "header!!", config);
            msgBox.Show();
        }
    --------------------------------------------------------
    - QuestionBox: If you want to use as a question box, button object must be configured like this:
        1. define the button object
        [{ text:"Yes", handler:FunctionHandle, isDefault:true },
         { text:"No",  handler:FunctionHandle }]
        2. In FunctionHandler, Close the dialog using this.hide() 
        
    - Question MsgBox Example:
    --------------------------------------------------------
        function yes(){
            alert("Implementation of YES");
            this.hide();
        }
        function no(){
            alert("Implementation of No");
            this.hide();
        }
        var qstBox = new OPMsgBox ("globalQuestionBox", "keke", "header!!", config);
        qstBox.SetButtons([{ text:"Yes", handler:yes, isDefault:true }, { text:"No",  handler:no }]);
    --------------------------------------------------------
    
    - Configuration Description
    --------------------------------------------------------
    var.config = {
                  width: width of message box
                  height: height of message box
                  isFixedCenter: force to place center postion
                  isDraggable: able to drag box
                  isClose: visibility of close button
                  isModal: able to be modal
                  zIndex: priority of visible level
                  buttons: defined buttons
                 }; 
    --------------------------------------------------------
====================================*/

YAHOO.log ("opMessageBox.js :: Script file start loading");

var OPMsgBox = function (id, messageText, headerText, config)
{
    this._id = id;
    this._internalId = this._id + (new Date()).getTime();
    this._headerText = headerText;
    this._renderParent = null;
    
    this._msgConfig = {
                      width: (config.width) ? config.width + "px" : null,
                      height: (config.height) ? config.height + "px" : null, 
                      fixedcenter: (config.isFixedCenter != null) ? config.isFixedCenter : true,
                      visible: (config.isVisible != null) ? config.isVisible : true,
                      draggable: (config.isDraggable != null) ? config.isDraggable : true,
                      close: (config.isClose != null) ? config.isClose : true,
                      text: messageText,
                      icon: YAHOO.widget.SimpleDialog.ICON_INFO,
                      constraintoviewport: true,
                      modal: (config.isModal != null) ? config.isModal : true,
                      zIndex: (config.zIndex) ? config.zIndex : 999,
                      buttons: (config.buttons) ? config.buttons : [{ text:"OK",  handler: function () {this.hide();} }],
                      effect:{effect:YAHOO.widget.ContainerEffect.FADE,duration:0.15},
                    };  
                    
	if (config.rtnFocusID)
		this.rtnFocusID = config.rtnFocusID;      
}

OPMsgBox.prototype.SetICON = function (icon){
	var dialog = YAHOO.widget.SimpleDialog; 
	if (icon == "INFO" || icon == "info")
		icon = dialog.ICON_INFO;
	else if (icon == "WARN" || icon == "warn")
		icon = dialog.ICON_WARN;
	else if (icon == "TIP" || icon == "tip")
		icon = dialog.ICON_TIP;
	else if (icon == "HELP" || icon == "help")
		icon = dialog.ICON_HELP;
	else if (icon == "ALARM" || icon == "alarm")
		icon = dialog.ICON_ALARM;
		
    this._msgConfig.icon = icon;
};

OPMsgBox.prototype.SetSize = function (newWidth, newHeight){
	this._msgConfig.width = newWidth + "px";
	this._msgConfig.height = newHeight + "px";
};

OPMsgBox.prototype.SetModal = function (isModal){
	this._msgConfig.modal = isModal;
};

OPMsgBox.prototype.SetParent = function (parentObj){
    this._renderParent = parentObj;
};

OPMsgBox.prototype.SetButtons = function (buttonArray){
    this._msgConfig.buttons = buttonArray;
};

OPMsgBox.prototype.SetZIndex = function (index){
    this._msgConfig.zIndex = index;
};

OPMsgBox.prototype.OK = function (){
	this._msgBase.submit();
};

OPMsgBox.prototype.Hide = function (){
	this._msgBase.hide();
};
             
OPMsgBox.prototype.Show = function (){
    this._msgBase = new YAHOO.widget.SimpleDialog(this._internalId, this._msgConfig);
    this._msgBase.wrapper = this;
	this._msgBase.subscribe("hide", function (){
			if (this.rtnFocusID)
				CruiseGlobal.GetEl(this.wrapper.rtnFocusID).focus(); 
		});
    this._msgBase.setHeader(this._headerText);
    this._msgBase.render((this._renderParent) ? this._renderParent : document.body);
};

OPMsgBox.prototype.AddEvent = function (id, event){
    YAHOO.util.Event.addListener(id, event, this.Show, this, true);
};

YAHOO.log ("opMessageBox.js :: Script file loading completed");