import datetime
import os
from pyPgSQL import PgSQL
import sys
from subprocess import Popen, PIPE
import time

mysql_host = "www.openmap.ro"
mysql_db = "openstr_pois"
mysql_user = "openstr_openstr"
mysql_pass = "7nwpuplscaf8"

f = open('last_update_pois.txt', 'r')
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

found = False
foundgz = False

#check for planet extract locally
if os.path.isfile('planet-rom-%s.osm' % today.strftime('%y%m%d')):
  found = True
if os.path.isfile('planet-rom-%s.osm.gz' % today.strftime('%y%m%d')):
  foundgz = True

if not (found or foundgz):
  cmd = 'wget http://osm.stilpu.org/daily/ -q -O - |grep planet-rom-%s.osm.gz' % today.strftime('%y%m%d')
  print cmd
  #cmd = 'wget http://osm.stilpu.org/daily/ -q -O - |grep planet-rom-%d.osm.gz' % yesterday
  ret = os.system(cmd)
  if ret != 0:
    print "Today's extract not found"
    sys.exit(1)

  cmd = 'wget http://osm.stilpu.org/daily/planet-rom-%s.osm.gz' % today.strftime('%y%m%d')
  print cmd
  ret = os.system(cmd)
  if ret != 0:
    print "Failed to download today's extract"
    sys.exit(1)

if not found:
  cmd = 'gunzip planet-rom-%s.osm.gz' % today.strftime('%y%m%d')
  print cmd
  ret = os.system(cmd)
  if ret != 0:
    print "Failed to extract today's extract"
    sys.exit(1)

cmd = 'python generate-pois.py planet-rom-%s.osm %s' % (today.strftime('%y%m%d'), today.strftime('%y%m%d'))
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to generate pois"
  sys.exit(1)

cmd = 'mysql --host=%s --user=%s -p%s %s < pois-%s.sql' % (mysql_host, mysql_user, mysql_pass, mysql_db, today.strftime('%y%m%d'))
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to update mysql DB"
  sys.exit(1)

f = open('last_update_pois.txt', 'w')
f.write(today.strftime('%y%m%d'))
f.close()
