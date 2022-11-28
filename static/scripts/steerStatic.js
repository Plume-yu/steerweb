/*
 * 생성 규칙
 * msg : 메세지 문장으로 구성된 텍스트 형식.
 * datatable : datatable object 내에서 사용하는 형식.
 * text : 하나, 둘 정도의 단어로 조합된 텍스트 형식.
 * err_x : 에러 코드에 static mapping 되어 있음. err_ + 에러코드 번호로 강제 형식.
 * col_x : 컬럼에 대한 텍스트. col_ + 컬럼이름 권장.
 * code_x_y : 코드에 대한 텍스트 static mapping 되어 있음. code_ + 코드정의 문자열 + _ + 값 으로 강제 형식.
 * 
 * text의 경우 word로 key를 만들지 않았음 => 같은 word가 다른 의미로 쓰일 수 있기 때문.
 */
 
var iconsIMG = {
				loader_bigbar : "<IMG src='./static/images/loader_bigbar.gif'/>",
				loader_smallbar : "<IMG src='./static/images/loader_smallbar.gif' />",
				loader_small1 : "<IMG src='./static/images/loader_small1.gif' />",
				loader_small2 : "<IMG src='./static/images/loader_small2.gif' />",
				loader_small3 : "<IMG src='./static/images/loader_small3.gif' />",
				loader_mid1 : "<IMG src='./static/images/loader_mid1.gif' />",
				loader_mid2 : "<IMG src='./static/images/loader_mid2.gif' />"
};

var l10nMsg = { 'err_436208621': 'Localization Resource Error (Check your configuration)',
				'text_09': 'OK',
				'text_11': 'ERROR'
				};