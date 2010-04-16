from xml.sax import make_parser
from xml.sax.handler import ContentHandler 
import time
import datetime
import math
import string
import sys

class Coords:

	def __init__(self,lat,lon):
		self.lat = lat
		self.lon = lon
	
	def __str__(self):
		return "lat: "+str(self.lat)+" lon: "+str(self.lon)
	
	def __eq__(self, other):
		return (self.lat==other.lat) and (self.lon==other.lon)
		
class Category:
	
	def __init__(self, id, name):
		self.id = id
		self.name = name
	def __str__(self):
		return self.name
	
	def sql(self):
		return "INSERT INTO categories (idcat, name) VALUES("+str(self.id)+",'"+self.name+"')"
		
class Subcategory:
	
	def __init__(self, id, name, cat):
		self.id = id
		self.name = name
		self.cat = cat

	def __str__(self):
		return self.name

	def sql(self):
		return "INSERT INTO subcategories (idsub, idcat, name) VALUES("+str(self.id)+","+str(self.cat)+",'"+self.name+"')"
		
class BoundingBox:

	def __init__(self, SW, NE):
		self.SW = SW
		self.NE = NE
	
class POI:
	
	def __init__(self, id, osmid, name, subcat, info, point, isin=None, bounds=None, localitate=None, alteloc=None):
		self.id = id
		self.osmid = osmid
		self.name = name
		self.subcat = subcat
		self.info = info
		self.point = point
		self.bounds = bounds
		self.localitate = localitate
		self.alteloc = alteloc
		self.isin = isin

	def __str__(self):
		isin=loc=alte=""
		if self.isin is not None:
			isin = "isin="+self.isin.encode('utf-8')
		if self.localitate is not None:
			loc = self.localitate.encode('utf-8')
		if self.alteloc is not None:
			alte = self.alteloc.encode('utf-8')
		return str(self.id)+" "+str(self.osmid)+" "+self.name.encode('utf-8')+" "+str(self.subcat)+" "+str(self.info)+" "+str(self.point)+" "+isin+" "+loc+" "+alte

	def sql(self):
		isin=loc=alte=""
		if self.isin is not None:
			isin = "isin="+self.isin.encode('utf-8')
		if self.localitate is not None:
			loc = self.localitate.encode('utf-8')
		if self.alteloc is not None:
			alte = self.alteloc.encode('utf-8')
		#sql = "INSERT INTO pois (id, name, cat, subcat, info, lat, lon, latSW, lonSW, latNE, lonNE) VALUES("
		sql = "("
		sql = sql + str(self.osmid) + ", "
		nume = self.name
		nume = string.replace(nume, "'", "''")
		sql = sql + "'" + nume + "', "
		sql = sql + str(self.subcat.cat) + ", "
		sql = sql + str(self.subcat.id) + ", "
		sql = sql + "'" + self.info + "', "
		sql = sql + str(self.point.lat/1000) + ", "
		sql = sql + str(self.point.lon/1000) + ", "
		if self.bounds is not None:
			sql = sql + str(self.bounds.SW.lat/1000) + ", "
			sql = sql + str(self.bounds.SW.lon/1000) + ", "
			sql = sql + str(self.bounds.NE.lat/1000) + ", "
			sql = sql + str(self.bounds.NE.lon/1000)
		else:
			sql = sql + "NULL, NULL, NULL, NULL"
		sql = sql + ")"
		return sql
		
class Localitate:
	def __init__(self, id, osmid, nume, tip, coord):
		self.id = id
		self.osmid = osmid
		self.nume = nume
		self.tip = tip
		self.coord = coord
		
class OSMParser(ContentHandler):
	
	def __init__(self):
		self.id = 0
		self.myattributes = {}
		self.mynodes = [];
		self.count = 0
		self.poicount = 0;
	
	def bbox(self,nodes):
		minx = 200
		miny = 200
		maxx = -200
		maxy = -200
		n = len(nodes)
		for i in range(0,n):
			if nodesLat[nodes[i]]>maxx:
				maxx = nodesLat[nodes[i]]
			if nodesLat[nodes[i]]<minx:
				minx = nodesLat[nodes[i]]
			if nodesLon[nodes[i]]>maxy:
				maxy = nodesLon[nodes[i]]
			if nodesLon[nodes[i]]<miny:
				miny = nodesLon[nodes[i]]
		return BoundingBox(Coords(minx,miny), Coords(maxx,maxy))

		
	def categorize(self, attributes):
		categ=[]
		info=""
		if (attributes.has_key('leisure')):
			if (attributes['leisure']=='park'):
				categ.append(subcategories["Parc"])
			if (attributes['leisure']=='garden'):
				categ.append(subcategories["Gradina"])
			if (attributes['leisure']=='water_park'):
				categ.append(subcategories["Parc acvatic"])
			if (attributes['leisure']=='playground'):
				categ.append(subcategories["Loc de joaca"])
			if (attributes['leisure']=='nature_reserve'):
				categ.append(subcategories["Rezervatie naturala"])
			if (attributes['leisure']=='stadium'):
				if attributes.has_key('sport'):
					if attributes['sport']=='rugby':
						categ.append(subcategories["Rugby"])
					else:
						categ.append(subcategories["Stadion"])
						info = "Sporturi: "+attributes['sport']
				else:
					categ.append(subcategories["Stadion"])
			if (attributes['leisure']=='sports_center'):
				if attributes.has_key('sport'):
					if (attributes['sport']=='skating') or (attributes['sport']=='hockey'):
						categ.append(subcategories["Patinoar"])
					else:
						categ.append(subcategories["Sala polivalenta"])
						info = "Sporturi: "+attributes['sport']
				else:
					categ.append(subcategories["Sala polivalenta"])
			if (attributes['leisure']=='track'):
				if attributes.has_key('sport'):
					if (attributes['sport']=='horse_racing'):
						categ.append(subcategories["Hipodrom"])
					elif (attributes['sport']=='motor'):
						categ.append(subcategories["Circuit curse"])
					elif (attributes['sport']=='athletics'):
						categ.append(subcategories["Atletism"])
			if (attributes['leisure']=='pitch'):
				if attributes.has_key('sport'):
					if attributes['sport']=='rugby':
						categ.append(subcategories["Rugby"])
					elif attributes['sport']=='tenis':
						categ.append(subcategories["Tenis"])
					else:
						categ.append(subcategories["Teren sport"])
						info = "Sporturi: "+attributes['sport']
				else:
					categ.append(subcategories["Teren sport"])
			if (attributes['leisure']=='golf_course'):
				categ.append(subcategories["Teren golf"])
			if (attributes['leisure']=='miniature_golf'):
				categ.append(subcategories["Minigolf"])
		if (attributes.has_key('tourism')):
			if (attributes['tourism']=='attraction'):
				categ.append(subcategories["Atractie turistica"])
			if (attributes['tourism']=='information'):
				categ.append(subcategories["Punct informare"])
				if attributes.has_key('information'):
					info = "Information point type: "+attributes['information']
			if (attributes['tourism']=='museum'):
				categ.append(subcategories["Muzeu"])
			if (attributes['tourism']=='zoo'):
				categ.append(subcategories["Zoo"])
			if (attributes['tourism']=='viewpoint'):
				categ.append(subcategories["Belvedere"])
			if (attributes['tourism']=='theme_park'):
				categ.append(subcategories["Parc de distractii"])
			if (attributes['tourism']=='artwork'):
				categ.append(subcategories["Opera de arta"])
			if (attributes['tourism']=='hotel'):
				categ.append(subcategories["Hotel"])
				if attributes.has_key('stars'):
					info = "Stele: "+attributes['stars']
			if (attributes['tourism']=='motel'):
				categ.append(subcategories["Motel"])
			if (attributes['tourism']=='guest_house'):
				categ.append(subcategories["Pensiune"])
			if (attributes['tourism']=='hostel'):
				categ.append(subcategories["Hostel"])
			if (attributes['tourism']=='chalet'):
				categ.append(subcategories["Vila"])
			if (attributes['tourism']=='alpine_hut'):
				categ.append(subcategories["Cabana"])
			if (attributes['tourism']=='camp_site'):
				categ.append(subcategories["Camping"])
		if (attributes.has_key('man_made')):
			if (attributes['man_made']=='lighthouse'):
				categ.append(subcategories["Far"])
			if (attributes['man_made']=='windmill'):
				categ.append(subcategories["Moara de vant"])
		if (attributes.has_key('waterway')):
			if (attributes['waterway']=='watefall'):
				categ.append(subcategories["Cascada"])
		if (attributes.has_key('historic')):
			if (attributes['historic']=='castle'):
				categ.append(subcategories["Castel"])
			if (attributes['historic']=='ruins'):
				categ.append(subcategories["Ruine"])
			if (attributes['historic']=='archaeological_site'):
				categ.append(subcategories["Sit arheologic"])
			if (attributes['historic']=='monument'):
				categ.append(subcategories["Monument"])
			if (attributes['historic']=='memorial'):
				categ.append(subcategories["Memorial"])
			if (attributes['historic']=='battlefield'):
				categ.append(subcategories["Batalie"])
		if (attributes.has_key('shop')):
			if (attributes['shop']=='hairdresser'):
				categ.append(subcategories["Frizerie"])
			if (attributes['shop']=='dry_cleaning'):
				categ.append(subcategories["Curatatorie haine"])
			if (attributes['shop']=='video'):
				categ.append(subcategories["Inchiriere Video/DVD"])
			if (attributes['shop']=='supermarket'):
				categ.append(subcategories["Supermarket"])
			if (attributes['shop']=='kiosk'):
				categ.append(subcategories["Chiosc presa"])
			if (attributes['shop']=='bakery'):
				categ.append(subcategories["Brutarie"])
			if (attributes['shop']=='butcher'):
				categ.append(subcategories["Preparate carne"])
			if (attributes['shop']=='florist'):
				categ.append(subcategories["Florarie"])
			if (attributes['shop']=='computer'):
				categ.append(subcategories["Calculatoare"])
			if (attributes['shop']=='electronics'):
				categ.append(subcategories["Electronice"])
			if (attributes['shop']=='furniture'):
				categ.append(subcategories["Mobila"])
			if (attributes['shop']=='shoes'):
				categ.append(subcategories["Incaltaminte"])
			if (attributes['shop']=='toys'):
				categ.append(subcategories["Jucarii"])
			if (attributes['shop']=='sports'):
				categ.append(subcategories["Sportiv"])
			if (attributes['shop']=='outdoor'):
				categ.append(subcategories["Outdoor"])
			if (attributes['shop']=='hardware'):
				categ.append(subcategories["Scule si unelte"])
			if (attributes['shop']=='clothes'):
				categ.append(subcategories["Haine"])
			if (attributes['shop']=='optician'):
				categ.append(subcategories["Optica medicala"])
			if (attributes['shop']=='car'):
				if attributes.has_key('service'):
					if ('car' in attributes['service']):
						categ.append(subcategories["Dealer auto"])
						#info
					if ('repair' in attributes['service']):
						categ.append(subcategories["Service auto"])
						#info
					if ('parts' in attributes['service']):
						categ.append(subcategories["Piese auto"])
					if ('tyres' in attributes['service']):
						categ.append(subcategories["Anvelope auto"])
			if (attributes['shop']=='car_repair'):
				categ.append(subcategories["Service auto"])
		
		if (attributes.has_key('amenity')):
			if (attributes['amenity']=='restaurant'):
				categ.append(subcategories["Restaurant"])
				#info cuisine
			if (attributes['amenity']=='fast_food'):
				categ.append(subcategories["Fastfood"])
				#info cuisine
			if (attributes['amenity']=='cafe'):
				categ.append(subcategories["Cafenea"])
			if (attributes['amenity']=='pub'):
				categ.append(subcategories["Pub"])
			if (attributes['amenity']=='nightclub'):
				categ.append(subcategories["Club"])
			if (attributes['amenity']=='fuel'):
				categ.append(subcategories["Benzinarie"])
				#info operator
			if (attributes['amenity']=='parking'):
				categ.append(subcategories["Parcare"])
				#info fee, type, capacity
			if (attributes['amenity']=='car_wash'):
				categ.append(subcategories["Spalatorie auto"])
			if (attributes['amenity']=='car_rental'):
				categ.append(subcategories["Rent a car"])
				#info operator
			if (attributes['amenity']=='bank'):
				categ.append(subcategories["Banca"])
				#info atm
			if (attributes['amenity']=='bureau_de_change'):
				categ.append(subcategories["Schimb valutar"])
			if (attributes['amenity']=='atm	'):
				categ.append(subcategories["ATM"])
			if (attributes['amenity']=='toilets'):
				categ.append(subcategories["Toalete"])
				#info charge
			if (attributes['amenity']=='post_box'):
				categ.append(subcategories["Casuta postala"])
				#info operator?
			if (attributes['amenity']=='telephone'):
				categ.append(subcategories["Telefon"])
				#info operator, payment
			if (attributes['amenity']=='recycling'):
				categ.append(subcategories["Centru reciclare"])
				#info recycling:
			if (attributes['amenity']=='fountain'):
				categ.append(subcategories["Fantana"])
			if (attributes['amenity']=='drinking_water'):
				categ.append(subcategories["Sursa apa potabila"])
			if (attributes['amenity']=='kindergarten'):
				categ.append(subcategories["Gradinita"])
			if (attributes['amenity']=='school'):
				categ.append(subcategories["Scoala"])
			if (attributes['amenity']=='college'):
				categ.append(subcategories["Liceu"])
			if (attributes['amenity']=='university'):
				categ.append(subcategories["Universitate/facultate"])
			if (attributes['amenity']=='cinema'):
				categ.append(subcategories["Cinema"])
			if (attributes['amenity']=='library'):
				categ.append(subcategories["Biblioteca"])
			if (attributes['amenity']=='arts_center'):
				categ.append(subcategories["Centru de arta"])
			if (attributes['amenity']=='theater'):
				categ.append(subcategories["Teatru"])
			if (attributes['amenity']=='place_of_worship'):
				categ.append(subcategories["Religie"])
				#info religion, denomination
			if (attributes['amenity']=='concert_hall'):
				categ.append(subcategories["Sala concerte"])
			if (attributes['amenity']=='casino'):
				categ.append(subcategories["Casino"])
			if (attributes['amenity']=='pharmacy'):
				categ.append(subcategories["Farmacie"])
			if (attributes['amenity']=='hospital'):
				categ.append(subcategories["Spital"])
			if (attributes['amenity']=='townlhall'):
				categ.append(subcategories["Primarie"])
			if (attributes['amenity']=='embassy'):
				categ.append(subcategories["Ambasada"])
			if (attributes['amenity']=='courthouse'):
				categ.append(subcategories["Tribunal"])
			if (attributes['amenity']=='prison'):
				categ.append(subcategories["Inchisoare"])
			if (attributes['amenity']=='police'):
				categ.append(subcategories["Politie"])
			if (attributes['amenity']=='fire_station'):
				categ.append(subcategories["Pompieri"])
			if (attributes['amenity']=='post_office'):
				categ.append(subcategories["Oficiu Postal"])
			if (attributes['amenity']=='bus_station'):
				categ.append(subcategories["Statie autobuz"])
			if (attributes['amenity']=='taxi'):
				categ.append(subcategories["Taxi"])
			if (attributes['amenity']=='ferry_terminal'):
				categ.append(subcategories["Ferry/Trecere bac"])
			if (attributes['amenity']=='veterinary'):
				categ.append(subcategories["Veterinar"])
		if (attributes.has_key('boundary')):
			if (attributes['boundary']=='national_park'):
				categ.append(subcategories["Parc national"])
		if (attributes.has_key('natural')):
			if (attributes['natural']=='beach'):
				categ.append(subcategories["Plaja"])
		if (attributes.has_key('route')):
			if (attributes['route']=='ski'):
				categ.append(subcategories["Partie ski"])
		if (attributes.has_key('sport')):
			if (attributes['sport']=='skiing'):
				categ.append(subcategories["Partie ski"])
			if (attributes['sport']=='10pin'):
				categ.append(subcategories["Bowling"])
			if (attributes['sport']=='swimming'):
				categ.append(subcategories["Piscina"])
		if (attributes.has_key('barrier')):
			if (attributes['barrier']=='border_control'):
				categ.append(subcategories["Punct de trecere al frontierei"])
		if (attributes.has_key('railway')):
			if (attributes['railway']=='tram_stop'):
				categ.append(subcategories["Statie tramvai"])
			if (attributes['railway']=='subway_entrance'):
				categ.append(subcategories["Intrare metrou"])
				#info wheelchair
			if (attributes['railway']=='station'):
				categ.append(subcategories["Gara"])
			if (attributes['railway']=='halt'):
				categ.append(subcategories["Halta"])
		if (attributes.has_key('airway')):
			if (attributes['airway']=='aerodrome'):
				categ.append(subcategories["Aeroport"])
				#info iata
		if (attributes.has_key('highway')):
			if attributes['highway'] in ['motorway','trunk','primary','secondary','tertiary','residential', 'service', 'unclassified']:
				if (attributes.has_key('name')):
					categ.append(subcategories["Strada"])
		if len(categ)==0:
			categ=None
		return (categ, info)
	
	def startElement(self, name, attrs):

		if name in ['node','way']:
			self.myattributes={}	
		
		if name=='node':
			self.id = attrs.get("id")
			#lat = long(attrs.get("lat").replace(".","",1))
			#lon = long(attrs.get("lon").replace(".","",1))
			lat = float(attrs.get("lat"))*1000
			lon = float(attrs.get("lon"))*1000
			#lat = attrs.get("lat")
			#lon = attrs.get("lon")
			nodesLat[self.id] = lat #Coords(lat,lon)
			nodesLon[self.id] = lon #Coords(lat,lon)
			self.count+=1
			pass
		elif name=='nd':
			ref = attrs.get("ref")
			self.mynodes.append(ref)
		elif name=='way':
			self.id = 0 - int(attrs.get("id"))
			self.mynodes=[]
			pass
		elif name=='tag':
			k = attrs.get("k","");
			v = attrs.get("v","");
			#print k,v.encode("utf-8")
			self.myattributes[k]=v;
			
	def endElement(self,name):
		#if (name in ['node','way']) and (len(self.myattributes)>0):
		#	print self.myattributes;
		#	print
		if (name=='way') and (len(self.myattributes)>0):
			nume = ""
			isin = None
			if self.myattributes.has_key("name"):
				nume = self.myattributes["name"]
			if self.myattributes.has_key("is_in"):
				isin = self.myattributes["is_in"]
			if self.myattributes.has_key("place"):
				if (self.myattributes['place'] in ['city','town','hamlet','village']) and (self.mynodes[0]==self.mynodes[len(self.mynodes)-1]):# and (nume!=""):
					lista = []
					for nodeid in self.mynodes:
						lista.append(Coords(nodesLat[nodeid],nodesLon[nodeid]))
					localitatipoly.append(Localitate(len(localitatipoly), self.id, nume,self.myattributes['place'], lista))
			subcats,info = self.categorize(self.myattributes)
			if subcats is not None:
				cx, cy = centroid(self.mynodes)
				ar = area(self.mynodes)
				box = self.bbox(self.mynodes)
				#print self.myattributes
				#print "area:", ar
				#print "centroid:", cx, cy
				for subcat in subcats:
					#id, osmid, name, subcat, info, point, isin, bounds=None, localitati=None
					if subcat.name=="Strada":
						strazi.append(POI(len(strazi)+1, self.id, nume, subcat, info, Coords(cy,cx), isin, box))
					else:
						pois.append(POI(len(pois)+1, self.id, nume, subcat, info, Coords(cy,cx), isin, box))
			#pass
		if (name=='node') and (len(self.myattributes)>0):
			nume = ""
			isin = None
			if self.myattributes.has_key("name"):
				nume = self.myattributes["name"]
			if self.myattributes.has_key("is_in"):
				isin = self.myattributes["is_in"]
			if self.myattributes.has_key("place"):
				if self.myattributes['place'] in ['city','town','hamlet','village']:
					localitati.append(Localitate(len(localitati), self.id, nume,self.myattributes['place'], [Coords(nodesLat[self.id], nodesLon[self.id])]))
			subcats,info = self.categorize(self.myattributes)
			if subcats is not None:
				for subcat in subcats:
					#id, osmid, name, subcat, info, point, isin, bounds=None, localitati=None
					pois.append(POI(len(pois)+1, self.id, nume, subcat, info, Coords(nodesLat[self.id], nodesLon[self.id]), isin))
		return

def createCategories():
	categs={}
	categs["Turism"] = Category(1,"Turism")
	categs["Cazare"] = Category(2,"Cazare")
	categs["Restaurante"] = Category(3,"Restaurante")
	categs["Servicii"] = Category(4,"Servicii")
	categs["Cumparaturi"] = Category(5,"Cumparaturi")
	categs["Locuri istorice"] = Category(6,"Locuri istorice")
	categs["Cultura"] = Category(7,"Cultura")
	categs["Divertisment"] = Category(8,"Divertisment")
	categs["Sporturi, Recreere"] = Category(9,"Sporturi, Recreere")
	categs["Sanatate"] = Category(10,"Sanatate")
	categs["Cladiri oficiale"] = Category(11,"Cladiri oficiale")
	categs["Transport"] = Category(12,"Transport")
	return categs

def createSubcategories():
	subcat={}
	
	#1 Turism
	subcat["Atractie turistica"]=Subcategory(1,"Atractie turistica",1)
	subcat["Punct informare"] = Subcategory(2,"Punct informare",1)
	subcat["Muzeu"] = Subcategory(3,"Muzeu",1)
	subcat["Zoo"] = Subcategory(4,"Zoo",1)
	subcat["Belvedere"] = Subcategory(5,"Belvedere",1)
	subcat["Parc de distractii"] = Subcategory(6,"Parc de distractii",1)
	subcat["Opera de arta"] = Subcategory(7,"Opera de arta",1)
	subcat["Far"] = Subcategory(8,"Far",1)
	subcat["Moara de vant"] = Subcategory(9,"Moara de vant",1)
	subcat["Cascada"] = Subcategory(10,"Cascada",1)

	#2 Cazare
	subcat["Hotel"] = Subcategory(11,"Hotel",2)
	subcat["Motel"] = Subcategory(12,"Motel",2)
	subcat["Pensiune"] = Subcategory(13,"Pensiune",2)
	subcat["Hostel"] = Subcategory(14,"Hostel",2)
	subcat["Vila"] = Subcategory(15,"Vila",2)
	subcat["Cabana"] = Subcategory(16,"Cabana",2)
	subcat["Camping"] = Subcategory(17,"Camping",2)

	#3 Restaurante
	subcat["Restaurant"] = Subcategory(18,"Restaurant",3)
	subcat["Fastfood"] = Subcategory(19,"Fastfood",3)
	subcat["Cafenea"] = Subcategory(20,"Cafenea",3)
	subcat["Pub"] = Subcategory(21,"Pub",3)

	#4 Servicii
	subcat["Benzinarie"] = Subcategory(22,"Benzinarie",4)
	subcat["Parcare"] = Subcategory(23,"Parcare",4)
	subcat["Dealer auto"] = Subcategory(118,"Dealer auto",4)
	subcat["Spalatorie auto"] = Subcategory(24,"Spalatorie auto",4)
	subcat["Piese auto"] = Subcategory(25,"Piese auto",4)
	subcat["Service auto"] = Subcategory(26,"Service auto",4)
	subcat["Anvelope auto"] = Subcategory(27,"Anvelope auto",4)
	subcat["Vulcanizare"] = Subcategory(28,"Vulcanizare",4)
	subcat["Rent a car"] = Subcategory(29,"Rent a car",4)
	subcat["Banca"] = Subcategory(30,"Banca",4)
	subcat["Schimb valutar"] = Subcategory(31,"Schimb valutar",4)
	subcat["ATM"] = Subcategory(32,"ATM",4)
	subcat["Salon infrumusetare"] = Subcategory(33,"Salon infrumusetare",4)
	subcat["Frizerie"] = Subcategory(34,"Frizerie",4)
	subcat["Curatatorie haine"] = Subcategory(35,"Curatatorie haine",4)
	subcat["Inchiriere Video/DVD"] = Subcategory(36,"Inchiriere Video/DVD",4)
	subcat["Toalete"] = Subcategory(37,"Toalete",4)
	subcat["Casuta postala"] = Subcategory(38,"Casuta postala",4)
	subcat["Telefon"] = Subcategory(39,"Telefon",4)
	subcat["Centru reciclare"] = Subcategory(40,"Centru reciclare",4)
	subcat["Fantana"] = Subcategory(41,"Fantana",4)
	subcat["Sursa apa potabila"] = Subcategory(42,"Sursa apa potabila",4)

	#5 Cumparaturi
	subcat["Supermarket"] = Subcategory(43,"Supermarket",5)
	subcat["Chiosc presa"] = Subcategory(44,"Chiosc presa",5)
	subcat["Brutarie"] = Subcategory(45,"Brutarie",5)
	subcat["Preparate carne"] = Subcategory(46,"Preparate carne",5)
	subcat["Florarie"] = Subcategory(47,"Florarie",5)
	subcat["Calculatoare"] = Subcategory(48,"Calculatoare",5)
	subcat["Electronice"] = Subcategory(49,"Electronice",5)
	subcat["Mobila"] = Subcategory(50,"Mobila",5)
	subcat["Incaltaminte"] = Subcategory(51,"Incaltaminte",5)
	subcat["Jucarii"] = Subcategory(52,"Jucarii",5)
	subcat["Sportiv"] = Subcategory(53,"Sportiv",5)
	subcat["Outdoor"] = Subcategory(54,"Outdoor",5)
	subcat["Scule si unelte"] = Subcategory(55,"Scule si unelte",5)
	subcat["Haine"] = Subcategory(56,"Haine",5)

	#6 Locuri istorice
	subcat["Castel"] = Subcategory(57,"Castel",6)
	subcat["Ruine"] = Subcategory(58,"Ruine",6)
	subcat["Sit arheologic"] = Subcategory(59,"Sit arheologic",6)
	subcat["Monument"] = Subcategory(60,"Monument",6)
	subcat["Memorial"] = Subcategory(61,"Memorial",6)
	subcat["Batalie"] = Subcategory(62,"Batalie",6)

	#7 Cultura
	subcat["Gradinita"] = Subcategory(63,"Gradinita",7)
	subcat["Scoala"] = Subcategory(64,"Scoala",7)
	subcat["Liceu"] = Subcategory(65,"Liceu",7)
	subcat["Universitate/facultate"] = Subcategory(66,"Universitate/facultate",7)
	subcat["Cinema"] = Subcategory(67,"Cinema",7)
	subcat["Biblioteca"] = Subcategory(68,"Biblioteca",7)
	subcat["Centru de arta"] = Subcategory(69,"Centru de arta",7)
	subcat["Teatru"] = Subcategory(70,"Teatru",7)
	subcat["Religie"] = Subcategory(71,"Religie",7)
	subcat["Sala concerte"] = Subcategory(72,"Sala concerte",7)
	subcat["Centru expozitional"] = Subcategory(73,"Centru expozitional",7)

	#8 Divertisment
	subcat["Parc acvatic"] = Subcategory(74,"Parc acvatic",8)
	subcat["Loc de joaca"] = Subcategory(75,"Loc de joaca",8)
	subcat["Rezervatie naturala"] = Subcategory(76,"Rezervatie naturala",8)
	subcat["Parc national"] = Subcategory(77,"Parc national",8)
	subcat["Parc"] = Subcategory(78,"Parc",8)
	subcat["Gradina"] = Subcategory(79,"Gradina",8)
	subcat["Casino"] = Subcategory(80,"Casino",8)
	subcat["Club"] = Subcategory(81,"Club",8)

	#9 Sporturi, recreere
	subcat["Stadion"] = Subcategory(82,"Stadion",9)
	subcat["Sala polivalenta"] = Subcategory(83,"Sala polivalenta",9)
	subcat["Hipodrom"] = Subcategory(84,"Hipodrom",9)
	subcat["Circuit curse"] = Subcategory(85,"Circuit curse",9)
	subcat["Teren sport"] = Subcategory(86,"Teren sport",9)
	subcat["Tenis"] = Subcategory(87,"Tenis",9)
	subcat["Bowling"] = Subcategory(88,"Bowling",9)
	subcat["Patinoar"] = Subcategory(89,"Patinoar",9)
	subcat["Rugby"] = Subcategory(90,"Rugby",9)
	subcat["Atletism"] = Subcategory(91,"Atletism",9)
	subcat["Teren golf"] = Subcategory(92,"Teren golf",9)
	subcat["Minigolf"] = Subcategory(93,"Minigolf",9)
	subcat["Plaja"] = Subcategory(94,"Plaja",9)
	subcat["Partie ski"] = Subcategory(95,"Partie ski",9)
	subcat["Piscina"] = Subcategory(96,"Piscina",9)

	#10 Sanatate
	subcat["Farmacie"] = Subcategory(97,"Farmacie",10)
	subcat["Spital"] = Subcategory(98,"Spital",10)
	subcat["Veterinar"] = Subcategory(99,"Veterinar",10)
	subcat["Optica medicala"] = Subcategory(100,"Optica medicala",10)

	#11 Cladiri oficiale/Guvernamant/Oficialitati
	subcat["Primarie"] = Subcategory(101,"Primarie",11)
	subcat["Ambasada"] = Subcategory(102,"Ambasada",11)
	subcat["Tribunal"] = Subcategory(103,"Tribunal",11)
	subcat["Inchisoare"] = Subcategory(104,"Inchisoare",11)
	subcat["Politie"] = Subcategory(105,"Politie",11)
	subcat["Pompieri"] = Subcategory(106,"Pompieri",11)
	subcat["Oficiu Postal"] = Subcategory(107,"Oficiu Postal",11)
	subcat["Punct de trecere al frontierei"] = Subcategory(108,"Punct de trecere al frontierei",11)

	#12 Transport
	subcat["Statie autobuz"] = Subcategory(109,"Statie autobus",12)
	subcat["Statie tramvai"] = Subcategory(110,"Statie tramvai",12)
	subcat["Intrare metrou"] = Subcategory(111,"Intrare metrou",12)
	subcat["Taxi"] = Subcategory(112,"Taxi",12)
	subcat["Gara"] = Subcategory(113,"Gara",12)
	subcat["Halta"] = Subcategory(114,"Halta",12)
	subcat["Aeroport"] = Subcategory(115,"Aeroport",12)
	subcat["Ferry/Trecere bac"] = Subcategory(116,"Ferry/Trecere bac",12)
	subcat["Port"] = Subcategory(117,"Port",12)

	#Special
	subcat["Strada"] = Subcategory(200,"Strada",None)

	return subcat
	
	

def GetDistanceInKm(point1, point2):
	R = 6371
	y = math.radians((point1.lat-point2.lat)/1000)
	x = math.radians((point1.lon-point2.lon)/1000)
	a = math.pow( math.sin(y/2),2)+ math.cos(math.radians(point1.lat/1000))*math.cos(math.radians(point2.lat/1000))*math.pow(math.sin(x/2),2)
	#print "a:",a
	c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
	return math.fabs(c*R)

def PointInPolygon(pt, poly):
	
	#daca primul nod = ultimul atunci il scoatem din lista
	if poly[0]==poly[len(poly)-1]:
		poly.pop()
	
	j=len(poly)-1 #number of sides-1 
	oddNodes=False
	polySides=len(poly)
	for i in range(0, polySides):
		#print "0"
		if (poly[i].lat<pt.lat<=poly[j].lat) or (poly[j].lat<pt.lat<=poly[i].lat):
			#print "1"
			if ((poly[i].lon+(pt.lat-poly[i].lat)/(poly[j].lat-poly[i].lat)*(poly[j].lon-poly[i].lon))<pt.lon):
				#print "oddNodes = not oddNodes"
				oddNodes = not oddNodes
		j=i

	return oddNodes
	
def area(nodes):
	a = 0
	n = len(nodes)
	for i in range(0,n):
		j = (i + 1) % n
		a += (nodesLon[nodes[i]] * nodesLat[nodes[j]])
		a -= (nodesLon[nodes[j]] * nodesLat[nodes[i]])
	a /= 2.0
	return abs(a)

def areaPoly(coords):
	a = 0
	n = len(coords)
	for i in range(0,n):
		j = (i + 1) % n
		a += (coords[i].lon * coords[j].lat)
		a -= (coords[j].lon * coords[i].lat)
	a /= 2.0
	return abs(a)

def centroid(nodes):
	if nodes[0]!=nodes[len(nodes)-1]:
		#probabil o strada, returnam coordonatele nodului de la mijloc
		mid = len(nodes)/2
		idmid = nodes[mid]
		return nodesLat[idmid], nodesLon[idmid]
	else:
		#un polygon calculam centrul
		cx = 0
		cy = 0
		a = area(nodes)
		if a < 0.0001:
			#o arie foarte mica -> aproape un punct
			mid = len(nodes)/2
			idmid = nodes[mid]
			return nodesLat[idmid], nodesLon[idmid]
			
		factor = 0;
		n = len(nodes)
		for i in range(0, n):
			j = (i + 1) % n
			factor = (nodesLon[nodes[i]] * nodesLat[nodes[j]] - nodesLon[nodes[j]] * nodesLat[nodes[i]])
			cx += ((nodesLon[nodes[i]] + nodesLon[nodes[j]]) * factor)
			cy += ((nodesLat[nodes[i]] + nodesLat[nodes[j]]) * factor)
		
		a *= 6.0
		factor = 1 / a
		cx *= factor
		cy *= factor
		dir = PointsDirection(nodes)
		if dir!=0:
			cx *= dir
			cy *= dir
		return cx,cy

	pass

def centroidPoly(coords):
	#un polygon calculam centrul
	cx = 0
	cy = 0
	a = areaPoly(coords)
	if a < 0.0001:
		#o arie foarte mica -> aproape un punct
		mid = len(coords)/2
		return coords[mid].lat, coords[mid].lon
		
	factor = 0;
	n = len(coords)
	for i in range(0, n):
		j = (i + 1) % n
		factor = (coords[i].lon * coords[j].lat - coords[j].lon * coords[i].lat)
		cx += ((coords[i].lon + coords[j].lon) * factor)
		cy += ((coords[i].lat + coords[j].lat) * factor)
	
	a *= 6.0
	factor = 1 / a
	cx *= factor
	cy *= factor
	dir = PointsDirectionPoly(coords)
	if dir!=0:
		cx *= dir
		cy *= dir
	return cx,cy

def PointsDirectionPoly(coords):
	#return 1 - clockwise
	#return -1 - counter-clockwise
	#return 0 - unknown 

	nCount=0
	j=0
	k=0
	nPoints=len(coords)

	if (nPoints<3):
		return 0
	for i in range(0,nPoints):
		j=(i+1) % nPoints #j:=i+1
		k=(i+2) % nPoints #k:=i+2

		crossProduct=(coords[j].lon - coords[i].lon)*(coords[k].lat- coords[j].lat)
		crossProduct=crossProduct-((coords[j].lat- coords[i].lat)*(coords[k].lon- coords[j].lon))

		if (crossProduct>0):
			nCount+=1
		else:
			nCount-=1
	if( nCount<0):
		return -1
	elif (nCount> 0):
		return 1
	else:
		return 0
		
def PointsDirection(nodes):
	#return 1 - clockwise
	#return -1 - counter-clockwise
	#return 0 - unknown 

	nCount=0
	j=0
	k=0
	nPoints=len(nodes)

	if (nPoints<3):
		return 0
	for i in range(0,nPoints):
		j=(i+1) % nPoints #j:=i+1
		k=(i+2) % nPoints #k:=i+2

		crossProduct=(nodesLon[nodes[j]] - nodesLon[nodes[i]])*(nodesLat[nodes[k]]- nodesLat[nodes[j]])
		crossProduct=crossProduct-((nodesLat[nodes[j]]- nodesLat[nodes[i]])*(nodesLon[nodes[k]]- nodesLon[nodes[j]]))

		if (crossProduct>0):
			nCount+=1
		else:
			nCount-=1
	if( nCount<0):
		return -1
	elif (nCount> 0):
		return 1
	else:
		return 0

def cautaLocalitati():

	i=0
	for punct in pois:
		localitate = ""
		#print punct.name, punct.point
		for loc in localitatipoly:
			if PointInPolygon(punct.point, loc.coord)==True:
				localitate = loc.nume.encode('utf-8')
				#print punct.name.encode('utf-8'), punct.subcat, " in ", localitate
				punct.localitate = loc.nume
		if localitate!="":
			punct.alteloc = loc.nume
			continue #sigur?
		for loc in localitati:
			if math.fabs(punct.point.lat-loc.coord[0].lat)>90.1: #20km pe latitudine = 180.2
				continue
			if math.fabs(punct.point.lon-loc.coord[0].lon)>126.6: #20 km pe longitudine la 45 grade latitudine = 253.2
				continue
			dist = GetDistanceInKm(punct.point, loc.coord[0])
			if dist<20: #20km
				if punct.alteloc is None:
					punct.alteloc = loc.nume
				else:
					punct.alteloc = punct.alteloc+", "+loc.nume
		for loc in localitatipoly:
			#if math.abs(punct.point.lat-loc.coord[0].lat)>183.2:
			#	continue
			cx,cy = centroidPoly(loc.coord)
			centru = Coords(cy,cx)
			if math.fabs(punct.point.lat-centru.lat)>90.1: #20km pe latitudine=180.2
				continue
			if math.fabs(punct.point.lon-centru.lon)>126.6: #20 km pe longitudine la 45 grade latitudine=253.2
				continue
			dist = GetDistanceInKm(punct.point, centru)
			if dist<20: #20km
				if punct.alteloc is None:
					punct.alteloc = loc.nume
				else:
					punct.alteloc = punct.alteloc+", "+loc.nume
		if i%100 ==0:
			print "positioned ",i
		i+=1
	"""
	for punct in strazi:
		localitate = ""
		#print punct.name, punct.point
		for loc in localitatipoly:
			if PointInPolygon(punct.point, loc.coord)==True:
				localitate = loc.nume.encode('utf-8')
				#print punct.name.encode('utf-8'), punct.subcat, " in ", localitate
				punct.localitate = loc.nume
		if localitate!="":
			punct.alteloc = loc.nume
			continue #sigur?
		for loc in localitati:
			#if math.abs(punct.point.lat-loc.coord[0].lat)>183.2:
			#	continue
			dist = GetDistanceInKm(punct.point, loc.coord[0])
			if dist<20: #20km
				if punct.alteloc is None:
					punct.alteloc = loc.nume
				else:
					punct.alteloc = punct.alteloc+", "+loc.nume
		for loc in localitatipoly:
			#if math.abs(punct.point.lat-loc.coord[0].lat)>183.2:
			#	continue
			cx,cy = centroidPoly(loc.coord)
			centru = Coords(cy,cx)
			dist = GetDistanceInKm(punct.point, centru)
			if dist<20: #20km
				if punct.alteloc is None:
					punct.alteloc = loc.nume
				else:
					punct.alteloc = punct.alteloc+", "+loc.nume
		if i%50 ==0:
			print "positioned ",i
		i+=1
	"""


if len(sys.argv) != 3:
  print "You need to provide two arguments: the uncompressed plater file (extract) and the date in format yymmdd"
  exit()

planet_file = sys.argv[1]
planet_date = datetime.datetime.strptime(sys.argv[2].strip(), '%y%m%d').date()

nodesLat = {}
nodesLon = {}
localitati = []
localitatipoly = []
pois = []
strazi = []
categories = createCategories()
subcategories = createSubcategories()
"""
f = open('categorii.sql','w')
for k,c in categories.items():
	f.write(c.sql().encode('utf-8')+'\n')
for k,s in subcategories.items():
	f.write(s.sql().encode('utf-8')+'\n')
f.close()
"""

parser = make_parser()
content = OSMParser()
parser.setContentHandler(content)
#fisier = open('test.osm', 'r')
#fisier = open('galati.osm', 'r')
#fisier = open('test1.osm', 'r')
#fisier = open('d:\downloads\planet-rom-090207.osm', 'r')
fisier = open(planet_file, 'r')
t0=datetime.datetime.now()
#print "Starting parsing OSM file...(string coords)"
print "Starting parsing OSM file...(float coords)"
#print "Starting parsing OSM file...(long coords)"
parser.parse(fisier)
print content.count, "nodes in dict"
#for poi in pois:
#	print poi.name.encode('utf-8'), poi.id, poi.osmid
#	print poi.subcat, poi.info, poi.point
#	print
print "Sunt %d pois" % len(pois)
print "Sunt %d strazi" % len(strazi)
#for loc in localitati:
#	print loc.nume.encode('utf-8'), loc.tip, loc.coord
print "Sunt %d localitati" % len(localitati)
print "Sunt %d localitati poligoane" % len(localitatipoly)
#for loc in localitatipoly:
#	print loc.nume.encode('utf-8'), loc.tip
print "positioning"
#cautaLocalitati()
print "printing"
f = open('pois-%s.sql' % planet_date.strftime('%y%m%d'),'w')
f.write("SET NAMES utf8;\nDELETE FROM pois;\n")
f.write("INSERT INTO pois (id, name, cat, subcat, info, lat, lon, latSW, lonSW, latNE, lonNE) VALUES \n")
i=0
for poi in pois:
	if poi.subcat.id != 200:
		if i!= 0:
			f.write(",\n")
		f.write(poi.sql().encode('utf-8'))
	if (i % 100)==0:
		print i
	i+=1
n = datetime.datetime.now()
print "Finished (took",(n-t0).seconds,"seconds and",(n-t0).microseconds/1000,"miliseonds)"
time.sleep(1)
f.write(';')
f.close()