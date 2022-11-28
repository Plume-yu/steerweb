# -*- coding: utf8 -*-

#===============================
#
# L10N stuff for steer system
#
#===============================
import xml.dom.minidom
import os.path
import SteerAdminGlobal
import traceback
from SteerVersion import Version

#===============================
class SteerL10N:
    @staticmethod
    def GetTextResource(nationCode):
        relativePath = '/../static/l10n/'
        fileName = 'steer_l10n.xml'
        fullName = relativePath + fileName.replace('.xml', '.' + nationCode + '.xml')
        
        SteerAdminGlobal.Log.Debug('GetTextResource Request', fullName)
        
        try:
            doc = xml.dom.minidom.parse(os.path.join(os.path.dirname(__file__) + fullName))
            node = doc.getElementsByTagName("Message")
            
            returnData = dict()
            for eachNode in node:
                key = eachNode.getAttribute('key')
                value = eachNode.getAttribute('value')
                returnData[key] = value
            
            #Add Version Info
            returnData["version"] = Version.VERSION_NUMBER
            return returnData
        except:
            traceMsg = traceback.format_exc()
            SteerAdminGlobal.Log.Error('GetTextResource Request', fullName, traceMsg)
            return None

if __name__ == '__main__':
    print SteerL10N.GetTextResource('ko')