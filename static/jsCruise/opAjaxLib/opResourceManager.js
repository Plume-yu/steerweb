/*==================================
    
    OP Resource Manager
    By Daesup, Lee
    
    ! The function name "Destroy" (destroy itself) must be implemented in each resource object 
    
====================================*/
var OPResourceManager = function ()
{
	this.baseDict = new Array();
};

OPResourceManager.prototype.Add = function (key, resource)
{
	this.Remove(key);
	this.baseDict.push({'key' : key, 'resource' : resource});
};

OPResourceManager.prototype.Remove = function (key)
{
	var resource = null;
	var i = 0;
	var found = false;
	for (i = 0; i < this.baseDict.length; i++)
	{
		if (this.baseDict[i]['key'] == key)
		{
	        try {
				resource = this.baseDict[i]['resource'];
				resource.Destroy();
				delete resource;
				found = true;
				break;
	        } catch(err){
	        	YAHOO.log ("Exception::ResourceManager->Remove," + key + "," + err, "error");
	        }
		}
	}
	if (found)
	{
		this.baseDict[i] = null;
		this.baseDict.splice(i, 1);
	}
};

OPResourceManager.prototype.Get = function (key)
{
	for (var i = 0; i < this.baseDict.length; i++)
	{
		if (this.baseDict[i]['key'] == key)
			return this.baseDict[i]['resource'];
	}
	return null;
};

OPResourceManager.prototype.RemoveAll = function ()
{
	if (this.baseDict.length <= 0)
		return;

	for (var i = 0; i < this.baseDict.length; i++)
	{
		try {
			var resource = this.baseDict[i]['resource'];
			resource.Destroy();
			delete resource;
        } catch(err){
        	YAHOO.log ("Exception::ResourceManager->RemoveAll," + err, "error");
        }
	}
	this.baseDict.splice(0, this.baseDict.length);
};

OPResourceManager.prototype.RemoveAllExcept = function (arrExceptKey)
{
	if (this.baseDict.length <= 0)
		return;

	for (var i = 0; i < this.baseDict.length; i++)
	{
		if (CruiseGlobal.ArrayHasValue(arrExceptKey, this.baseDict[i]['key']))
			continue;
		try {
			var resource = this.baseDict[i]['resource'];
			resource.Destroy();
			delete resource;
        } catch(err){
        	YAHOO.log ("Exception::ResourceManager->RemoveAllExcept," + err, "error");
        }
	}
	this.baseDict.splice(0, this.baseDict.length);
};