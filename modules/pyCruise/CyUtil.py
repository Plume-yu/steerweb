#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
utility functions for Op System 
using Cython 

made by kasw 2010,2011 
"""

import base64,sys,random
import struct, time
import Crypto.Cipher.AES

trans64s = [ 
'bA85lrkC=zgnEvSGOoD1jTHY3ZF_U2RpcIMQ7sPm9qK4ah0XdeJN6uW-BtwyVxfLi',
'IJ3s-j=QSM1vTy9B4icqK7HNGE5Aftz2O6Rl8L0xYZmUCpgwXru_DhWFPenbaokdV',
'_85rXHPh=J0WnpkDY9lba7KQgFxRsO2MCE1qBtvojAyc-NeZUdGV36zwifLS4ITmu',
'ZP7qnEk_BRu2CQDoFjOsV194NmeMwfr=haXvIg3bl0UpzWGcH-iyx5tdJLTAKY86S',
'BgQHGW1N6qA0RYoSZhFml5ie9d-Va7fPD=jsUrM_wtkOuyKpx3nIczJ42XCLEvb8T',
'LoNRGlvtDmiXkMhy7CpH4Pj90OzeKrFcWwxB28g1I6_JfYZQSu5anVEsbT-U3qdA=',
'Vs3Nw-YBKhA6xp=iH9a48oEMXvOtQkcPfGuTICey217z5SjmqDdgJRZ_lLU0FnWrb',
'tP=Ta284cwzJd_L5v6CexjpHN3MDs1mBkqRnYXfFKGEV0r-7ZUgulObI9SAhQiyoW',
'BS5T6PuI3_ZyVNRMGdczm8Y94kWJtUAXEO7s0gwiF1xnrHj2D=CbhLl-ofQKqpvae',
'lZdMGgK9QcRiStOLpFo0P4E-Ae6DbWhx=U_YVum8CaJyfNzjskqX32nBwIv75rT1H',
'sLMSexh=JjHRdniyCZV8TKIglpP_2u1mfY7vX0cDobNwG4qWzaUAE-6k5r9OF3BtQ',
'rqLObZ715GT2-eVvJBcAMmj4h_SRFUXw30PYWnfEtx89odIkpNQy6lHgKC=siuzDa',
'yi-JqzgVa8j9T1QbYcleK7AIPBUo5u2=CNf4sGmLWORhZM6k0wEvS3xpDt_dHFXrn',
'w42Ivu6sU3nmKfMparhdTY0tzS-WqJHeVN98ybjQX7FBOoA1PRiclZCG5gE_xLD=k',
'NUxnHZGIVd-Y6D21vzCqwf8pyc5J4RBE7lkjraiA90SOXesWgmoLtP=Qu3MhbT_FK',
'XZTNumPR3q0bKpGoeBDxVfhMl5U6nkyCwEYH4sa7z=WSidIjrg_cAF8Q9J2vO-1Lt',
'l8DxfXmYwLRe2gK57N9H-SF_Q4nGBrEj3tzC=6sM1OWoPUv0IhZubTApdVqciaykJ',
'9IYKHTtM-bO6C_lieUEvL31NZr=zPynogqx47JG8dADRWf0XumV5Qh2ksajpBFScw',
'yYT-a0NkjUuKAOS_b2mhMoB1Xgf569=WdVrIwE4JiLvFneHtRplDq7scQ8PxGZC3z',
'Yt3FKL51kbxfiHuVgoOQD6N=W9_-nrGMmwh4eIj8pBZJzCTyaqP2UsERd0XAlvSc7',
'qwfAGv4=BDjHE1QJdNZTFyMcru_nI03mzLk9p8esaVX7bKUCi-PhWo2gSxt65lROY',
'CGngt1Ui5YlPO6qTuo_IvKWVS0BsNpe3JcLX=hjDyarfxz89QwE2AkM-mdbZH74RF',
'YvFJi9_TuG5MhDSB04QRpPaUme7=-sdyXrIzLVNqwH83jcK2OAWg6lE1kobZntCfx',
'unCiP=MBYUp2SEfI5bvoTsZqLlAF-XNzgKDWyJ0m93teHdw4ROc7QrGhaj8V16_kx',
'zavjCwqPrOHI28T6X9hUVN5EF0Rf-tomDdp_W71Jk=MxiKgAYeGlu3QLcbnBSsyZ4',
'h=aQ39JEkqtIiUOH86mpDCATGzF_b0xSKVXj7Wd4lNLrB5RnPsc-wf1uvyYgeZMo2',
'hbfZ=-N6A3c08IWQmCv4PYR_Uqu1zterSlJ2igBHTEkjKMa9wnFpLdyO7DVXG5sxo',
'9XAN1gV-wQu=7fqa8YsvKD_cxTJFtyMLEemSp6kndOUr5zC24oHWl0IiGhB3PZjRb',
'3vrPBoRLq6-8EsD0Ib=pCYc9FhyMxmAGztl7f_kuTXNin5OQKe4SJwjVWaHdZ12gU',
'ob5MTpA1HsQeO3YwG8VZSgfhUd-LR6iC27jqFKNBXrzJEyu0Dt_4v=kWI9xaPncml',
'aAHrsKv05JO=nb-8e3folUQiCLumBzY9Ftpxg_wXEk4NPW1dRTG2jZIDS7yMhq6cV',
'Rmq8A-Nc90nO1gIiHk_LSaluY7e6KUDjyz4GbZEdFthJVQoPrsX3Cw5xTf=vBMp2W',
'lRf=KQDN8FXn_-b6HvTCaZhoLIAyxGUEwg4pYOsdz1Jj3mcet07Mq9ki2Wru5VSBP',
'EGtNPX4hTfxj90dCV=o3_AQ8vzyq1cr27Ru5YesUFZabSwgMWnB6DpLHI-mOKlJki',
'iE63oGVPN2FpeKjTnJzy8Z4fr7kIua-Y9x_HCOXtBgmUdWwcADS1RlsvL0h5M=bqQ',
'DsO2Fp1EQhA8=jHzIGnCJUK96myrbSL_tB4g7w-0cNqfo5kXPRTlZVdueYaiMx3Wv',
'zA=waV0niOeWNflouq_m1LRXv63phcr2My7IsQtg9P4jYH8KBCUbJGxEkD-TFSZd5',
'MX0WbjB-GoZ=42N_SLvPkRyIQDpgtE7OHhcTYVu13K5idJAq9wlsfCnxez8rF6Uma',
'QkH8YWdSPer9Zx6p4jTz0uJnbFiVhmga2OcUCEBDKL7RX1GvlNfow_A=Mq3yIs5t-',
'xKgPbGAhi-MluqsRJ25n6Yaz841yrFjoVdBCpILvS_mO=EH0TDcXfkeUtWw73Q9NZ',
'kBx6CbThGmSNwiyDJvKRVcsqzU=_EdWoL3Pf-tuOM2jXe4QZH01aAlr78F9pg5YnI',
'KSPRVgsneQk8E3hZX2TA16opm=f-INuMWLHa7wv9GDrcJxlFCbztB5dUq4iYOy0j_',
'GsiP6KBN3Oh8S0qt47fobcU2Ru1gQFwZy_rzdA-x9mHlaCn=DYpTXJEL5WjVeMvkI',
'lL0ZyaP-pG2Yd3Bxmw=oThU9VQqOFRAbMtk65vzsuWI8rCcH4SJ1nEeX7Kg_DfjNi',
'w9_f8zkcbio-60YgsBaGQNHIpt3Zjl7xT5emXOPUFdqnVRCEh42MSy1vLKDuJ=rAW',
'1yDwEpHGNvRPVg0-3O5fMC=Yret8bdKAoITsjx6lk_zQZ9iBFLSaWhmn27UuJq4Xc',
'pr0Ej1xTSBI7oiyCvM6DPdGK5zOcV_a2bNFsRlnU3YmJq=QZ4uAgfkXWewH9ht8-L',
'JArIlgz1nMeRDqX_EWUCuS=tfsjNko-PH2vKG68ZcwO3Lp5TQBbyi4Fd79xmah0VY',
'kQe0hZLg1WqToMxIt-3PRBzFXVmw7Hd_ljcn2fK9C=S4y8DYOuErJGb6NsavUA5pi',
'SlHTDxWoMiB73OmhJI18NdnCKsZb=9Y0tRfgj-eEvc5_2zkUuLqAwaFy4pGVXr6QP',
'TDIgFEiJfQX76oSnP5Lxw=azRNmsbK2_MC3YBeqkVAlOr8WvUuGpy491-0cZdthjH',
'Len19SXVAZqTw3m-4PHcI57GO86KRYvzxh0Do_d2ksbNuCFtygJpErjQUlM=BfiaW',
'e0DVpa3MbPndlWKqFNw=12ZjxBsTIcEvgYimO6SJ_A-hrXGH5kuR8f7Qt9y4LoUCz',
'JmO=M_Zxu9IL3jyBnwaAFd6r0HG8KVNe2UzDXYR5iT1sotpkcvS4fgC-PQ7WqbhEl',
'4XxwT1rn2Z=QKUOj6Lvm7JRphBotfNy3HC8EA-GFIleY9sV5kPz_0ucbMDaSgWdqi',
'7gFnr1ULNus-hDvAPSJfwopT3G4=lBkI806bMzmHZyce2ORW_CQKEqXjYaxdt5V9i',
'xsazCUBJh2MktI5ENRKd8_byDFloQP74cqeTSi16g9ZYmO3=W0XLAjvfwpnurG-VH',
'ql4_7Do-Vcgz5wYLPkp1ATiBCb3FSImafORv=usHhyNxZGe28Q6ntX9JUKjWEd0rM',
'hWJmLfjIH_X4cs-M9qwA0iexB73rKU6VORGn1YoQtd2S8EF=5uZgybTaClNzkDpPv',
'VXfMOpoFG187J6_lNnShDZqzYHixkWsdwuCtTAgyjIEUKc9Pm-r52vQLe4=a0bB3R',
'xM3I0XnfmdyDWtHTEolk=_w8jBUcvg6As-QRVYSqe2rJCZ4i1N7hzOFpbGuLK59Pa',
'4Rs3DcjO7vL5KSkGrgoBHtn-fIQhblZTxJ2pVymawPWMeUu_Y0AqEN1XC8F9z6d=i',
'2T8N5_RPvyUIaXS1WlZVM9pJ74OH0CsxEtDYB-=ednomKwfGzhbrFugkc3QijA6Lq',
'=FqVRKC4rSvY8Hiwst_o152TMUGJOkLX6dIc3NZme-hbEyAW7pjDlQafBPznxgu90',
'vl3BrfZkyuMWI8A7CxJHmD5KEsXoQaS1dPz_wGbpiOhg-qF0=RU42nLT9VtYcNje6'
]
base64string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-='


# table making functions 
def shuffletranslantiontable(oristr):
    orilist = list(oristr)
    random.shuffle(orilist)
    return "".join(orilist)
def maketranstable(oristr=base64string):
    for i in range(len(oristr)):
        print "'" + shuffletranslantiontable(oristr) + "',"

def toTrans(srcstr,fromtrans,totrans):
    def getpos( ch ):
        return fromtrans.find(ch)
    
    rtns = "".join( [ totrans[getpos(c)] for c in srcstr ] ) 
    return rtns
        
# service functions 
def decrypt( todestr):
    tnum = base64string.find(todestr[0])
    return base64.b64decode( toTrans( todestr[1:] , trans64s[tnum], base64string ) ,"-_")

def encrypt( toenstr):
    tnum = random.randint(0,len(trans64s)-1)
    return base64string[tnum] + toTrans( base64.b64encode(toenstr,"-_" ) , base64string ,trans64s[tnum] )   
 
    
# password salt functions 
def generateRandomSaltString(lenPwd):
    """
    base String 내에서 random으로 min에서 max길이의 character 들을 뽑아내 salt string을 만든다.
    password는 기본적으로 16byte를 기준으로 한다.
    salt는 16byte를 모두 채운 후 기본으로 8byte, 랜덤으로 0~8byte가 추가로 붙게된다.
    """
    base = 'abcdefghijklmnopqrstuvwxyz1234567890'
    salt = ''
    less = 16 - lenPwd
    max = min = less + 8 if less > 0 else 8
    max += random.randint(0, 8)
    for x in random.sample(base, random.randint(min, max)):
        salt += x
    return salt

# session functions
sessionCodec = Crypto.Cipher.AES.new("1234567890123456")
def steerSessionMake(idint, timet = None, int3 = None, int4 = None):
    """세션 키 생성기
    4개의 32bit int를 받아서 128bit hex string을 돌려 주는 함수
    1개만 주는 경우 나머지는 자동으로 채운다.
    """
    timet = int(time.time()) if timet == None else timet
    int3 = random.getrandbits(32) if int3 == None else int3
    int4 = random.getrandbits(32) if int4 == None else int4

    data = struct.pack("<I", idint) + struct.pack("<I", timet) + struct.pack("<I", int3) + struct.pack("<I", int4)
    endata = sessionCodec.encrypt(data)
    enlist = struct.unpack("<IIII", endata)
    return "%08x%08x%08x%08x" % enlist
def steerSessionParse(sessionKey):
    """세션 키를 분석해서 원래 값을 만드는함수
    4개의 int 를 돌려준다.
    makeSessionKey 의 인자 순으로 돌려준다.
    """
    if not sessionKey:
        return None
    ints = [struct.pack("<I", int(sessionKey[a:a+8] ,16)) for a in range(0,32,8)]
    data = "".join(ints)
    dedata = sessionCodec.decrypt(data)
    delist = struct.unpack("<IIII", dedata)
    return delist


# testing code 

def crypttest():
    toenstr="kaswadslfk;ajsf49;slazdijfasl;kf4389a;seifljawe;fklajsd"
    if len(sys.argv) == 2  :
        toenstr = sys.argv[1]
    print toenstr
    todestr = encrypt(toenstr)
    print todestr
    destr = decrypt(todestr)
    if toenstr != destr :
        print "incorrect", toenstr, destr
    
if __name__ == "__main__":
    #maketranstable()
    crypttest()
    
__all__ = [ 'decrypt','encrypt','generateRandomSaltString','steerSessionMake', 'steerSessionParse']
