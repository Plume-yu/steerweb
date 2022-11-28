#!/usr/bin/env python
# -*- coding: utf-8 -*-
import base64,sys,random

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
        
def decrypt( todestr):
    tnum = base64string.find(todestr[0])
    return base64.b64decode( toTrans( todestr[1:] , trans64s[tnum], base64string ) ,"-_")

def encrypt( toenstr):
    tnum = random.randint(0,len(trans64s)-1)
    return base64string[tnum] + toTrans( base64.b64encode(toenstr,"-_" ) , base64string ,trans64s[tnum] )   
 
def test():
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
#    test()
    if len(sys.argv) > 1:
        print encrypt(sys.argv[1])
    else:
        print "error"
    
__all__ = ['decrypt','encrypt']
