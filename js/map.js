var epsg4326 = new OpenLayers.Projection("EPSG:4326");
var markers;
var vectors;
var popup;

var mykey = '12345678901234567890'; //Your Cloudmade key

OpenLayers._getScriptLocation = function () {
  // Should really have this file as an erb, so that this can return 
  // the real rails root
  if (window.location.href.search(/localhost/)==-1) {
	return "/";
  }
  else {
	return "/routing/";
  }
}

function createMap(divName, options) {
   options = options || {};
	var map1;

   map1 = new OpenLayers.Map(divName, {
      units: "m",controls:[],
      //maxResolution: 156543.0339,
      numZoomLevels: 19,
	  projection: new OpenLayers.Projection("EPSG:900913"),
      displayProjection: new OpenLayers.Projection("EPSG:4326"),
	  maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
								 20037508, 20037508.34)
   });

   var cloudmadekey = mykey;

	cloudmade = new OpenLayers.Layer.CloudMade("CloudMade", {
	    key: cloudmadekey,
	    styleId: 2525 //Original with no POIS
	});
	map1.addLayer(cloudmade);

   mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik", {
      displayOutsideMaxExtent: true,
      wrapDateLine: true, 
	  attribution: '&copy; 2009 <a href="http://cloudmade.com">CloudMade</a> - Map data <a href="http://creativecommons.org/licenses/by-sa/2.0/">CCBYSA</a> 2009 <a href="http://openstreetmap.org">OpenStreetMap.org</a> contributors - <a href="http://cloudmade.com/terms_conditions">Terms of Use</a>'
   });
   map1.addLayer(mapnik);

   osmarender = new OpenLayers.Layer.OSM.Osmarender("Osmarender", {
      displayOutsideMaxExtent: true,
      wrapDateLine: true,
	  attribution: '&copy; 2009 <a href="http://cloudmade.com">CloudMade</a> - Map data <a href="http://creativecommons.org/licenses/by-sa/2.0/">CCBYSA</a> 2009 <a href="http://openstreetmap.org">OpenStreetMap.org</a> contributors - <a href="http://cloudmade.com/terms_conditions">Terms of Use</a>'
   });
   map1.addLayer(osmarender);
   
	gLayer = new OpenLayers.Layer.Google("Satelit", {
					sphericalMercator: true,
					numZoomLevels: 22,
					type: G_SATELLITE_MAP
			});
	map1.addLayer(gLayer);
   //var cyclemap = new OpenLayers.Layer.OSM.CycleMap("Cycle Map", {
   //   displayOutsideMaxExtent: true,
   //   wrapDateLine: true
   //});
   //map1.addLayer(cyclemap);

   wmsOSM = new OpenLayers.Layer.WMS(
                "OSM transparent",
                "http://wms.openstreet.ro:9876/",
                {
                    layers: 'admin,roads,minor-roads-casing,minor-roads-fill,water_areas,water_lines,tunnels,tracks-notunnel-nobridge,tracks-bridges,tracks-tunnels,waterway-bridges,bridges,trams,power,text,placenames,planet roads text osm,area-text,interpolation_lines,housenumb_ways,housenumb_nodes',
					transparent: 'TRUE'
                },
                {
				    isBaseLayer: false,
				    visibility: false,
					attribution: '<span class="linkAlb">Rendering &copy; <a href="http://www.alphatelecom.ro/">Alpha Telecom SRL</a> - Map data <a href="http://creativecommons.org/licenses/by-sa/2.0/">CCBYSA</a> 2009 <a href="http://openstreetmap.org">OpenStreetMap.org</a> contributors - <a href="http://cloudmade.com/terms_conditions">Terms of Use</a></span>'
				}
            );
	map1.addLayer(wmsOSM);

	wmsTP = new OpenLayers.Layer.WMS(
                "Transport public",
                "http://cipt2001.homeip.net:9090/geoserver/wms",
                {
                    layers: 'osm-transport',
					transparent: 'TRUE'
                },
                {
				    isBaseLayer: false,
				    visibility: false
				}
            );

   //var numZoomLevels = Math.max(mapnik.numZoomLevels, osmarender.numZoomLevels, cloudmade.numZoomLevels);

    map1.addControl(new OpenLayers.Control.ArgParser());
    map1.addControl(new OpenLayers.Control.Attribution());
    map1.addControl(new OpenLayers.Control.LayerSwitcher());
    map1.addControl(new OpenLayers.Control.Navigation());
    map1.addControl(new OpenLayers.Control.PanZoomBar());
    map1.addControl(new OpenLayers.Control.ScaleLine());
   
   //map1.addControl(new OpenLayers.Control.LayerSwitcher());
   //         map1.addControl(new OpenLayers.Control.MousePosition());
   return map1;
}

function getArrowIcon() {
   var size = new OpenLayers.Size(25, 22);
   var offset = new OpenLayers.Pixel(-30, -27);
   var icon = new OpenLayers.Icon("/images/arrow.png", size, offset);

   return icon;
}

function addMarkerToMap(position) {
	var marker_style = {
			pointRadius: 13,
			externalGraphic: '/images/marker.png',
			graphicXOffset: -13,
			graphicYOffset: -26
	};
	var marker = new OpenLayers.Feature.Vector(position.clone(), null, marker_style);

    return marker;
}

/*function addBoxToMap(boxbounds) {
   if(!vectors) {
     // Be aware that IE requires Vector layers be initialised on page load, and not under deferred script conditions
     vectors = new OpenLayers.Layer.Vector("Box Layer", {
        displayInLayerSwitcher: false
     });
     map.addLayer(vectors);
   }
   var geometry = boxbounds.toGeometry().transform(epsg4326, map.getProjectionObject());
   var box = new OpenLayers.Feature.Vector(geometry, {}, {
      strokeWidth: 2,
      strokeColor: '#ee9900',
      fillOpacity: 0
   });
   
   vectors.addFeatures(box);

   return box;
}

function removeBoxFromMap(box){
   vectors.removeFeature(box);


function openMapPopup(marker, description) {
   closeMapPopup();

   popup = new OpenLayers.Popup.AnchoredBubble("popup", marker.lonlat, null,
                                               description, marker.icon, true);
   popup.setBackgroundColor("#E3FFC5");
   popup.autoSize = true;
   map.addPopup(popup);

   return popup;
}

function closeMapPopup() {
   if (popup) {
      map.removePopup(popup);
      delete popup;
   }
}

function removeMarkerFromMap(marker){
   markers.removeMarker(marker);
}
*/

function getMapCenter(center, zoom) {
   return map.getCenter().clone().transform(map.getProjectionObject(), epsg4326);
}

function setMapCenter(center, zoom) {
   zoom = parseInt(zoom);
   var numzoom = map.getNumZoomLevels();
   if (zoom >= numzoom) zoom = numzoom - 1;
   map.setCenter(center.clone().transform(epsg4326, map.getProjectionObject()), zoom);
}

/*function setMapExtent(extent) {
   map.zoomToExtent(extent.clone().transform(epsg4326, map.getProjectionObject()));
}

function getMapExtent() {
   return map.getExtent().clone().transform(map.getProjectionObject(), epsg4326);
}

function getEventPosition(event) {
   return map.getLonLatFromViewPortPx(event.xy).clone().transform(map.getProjectionObject(), epsg4326);
}*/

function getMapLayers() {
   var layerConfig = "";

   for (var layers = map.getLayersBy("isBaseLayer", true), i = 0; i < layers.length; i++) {
      layerConfig += layers[i] == map.baseLayer ? "B" : "0";
   }

   for (var layers = map.getLayersBy("isBaseLayer", false), i = 0; i < layers.length; i++) {
      if (layers[i].name.search('SelectFeature')==-1)
		layerConfig += layers[i].getVisibility() ? "T" : "F";
   }
   return layerConfig;
}

function setMapLayers(layerConfig) {
   var l = 0;
   for (var layers = map.getLayersBy("isBaseLayer", true), i = 0; i < layers.length; i++) {
      var c = layerConfig.charAt(l++);

      if (c == "B") {
         map.setBaseLayer(layers[i]);
      }
   }

   while (layerConfig.charAt(l) == "B" || layerConfig.charAt(l) == "0") {
      l++;
   }

   for (var layers = map.getLayersBy("isBaseLayer", false), i = 0; i < layers.length; i++) {
      var c = layerConfig.charAt(l++);

      if (c == "T") {
         layers[i].setVisibility(true);
      } else if(c == "F") {
         layers[i].setVisibility(false);
      }
   }
}

/*function scaleToZoom(scale) {
   return Math.log(360.0/(scale * 512.0)) / Math.log(2.0);
}*/
