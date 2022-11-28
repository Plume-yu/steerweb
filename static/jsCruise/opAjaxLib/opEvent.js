/*==================================
    
    YUI Event Wrapper
    By Daesup, Lee
    
    
	* onAvailable: onAvailable targets a single element and fires when that element is available (when it responds to document.getElementById()) 
				   but you can't count on the element's children having been loaded at this point.
	* onContentReady: When you care about not just your target element but its children as well, use onContentReady. 
					  This method will tell you that your target element and all of its children are present in the DOM.
	* onDOMReady: Some DOM scripting operations cannot be performed safely until the page's entire DOM has loaded.
	              onDOMReady will let you know that the DOM is fully loaded and ready for you to modify via script.
====================================*/

// THIS IS SINGLETON OBJECT! Instanciation in opGlobal.js

YAHOO.log ("opEvent.js :: Script file start loading");
function OPEvent ()
{
	this.onDOMReady = function (fn , obj , overrideContext ) {
		YAHOO.util.Event.onDOMReady(fn, obj, overrideContext);
	};
	
	this.addListener = function (el , sType , fn , obj , overrideContext ) {
		YAHOO.util.Event.addListener(el, sType, fn, obj, overrideContext);
	};
	
	this.CreateKeyListener = function (attachTo, keyCode, callbackFn, args, isUseCtrl, isUseAlt, currentScope, isKeyUp) {
		if (!isUseCtrl) isUseCtrl = false;
		if (!isUseAlt) isUseAlt = false;
		if (!currentScope) currentScope = window;
		if (!isKeyUp)
			keyEvent = YAHOO.util.KeyListener.KEYDOWN;
		else 
			keyEvent = YAHOO.util.KeyListener.KEYUP;
		
		return new YAHOO.util.KeyListener(attachTo, 
											{ ctrl: isUseCtrl, alt: isUseAlt, keys: keyCode }, 
											{ fn:callbackFn, obj: args, scope: currentScope, correctScope:true },
											keyEvent
		);
	};
}
YAHOO.log ("opEvent.js :: Script file loading completed");