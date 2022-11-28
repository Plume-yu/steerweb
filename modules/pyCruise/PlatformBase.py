# -*- coding: utf-8 -*-
'''
Created on 2010. 6. 29.

@author: rakho.kang
'''

import struct
from twisted.python import threadpool
from twisted.internet import protocol
from twisted.internet import reactor

class StringTooLongError(AssertionError):
    """
    Raised when trying to send a string too long for a length prefixed
    protocol.
    """

class PlatformBaseProtocol(protocol.Protocol):
    headerFormat = 'H'
    headerSize = struct.calcsize(headerFormat)
    MAX_LENGTH = 0xffff
    
    def __init__(self):
        self.buffer = ''
        self.dataSize = 0
        
    def lengthLimitExceeded(self, size):
        """MAX_LENGTH를 넘는 size의 data가 도착할 경우 호출된다.
        """
        raise NotImplementedError

    def dataReceived(self, data):
        self.buffer += data
        self.dataSize = len(self.buffer)
        
        while self.dataSize >= self.headerSize:
            size, = struct.unpack_from(self.headerFormat, self.buffer)
            
            if self.dataSize >= size:
                dataBody = self.buffer[self.headerSize:size]
                self.buffer = self.buffer[size:]
                self.dataSize = len(self.buffer)
                self.stringReceived(dataBody)
            else:
                break
    
    def stringReceived(self, data):
        """상속 받은 class에서 data 도착시 호출되는 method
        """
        raise NotImplementedError
    
    def sendString(self, data):
        dataLength = len(data)
        
        if dataLength > self.MAX_LENGTH - self.headerSize:
            raise StringTooLongError("Try to send %s bytes whereas maximum is %s" % (dataLength, self.MAX_LENGTH - self.headerSize))
        
        size = self.headerSize + dataLength
        
        self.transport.writeSequence((struct.pack(self.headerFormat, size), data))

class PlatformBaseClientFactory(protocol.ClientFactory):
    def __init__(self):
        self.reconnectDelay = 3
        
    def clientConnectionFailed(self, connector, reason):
        reactor.callLater(self.reconnectDelay, connector.connect)
        
    def clientConnectionLost(self, connector, reason):
        reactor.callLater(self.reconnectDelay, connector.connect)

class PlatformBaseProtocolThreadPool(protocol.Protocol):
    headerFormat = 'H'
    headerSize = struct.calcsize(headerFormat)
    MAX_LENGTH = 0xffff
    
    def __init__(self):
        self.buffer = ''
        self.dataSize = 0
        
    def lengthLimitExceeded(self, size):
        """MAX_LENGTH를 넘는 size의 data가 도착할 경우 호출된다.
        """
        raise NotImplementedError

    def dataReceived(self, data):
        self.buffer += data
        self.dataSize = len(self.buffer)
        
        while self.dataSize >= self.headerSize:
            size, = struct.unpack(self.headerFormat, self.buffer[:self.headerSize])
            if size > self.MAX_LENGTH:
                self.lengthLimitExceeded(size)
                break            
            elif self.dataSize >= size:
                dataBody = self.buffer[self.headerSize:size]
                self.buffer = self.buffer[size:]
                self.dataSize = len(self.buffer)
                self.factory.threadPool.callInThread(self.stringReceived, dataBody)
            else:
                break
    
    def stringReceived(self, data):
        """상속 받은 class에서 data 도착시 호출되는 method
        """
        raise NotImplementedError
    
    def sendString(self, data):
        if len(data) > self.MAX_LENGTH - self.headerSize:
            raise StringTooLongError("Try to send %s bytes whereas maximum is %s" % (len(data), self.MAX_LENGTH - self.headerSize))
        size = self.headerSize + len(data)
        reactor.callFromThread(self.transport.write, struct.pack(self.headerFormat, size) + data)

class ThreadPoolRunner:
    def __init__(self, min, max):
        self.threadPool = threadpool.ThreadPool(min, max)
        
    def startThreadPool(self):
        self.threadPool.start()
        reactor.addSystemEventTrigger('during', 'shutdown', self.stopThreadPool)
    
    def stopThreadPool(self):
        self.threadPool.stop()

class PlatformBaseServerFactoryThreadPool(protocol.ServerFactory, ThreadPoolRunner):
    def __init__(self, min = 8, max = 32):
        ThreadPoolRunner.__init__(self, min, max)
        reactor.callWhenRunning(self.startThreadPool)
    
class PlatformBaseClientFactoryThreadPool(protocol.ClientFactory, ThreadPoolRunner):
    def __init__(self, min = 8, max = 32):
        ThreadPoolRunner.__init__(self, min, max)
        reactor.callWhenRunning(self.startThreadPool)
        self.reconnectDelay = 3
        
    def clientConnectionFailed(self, connector, reason):
        reactor.callLater(self.reconnectDelay, connector.connect)
        
    def clientConnectionLost(self, connector, reason):
        reactor.callLater(self.reconnectDelay, connector.connect)

__all__ = ['PlatformBaseProtocol', 'PlatformBaseClientFactory',
           'PlatformBaseProtocolThreadPool', 'PlatformBaseServerFactoryThreadPool', 'PlatformBaseClientFactoryThreadPool']
