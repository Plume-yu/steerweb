/*==================================
    
    YUI DataTable Wrapper
    By Daesup, Lee
    
    - Make a column definition as following:
    --------------------------------------------------------
        var columns = [
            {key:"keyName1", parser:"number", label:"KeyLabel1", sortable:false},
            {key:"keyName6", label:"KeyLabel6", sortable:false},           
        ];
    --------------------------------------------------------
    - Paginator is the YAHOO.widget.Paginator:
    --------------------------------------------------------
        new YAHOO.widget.Paginator({
                                    rowsPerPage  : 999,
                                    containers   : "innerTop",
                                    alwaysVisible: true
                                   })
    --------------------------------------------------------
    - selectCallbackFn returns an array of selected items by user
    --------------------------------------------------------
    - contextObj is custom object
    --------------------------------------------------------
    	var contextObj = [ { menuText: "menu1", menuCallback: onMenu1Click },
    						{ menuText: "menu2", menuCallback: onMenu2Click } ];
    	
    	* Callback argument is a dictionary of selected row data
   
    --------------------------------------------------------
    - opConfig is a key-object pair
    --------------------------------------------------------
		selectCallbackFn : calling function as a callback
		addRequestParamFn : The FUNCTION returns parameter key-value request format (ex: &key=value)
		paginator : paginator object 
		contextObj : contextObj object 
		selectionMode : selectionMode "single" or "multi"
		l10nObj : localization object
		formatRow : your formatter
		elAllRecordsCount : total record count of data, not per a page
====================================*/

YAHOO.log ("opDataTable.js :: Script file start loading");

// Inline cell Editing
var OPTextboxCellEditor = function (validator, configs)
{
	var editValidator = (validator) ? validator : YAHOO.widget.DataTable.validateNumber;
	var yahooConfig = {validator: editValidator,
						LABEL_SAVE : (configs != null && configs.LABEL_SAVE != null) ? configs.LABEL_SAVE : "Save",
						LABEL_CANCEL : (configs != null && configs.LABEL_CANCEL != null) ? configs.LABEL_CANCEL : "Cancel",
						};
	
	return new YAHOO.widget.TextboxCellEditor(yahooConfig)
}

var OPTextareaCellEditor = function (validator, configs)
{
	var editValidator = (validator) ? validator : YAHOO.widget.DataTable.validateNumber;
	return new YAHOO.widget.TextareaCellEditor({validator: editValidator})
}


// options: ["a", "b", "c"] or [{label: "a", value:"a"}, {...}]
var OPCheckboxCellEditor = function (validator, options, configs)
{
	var editValidator = (validator) ? validator : null;
	return new YAHOO.widget.CheckboxCellEditor({checkboxOptions: options, validator: editValidator})
}

//options: ["a", "b", "c"] or [{label: "a", value:"a"}, {...}]
var OPDropdownCellEditor = function (validator, options, isMultiple, dropdownSize, configs)
{
	var editValidator = (validator) ? validator : null;
	return new YAHOO.widget.DropdownCellEditor({dropdownOptions: options, multiple: isMultiple, size: dropdownSize, validator: editValidator})
}

//options: ["a", "b", "c"] or [{label: "a", value:"a"}, {...}]
var OPRadioCellEditor = function (validator, options, configs)
{
	var editValidator = (validator) ? validator : null;
	return new YAHOO.widget.RadioCellEditor({radioOptions: options, validator: editValidator})
}

// Paginator
function OPPaginator (targetDiv, rowsPerPage, isAlwaysVisible, configs) {
	targetBaseDiv = targetDiv;
	exportButtonDiv = targetBaseDiv + "_exportButton";
	totalCountDiv = targetBaseDiv + "_TotalCount";
	
	preTemplateBase = "<span id='" + exportButtonDiv + "'></span>&nbsp;Total: <span id='" + totalCountDiv + "'></span>&nbsp;";
	customPageLinks = 10;
	template = preTemplateBase + "{RowsPerPageDropdown}{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} ";
	rowsPerPageOptions = [10, 30, 50];
	firstPageLinkLabel = "<< First";
	lastPageLinkLabel = "Last >>";
	previousPageLinkLabel = "< Prev";
	nextPageLinkLabel = "Next >";

	if (configs)
	{
		if (configs.customPageLinks != null)
			customPageLinks = configs.customPageLinks;
		if (configs.template != null)
			template = preTemplateBase + configs.template;
		if (configs.rowsPerPageOptions != null)
			rowsPerPageOptions = configs.rowsPerPageOptions;
		if (configs.firstPageLinkLabel != null)
			firstPageLinkLabel = configs.firstPageLinkLabel;
		if (configs.lastPageLinkLabel != null)
			lastPageLinkLabel = configs.lastPageLinkLabel;
		if (configs.previousPageLinkLabel != null)
			previousPageLinkLabel = configs.previousPageLinkLabel;
		if (configs.nextPageLinkLabel != null)
			nextPageLinkLabel = configs.nextPageLinkLabel;
	}
	
	this.instance = new YAHOO.widget.Paginator({
                                    rowsPerPage  : rowsPerPage,
                                    containers   : targetBaseDiv,
                                    alwaysVisible: isAlwaysVisible,
                                    pageLinks : customPageLinks,
                                    template : template,
                                    rowsPerPageOptions : rowsPerPageOptions,
                                    firstPageLinkLabel : firstPageLinkLabel,
                                    lastPageLinkLabel : lastPageLinkLabel,
                                    previousPageLinkLabel : previousPageLinkLabel,
                                    nextPageLinkLabel : nextPageLinkLabel
                                   });
	this.exportButtonDiv = exportButtonDiv;
	this.totalCountDiv = totalCountDiv;
}

var OPDataTable = function (key, dataSourceString, columnDef, targetDiv, opConfig)
{
	//Private:
    this._keyColumn = '';
    this._updateStartRowIndex = 0;
    this._totalCountReturned = 0;
    this._dataSourceString = dataSourceString;
    this._intervalID = 0;

    this._id = key;
    this._key = key;
    this._colDef = columnDef;
    this._targetDiv = targetDiv;
    this._rowsPerPage = (opConfig.paginator && opConfig.paginator.instance) ? opConfig.paginator.instance.getRowsPerPage() : 10000000;
    this._paginator = opConfig.paginator;
    this._contextObj = opConfig.contextObj;
    this._selectionMode = (opConfig.selectionMode) ? opConfig.selectionMode : "multi";
    this._elAllRecordsCount = opConfig.elAllRecordsCount;
    this._sort = (opConfig.sortColumn) ? opConfig.sortColumn : '';
    this._dir = (opConfig.sortDir) ? opConfig.sortDir : '';
    this._width = (opConfig.width) ? opConfig.width : "100%";
    this._height = (opConfig.height) ? opConfig.height : "100%";
    this._columnEditorIgnoreInfo = (opConfig.columnEditorIgnoreInfo) ? opConfig.columnEditorIgnoreInfo : null;
    
    this._config = {
        initialRequest: "sort=" + this._sort + "&dir=" + this._dir + "&startIndex=0&results=" + this._rowsPerPage + "&key=" + this._key + ((opConfig.addRequestParamFn) ? opConfig.addRequestParamFn() : ""),
        dynamicData: true, 
        sortedBy: { key : this._sort, dir : this._dir },
        height: this._height,
        width: this._width,
        selectionMode: this._selectionMode,
        paginator: (opConfig.paginator && opConfig.paginator.instance) ? opConfig.paginator.instance : null,
        csvExport: (opConfig.csvExport) ? opConfig.csvExport : 0,
        csvExportCurrentOnly: (opConfig.csvExportCurrentOnly) ? opConfig.csvExportCurrentOnly : 0,
        csvExportButtonFn: (opConfig.csvExportButtonFn) ? opConfig.csvExportButtonFn : '',
        csvExportDownloadFn: (opConfig.csvExportDownloadFn) ? opConfig.csvExportDownloadFn : '',
        dataReturnExternalCallbackFn: (opConfig.dataReturnExternalCallbackFn) ? opConfig.dataReturnExternalCallbackFn : null,
        formatRow: (opConfig.formatRow) ? opConfig.formatRow : null,
        generateRequest: function (oState, oSelf) {
                                                    var sort, dir, startIndex, results;
                                                    oState = oState || {pagination: null, sortedBy: null};
                                                    sort = (oState.sortedBy) ? oState.sortedBy.key : oSelf.getColumnSet().keys[0].getKey();
                                                    dir = (oState.sortedBy && oState.sortedBy.dir == "yui-dt-desc") ? "desc" : "asc";
                                                    startIndex = (oState.pagination) ? oState.pagination.recordOffset : 0;
                                                    
                                                    results = (oState.pagination) ? oState.pagination.rowsPerPage : this._rowsPerPage;
                                                    return  "sort=" + sort +
                                                            "&dir=" + dir +
                                                            "&startIndex=" + startIndex +
                                                            "&results=" + results +
                                                            "&key=" + key +
                                                            ((opConfig.addRequestParamFn) ? opConfig.addRequestParamFn() : "");
                                                },
		MSG_EMPTY : opConfig.l10nObj["datatable_01"],
		MSG_ERROR : opConfig.l10nObj["datatable_02"],
		MSG_LOADING : opConfig.l10nObj["datatable_03"],
		MSG_SORTASC : opConfig.l10nObj["datatable_04"],
		MSG_SORTDESC : opConfig.l10nObj["datatable_05"]
    };
    
    if (opConfig.JSArrayObejct){
    	this._oYuiDataSource = new YAHOO.util.DataSource(opConfig.JSArrayObejct.data);
    	this._oYuiDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
    	this._oYuiDataSource.responseSchema = {
    		fields: this._colDef,
    	};
    }
    else
    {
		this._oYuiDataSource = new YAHOO.util.DataSource(this._dataSourceString);
		this._oYuiDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
		this._oYuiDataSource.responseSchema = {
		    resultsList: "records",
		    fields: this._colDef,
		    metaFields: {
		        totalRecords: "totalRecords",
		        AllRecordsCount : "AllRecordsCount",
		        returnCode: "returnCode",
		        exceptionFlag: "exceptionFlag",
		        errMsg: "errMsg",
		        trace: "trace",
		        csvExport: "csvExport",
		        csvFile: "csvExportFile",
		        csvPath: "csvExportPath",
		        additionalData: "additionalData"
		    }
		};
    }
	
	this._oYuiDataTable = new YAHOO.widget.ScrollingDataTable(this._targetDiv, this._colDef, this._oYuiDataSource, this._config);
	this._oYuiDataTable.wrapper = this;
	YAHOO.log ("OPDatatable Created: [" + this._id + "|" + this.key + "|" + this._dataSourceString + this._config.initialRequest + "|" + this._targetDiv + "]" , "debug");
	
	// Event Handler =================
	if (this._selectionMode == "single" || this._selectionMode == "multi"){
		this._oYuiDataTable.subscribe("rowMouseoverEvent", this._oYuiDataTable.onEventHighlightRow); 
		this._oYuiDataTable.subscribe("rowMouseoutEvent", this._oYuiDataTable.onEventUnhighlightRow);
		this._oYuiDataTable.subscribe("rowClickEvent", this._oYuiDataTable.onEventSelectRow);
	}
	

	var highlightEditableCell = function(oArgs){
		var elCell = oArgs.target;
		if (YAHOO.util.Dom.hasClass(elCell, "yui-dt-editable")){
			this.highlightCell(elCell);
		}
	}
	
	var OnEditorSaveEvent = function (oArgs){
		var columnKey = oArgs.editor.getColumn().getKey();
		var oRecord = oArgs.editor.getRecord();
		var newValue = oRecord.getData(columnKey);
		var recordIndex = this.getRecordIndex(oRecord);
		this.getDataSource().liveData[recordIndex][columnKey] = newValue;
	}
	
	var OnEventShowCellEditor = function (oArgs){
		var info = this.wrapper._columnEditorIgnoreInfo;
		
		if (info) {
			var record = this.getRecord(oArgs.target);
			var rData = record.getData();
			
			if (rData[info.ignoreColumnName] == info.ignoreColumnValue)
				return;
			else
				this.onEventShowCellEditor(oArgs);
		}
		else{
			this.onEventShowCellEditor(oArgs);
		}
	}
	
	this._oYuiDataTable.subscribe("cellMouseoverEvent", highlightEditableCell);
	this._oYuiDataTable.subscribe("cellMouseoutEvent", this._oYuiDataTable.onEventUnhighlightCell);
	this._oYuiDataTable.subscribe("cellClickEvent", OnEventShowCellEditor);
	this._oYuiDataTable.subscribe("editorSaveEvent", OnEditorSaveEvent);
	
	if (opConfig.selectCallbackFn)
	{
		this._oYuiDataTable.subscribe("rowSelectEvent", function (el, record) {
		    											if (!this._isPayLoad) {
			    											this.clearTextSelection();   											
			                                                opConfig.selectCallbackFn(this._GetSelectedRows(), this.wrapper);
		    											}
		                                             }
		);
		this._oYuiDataTable.subscribe("rowUnselectEvent", function (el, record) {
		    											this.clearTextSelection();								
			                                            opConfig.selectCallbackFn(this._GetSelectedRows(), this.wrapper); 
		                                             }
		);	
	}
	else
	{
		this._oYuiDataTable.subscribe("rowSelectEvent", function (el, record) {
		    											if (!this._isPayLoad) {
			    											this.clearTextSelection();   											
			                                                this._GetSelectedRows();
		    											}
		                                             }
		);
		this._oYuiDataTable.subscribe("rowUnselectEvent", function (el, record) {
		    											this.clearTextSelection();   											
														this._GetSelectedRows();
		                                             }
		);	
	}
	this._oYuiDataTable.subscribe("dataReturnEvent",  function (oStatus) {
													if (opConfig.returnCodeValidator)
														opConfig.returnCodeValidator(oStatus.response.meta);
													
													if (opConfig.dataReturnExternalCallbackFn)
														opConfig.dataReturnExternalCallbackFn(oStatus.response.meta);
													
													this.wrapper._totalCountReturned = oStatus.response.meta.totalRecords;
													isExport = oStatus.response.meta.csvExport;
													if (isExport && Number(isExport) == 1){
														this.wrapper._config.csvExportDownloadFn(oStatus.response.meta.csvPath, oStatus.response.meta.csvFile);
													}
	                                             }
	);
	
	this._oYuiDataTable.subscribe("postRenderEvent",  function () {
													CruiseGlobal.GetEl(this.wrapper._paginator.totalCountDiv).innerHTML = this.wrapper._totalCountReturned;
													
													if (this.wrapper._config.csvExport == 1){
														this.wrapper._config.csvExportButtonFn (this.wrapper);
													}
	}
	);
	
	//================================
	YAHOO.widget.ScrollingDataTable.prototype._GetSelectedRows = function ()
	{
	   	this._selectedRows = new Array();
	    for (var i = 0; i < this.getSelectedRows().length; i++)
	        this._selectedRows.push(this.getRecordSet().getRecord(this.getSelectedRows()[i])._oData);
	    return this._selectedRows;
	};
	    
	this._oYuiDataTable.handleDataReturnPayload = function(oRequest, oResponse, oPayload) {
		this._isPayLoad = true;
	    oPayload.totalRecords = oResponse.meta.totalRecords;
	    
	    if (this.wrapper._elAllRecordsCount)
	    	this.wrapper._elAllRecordsCount.innerHTML = oResponse.meta.AllRecordsCount;
	    
		if (this._selectedRows)
		{
			this.unselectAllRows();
			var recs = this.getRecordSet()._records;
			for (var i = 0; i < recs.length; i++) {
				for (var j = 0; j < this._selectedRows.length; j++) {
					if (!recs[i]) continue;
					
					var isFound = true
					for (idx in this._keyColumn) {
						if (recs[i].getData(this._keyColumn[idx]) != this._selectedRows[j][this._keyColumn[idx]]) {
							isFound = false;
							break;
						}
							
					}
					if (isFound)
						this.selectRow(recs[i]);
				}
			}
		}
		this._isPayLoad = false;
		
		if (CruiseGlobal.SHOWLOADING != null)
			CruiseGlobal.SHOWLOADING.hide();
		if (CruiseGlobal.NOWLOADING != null)
			CruiseGlobal.NOWLOADING.hide();
	    return oPayload;
	};
    var onContextMenuClick = function(p_sType, p_aArgs, p_objs)
    {
        var task = p_aArgs[1];
        if(task)
        {
			var elRow = this.contextEventTarget;
			elRow = p_objs[0].getTrEl(elRow);
			if(elRow)
			{
				var oRecord = p_objs[0].getRecord(elRow);
				p_objs[1][task.index].menuCallback (oRecord._oData, p_objs[0].wrapper);
            }
        }
    };
    
    
    if (this._contextObj)
    {
	    this.contextMenu = new YAHOO.widget.ContextMenu(this.id + "_contextmenu", {trigger:this._oYuiDataTable.getTbodyEl()});
	    
	    for (var i = 0; i < this._contextObj.length; i++) {
	    	this.contextMenu.addItem(this._contextObj[i].menuText);
	    }

	    this.contextMenu.render(this._targetDiv);
	    this.contextMenu.clickEvent.subscribe(onContextMenuClick, [this._oYuiDataTable, this._contextObj]);
	}
};

OPDataTable.prototype._ExcelExportRequest = function (isExportAll)
{ 
	this._oYuiDataTable.getDataSource().sendRequest(this._config.generateRequest(this._oYuiDataTable.getState(), this._oYuiDataTable) + "&csvExport=" + ((isExportAll == true) ? "2" : "1"),
			    								{
			    									success: this._oYuiDataTable.onDataReturnReplaceRows,
			    									failure: this._oYuiDataTable.onDataReturnReplaceRows,
			    									scope: this._oYuiDataTable,
			    									argument: { updateIndex : this._updateStartRowIndex }
			    								});
};


OPDataTable.prototype._Refresh = function (updateStartRowIndex)
{
	if (updateStartRowIndex)
		this._updateStartRowIndex = updateStartRowIndex;
	else if (this._oYuiDataTable.getState().pagination)
		this._updateStartRowIndex = this._oYuiDataTable.getState().pagination.recordOffset;
	else
		this._updateStartRowIndex = 0;
	
	this._oYuiDataTable.getDataSource().sendRequest(this._config.generateRequest(this._oYuiDataTable.getState(), this._oYuiDataTable),
			    								{
			    									success: this._oYuiDataTable.onDataReturnReplaceRows,
			    									failure: this._oYuiDataTable.onDataReturnReplaceRows,
			    									scope: this._oYuiDataTable,
			    									argument: { updateIndex : this._updateStartRowIndex }
			    								});
};

//public:
OPDataTable.prototype.Destroy = function() {

	if (this._paginator)
	{
		this._paginator.instance.destroy();
		delete this._paginator;
	}
	
	if (this._contextObj)
	{
		this.contextMenu.destroy();
		delete this._contextObj;	
	}
	
	// YUI instance should be destroyed after all created instances are destroyed
	this._oYuiDataTable.destroy();
};

OPDataTable.prototype.SetKeyColumn = function(keyColumn) {
	this._oYuiDataTable._keyColumn = [keyColumn];
};

OPDataTable.prototype.SetKeyColumnIdx = function (columns, idx) {
	this._oYuiDataTable._keyColumn = [columns[idx].key]
};

OPDataTable.prototype.SetKeyColumns = function(keyColumns) {
	this._oYuiDataTable._keyColumn = keyColumns;
};

OPDataTable.prototype.SetKeyColumnIdxs = function (columns, idx) {
	var arrKeyStr = new Array();
	for (i in idx){
		arrKeyStr.push(columns[idx[i]].key);
	}
	this._oYuiDataTable._keyColumn = arrKeyStr;
	//alert(YAHOO.lang.dump(arrKeyStr));
};

OPDataTable.prototype.ResizeEventDelegator = function() {
	return this._Refresh();
};

OPDataTable.prototype.Refresh = function (updateStartRowIndex)
{
	return this._Refresh(updateStartRowIndex);
};

OPDataTable.prototype.GetSelectedRows = function ()
{
	return this._oYuiDataTable._GetSelectedRows();
};

OPDataTable.prototype.GetLiveData = function ()
{
	return this._oYuiDataTable.getDataSource().liveData;
};

OPDataTable.prototype.GetRecordSet = function ()
{
	return this._oYuiDataTable.getRecordSet();
};

OPDataTable.prototype.StartInterval = function (miliseconds, updateStartRowIndex)
{
	if (updateStartRowIndex)
		this._updateStartRowIndex = updateStartRowIndex;
	else if (this._oYuiDataTable.getState().pagination)
		this._updateStartRowIndex = this._oYuiDataTable.getState().pagination.recordOffset;
	else
		this._updateStartRowIndex = 0;
		
    this._intervalID = this._oYuiDataTable.getDataSource().setInterval(miliseconds, 
    											this._config.generateRequest(this._oYuiDataTable.getState(), this._oYuiDataTable),
			    								{
			    									success: this._oYuiDataTable.onDataReturnReplaceRows,
			    									failure: this._oYuiDataTable.onDataReturnReplaceRows,
			    									scope: this._oYuiDataTable,
			    									argument: { updateIndex : this._updateStartRowIndex }
			    								});
};

OPDataTable.prototype.StopInterval = function ()
{
	this._oYuiDataTable.getDataSource().clearInterval(this._intervalID);
};

OPDataTable.prototype.GetAllRecordsCount = function ()
{
	return this._AllRecordsCount;
};

YAHOO.log ("opDataTable.js :: Script file loading completed");