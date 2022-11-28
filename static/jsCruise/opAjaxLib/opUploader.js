/*==================================
    
    Uploader Wrapper
    By Daesup, Lee
    
====================================*/

YAHOO.log ("opUploader.js :: Script file start loading");
var OPUploader = function (id, targetDiv, post, config)
{
    //private:
    this._id = id;
    this._targetDiv = targetDiv;
    this._config = config;
    this._post = post;

    if (!this._config)
    	this._config = {};

	this._uploader = new qq.FileUploader({
		element: this._targetDiv,
		action: this._post,
		multiple: (this._config.multiple) ? this._config.multiple : false,
		sizeLimit: (this._config.sizeLimit) ? this._config.sizeLimit : 0,  
        minSizeLimit: (this._config.minSizeLimit) ? this._config.minSizeLimit : 0,
        allowedExtensions: (this._config.allowedExtensions) ? this._config.allowedExtensions : [],
        maxConnections: (this._config.maxConnections) ? this._config.maxConnections : 3,
        template: (this._config.templateHTML) ? this._config.templateHTML : 
    		'<div class="qq-uploader">' + 
	        '<div class="qq-upload-button">' + ((this._config.uploadButtonText) ? this._config.uploadButtonText : "Upload") + '</div>' +
	        '<div><ul id="opUploader_uploadList_' + this._id +'" class="qq-upload-list"></ul></div>' + 
	        '</div>',
        fileTemplate: (this._config.fileTemplateHTML) ? this._config.fileTemplateHTML : '<li><table><tr>' +
    	        '<td><span class="qq-upload-file"></span></td>' +
    	        '<td><span class="qq-upload-spinner"></span></td>' +
    	        '<td><span class="qq-upload-size"></span></td>' +
    	        '<td><a class="qq-upload-cancel" href="#">Cancel</a></td>' +
    	        '<td><span class="qq-upload-failed-text">Failed</span></td>' +
    	        '</tr></table></li>',
        messages: {
            typeError: this._config.typeErrorMsg,
            sizeError: this._config.sizeErrorMsg,
            minSizeError: this._config.minSizeErrorMsg,
            emptyError: this._config.emptyErrorMsg,
            onLeave: this._config.onLeave           
        }
	});
};

OPUploader.prototype.RegisterEventSubmit = function (func) {
	this._uploader._options.onSubmit = func;
};

OPUploader.prototype.RegisterEventProgress = function (func) {
	this._uploader._options.onProgress = func;	
};


OPUploader.prototype.RegisterEventComplete = function (func) {
	this._uploader._options.onComplete = func;
};


OPUploader.prototype.RegisterEventCancel = function (func) {
	this._uploader._options.onCancel = func;
};


OPUploader.prototype.RegisterEventShowMessage = function (func) {
	this._uploader._options.showMessage = func;
};

OPUploader.prototype.FlushUploadList = function () {
	CruiseGlobal.Flush("opUploader_uploadList_" + this._id);
};


YAHOO.log ("opUploader.js :: Script file loading completed");