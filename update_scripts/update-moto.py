import datetime
import os
from pyPgSQL import PgSQL
import sys
from subprocess import Popen, PIPE
import time

f = open('last_update.txt', 'r')
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

cmd = 'wget http://osm.stilpu.org/daily/ -q -O - |grep planet-rom-%s.osm.gz' % today.strftime('%y%m%d')
print cmd
#cmd = 'wget http://osm.stilpu.org/daily/ -q -O - |grep planet-rom-%d.osm.gz' % yesterday
ret = os.system(cmd)
if ret != 0:
  print "Today's extract not found"
  sys.exit(1)
  #TODO Also check for yesterday

cmd = 'wget http://osm.stilpu.org/daily/planet-rom-%s.osm.gz' % today.strftime('%y%m%d')
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to download today's extract"
  sys.exit(1)

cmd = 'gunzip planet-rom-%s.osm.gz' % today.strftime('%y%m%d')
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to extract today's extract"
  sys.exit(1)

cmd = '~/osm/osm2pgsql.latest/osm2pgsql -m -s -S ~/bin/default.style -d gis -U ctalaba planet-rom-%s.osm' % today.strftime('%y%m%d')
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to insert today's extract into database"
  sys.exit(1)

cmd = 'python pt.py'
print cmd
ret = os.system(cmd)
if ret != 0:
  print "Failed to update transport layer"
  sys.exit(1)

conn = PgSQL.connect(user='ctalaba', database='gis', password='c', host='localhost', port=5432)
cur = conn.cursor()

command = "DROP TABLE planet_osm_surface;"
cur.execute(command)
conn.commit()

command = "SELECT * INTO planet_osm_surface FROM planet_osm_line WHERE (surface IS NOT NULL) OR (smoothness IS NOT NULL)"
cur.execute(command)
conn.commit()

#curl -X GET 'http://cipt2001.homeip.net:9090/geoserver/gwc/rest/seed/osm:moto_sport.json'
#curl -T seedtest.xml -X POST 'http://cipt2001.homeip.net:9090/geoserver/gwc/rest/seed/osm:moto_sport.xml'

layers = ['osm:moto_standard', 'osm:moto_sport', 'osm:moto_endtour', 'osm:moto_cross', 'osm:moto_cruiser']
#layers = ['osm:moto_sport', 'osm:moto_endtour', 'osm:moto_cross', 'osm:moto_cruiser']
#layers = ['osm:moto_standard']

for layer in layers:
  cmd = "curl -T seedtest-%s.xml -X POST 'http://cipt2001.homeip.net:9090/geoserver/gwc/rest/seed/%s.xml'" % (layer, layer)
  print cmd
  ret = os.system(cmd)
  if ret != 0:
    print "Failed to start reseed layer: %s. Exit code: %d" % (layer, ret)
    sys.exit(1)

  while True:
    print "Sleeping 30 sec"
    time.sleep(30)
    cmd = "curl -X GET 'http://cipt2001.homeip.net:9090/geoserver/gwc/rest/seed/%s.json'" % layer
    print cmd
    proc = Popen(cmd, stdout=PIPE, stderr=PIPE, shell=True)
    output, errlog = proc.communicate()
    print "Query:", output
    if output[:36] == '{"long-array-array":[[0,0,0],[0,0,0]':
      print "Both thread finished"
      break

f = open('last_update.txt', 'w')
f.write(today.strftime('%y%m%d'))
f.close()