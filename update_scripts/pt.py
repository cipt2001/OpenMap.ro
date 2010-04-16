from pyPgSQL import PgSQL

routes = []
conn = PgSQL.connect(user='ctalaba', database='gis', password='c', host='localhost', port=5432)
cur = conn.cursor()

def getNodeInfo(id):
  #return a list of [lat, lon, name]
  cur.execute('SELECT * FROM planet_osm_point WHERE osm_id=' + str(id))
  row = cur.fetchall()
  row = row[0]
  #we are only interested in lat, lon and name for nodes/stops
  name=row[34] # this will change for a different style
  l = len(row)
  return [name, row[l-2], row[l-1]]

def getWayInfo(id):
  #return a list of [z-order, way_area, way_geometry]
  cur.execute('SELECT * FROM planet_osm_line WHERE osm_id=' + str(id))
  row = cur.fetchall()
  try:
    row = row[0]
    #we are only interested in z-order, way_area and geometry for ways
    l = len(row)
    return [row[l-3], row[l-2], row[l-1]]
  except:
    raise

def getRoutes(route_type):
  #Process routes by type
  lroutes = []
  cur.execute("SELECT * FROM planet_osm_rels WHERE 'route'=ANY(tags) AND '" + route_type + "'=ANY(tags)")
  
  rows = cur.fetchall()
  #print rows
  for row in rows:
    new_route = []
    
    #process members and roles
    members = row[4]
    i = 0
    mlist = []
    while i < len(members):
      name = members[i]
      if name[0] == 'w':
        mtype = 1
      if name[0] == 'n':
        mtype = 2
      mname = name[1:]
      mrole = members[i+1]
      mlist.append([mtype, mname, mrole])
      i += 2
    
    #process tags
    tags = row[5]
    i = 0
    rtype = route = ref = name = operator = network = ''
    while i < len(tags):
      if tags[i] == 'type':
        rtype = tags[i+1]
      if tags[i] == 'route':
        route = tags[i+1]
      if tags[i] == 'ref':
        ref = tags[i+1]
      if tags[i] == 'name':
        name = tags[i+1]
      if tags[i] == 'operator':
        operator = tags[i+1]
      if tags[i] == 'network':
        network = tags[i+1]
      i += 2
    if ref == '':
        ref = name
    
    new_route.append(row[0])
    new_route.append(rtype)
    new_route.append(route)
    new_route.append(ref)
    new_route.append(name)
    new_route.append(operator)
    new_route.append(network)
    new_route.append(mlist)
  
    lroutes.append(new_route)
  return lroutes

def findExistingRoad(routes, rid, mid):
  #print "rid:", rid, "  mid:", mid
  code = []
  for j in range(rid+1, len(routes)):
    if routes[j][0]>=0 and mid == routes[j][9]:
      #print "mid:", mid, "found item:", routes[j][9]
      code.append(j)
  return code

def compressRoutes(routes):
  #need to concatenate routes (of same type) that share the same road segment
  rid = 0
  temp_routes = []
  blabla = []
  for route in routes:
    members = route[7]
    for member in members:
      if member[0] == 1: #ways
        rid += 1
        record = [0, int(route[0]), route[1], route[2], route[3], route[4], route[5], route[6], member[0], int(member[1]), member[2], route[3]]
        temp_routes.append(record)
        blabla.append(int(member[1]))
      #if member[0] == 2: #nodes
      #  #should do something
  #print len(blabla)
  #if len(blabla) < 30:
  #  print blabla
  #print len(list(set(blabla)))
  for i in range(len(temp_routes)):
    route = temp_routes[i]
    existing_ids = findExistingRoad(temp_routes, i, route[9])
    #ref = route[4]
    route[11] = route[4]
    for id1 in existing_ids:
      #print "Existing ID:", existing_id
      #print "Concatenating " + str(temp_routes[existing_id][9]) + "(" + str(temp_routes[existing_id][4]) + ")" + "and" + str(route[9]) + "(" + route[4] + ")"
      #print "Relation id ", temp_routes[existing_id][1], "and", route[1]
      route[11] = route[11] + ", " + temp_routes[id1][11]
      temp_routes[id1][0] = -1
  #print len(temp_routes)
  c1 = 0
  for i in range(len(temp_routes)-1, -1, -1):
    route = temp_routes[i]
    if route[0] == -1:
      c1 += 1
      temp_routes.remove(route)
  #print "c1", c1
  #print len(temp_routes)
  for route in temp_routes:
    route[4] = route[11]
  return temp_routes


#add bus routes
#routes.extend(getRoutes('bus'))
bus_routes = compressRoutes(getRoutes('bus'))
#add tram routes
#routes.extend(getRoutes('tram'))
tram_routes = compressRoutes(getRoutes('tram'))
#add trolley routes
#routes.extend(getRoutes('trolleybus'))
trolley_routes = compressRoutes(getRoutes('trolleybus'))
#add subway routes
#routes.extend(getRoutes('subway'))
subway_routes = compressRoutes(getRoutes('subway'))
#print routes
#print len(routes)

routes = bus_routes
routes.extend(tram_routes)
routes.extend(trolley_routes)
routes.extend(subway_routes)

#add geometry information from nodes and ways
for route in routes:
  print "Getting info for segment", route[9], "with type", route[8]
  exp = False
  if route[8] == 1: #way
    #if route[9] == 30839982:
    #  print route
    try:
      infos = getWayInfo(route[9])
    except:
      exp=True
      print "Got exception for id %s" % route[9]
  #if route[8] ==2: #node
  #  infos = getNodeInfo(route[9])
  #print infos
  if not exp:
    route.extend(infos)
command = "DELETE FROM planet_osm_pt_ways"
cur.execute(command)
conn.commit()

#we are ready to generate the new tables: planet_osm_pt_ways and planet_osm_pt_nodes
command = ""
for route in routes:
    if route[8] == 1: #ways
      print  route, len(route)
      if len(route) == 15:
        command = "INSERT INTO planet_osm_pt_ways (rel_id, type, route, ref, name, operator, network, member_id, role, zorder, way_area, way) VALUES (%d, '%s', '%s', '%s', '%s', '%s', '%s', %d, '%s', %d, NULL, '%s')" % (int(route[1]), 
                route[2], route[3], route[4], route[5], route[6], route[7], int(route[9]), route[10], int(route[12]), route[14])
        print command
        cur.execute(command)
        conn.commit()
    if route[8] == 2: #nodes
      #command = "INSERT INTO planet_osm_pt_nodes (rel_id, type, route, ref, name, operator, network, member_id, role, stop_name, zorder, way) VALUES (%d, '%s', '%s', '%s', '%s', '%s', '%s', %d, '%s', '%s', NULL, '%s')" % (int(route[0]), 
      #            route[1], route[2], route[3], route[4], route[5], route[6], int(member[1]), member[2], member[3], member[5])
      print command
      #cur.execute(command)
      #conn.commit()
conn.close()
