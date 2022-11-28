/*==================================
    
    YUI Dialog Wrapper
    By Daesup, Lee
   
   	
   	* Example:
   	//=======================================
    var _callback = function (o, messages)
    {
		var handleSuccess = function(o, msg) {
			CruiseGlobal.SHOWINFO(l10nMsg["text_01"], msg.returnMsg, l10nMsg["text_02"]);
			if (msg.returnCode == SteerErrorCode.SUCCESS ){
				this.Hide();
				SteerGlobal.SteerHandleResourceMan.Remove("CreateUser_Dialog")
			}
		};
		var validator = function(data){
			if (data.userIDstr.length <= 0 || data.userName.length <= 0 || data.PASSWORDstr.length <= 0)
			{ 
				CruiseGlobal.SHOWINFO (l10nMsg["text_05"], l10nMsg["msg_02"], l10nMsg["text_02"]);
				return false;
			}
			if (data.PASSWORDstr != data.PASSWORDstr2)
			{
				CruiseGlobal.SHOWINFO (l10nMsg["text_05"], l10nMsg["msg_01"], l10nMsg["text_02"]);
				return false;
			}
			
			return true;
		};
    	
		var oDialog = new OPDialog ("CreateUser_Dialog", messages, "createUser", null, { width: 350 });
		oDialog.SetDefaultButtonText([l10nMsg["text_06"],l10nMsg["text_03"]]);
		oDialog.SetValidator(validator);
		oDialog.SetCallbacks((new REQUEST_SUCCESS_CALLBACK(handleSuccess)).callback, REQUESTFAIL_DEFAULT_CALLBACK);
		oDialog.Show();
    //=======================================
====================================*/

YAHOO.log ("opDialog.js :: Script file start loading");
var OPDialog = function (id, dialogContents, key, headerText, callback, config)
{
	//private:
    this._id = id;
    this._dialogContents = dialogContents;
    this._key = key;
    this._headerText = headerText;
    this._renderParent = null;
    this._callback = callback;
    this.cancelAddHandler = null;
    this.submitAddHandler = null;
	
	if (!config)
		config = {};

    this._msgConfig = {
    				  width: (config.width != null) ? config.width + "px" : null,
                      height: (config.height != null) ? config.height + "px" : null, 
                      fixedcenter: (config.isFixedCenter != null) ? config.isFixedCenter : true,
                      visible: true,
                      draggable: true,
                      close: (config.isClose != null) ? config.isClose : true, 
                      constraintoviewport: true,
                      modal: (config.isModal != null) ? config.isModal : false,
                      zIndex: (config.zIndex != null) ? config.zIndex : 3,
                      hideaftersubmit : false,
					  buttons : (config.buttons != null) ? config.buttons :
					  								[{ text:"Submit", handler: 
					  												function () {
					  													if (this.submitAddHandler) this.submitAddHandler();
					  													this.submit(); }, isDefault:true },
			  										{ text:"Cancel", handler:
			  														function () {
			  															if (this.cancelAddHandler) this.cancelAddHandler();
			  															this.cancel(); } } ],
			  		  effect:{effect:YAHOO.widget.ContainerEffect.FADE,duration:0.15}
					 };
		 
    if (this._key)
		this._msgConfig.postdata = "key=" + this._key;
};

//public:
OPDialog.prototype.SetModal = function (isModal){
	this._msgConfig.modal = isModal;
};

OPDialog.prototype.SetParent = function (parent){
    this._renderParent = parent;
};

OPDialog.prototype.SetButtons = function (buttonArray){
    this._msgConfig.buttons = buttonArray;
};

OPDialog.prototype.Destroy = function() {
	this.dialogBase.destroy();
};

OPDialog.prototype.SetDefaultButtonText = function (arrButtonText){
	for (index in arrButtonText)
	{
		this._msgConfig.buttons[index].text = arrButtonText[index];
	}
};

OPDialog.prototype.SetDefaultSubmitHandler = function (handler){
	this.submitAddHandler = handler;
};

OPDialog.prototype.SetDefaultCancelHandler = function (handler){
	this.cancelAddHandler = handler;
};

OPDialog.prototype.SetZIndex = function (index){
    this._msgConfig.zIndex = index;
};

OPDialog.prototype.SetValidator = function (func_validator){
	this.validator = function(){
		var data = this.getData();
		return func_validator (data);
	};
};

OPDialog.prototype.SetDialogContents = function (contents){
	this._dialogContents = contents;
};

OPDialog.prototype.SetHeader = function (headerText){
	this.dialogBase.setHeader(headerText);
};

OPDialog.prototype.AddPostData = function (key, value){
	if (_key)
		this._msgConfig.postdata += key + "=" + value;
	else
		this._msgConfig.postdata = data;
};

OPDialog.prototype.Hide = function (){
	this.dialogBase.hide();
};

OPDialog.prototype.Show = function (){   
    var dialogDiv = CruiseGlobal.CreateElement("DIV", this._id + "_div", null, null, {body: this._dialogContents});
    
    if (this._renderParent)
    	this._renderParent.appendChild(dialogDiv);
    else
    	document.body.appendChild(dialogDiv);
    
    this.dialogBase = new YAHOO.widget.Dialog(dialogDiv, this._msgConfig);
    if (this._headerText)
    	this.dialogBase.setHeader(this._headerText);

	this.dialogBase.wrapper = this;
	this.dialogBase.submitAddHandler = this.submitAddHandler;
	this.dialogBase.cancelAddHandler = this.cancelAddHandler;

    this.dialogBase.validate = this.validator;
    this.dialogBase.callback = { success: (new REQUEST_SUCCESS_CALLBACK(this._callback)).callback, failure: REQUESTFAIL_DEFAULT_CALLBACK };
    this.dialogBase.render((this._renderParent) ? this._renderParent : document.body);  
};
    
OPDialog.prototype.AddEvent = function (id, event){
    YAHOO.util.Event.addListener(id, event, this.Show, this, true);
};
YAHOO.log ("opDialog.js :: Script file loading completed");