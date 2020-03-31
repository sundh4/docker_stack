import getpass
import os.path

def getUserToken(beta=False):
    if beta:
        f = open("/home/"+getpass.getuser()+"/.alphienbeta/.alsid")
    else:
        f = open("/home/"+getpass.getuser()+"/.alphien/.alsid")
    token = f.readlines()
    return token[0]
