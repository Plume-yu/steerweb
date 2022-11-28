/*==================================
    
    Steer Logout Script
    By Daesup, Lee

====================================*/

function SteerLogout()
{
    var EndProcess = function (){
		var _callback = function(o, messages) {
			if (!SteerGlobal.ValidateResponse(messages)) return;
			window.location = "./";
		};

		OPAjaxRequest("POST", "requestLogout", _callback);
		this.hide();
		SteerGlobal.ShowLoading();
    };

    var qstBox = new OPMsgBox ("ConfirmLogout", 
    							l10nMsg["msg_10"],
    							l10nMsg["text_23"],
    							{isFixedCenter: true,
    							isDraggable: false,
    							isClose: true,
    							isModal: true,
    							width: 300
             					});
    qstBox.SetICON("warn");
    qstBox.SetButtons([{ text:l10nMsg["text_02"], handler:EndProcess, isDefault:true }, { text:l10nMsg["text_03"],  handler: function () {this.hide();} }]);
    qstBox.Show();
    return;
}