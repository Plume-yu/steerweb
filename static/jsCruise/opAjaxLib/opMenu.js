/*==================================
    
    YUI Menu Wrapper
    By Daesup, Lee
    
    - Menu Example:
    -------------------------------------------------
        var leftMenu = new OPMenu ("menuIDHere", "renderDivHere", [
                [
                    { text: "Text1-1", onclick: { fn: functionWhenYouClickThis, obj: "objectYouWantToPass"} },
                    { text: "Text1-2", url: "http://test.com" },
                ],
                [   { text: "Text2", url: "http://test.com" }     ],
                [   { text: "Text3", url: "http://test.com" } ]
            ],
            ["테스트1", "테스트2", "테스트3"]
        );
        leftMenu.RenderMenu();
    -----------------------------------------------
====================================*/

YAHOO.log ("opMenu.js :: Script file start loading");
function OPMenu (id, targetDiv, items, groupTitles, menuConfig)
{
    //private:
    var _id = id;
    var _targetDiv = targetDiv;
    var _items = items;
    var _groupTitles = groupTitles;
    var _menuConfig = menuConfig;
    
    var _oMenu = new YAHOO.widget.Menu(
                            _id,
                            (_menuConfig) ? _menuConfig : { position: "static" }
                    );
                    
    _oMenu.addItems (_items);
    
    for (var i = 0; i < _groupTitles.length; i++){
        _oMenu.setItemGroupTitle(_groupTitles[i], i);
    }
    
    //public:
    this.RenderMenu = function () {
        _oMenu.render(_targetDiv);
    };
    
    this.ChangeMenuText = function (itemIndex, groupIndex, text){
        _oMenu.getItem(itemIndex, groupIndex).cfg.setProperty("text", text);
    };
}
YAHOO.log ("opMenu.js :: Script file loading completed");