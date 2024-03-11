import gzip
import os

outName = "C:/Dropbox/projects/sdds/SDDS_ESP_Extension/src/site_browserHtml.hex.h"

_filename = "index.html"
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

os.remove(zipName)