from .database.getTeamInfo import getTeamInfo
from glob import glob
import os
from pathlib import Path
import getpass
from itertools import chain
import ntpath
import importlib.util
import re

print("Welcome to Alphien!")
teams = getTeamInfo()
user = getpass.getuser()
# teams=["/home/"+user+"/"+str(i) for i in teams]
# teamparse = '|'.join(teams)

# paths=[glob(tm) for tm in teams]
# paths=list(chain.from_iterable(paths))
# paths = [pth + "/Library" for pth in paths]
# fls = []
print("Importing your qlib functions...\n")
for tm in teams:
    pth = "/home/"+user+"/"+tm+"/Library"
    for filename in Path(pth).rglob('*.py'):
        flnm = str(filename)
        if ".ipynb_checkpoints" in flnm:
            continue
        basenm = ntpath.basename(filename)
        basenm = re.sub("^"+tm+"_","",basenm)
        basenm = re.sub(".py$","",basenm)
        spec = importlib.util.spec_from_file_location(basenm,flnm)
        print("import "+flnm+" as libal."+basenm)
        exec(basenm+"=importlib.util.module_from_spec(spec)")
        exec("spec.loader.exec_module("+basenm+")")

pth = "/home/"+user+"/Library/Functions"
for filename in Path(pth).rglob('*.py'):
    flnm = str(filename)
    if ".ipynb_checkpoints" in flnm:
        continue
    basenm = ntpath.basename(filename)
    basenm = re.sub("^"+tm+"_","",basenm)
    basenm = re.sub(".py$","",basenm)
    spec = importlib.util.spec_from_file_location(basenm,flnm)
    print("import "+flnm+" as libal."+basenm)
    exec(basenm+"=importlib.util.module_from_spec(spec)")
    exec("spec.loader.exec_module("+basenm+")")
