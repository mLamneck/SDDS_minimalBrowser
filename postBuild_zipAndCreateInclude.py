import gzip
import os
import shutil
from datetime import datetime

_filename = "index.html"
outName = "site_browserHtml.hex.h"
inName = 'dist/' + _filename
zipName = _filename + '.zip'

f_in = open(inName,'rb')
f_out = gzip.open(zipName,'wb')
f_out.writelines(f_in)
f_out.close()

f_in = open(zipName,'rb')
f_out = open(outName,'w')

c = f_in.read(1)
while c:
    hexVal = hex(ord(c))
    f_out.write(hexVal)
    c = f_in.read(1)
    if (c):
        f_out.write(", ")
f_out.close()
f_in.close()

datum = datetime.now().strftime('%Y%m%d')
#shutil.copy(inName, os.path.join("release",f"sddsMinimalBrowser.html"))
#shutil.copy(inName, os.path.join("release",f"{datum}_sddsMinimalBrowser.html"))
shutil.copy(outName, os.path.join("release",f"{datum}_{outName}"))
os.remove(zipName)