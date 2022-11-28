/*==================================
    
    YUI Layout Wrapper
    By Daesup, Lee
    
    - Layout Example:
    -------------------------------------------------
        var baseLayout = new OPLayout ("baseLayout", 
            [
                { position: 'top', height: 94, body: 'baseTop', scroll: null, zIndex: 2 },
                { position: 'left', header: 'Left', width: 200, body: 'baseLeft', gutter: '2 5 2 1', collapse: true, scroll: null, zIndex: 1 },
                { position: 'center', height: "100%", scroll: null, resize: false, }
            ]);
        
        var centerLayout = new OPLayout ("centerLayout",
            [
                { position: 'center', body: 'innerCenter', gutter: '2 1 1 1', scroll: false},
                { position: 'bottom', body: 'innerBottom', height: 600, gutter: '5 1 2 1', resize: true, scroll: true}
            ],
            baseLayout.GetWrap("center"),
            resizeCallback,
            baseLayout);
            
        function resizeCallback(layout, parentLayout){
            document.getElementById("DataListSection").style.height = (centerLayout.GetHeight("center") - 30).toString() + "px";
        }
        resizeCallback();
    -----------------------------------------------
====================================*/

YAHOO.log ("opLayout.js :: Script file start loading");

var OPLayout = function (id, units, el, resizeCallback, parentLayout, objs)
{
    this._id = id;
    this._el = el;
    this._units = units;
    this._parentLayout = parentLayout;
    this._objs = objs;
    
    this.oLayout = new YAHOO.widget.Layout(this._el, {
                                            units: this._units,
                                            parent: (this._parentLayout) ? this._parentLayout.oLayout : null
                                           });
                                           
	this.oLayout.OPLayout = this;                                          
	if (resizeCallback)
    	this.oLayout.subscribe("resize", function () {resizeCallback (this.OPLayout, this.OPLayout._parentLayout, this.OPLayout._objs);});
    	
    this.oLayout.render();
};

OPLayout.prototype.Add = function (unitConfig) {
	this.oLayout.addUnit(unitConfig);
};

OPLayout.prototype.Remove = function (unit) {
	this.oLayout.removeUnit(unit);
};

OPLayout.prototype.Destroy = function (){
	this.oLayout.destroy();
};

OPLayout.prototype.GetLayout = function (){
    return this.oLayout;
};

OPLayout.prototype.Resize = function (){
    return this.oLayout.resize();
};

OPLayout.prototype.GetLayoutUnit = function (id) {
	return this.oLayout.getUnitById (id);
};

OPLayout.prototype.GetUnitByPosition = function (positionName) {
	return this.oLayout.getUnitByPosition (positionName);
};

OPLayout.prototype.GetWrap = function (positionName){
    return this.oLayout.getUnitByPosition(positionName).get('wrap');
};

OPLayout.prototype.GetHeight = function (positionName){
    return this.oLayout.getUnitByPosition(positionName).get('height');
};

OPLayout.prototype.GetWidth = function (positionName){
    return this.oLayout.getUnitByPosition(positionName).get('width');
};

OPLayout.prototype.SetHeight = function (positionName, value, isIgnoreEvent){
    return this.oLayout.getUnitByPosition(positionName).set('height', value, (isIgnoreEvent) ? isIgnoreEvent : null);
};

OPLayout.prototype.SetWidth = function (positionName, value, isIgnoreEvent){
    return this.oLayout.getUnitByPosition(positionName).set('width', value, (isIgnoreEvent) ? isIgnoreEvent : null);
};

OPLayout.prototype.GetSize = function (positionName){
	var unit = this.oLayout.getUnitByPosition(positionName);
    return { width: unit.get('width'), height: unit.get('height') };
};
YAHOO.log ("opLayout.js :: Script file loading completed");