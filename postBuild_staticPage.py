import os
import shutil
from datetime import datetime

_filename = "index.html"
outName = "site_browserHtml.hex.h"
inName = 'dist/' + _filename
zipName = _filename + '.zip'

datum = datetime.now().strftime('%Y%m%d')
shutil.copy(inName, os.path.join("release",f"sddsMinimalBrowser.html"))
shutil.copy(inName, os.path.join("release",f"{datum}_sddsMinimalBrowser.html"))