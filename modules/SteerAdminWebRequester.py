#!/usr/bin/env python
# -*- coding: utf8 -*-
import SteerAdminGlobal

#===============================
#
# Web Requester
#
#===============================

import binascii
import struct
import socket
import SteerAdminConfig
from pyCruise.OpMsg import OpMsg
from SteerAdminError import SteerAdminError

#===============================
class SteerConnector:
    @staticmethod
    def SendAndRecv(opMsg):
        StructFormat = '!HII'
        SocketMaxLen = SteerAdminConfig.MaxLen
        SocketTimeout = SteerAdminConfig.TimeOut
        SteerAddr = SteerAdminConfig.SteerGatewayAddress
        SteerPort = SteerAdminConfig.SteerGatewayPort
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(SocketTimeout) 
        
        prefixLength = struct.calcsize(StructFormat)
        serializedData = opMsg.serialize()

        senddata = struct.pack(StructFormat, len(serializedData) + prefixLength, opMsg.getSenderGUSID(), opMsg.getReceiverGUSID()) + serializedData
        
        try:
            sock.connect((SteerAddr,SteerPort))
        except:
            SteerAdminGlobal.Log.Error("Connect Failed", SteerAddr, SteerPort)
            sock = None
            return SteerAdminError.CONNECTION_FAILED, None

        SteerAdminGlobal.Log.Debug("Connection Established", SteerAddr, SteerPort)

        try:
            sendLength = sock.send(senddata)
            
            while sendLength < len(senddata):
                sendLength += sock.send(senddata[sendLength:])
                
            SteerAdminGlobal.Log.Debug("Send Data", SteerAddr, SteerPort, sendLength, binascii.b2a_hex(senddata))
        except:
            SteerAdminGlobal.Log.Error("Send Failed", SteerAddr, SteerPort)
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None

        if sendLength <= 0:
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None

        try:
            resMsg = sock.recv(SocketMaxLen)
            SteerAdminGlobal.Log.Debug("Recv Data", SteerAddr, SteerPort, binascii.b2a_hex(resMsg))
            
            if len(resMsg) <= 0:
                sock.close()
                SteerAdminGlobal.Log.Error("Receive Failed", SteerAddr, SteerPort)
                return SteerAdminError.SEND_RECV_FAILED, None
            
            # prefixLength 만큼 받아지도록 반복한다.
            while True:
                if len(resMsg) >= prefixLength:
                    break
                else:
                    resMsg += sock.recv(SocketMaxLen)
                    SteerAdminGlobal.Log.Debug("Recv Data", SteerAddr, SteerPort, binascii.b2a_hex(resMsg))
            # prefixLength 만큼 받은 데이터를 해석하여 전체 데이터 사이즈를 얻는다.
            resMsgSize, senderGUSID, receiverGUSID = struct.unpack(StructFormat, resMsg[:prefixLength])
            # 전체 데이터 사이즈 만큼 받아지도록 반복한다.
            while True:
                if len(resMsg) < resMsgSize:
                    resMsg += sock.recv(SocketMaxLen)
                    SteerAdminGlobal.Log.Debug("Recv Data", SteerAddr, SteerPort, binascii.b2a_hex(resMsg))
                else:
                    break;
            # 소켓을 닫는다.
            sock.close()
            
            unpackdata = resMsg[prefixLength:]
        except:
            sock.close()
            SteerAdminGlobal.Log.Error("Receive Failed :: %s (%i)" % (SteerAddr, SteerPort))
            return SteerAdminError.SEND_RECV_FAILED, None

        retOpMsg = OpMsg()
        retOpMsg.parse(unpackdata)
        return retOpMsg.getResultCode(), retOpMsg

    @staticmethod
    def Send(opMsg):
        StructFormat = '!HII'
        SocketTimeout = SteerAdminConfig.TimeOut
        SteerAddr = SteerAdminConfig.SteerGatewayAddress
        SteerPort = SteerAdminConfig.SteerGatewayPort
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(SocketTimeout) 
        
        prefixLength = struct.calcsize(StructFormat)
        serializedData = opMsg.serialize()

        senddata = struct.pack(StructFormat, len(serializedData) + prefixLength, opMsg.getSenderGUSID(), opMsg.getReceiverGUSID()) + serializedData
        
        try:
            sock.connect((SteerAddr,SteerPort))
        except:
            SteerAdminGlobal.Log.Error("Connect Failed", SteerAddr, SteerPort)
            sock = None
            return SteerAdminError.CONNECTION_FAILED, None

        SteerAdminGlobal.Log.Debug("Connection Established", SteerAddr, SteerPort)

        try:
            sendLength = sock.send(senddata)
            
            while sendLength < len(senddata):
                sendLength += sock.send(senddata[sendLength:])
                
            SteerAdminGlobal.Log.Debug("Send Data", SteerAddr, SteerPort, sendLength, binascii.b2a_hex(senddata))
        except:
            SteerAdminGlobal.Log.Error("Send Failed", SteerAddr, SteerPort)
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None

        if sendLength <= 0:
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None

        sock.close()
        return SteerAdminError.SUCCESS 
    
#===============================
class PlatformConnector:
    @staticmethod
    def SendAndRecv(msgServerID, msgID, msgBody):
        '''
        serverID, msgID를 지정하여 msgBody를 입력하면
        returnCode와 returnMsg를 반환한다.
        returnCode가 0이 아니면 returnMsg는 None이 반환된다.
        '''
        sizeFormat = 'H'
        destFormat = 'I'
        idFormat = 'H'
        sizeSize = struct.calcsize(sizeFormat)
        destSize = struct.calcsize(destFormat)
        idSize = struct.calcsize(idFormat)
        
        msgSize = sizeSize + destSize + idSize + len(msgBody)
        
        reqMsg = struct.pack(sizeFormat, msgSize)
        reqMsg += struct.pack(destFormat, msgServerID)
        reqMsg += struct.pack(idFormat, msgID)
        reqMsg += msgBody
        
        SocketMaxLen = SteerAdminConfig.MaxLen
        SocketTimeout = SteerAdminConfig.TimeOut
        HubGWAddr = SteerAdminConfig.HubGatewayAddress
        HubGWPort = SteerAdminConfig.HubGatewayPort
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(SocketTimeout)
            
        try:
            sock.connect((HubGWAddr, HubGWPort))
        except:
            SteerAdminGlobal.Log.Error("Connect Failed", HubGWAddr, HubGWPort)
            sock = None
            return SteerAdminError.CONNECTION_FAILED, None

        SteerAdminGlobal.Log.Debug("Connection Established", HubGWAddr, HubGWPort)
        
        try:
            lenSendBytes = sock.send(reqMsg)
            
            while lenSendBytes < msgSize:
                lenSendBytes += sock.send(reqMsg[lenSendBytes:])
                
            SteerAdminGlobal.Log.Debug("Send Data", HubGWAddr, HubGWPort, lenSendBytes, binascii.b2a_hex(reqMsg))
        except:
            SteerAdminGlobal.Log.Error("Send Failed", HubGWAddr, HubGWPort)
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None

        if lenSendBytes <= 0:
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None
    
        try:
            resMsg = sock.recv(SteerAdminConfig.MaxLen)
            
            if len(resMsg) <= 0:
                sock.close()
                return SteerAdminError.SEND_RECV_FAILED, None
            else:
                # sizeSize 만큼 받아지도록 반복한다.
                while True:
                    if len(resMsg) >= sizeSize:
                        break
                    else:
                        resMsg += sock.recv(SocketMaxLen)
                # sizeSize 만큼 받은 데이터를 해석하여 전체 데이터 사이즈를 얻는다.
                resMsgSize, = struct.unpack(sizeFormat, resMsg[:sizeSize])
                # 전체 데이터 사이즈 만큼 받아지도록 반복한다.
                while True:
                    if len(resMsg) < resMsgSize:
                        resMsg += sock.recv(SocketMaxLen)
                    else:
                        break;
                # 소켓을 닫는다.
                sock.close()
        except:
            if sock is not None:
                sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None
        
        opMsg = OpMsg()
        opMsg.parse(resMsg[sizeSize + idSize:]) 
        return opMsg.getResultCode(), opMsg
    
    # 현재 Platform Hub Gateway에서는 단방향에 대한 지원이 없다.
    # 사용 할 경우 패킷을 받아 핸들 하는 곳에서 Send And Recv로 바꿔서 호출 후 Platform Hub Gateway로 반드시 리턴을 줘야 한다.
    @staticmethod
    def Send(msgServerID, msgID, msgBody):
        sizeFormat = 'H'
        destFormat = 'I'
        idFormat = 'H'
        sizeSize = struct.calcsize(sizeFormat)
        destSize = struct.calcsize(destFormat)
        idSize = struct.calcsize(idFormat)
        
        msgSize = sizeSize + destSize + idSize + len(msgBody)
        
        reqMsg = struct.pack(sizeFormat, msgSize)
        reqMsg += struct.pack(destFormat, msgServerID)
        reqMsg += struct.pack(idFormat, msgID)
        reqMsg += msgBody
        
        SocketTimeout = SteerAdminConfig.TimeOut
        HubGWAddr = SteerAdminConfig.HubGatewayAddress
        HubGWPort = SteerAdminConfig.HubGatewayPort
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(SocketTimeout)
        
        try:
            sock.connect((HubGWAddr, HubGWPort))
        except:
            SteerAdminGlobal.Log.Error("Connect Failed", HubGWAddr, HubGWPort)
            sock = None
            return SteerAdminError.CONNECTION_FAILED, None

        SteerAdminGlobal.Log.Debug("Connection Established", HubGWAddr, HubGWPort)
        
        try:
            lenSendBytes = sock.send(reqMsg)

            while lenSendBytes < msgSize:
                lenSendBytes += sock.send(reqMsg[lenSendBytes:])
                
            SteerAdminGlobal.Log.Debug("Send Data", HubGWAddr, HubGWPort, lenSendBytes, binascii.b2a_hex(reqMsg))
        except:
            SteerAdminGlobal.Log.Error("Send Failed", HubGWAddr, HubGWPort)
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None

        if lenSendBytes <= 0:
            sock.close()
            return SteerAdminError.SEND_RECV_FAILED, None
        
        sock.close()
        return SteerAdminError.SUCCESS