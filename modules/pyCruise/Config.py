#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Created on 2010. 11. 2.

@author: lunacalos
'''

'''
example:

example.ini
    [test_section]
    test_key1='test_key_value'
    [test_section2]
    test_key2=1000
    
example.xml
    <?xml version="1.0" encoding="UTF-8"?>
    <Config>
        <Test1>test_key_value</Test1>
        <Test2>1000</Test2>
    </Config>
    
Code Example:
    configReader = CruiseINIReader(os.path.join(os.path.dirname(__file__), '../BoxAdminWebSettings.conf'))
    LOG_LEVEL = configReader.GetString('BoxAdminWeb', 'log_level', 'debug')
    LOG_PATH = configReader.GetString('BoxAdminWeb', 'log_path')
    HubGatewayAddress = configReader.GetString('BoxAdminWeb', 'hub_gateway_address', '127.0.0.1')
    HubGatewayPort = configReader.GetInt('BoxAdminWeb', 'hub_gateway_port', 8088)
'''

import ConfigParser
import xml.dom.minidom

class CruiseINIReader:
    def __init__(self, absolutePathAndFile):
        self.cp = ConfigParser.RawConfigParser()
        self.cp.read(absolutePathAndFile)
        
    def GetString (self, section, key, default = None):
        if self.cp.has_option(section, key):
            return str(self.cp.get(section, key)).strip("'")
        else:
            return default if default else None
    
    def GetInt (self, section, key, default = None):
        if self.cp.has_option(section, key):
            return int(self.cp.get(section, key))
        else:
            return default if default else None
    
class CruiseXMLReader:   
    def __init__(self, absolutePathAndFile):
        self.xmlDoc = xml.dom.minidom.parse(absolutePathAndFile)

    def GetString(self, nodeTagName, default = None):
        node = self.xmlDoc.getElementsByTagName(nodeTagName)
        
        if len(node) > 0:
            return str(node[0].childNodes[0].data)
        else:
            default if default else None

    def GetInt (self, nodeTagName, default = None):
        node = self.xmlDoc.getElementsByTagName(nodeTagName)
        
        if len(node) > 0:
            return int(node[0].childNodes[0].data)
        else:
            default if default else None

# copyed from cherrypy _cpconfig.py 
# by kasw
# 사용법
# iniparser = Config.OpConfigParser()
# options = iniparser.dict_from_file( "servicename.ini" )
# cmdparser = OptionParser()
# cmdparser.add_option(...)
# opt, args = cmdparser.parse_args()
# mergeddict = iniparser.merge( "servicename" , options, opt )
# mergeddict 가 완료된 option이 들어있는 dict임. 
# { "section1" : { } , "section2" : { } } 형태.
class OpConfigParser(ConfigParser.ConfigParser):
    """Sub-class of ConfigParser that keeps the case of options and that raises
    an exception if the file cannot be read.
    """
    
    def optionxform(self, optionstr):
        return optionstr
    
    def read(self, filenames):
        if isinstance(filenames, basestring):
            filenames = [filenames]
        for filename in filenames:
            try:
                fp = open(filename)
            except IOError:
                continue
            fp = open(filename)
            try:
                self._read(fp, filename)
            finally:
                fp.close()
    
    def as_dict(self, raw=False, vars=None):
        """Convert an INI file to a dictionary"""
        # Load INI file into a dict
        #from cherrypy.lib import unrepr
        result = {}
        for section in self.sections():
            if section not in result:
                result[section] = {}
            for option in self.options(section):
                value = self.get(section, option, raw, vars)
#                try:
#                    value = unrepr(value)
#                except Exception, x:
#                    msg = ("Config error in section: %r, option: %r, "
#                           "value: %r. Config values must be valid Python." %
#                           (section, option, value))
#                    raise ValueError(msg, x.__class__.__name__, x.args)
                result[section][option] = value
        return result
    
    def dict_from_file(self, file):
        if hasattr(file, 'read'):
            self.readfp(file)
        else:
            self.read(file)
        
        return self.as_dict()               

    def merge(self,sectionname, inidict, cmdopt):
        #print type(cmdopt), dir(cmdopt), cmdopt.__dict__
        if sectionname not in inidict :
            inidict[sectionname] = {}
        for k,v in cmdopt.__dict__.iteritems() :
            if v or k not in inidict[sectionname]:  
                inidict[sectionname][k] = v 
        return inidict
    
    #lunacalos 110504
    def mergeToOption (self, sectionName, iniDict, cmdOpt):
        for k,v in cmdOpt.__dict__.iteritems() :
            if v == None and k in iniDict[sectionName]:
                cmdOpt.__dict__[k] = iniDict[sectionName][k]
        
        return cmdOpt

def oldtest():
    reader = CruiseINIReader("D:\\Temp\\example.ini")
    print reader.GetString('test_section', 'test_key1') #returns string
    print reader.GetString('test_section2', 'test_key2') #returns int
    
    xmlReader = CruiseXMLReader("D:\\Temp\\example.xml")
    print xmlReader.GetString("Test1") #returns string
    print xmlReader.GetInt("Test2") #returns int    
            
def OpConfigParserTest():
    from optparse import OptionParser
    iniparser = OpConfigParser()
    options = iniparser.dict_from_file( "Config.ini" )
    cmdparser = OptionParser()
    cmdparser.add_option('--server_id', dest = 'server_id', type = 'int', default = '1', help = 'Server ID')
    cmdparser.add_option('--hub_ip', dest = 'hub_ip', type = 'string', default = '127.0.0.1', help = 'Hub IP')
    cmdparser.add_option('--hub_port', dest = 'hub_port', type = 'int', default = '20000', help = 'Hub Port')
    cmdparser.add_option('--db_host', dest = 'db_host', type = 'string', default = '127.0.0.1', help = 'Host Name of DB')
    cmdparser.add_option('--db_user', dest = 'db_user', type = 'string', default = 'root', help = 'User Name of DB')
    cmdparser.add_option('--db_passwd', dest = 'db_passwd', type = 'string', default = 'password', help = 'User Password of DB')
    cmdparser.add_option('--db_catalog', dest = 'db_catalog', type = 'string', default = 'box2db', help = 'Catalog of DB')
    cmdparser.add_option('--log_level', dest = 'log_level', type = 'string', default = 'debug', help = 'Log writing level')
    cmdparser.add_option('--log_file', dest = 'log_file', type = 'string', help = 'Log path(absolute) and file name')
    opt, args = cmdparser.parse_args()
    mergeddict = iniparser.merge( "Config" , options, opt )
    print mergeddict
    
if __name__ == '__main__':
    OpConfigParserTest()