function deleteSearchResultsNew() {
		searchLayer.destroyFeatures();
}

function getLocationsCallbackNew(address, xml, index){
	//console.log(this);

	var south = 200.0,
	    north = -200.0,
		east = 200.0,
		west = -200.0,
		foundElems = [],
		i = 0,
		found = false,
	    newdiv,
		searches = $('#inputs_list').find('div.loader'),
		_obj = directionsManager,
		select_field,
		select_option,
		response = [],
		lonlat, point, imagine, marker_style, marker, option, location_coords, location_descr, b;
		
	
	//making sure with have only one serach results div 
	//deleteSearchResults();
	
	$(searches[index]).addClass("hidden");

	$(xml).find("named").each(function() {
		if (this.parentNode.nodeName=="searchresults") {
			found = true;
		}
	});


	if (found === false) {
		_obj.fieldsManager.getCoordField(index).value = "Nu am găsit nici un rezultat";
		return;
	}
    
    $(_obj.fieldsManager.getCoordField(index)).addClass('hidden');
    
    select_field = _obj.fieldsManager.getSearchSelect(index);
    $(select_field).removeClass('hidden');
      
    select_option = document.createElement('option');
      select_option.innerHTML = 'Selectați din listă';
      select_field.appendChild(select_option);

	
	$(xml).find("named").each(function() {
		//console.log(this.parentNode.nodeName+"     "+$(this).attr("name")+"  "+$(this).attr("lat")+"   "+$(this).attr("lon"));
		if (this.parentNode.nodeName==="searchresults") {
			i++;
			feature=[];
			if ((south==200.0)||(south > parseFloat($(this).attr("lat"))))
			{
				south = parseFloat($(this).attr("lat"));
			}
			if ((north==-200.0)||(north < parseFloat($(this).attr("lat"))))
			{
				north = parseFloat($(this).attr("lat"));
			}
			if ((east==200.0)||(east < parseFloat($(this).attr("lon"))))
			{
				east = parseFloat($(this).attr("lon"));
			}
			if ((west==-200.0)||(west > parseFloat($(this).attr("lon"))))
			{
				west = parseFloat($(this).attr("lon"));
			}
			lonlat = new OpenLayers.LonLat(parseFloat($(this).attr("lon")), parseFloat($(this).attr("lat"))).transform(CMProjection, OSMProjection);
			point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
			imagine = "/images/cautare/"+i+".png";
			//var icon = new OpenLayers.Icon("/images/subcats/"+imagine, new OpenLayers.Size(20, 20), new OpenLayers.Pixel(-10,-10));
			marker_style = {
					pointRadius: 17,
					externalGraphic: imagine,
					graphicXOffset: -17,
					graphicYOffset: -35
			};
			marker = new OpenLayers.Feature.Vector(point, null, marker_style);
			//var marker = new OpenLayers.Marker(lonlat, icon);
			marker.longlat = lonlat;
			marker.title = $(this).attr("name");
			//console.log(marker.id);
			foundElems.push(marker);
			
			option = document.createElement('option');
			option.innerHTML = String.fromCharCode(64+i)+". "+$(this).attr("name");
			select_field.appendChild(option);
			
			feature.lat = lonlat.lat;
			feature.lon = lonlat.lon;
			feature.name = $(this).attr("name");
			
			response.push(feature);
			
		}
	});
	searchLayer.addFeatures(foundElems);
	
	$(select_field).bind('change', function(){
      if(select_field.selectedIndex > 0){
	  //console.log("select_field).bind");
        location_coords = response[select_field.selectedIndex-1].lon + ' ' + response[select_field.selectedIndex-1].lat;
        location_descr = response[select_field.selectedIndex - 1].name;
        _obj.fieldsManager.setCoords(location_coords, index);
        _obj.fieldsManager.setDescr(location_descr, index);
        _obj.fieldsManager.showDescr(index);
        _obj.fieldsManager.destroySearchSelect(index);
        $(_obj.fieldsManager.getCoordField(index)).removeClass('hidden');
        _obj.reloadFields();
		deleteSearchResultsNew();
      }
    });
	
	
	if (i>0) {
		b = new OpenLayers.Bounds(west, south, east, north).transform(CMProjection, OSMProjection);
		map.zoomToExtent(b);
		$("#directions").append(newdiv);
	} else {
		newdiv = $("<div id=\"searchResults\"><p class=\"titleSearch\">Nu am gasit nici un rezultat!</p></div>");
		$("#directions").append(newdiv);		
	}
	
}	

function getLocationsCallbackNominatim(address, xml, index){
	//console.log(this);

	var south = 200.0,
	    north = -200.0,
		east = 200.0,
		west = -200.0,
		foundElems = [],
		i = 0,
		found = false,
	    newdiv,
		searches = $('#inputs_list').find('div.loader'),
		_obj = directionsManager,
		select_field,
		select_option,
		response = [],
		lonlat, point, imagine, marker_style, marker, option, location_coords, location_descr, b;
		
	
	//making sure with have only one serach results div 
	//deleteSearchResults();
	
	$(searches[index]).addClass("hidden");

	$(xml).find("place").each(function() {
		found = true;
	});


	if (found === false) {
		_obj.fieldsManager.getCoordField(index).value = "Nu am găsit nici un rezultat";
		return;
	}
    
    $(_obj.fieldsManager.getCoordField(index)).addClass('hidden');
    
    select_field = _obj.fieldsManager.getSearchSelect(index);
    $(select_field).removeClass('hidden');
      
    select_option = document.createElement('option');
      select_option.innerHTML = 'Selectați din listă';
      select_field.appendChild(select_option);

	
	$(xml).find("place").each(function() {
		//console.log(this.parentNode.nodeName+"     "+$(this).attr("name")+"  "+$(this).attr("lat")+"   "+$(this).attr("lon"));
		i++;
		feature=[];
		//NEED TO TAKE CARE OF BOUNDING BOX, INSTEAD OF LAT AND LON
		if ((south==200.0)||(south > parseFloat($(this).attr("lat"))))
		{
			south = parseFloat($(this).attr("lat"));
		}
		if ((north==-200.0)||(north < parseFloat($(this).attr("lat"))))
		{
			north = parseFloat($(this).attr("lat"));
		}
		if ((east==200.0)||(east < parseFloat($(this).attr("lon"))))
		{
			east = parseFloat($(this).attr("lon"));
		}
		if ((west==-200.0)||(west > parseFloat($(this).attr("lon"))))
		{
			west = parseFloat($(this).attr("lon"));
		}
		lonlat = new OpenLayers.LonLat(parseFloat($(this).attr("lon")), parseFloat($(this).attr("lat"))).transform(CMProjection, OSMProjection);
		point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
		imagine = "/images/cautare/"+i+".png";
		//var icon = new OpenLayers.Icon("/images/subcats/"+imagine, new OpenLayers.Size(20, 20), new OpenLayers.Pixel(-10,-10));
		marker_style = {
				pointRadius: 17,
				externalGraphic: imagine,
				graphicXOffset: -17,
				graphicYOffset: -35
		};
		marker = new OpenLayers.Feature.Vector(point, null, marker_style);
		//var marker = new OpenLayers.Marker(lonlat, icon);
		marker.longlat = lonlat;
		marker.title = $(this).attr("display_name");
		//console.log(marker.id);
		foundElems.push(marker);
		
		option = document.createElement('option');
		option.innerHTML = String.fromCharCode(64+i)+". "+$(this).attr("display_name");
		//NEED TO PARSE THE CATEGORY AND TYPE OF THE RESULT
		select_field.appendChild(option);
		
		feature.lat = lonlat.lat;
		feature.lon = lonlat.lon;
		feature.name = $(this).attr("display_name");
		
		response.push(feature);

	});
	searchLayer.addFeatures(foundElems);
	
	$(select_field).bind('change', function(){
      if(select_field.selectedIndex > 0){
	  //console.log("select_field).bind");
        location_coords = response[select_field.selectedIndex-1].lon + ' ' + response[select_field.selectedIndex-1].lat;
        location_descr = response[select_field.selectedIndex - 1].name;
        _obj.fieldsManager.setCoords(location_coords, index);
        _obj.fieldsManager.setDescr(location_descr, index);
        _obj.fieldsManager.showDescr(index);
        _obj.fieldsManager.destroySearchSelect(index);
        $(_obj.fieldsManager.getCoordField(index)).removeClass('hidden');
        _obj.reloadFields();
		deleteSearchResultsNew();
      }
    });
	
	
	if (i>0) {
		b = new OpenLayers.Bounds(west, south, east, north).transform(CMProjection, OSMProjection);
		map.zoomToExtent(b);
		$("#directions").append(newdiv);
	} else {
		newdiv = $("<div id=\"searchResults\"><p class=\"titleSearch\">Nu am gasit nici un rezultat!</p></div>");
		$("#directions").append(newdiv);		
	}
	
}

function getCoordinatesNew(event){
  //console.log("getCoordinatesNew")
  //console.log(this);
  if (event.keyCode!=13) {
	return;
  }
  var address = {},
      index = $(this).data('idx'),
	  searches;
  //console.log($(this).data('idx'));
  address.name = this.value;
  //console.log("before "+address.name);
  //address.name = address.name.replace(/\s+/g,'+');
  //console.log("after "+address.name);
  deleteSearchResultsNew();
  searches = $('#inputs_list').find('div.loader');
  $(searches[index]).removeClass("hidden");
  $.ajax({
	type: "GET", 
	url: "proxy.php", //http://cipt2001.homeip.net:8765/gazetteer/index.php
	data: ({q: address.name}),//"find="+address.name, 
	dataType: "xml", 
	success: function(xml) {
		//alert(xml);
		getLocationsCallbackNominatim(address, xml, index);
		$("#searchIndicator").addClass("hidden");
	},
	error: function() {
			  $.ajax({
				type: "GET", 
				url: "/namefinder/search1.php", //proxy.php
				data: ({find: address.name}),//"find="+address.name, 
				dataType: "xml", 
				success: function(xml) {
					//alert(xml);
					getLocationsCallbackNew(address, xml, index);
					$("#searchIndicator").addClass("hidden");
				},
				error: function() {
					$(searches[index]).addClass("hidden");
					directionsManager.fieldsManager.getCoordField(index).value = "Nu am găsit nici un rezultat";
				}
			  });
	}
  });


  return false;
}

