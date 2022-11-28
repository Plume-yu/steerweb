/*==================================
    
    YUI MenuBar Wrapper
    By Daesup, Lee
    
    - MenuBar Example:
    -------------------------------------------------
        var aSubmenuData = [
            {
                id: "communication", 
                itemdata: [ 
                    { text: "Click Test", onclick: { fn: function() {alert("keke");}, obj: ["good", "keke"]} },
                    {
                        text: "PIM", 
                        submenu: {  id: "pim", 
                                    itemdata: [ { text: "Yahoo! Mail", url: "http://mail.yahoo.com" }  ] 
                                 }
                    }, 
                    { text: "Member Directory", url: "http://members.yahoo.com" },
                    { text: "로그아웃", helptext: "Alt + Q", onclick: { fn: function(){alert("quit!");} }, keylistener: { alt: true, keys: 81 } }
                ]
            } 
        ];
    -----------------------------------------------
====================================*/

YAHOO.log ("opMenuBar.js :: Script file start loading");
var OPMenuBar = function (id, subMenuData)
{
    //private:
    this._id = id;
    this._subMenuData = (subMenuData) ? subMenuData : [];
    
    this._oMenuBar = new YAHOO.widget.MenuBar(this._id, { 
                                                autosubmenudisplay: false, 
                                                hidedelay: 750, 
                                                lazyload: true,
                                                effect: { 
                                                    effect: YAHOO.widget.ContainerEffect.FADE,
                                                    duration: 0.2
                                                }});
                                                
    for (var i = 0; i < this._subMenuData.length; i++){
        if (this._oMenuBar.getRoot() == this._oMenuBar) {
            this._oMenuBar.getItem(i).cfg.setProperty("submenu", this._subMenuData[i]);
        }
    }
};

OPMenuBar.prototype.RegisterEvent = function (event, callback) {
	this._oMenuBar.subscribe(event, callback); 
};

OPMenuBar.prototype.RenderMenu = function (){
    this._oMenuBar.render();
}; 

YAHOO.log ("opMenuBar.js :: Script file loading completed");