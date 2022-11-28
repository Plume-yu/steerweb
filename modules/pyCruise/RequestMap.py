#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 4. 16.

@author: rakho.kang
'''

from SerialNumberMaker import SerialNumberMaker

class RequestMap:
    """
    Serial Number를 발급하여 발급된 number를 이용하여
    input args를 내부의 map에 저장하거나 발급된 number를 입력하여 저장된 args를 반환 받는다.
    get한 serial number의 args는 map에서 삭제된다.
    """
    def __init__(self):
        self.map = {}
        self.snm = SerialNumberMaker()
        
    def set(self, *args):
        """
        입력된 args를 serial number를 발급 받아 저장하고
        해당 serial number를 반환 한다.
        """
        sn = self.snm.getSN()
        self.map[sn] = args
        return sn
        
    def get(self, sn):
        """
        발급된 serial number를 입력하면
        set 했던 args를 반환하고
        입력된 serial number에 해당하는 key를 map에서 삭제한다.
        """
        args = self.map[sn]
        del self.map[sn]
        return args

__all__ = ['RequestMap']
