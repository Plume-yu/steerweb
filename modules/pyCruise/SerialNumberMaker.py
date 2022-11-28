#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 4. 13.

@author: rakho.kang
'''

from threading import Lock

class SerialNumberMaker:
    """Serial number를 발급해준다.
    """

    def __init__(self, GUSID = 0):
        """serialNumber의 초기값을 셋팅한다. GUSID가 입력되는 경우 유일한 값이 된다.
        """
        self.serialNumber = 1L
        self.identifier = long(GUSID) << 32
    
    def getSN(self):
        serialNumber = self.serialNumber;
        self.serialNumber += 1
        return self.identifier + serialNumber

class SerialNumberMakerMultiThread:
    """Serial number를 thread safe 하게 발급해준다.
    """

    def __init__(self, GUSID = 0):
        """Lock object를 생성하고, serialNumber의 초기값을 셋팅한다. GUSID가 입력되는 경우 유일한 값이 된다.
        """
        self.lock = Lock()
        self.serialNumber = 1L
        self.identifier = long(GUSID) << 32
    
    def getSN(self):
        """Lock을 걸어 Thread safe 하게 serial number를 반환한다.
        """
        self.lock.acquire()
        serialNumber = self.serialNumber;
        self.serialNumber += 1
        self.lock.release()
        return self.identifier + serialNumber

__all__ = ['SerialNumberMaker', 'SerialNumberMakerMultiThread']
