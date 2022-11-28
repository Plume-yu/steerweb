'''
Created on 2011. 3. 21.

@author: rakho.kang
'''
from cx_Freeze import setup, Executable

if __name__ == '__main__':
    setup(name = "CryptStr",
          version = "1.0",
          description = "Encrypt",
          executables = [Executable("CryptStr.py")])