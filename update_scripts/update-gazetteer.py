import datetime
import os
from pyPgSQL import PgSQL
import sys
from subprocess import Popen, PIPE
import time

f = open('last_update_gazetteer.txt', 'r')
lu = f.readline()
f.close()
today = datetime.date.today()
yesterday = today - datetime.timedelta(1)
last_update = datetime.datetime.strptime(lu.strip(), '%y%m%d').date()

print today
print yesterday
print last_update

if last_update >= today:
  print "Already updated"
  sys.exit(1)

next_day = last_update + datetime.timedelta(1)
while next_day <= today:

  cmd = 'wget http://osm.stilpu.org/diff/romania-%s-%s.osc.gz' % (last_update.strftime('%Y%m%d'), next_day.strftime('%Y%m%d'))
  print cmd
  ret = os.system(cmd)
  if ret != 0:
    print "%s-%s's diff not found" % (last_update.strftime('%Y%m%d'), next_day.strftime('%Y%m%d'))
    sys.exit(1)

  cmd = 'osm2pgsql -las -O gazetteer -d gazetteer romania-%s-%s.osc.gz' % (last_update.strftime('%Y%m%d'), next_day.strftime('%Y%m%d'))
  print cmd
  ret = os.system(cmd)
  if ret != 0:
    print "Failed to insert today's diff into database"
    sys.exit(1)
    
  last_update = next_day
  next_day = last_update + datetime.timedelta(1)
  
cmd = 'cd /home/ctalaba/osm/gazetteer && php5 util.update.php.mine --index'
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to update gazetteer index"
  sys.exit(1)

f = open('last_update_gazetteer.txt', 'w')
f.write(today.strftime('%y%m%d'))
f.close()