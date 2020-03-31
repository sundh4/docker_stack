import re
import getpass
import os
# read config file
if os.access("/home/"+getpass.getuser()+"/Drive/Admin/.4E.config",os.R_OK):
    fle = open("/home/"+getpass.getuser()+"/Drive/Admin/.4E.config")
else:
    fle = open("/mnt/public/Libs/.Al.config")
conf = fle.read().split("\n")
fle.close()
for ln in conf:
    if bool(re.search("^\#",ln)):
        continue
    else:
        ln = re.sub("^\.","_",ln)
        ln = re.sub("FALSE","False",ln)
        ln = re.sub("TRUE","True",ln)
        exec(ln,globals())