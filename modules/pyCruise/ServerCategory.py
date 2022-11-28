#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 3. 30.

@author: rakho.kang
'''

class ServerCategory:
    unknown = 254
    all = 255
    arbitergw = 0
    steerweb = 1
    steergw = 2
    steerhub = 3        
    steermind = 4
    steerdb = 5
    gas = 6
    glogdb = 7          # not used
    steerclient = 8     # 전용 괸리 프로그램?
    steercast = 9       # 캐스트 관리 서버 
    steersession = 10   # 스티어 로그인 세션 관리자. 
    gameadmintool = 11
    steerbridge = 12
    hubgw = 13
    cardmaker = 14
    carddealer = 15
    boxapi = 16
    boxdm = 17
    dbgw = 18
    webcstool = 19
    cardsteerbridge = 20
    cardweb = 21
    carddb = 22
    boxdb = 23
    boxbridgedorian = 24
    scstool = 25
    boxweb = 26
    cardbridgenetmoderator = 27
    dicedb = 31
    dice = 32
    diceweb = 33
    steereye = 35
    servername = {arbitergw : 'ArbiterGateway',
                  steerweb : 'SteerWeb',
                  steergw : 'SteerGW',
                  steerhub : 'SteerHub',
                  steermind : 'SteerMind',
                  steerdb : 'SteerDBMS',
                  gas : 'GameArbiter',
                  glogdb : 'GameLog',
                  steerclient : 'SteerClient',
                  steercast : 'SteerCast',
                  steersession : 'SteerSession',
                  gameadmintool : 'GameAdminTool',
                  steerbridge : 'SteerBridge',
                  hubgw : 'HubGateway',
                  cardmaker : 'CardMaker',
                  carddealer : 'CardDealer',
                  boxapi : 'BoxAPI',
                  boxdm : 'BoxDataManager',
                  dbgw : 'DB Gateway',
                  webcstool: 'Web CS Tool',
                  cardsteerbridge: 'SteerBridge for Card',
                  cardweb: 'CardWeb',
                  carddb: 'CardDBMS',
                  boxdb: 'BoxDBMS',
                  boxbridgedorian: 'BoxBridgeForDorian',
                  scstool : 'SCSTool',
                  boxweb : 'BoxWeb',
                  cardbridgenetmoderator : 'CardBridgeForNetModerator',
                  dicedb : 'Dice Database',
                  dice : 'Dice Server',
                  diceweb : 'Dice Web',
                  steereye : 'SteerEye',
                  unknown : 'unknown',
                  all : 'all',
                  any : 'any'}
    
    @staticmethod
    def getServerName(serverCategory):
        if serverCategory in ServerCategory.servername:
            return ServerCategory.servername[serverCategory]
        else:
            return "unknowntype " + str(serverCategory)

class GUID:
    @staticmethod
    def make(category = 0, number = 0):
        category = int(category)
        number = int(number)
        category &= 0x000000ff
        number &= 0x00ffffff
        return category << 24 | number
    
    @staticmethod
    def getCategory(guid):
        guid = int(guid)
        return (guid & 0xff000000) >> 24
    
    @staticmethod
    def getNumber(guid):
        guid = int(guid)
        return guid & 0x00ffffff
    
    @staticmethod
    def getCategoryName(category):
        if category in ServerCategory.servername:
            return ServerCategory.servername[category]
        else:
            return "unknowntype" + str(category)
    
    @staticmethod
    def toString(guid):
        return "%s:%s" % (GUID.getCategoryName(GUID.getCategory(guid)), GUID.getNumber(guid))
    
    @staticmethod
    def toHex(guid):
        return "%08X" % guid

__all__ = ['ServerCategory', 'GUID']
