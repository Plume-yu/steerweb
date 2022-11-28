/*==================================
    
    YUI Validation Utility Container
    By Daesup, Lee
    
====================================*/

// THIS IS SINGLETON OBJECT! Instanciation in opGlobal.js

YAHOO.log ("opValidation.js :: Script file start loading");
var _OPValidation = function ()
{
};

_OPValidation.prototype.Length = function (userVal)
{
	var i, j = 0;
	for (i = 0; i < userVal.length; i++)
	{
		valLen = escape(userVal.charAt(i)).length;
		if (valLen > 4)
			j++;
		j++;
	}
	return j;
};

_OPValidation.prototype.HasValue = function (userVal)
{
	var val = YAHOO.lang.trim(userVal);
	if (val != undefined && val != null && val != undefined && val != NaN && val.toString().length > 0)
		return true;
	else
		return false;
};

_OPValidation.prototype.IsNumber = function (userVal, nullable)
{
	var len = userVal.toString().length;
	var val = YAHOO.lang.trim(userVal.toString());

	if (!nullable)
	{
		if (val == null || val == '')
			return false;
	}
	
	if (val == null || val == '')
	{
		if (len > 0)
			return false;
		return true;
	}
	if (YAHOO.lang.isNumber(Number(val)))
		return true;
	else
		return false;
};

_OPValidation.prototype.HasSpecialCharacter = function (userVal)
{
	var val = YAHOO.lang.trim(userVal);
	re = /[~!@\#$%^&*\()\-=+_\[\]{};'<>,.\/?\\|]/gi;
	if (re.test(val))
		return true;
	else
		return false;
};

_OPValidation.prototype.HasRECharacter = function (userVal, regularExpStr)
{
	var val = YAHOO.lang.trim(userVal);
	if (regularExpStr.test(val))
		return true;
	else
		return false;
};

_OPValidation.prototype.HasAlphaNumeric = function (userVal)
{
	var val = YAHOO.lang.trim(userVal);
	re = /^[0-9a-zA-Z]+$/;
	if (re.test(val))
		return true;
	else
		return false;
};

_OPValidation.prototype.MaxLength = function (userVal, maxLength)
{
	var val = YAHOO.lang.trim(userVal);
	if (val != undefined && val != null && val != undefined && val != NaN && this.Length(val) <= maxLength)
		return true;
	else
		return false;
};

_OPValidation.prototype.MinLength = function (userVal, minLength)
{
	var val = YAHOO.lang.trim(userVal);
	if (val != undefined && val != null && val != undefined && val != NaN && this.Length(val) >= minLength)
		return true;
	else
		return false;
};

_OPValidation.prototype.IsUIntNotZero = function (userVal, maxLength)
{
	if (!this.HasValue(userVal))
		return false;
	if (this.HasSpecialCharacter(userVal))
		return false;
	if (!this.IsNumber(userVal))
		return false;
	if (!this.MaxLength(userVal, maxLength))
		return false;
	if (Number(userVal) <= 0)
		return false;
	
	return true;
};

_OPValidation.prototype.IsDate = function (inputDate, splitChar)
{
	var point = (splitChar == null) ? "-" : splitChar;
    var dateElement = new Array(3);
    
	inputDate = inputDate.substring(0, 10);
    if(point != ""){
        dateElement = inputDate.split(point);
        if(inputDate.length != 10 || dateElement.length != 3){
            return false;
        }
    }else{
        dateElement[0] = inputDate.substring(0,4);
        dateElement[1] = inputDate.substring(4,6);
        dateElement[2] = inputDate.substring(6,9);
    }

    //년도 검사
    if( !( 1800 <= dateElement[0] && dateElement[0] <= 4000 ) ) {
        return false;
    }

    //달 검사
    if( !( 0 < dateElement[1] &&  dateElement[1] < 13  ) ) {
        return false;
    }

    // 해당 년도 월의 마지막 날
    var tempDate = new Date(dateElement[0], dateElement[1], 0);
    var endDay = tempDate.getDate();

    //일 검사
    if( !( 0 < dateElement[2] && dateElement[2] <= endDay ) ) {
         return false;
    }

    return true;
};

_OPValidation.prototype.IsTime = function (inputTime, splitChar)
{
    try {
    	var point = (splitChar == null) ? ":" : splitChar;
        var dateElement = new Array(3);
        
        if(inputTime.length != 8){
            return false;
        }
        
    	inputTime = inputTime.substring(0, 8);
        if(point != ""){
            dateElement = inputTime.split(point);
            if(dateElement.length != 3){
                return false;
            }
        }else{
            dateElement[0] = inputTime.substring(0,2);
            dateElement[1] = inputTime.substring(2,4);
            dateElement[2] = inputTime.substring(4,6);
        }
        
        dateElement[0] = Number(dateElement[0]);
        dateElement[1] = Number(dateElement[1]);
        dateElement[2] = Number(dateElement[2]);

        //시간 검사
        if( !( 0 <= dateElement[0] && dateElement[0] <= 23 ) ) {
            return false;
        }

        //분 검사
        if( !( 0 <= dateElement[1] &&  dateElement[1] <= 59  ) ) {
            return false;
        }
        
        //초 검사
        if( !( 0 <= dateElement[2] && dateElement[2] <= 59 ) ) {
             return false;
        }

        return true;
    }
    catch(e) {
    	return false;
    }

};

/*
 * 날짜 비교
 * 종료일이 시작일 보다 작을때 false를
 * 정상 기간일 경우 true를 리턴한다.
 * 날짜가 잘못되었을 경우 null을 리턴한다.
 * @param startDate 시작일
 * @param endDate 종료일
 * @param splitChar 날짜 구분자
 */
_OPValidation.prototype.CompareDate = function (startDate, endDate, splitChar){
    //정상 날짜인지 체크한다.
	var point = (splitChar == null) ? "-" : splitChar;
	
    if(!this.IsDate(startDate, point)){
        return null;
    }
    
    if(!this.IsDate(endDate, point)){
        return null;
    }
    
    startDate = startDate.substring(0, 10);
    endDate = endDate.substring(0, 10);
    //년 월일로 분리 한다.
    var start_Date = new Array(3);
    var end_Date = new Array(3);

    if(point != ""){
        start_Date = startDate.split(point);
        end_Date = endDate.split(point);
        if(start_Date.length != 3 && end_Date.length != 3){
            return false;
        }
    }else{
        start_Date[0] = startDate.substring(0,4);
        start_Date[1] = startDate.substring(4,6);
        start_Date[2] = startDate.substring(6,9);

        end_Date[0] = endDate.substring(0,4);
        end_Date[1] = endDate.substring(4,6);
        end_Date[2] = endDate.substring(6,9);
    }

    //Date 객체를 생성한다.
    var sDate = new Date(start_Date[0], start_Date[1], start_Date[2]);
    var eDate = new Date(end_Date[0], end_Date[1], end_Date[2]);

    if(sDate > eDate){
        return false;
    }

    return true;
}

_OPValidation.prototype.IsArray = function (target)
{
	if (target != null && typeof target == 'object'){
		return (typeof target.push == 'undefinded') ? false : true;
	} else {
		return false;
	}
}

YAHOO.log ("opValidation.js :: Script file loading completed");