/*==================================
    
    YUI Script Loader Wrapper
    By Daesup, Lee

====================================*/

function OPLoader (scriptPath, successCallback, errorCallback) {
    YAHOO.log("OPLoader loading: " + scriptPath, "info");                                                                
    YAHOO.util.Get.script(scriptPath, {
                onSuccess: function(obj) {          
                    YAHOO.log("Successfully loading module. Transaction ID: " + obj.tId, "info");
                    successCallback(obj.tId);
                },
                onFailure: function(obj) {
                    alert("Failure handler was called. path: " + scriptPath + " tID: " + obj.tId);
                    if (errorCallback != null) errorCallback(obj.tId);
                },
                scope: window,
                timeout: 10000,
                autopurge: true
            });    
}

function OPUnloader (obj) {
    YAHOO.log("Unloading module. object ID: " + obj.id, "info");
    obj.Destroy();
    obj = null;
}