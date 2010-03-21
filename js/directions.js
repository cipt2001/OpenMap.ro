OSM = window.OSM || {};

OSM.DataModel = function(){
  this.points_names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  this.travel_modes = {
    DRIVING : 'car',
    WALKING : 'foot',
    CYCLING : 'bicycle'
  };
  this.projections = {
    CM : new OpenLayers.Projection('EPSG:4326'),
    OSM : new OpenLayers.Projection('EPSG:900913')
  };
  this.routing_options  = {
    units : 'km',
    language : 'en'
  };
  this.output_panel = $('#output_panel')[0];
  this.NO_RESPONSE_TEXT = 'We couldn\'t find what you were looking for, why not ';
  this.polyline_style = {
    strokeColor: '#762DA5',
        strokeOpacity: 0.8,
        strokeWidth: 5,
        pointRadius: 6,
        pointerEvents: 'visiblePainted'
  };
  this.host = 'http://routes.cloudmade.com';
  this.key = '12345678901234567890'; //Your Cloudmade key
};

OSM.DataModel.prototype = {
  getPointName : function(i){
    return this.points_names[i];
  },
  getTravelMode : function(name){
    return this.travel_modes[name];
  },
  getCMProjection : function(){
    return this.projections.CM;
  },
  getOSMProjection : function(){
    return this.projections.OSM;
  },
  getPanel : function(){
    return this.output_panel;
  },
  getRoutingOption : function(name){
    return this.routing_options[name];
  },
  getNoResponseText : function(){
    return this.NO_RESPONSE_TEXT;
  },
  getPolylineStyle : function(){
    return this.polyline_style;
  },
  getHost : function(){
    return this.host;
  },
  getKey : function(){
    return this.key;
  }
};

OSM.Utils = function(){};
  
OSM.Utils.prototype = {
  
  translate : function(instruction) {
	var fraze = ['Mergeți spre sud pe', 'Mergeți spre nord pe', 'Mergeți spre vest pe', 'Mergeți spre est pe', 
				 'Mergeți spre sud-est pe', 'Mergeți spre nord-est pe', 'Mergeți spre sud-vest pe', 'Mergeți spre nord-vest pe', 
				 'Continuați pe', 'Continuați',
				 'Virați la dreapta pe', 'Virați strâns la dreapta pe', 'Virați ușor la dreapta pe', 
				 'Virați la dreapta', 'Virați strâns la dreapta', 'Virați ușor la dreapta', 
				 'Virați la stânga pe', 'Virați strâns la stânga pe', 'Virați ușor la stânga pe',
				 'Virați la stânga', 'Virați strâns la stânga', 'Virați ușor la stânga',
				 'Intrați în sensul giratoriu, și părăsiți-l la', 'ieșire', 
				 'prima', 'a doua', 'a treia', 'a patra', 'a cincea', 'a șasea', 'a șaptea', 'a opta', 'a noua', ' pe ',
				 'Întoarcere la 180 de grade'];
	var fraze_en = ['Head south on', 'Head north on', 'Head west on', 'Head east on', 
				 'Head southeast on', 'Head northeast on', 'Head southwest on', 'Head northwest on', 
				 'Continue on', 'Continue', 
				 'Turn right at', 'Sharp right at', 'Slight right at', 
				 'Turn right', 'Sharp right', 'Slight right', 
				 'Turn left at', 'Sharp left at', 'Slight left at',
				 'Turn left', 'Sharp left', 'Slight left',
				 'At the roundabout, take the', 'exit',
				 '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', ' onto ',
				 'Make a U-turn'];
	var translated = instruction;
	for(var i=0;i<fraze_en.length;i++){
		translated = translated.replace(fraze_en[i], fraze[i]);
	}
	return translated;
  },
    
  loadScript: function(url, callback, context){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    if (callback) {
      script.onload = script.onreadystatechange = function(){
        if (script.readyState && script.readyState != "loaded" &&
        script.readyState != "complete") {
          return;
        }
        script.onload = script.onreadystatechange = null;
        callback.call(context);
      };
    }
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  
  getJson: function(url, callback, name, context, noCallback){
    if (noCallback) {
      this.loadScript(url, function(){
        callback.call(context, window[name]);
      });
    }
    else {
      window[name] = function(response){
        callback.call(context, response);
      };
      this.loadScript(url);
    }
  },
  
  transformLatLngToCM : function(lonlat){
    var lonlat1 = lonlat.clone().transform(directionsData.getOSMProjection(), directionsData.getCMProjection());
    return lonlat1;
  },
  
  transformLatLngToOSM : function(lonlat){
    var lonlat1 = lonlat.transform(directionsData.getCMProjection(), directionsData.getOSMProjection());
    return lonlat1;
  },
  
  convertUnits : function(units){
    
    var measurement, multiplier;

    switch (directionsData.getRoutingOption('units')) {
      case 'km':
        multiplier = 1000;
        measurement = ['m', 'km'];
      break;
      
      case 'miles':
        multiplier = 5280;
        measurement = ['ft', phrases[directionsData.getRoutingOption('language')].mile];
        units = units*3.24;
      break;
    }
    var total_distance;
	var points;
	
    if (units >= multiplier/10 && units < multiplier*100) {
      total_distance = /^.+\..{0,1}/.exec((parseInt(units)/multiplier).toString());
      points = ' ' + measurement[1];
    } else if (units < multiplier/10) {
      total_distance = Math.round(units);
      points = ' ' + measurement[0];
    } else {
      total_distance = Math.round(parseInt(units)/multiplier);
      points = ' ' + measurement[1];
    }
    
    return {'distance': total_distance, 'points': points};
    
  },
  
  convertTime : function(time){
    var total_duration;
	var points;
    if (time < 60) {
      total_duration = parseInt(time);
      points = ' s';
    } else if (time >= 60 && time < 3600) {
      total_duration = Math.round(parseInt(time)/60);
      points = ' m';
    } else {
      total_duration = Math.round(parseInt(time)/3600);
      points = ' h';
    }
    return {'duration': total_duration, 'points': points};
    
  },
  
  extend : function(dest, source) {
    for (var i in source) {
      if (source.hasOwnProperty(i)) {
        dest[i] = source[i];
      }
    }
    return dest;
  }
  
};

OSM.FieldsManager = function(target){
  
  this.coordinates_array = [];
  this.locations_array = [];
  this.target = document.getElementById(target);
  this.resetCoordFields();

};

OSM.FieldsManager.prototype = {
  
  resetCoordFields : function(){
    this.coord_fields = $(this.target).find('input.point_description');//children //$(this.target).siblings('input.point_description');
    for(var i=0; i<this.getCoordFieldsNum(); i++){
      this.setCoords(this.getCoordField(i).value, i);
    }
  },
  
  setDescr : function(value, i){
    this.locations_array[i] = value;
  },
  
  getDescr : function(i){
    return this.locations_array[i];
  },
  
  setCoords : function(value, i){
    if (value && value.match(/\d+(\.\d+)/g) && value.match(/\d+(\.\d+)/g).length == 2){
      this.coordinates_array[i] = value;
    }
  },
  
  getCoords : function(i){
    return this.coordinates_array[i];
  },
  
  removePoint : function(i){
    if(this.coordinates_array && this.locations_array[i]){
      this.coordinates_array.splice(i,1);
    }
    if(this.locations_array && this.locations_array[i]){
      this.locations_array.splice(i,1);
    }
  },
  
  showCoords : function(i){
    this.getCoordField(i).value = this.getCoords(i);
  },
  
  getCoordsNum : function(){
    return this.coordinates_array.length;
  },
  
  showDescr : function(i){
    this.getCoordField(i).value = this.getDescr(i);
  },
  
  getCoordField : function(i){
    return this.coord_fields[i];
  },

  getCoordFieldsNum : function(){
    return this.coord_fields.length;
  },
  
  clearFields : function(){
    
    for(var i=0; i<this.getCoordFieldsNum(); i++){
      this.getCoordField(i).value = '';
    }
    
  },
  
  addNewLocation : function(i){

    this.resetCoordFields();
    
    var li_el = document.createElement('li');
    
    var label = document.createElement('a');
      label.className = 'label';
      label.href='#';
      label.innerHTML = directionsData.getPointName(i);
      
    this.lonlat_field = document.createElement('input');
    this.lonlat_field.className = 'point_description';
    this.lonlat_field.type = 'text';
    
	$(this.lonlat_field).bind('keyup', getCoordinatesNew);

	var loader_div = document.createElement('div');
	loader_div.className = 'loader hidden';
	var loader_img = document.createElement('img');
	loader_img.src = '/images/directions/indicator2.gif';
	loader_div.appendChild(loader_img);
	
    var add_way = document.createElement('a');
      add_way.href = '#';
      add_way.className = 'set_point';
    
    var replace_points_link = document.createElement('a');
      replace_points_link.href = '#';
      replace_points_link.className = 'replace_points';
    
    var remove_point = document.createElement('a');
      remove_point.href = '#';
      remove_point.className = 'remove_point';

      li_el.appendChild(label);
      li_el.appendChild(this.lonlat_field);
	  li_el.appendChild(loader_div);
      li_el.appendChild(add_way);
      li_el.appendChild(replace_points_link);
      li_el.appendChild(remove_point);
    this.target.insertBefore(li_el, $('#add_destination')[0].parentNode);
    this.resetCoordFields();
    return li_el;
  },
  
  getSearchSelect : function(i){

    this.resetCoordFields();
    
	if (this.hasSearchSelect(i)) {
		return this.search_results_selects[i];
	}
	
    if(!this.search_results_selects){
      this.search_results_selects = [];
    }
    
    this.search_results_selects[i] = document.createElement('select');
    $(this.search_results_selects[i]).addClass('waypoint_search_results hidden');
    
    this.getCoordField(i).parentNode.insertBefore(this.search_results_selects[i], this.getCoordField(i));
    return this.search_results_selects[i];
    
  },
  
  hasSearchSelect : function(i){
    
    if(this.search_results_selects && this.search_results_selects[i]){
      return true;
    }
    
  },
  
  destroySearchSelect : function(i){
    if(this.search_results_selects[i]){
      this.search_results_selects[i].parentNode.removeChild(this.search_results_selects[i]);
      if(this.getDescr(i)){
        this.showDescr(i);
      } else if(this.getCoords(i)) {
        this.showCoords(i);
      }
      $(this.getCoordField(i)).removeClass('hidden');
	  this.search_results_selects[i] = undefined;
    }
  }
  
};

OSM.DirectionsManager = function(){
  
  var _obj = this;
  
  if(!this.fieldsManager){
    this.fieldsManager = new OSM.FieldsManager('inputs_list');
  }
  this.fieldsManager.resetCoordFields();
  this.fieldsManager.clearFields();
  if(!this.permalink_control){
    this.permalink_control = new OSM.permalinkControl('permalinkanchor');
  }
  this.permalink_control.init(this);
  
  parseUrl = function(){
    _obj.parseUrl();
  };
  var t=setTimeout("parseUrl()",2000);

  this.travel_mode = directionsData.getTravelMode('DRIVING');
  this.setListeners();
  this.activateFieldsControls();
  
};

OSM.DirectionsManager.prototype = {
  
  setListeners : function(){
    
    var _obj = this;
    
    $('#add_destination').bind('click', this.addRouteStep);
    
    $('#transport_switcher a').each(function() {

      var item = this;
      var switcherHandler = function(event){
        if($('#by_car').parent().hasClass('active')){
          _obj.saved_travel_preference = $('#preferences')[0].selectedIndex;
        }
        
        $('#transport_switcher a').each(function() {
          $(this).parent().removeClass('active');
        });
        
        $(item).parent().addClass('active');
        
        switch (item.id) {
        
          case 'by_car':
            $('#preferences')[0].disabled = '';
            if(_obj.saved_travel_preference){
              $('#preferences')[0].selectedIndex = _obj.saved_travel_preference;
            }
            _obj.travel_mode = directionsData.getTravelMode('DRIVING');
          break;
          
          case 'by_walking':
            $('#preferences')[0].selectedIndex = 0;
            $('#preferences')[0].disabled = 'disabled';
            _obj.travel_mode = directionsData.getTravelMode('WALKING');
          break;
          
          case 'by_cycling':
            $('#preferences')[0].selectedIndex = 0;
            $('#preferences')[0].disabled = 'disabled';
            _obj.travel_mode = directionsData.getTravelMode('CYCLING');
          break;
        }
        _obj.reloadFields();
        
      };
      
      $(this).bind('click', function(event){
          switcherHandler(event);
      });
      
      $(this).bind('keypress', function(event){
        var event1 = event || window.event;
        if (event1.keyCode == 13) {
          switcherHandler(event1);
        }
      });
      
    });
    
    $('#clear_route').bind('click', function(){
      
      $('#clear_route').addClass('unvisible');
      $('#start_text').removeClass('hidden');
      _obj.fieldsManager.clearFields();
      _obj._removePolyline();
      _obj.reloadFields();
      _obj.hideIndicator();
      _obj._resetSetter();
      
    });
    
    $('#preferences').bind('change', function(){
      
      _obj.travel_mode = directionsData.getTravelMode('DRIVING');
      if($('#preferences')[0].selectedIndex == 1){
        _obj.travel_mode = directionsData.getTravelMode('DRIVING') + '/shortest';
      }
      _obj.reloadFields();
      
    });
    
    $('#map').bind('contextmenu', function(e){
      if(e.target.id != 'permalinkanchor'){
        e.preventDefault();
        if(!_obj.context_menu){
          _obj.context_menu = new OSM.ContextMenu({
            'obj':_obj
          });
        }
        if(_obj.dragging_on != true){
          _obj.context_menu.show(e);
        } else {
          _obj.refreshMarkerCoordinates();
        }
      }
    });
    
    $('#close_routing').bind('click', function(){
      $('#directions').addClass('hidden');
      handleResize();
      //$('#tabnav').siblings('a').each(function(item){
      //  item.removeClass('active');
      //});
      //$('#tabnav').siblings('a')[0].addClass('active');
      //$('#sidebar').style.left = '0px';
    });
    
  },
  
  activateFieldsControls : function(){

    var _obj = this;
    var close_links = $('#inputs_list').find('a.remove_point'); //chldren
    var replace_links = $('#inputs_list').find('a.replace_points');//chldren
    var add_buttons = $('#inputs_list').find('a.set_point');//chldren
    
    (function(){
      for(var i=0; i<replace_links.length; i++){
      if(i==0){
          $(replace_links[i]).addClass('unvisible');
        } else {
          $(replace_links[i]).removeClass('unvisible');
        }
      }
    })();
    
    for(var i=0; i<add_buttons.length; i++){
      (function(){
        var index = i;
        
		
        var addWaypoint = function(){
          _obj.field = _obj.fieldsManager.getCoordField(index);
          $('#map_OpenLayers_ViewPort').css({'cursor' : 'crosshair'});
          $(add_buttons[index]).addClass('set_point_active');
		  
  		  var clearDescr = function(e) {
	 		var li = index;
			if (_obj.fieldsManager.hasSearchSelect(li)) {
		        _obj.fieldsManager.destroySearchSelect(li);
		        $(_obj.fieldsManager.getCoordField(li)).removeClass('hidden');
				deleteSearchResultsNew();
			}
			_obj.fieldsManager.setDescr("", li);
			_obj.getCoords(e);
			$('#map').unbind('click', clearDescr);
		  };
		  
          $('#map').bind('click', clearDescr);
        };
        
        add_buttons[index].onclick = function(){
          
          if(! $(add_buttons[index]).hasClass('set_point_active')){
		  	_obj._resetSetter();
            $(add_buttons[index]).addClass('set_point_active');
            addWaypoint();
          } else {
		  	_obj._resetSetter();
		  }
        };
		
      })();
    }
    for(var i=0; i<replace_links.length; i++){ //i already defined?
      (function(){
        var index = i;
        replace_links[index].onclick = function(){//CHECK
          replace_links.each(function(){
            $(this).addClass('unvisible');
          });
          var current_node = _obj.fieldsManager.getCoordField(index);
          var current_value = _obj.fieldsManager.getCoords(index);
		  var current_descr = _obj.fieldsManager.getDescr(index);
          var previous_node = _obj.fieldsManager.getCoordField(index-1);
          var previous_node_holder = previous_node.parentNode;
          var previous_value = _obj.fieldsManager.getCoords(index-1);
		  var previous_descr = _obj.fieldsManager.getDescr(index-1);
            current_node.parentNode.insertBefore(previous_node, current_node);//CHECK
            previous_node_holder.insertBefore(current_node, previous_node_holder.getElementsByTagName('a')[1]);
            _obj.fieldsManager.setCoords(current_value, index-1);
            _obj.fieldsManager.setDescr(current_descr, index-1);
            _obj.fieldsManager.setCoords(previous_value, index);
            _obj.fieldsManager.setDescr(previous_descr, index);
            _obj.reloadFields();
        };
      })();
    }
    
    for(var i=0; i<close_links.length; i++){
      (function(){
        var index = i;
        
        if(close_links.length > 2) {
          $(close_links[index]).removeClass('unvisible');
        } else {
          $(close_links[index]).addClass('unvisible');
        }
        
        close_links[index].onclick = function(){
          if(close_links.length > 2){
            _obj.destroyWaypoint(index);
            _obj.reloadFields();
          }
        };
        
      })();
    }

	this.reloadIndexes();
	
  },

  reloadIndexes : function(){
    var inputs_text = $('#inputs_list').find('input.point_description'); //children
  
  	for(var i=0; i<inputs_text.length; i++){
			$(inputs_text[i]).data('idx', i);
	}
  },
  
  parseFieldSearchResult : function(response, index){
    
    var _obj = this;
    
    _obj.fieldsManager.getCoordField(index).addClass('hidden');
    
    var select_field = _obj.fieldsManager.getSearchSelect(index);
      select_field.removeClass('hidden');
      
    var select_option = document.createElement('option');
      select_option.innerHTML = 'Select result';
      select_field.appendChild(select_option);
    
    for(var i=0; i<response.features.length; i++){
      var option = document.createElement('option');
      option.innerHTML = response.features[i].properties.name;
      select_field.appendChild(option);
    }
    
    $(select_field).bind('change', function(){
      if(select_field.selectedIndex > 0){
        var location_coords = response.features[select_field.selectedIndex-1].centroid.coordinates[0] + ' ' + response.features[select_field.selectedIndex-1].centroid.coordinates[1];
        var location_descr = response.features[select_field.selectedIndex - 1].properties.name;
        _obj.fieldsManager.setCoords(location_coords, index);
        _obj.fieldsManager.setDescr(location_descr, index);
        _obj.fieldsManager.showDescr(index);
        _obj.fieldsManager.destroySearchSelect(index);
        _obj.fieldsManager.getCoordField(index).removeClass('hidden');
        _obj.reloadFields();
      }
    });
    
  },

  getCoords : function(e){
    var event = e || window.event;
    var _obj = directionsManager;
    var position = map.events.getMousePosition(event);
    var lonlat = map.getLonLatFromViewPortPx(position);

    if(_obj.field){
      _obj.field.value = lonlat.lon+' '+lonlat.lat;
    }
    _obj._resetSetter();
    _obj.reloadFields();

  },
  
  destroyWaypoint : function(index){
    $(this.fieldsManager.getCoordField(index).parentNode).remove();
    this.fieldsManager.removePoint(index);
    $('#map').unbind('click', this.getCoords);
    
  },
  
  addRouteStep : function(e){
	var dm;
	if (e) {
		dm = directionsManager;
	} else {
		dm = this;
	}
    var fm = dm.fieldsManager;
    var inputs_number = fm.getCoordFieldsNum();
	var li_el;
    if(fm.getCoordField(0).value != '' && fm.getCoordField(1).value != ''){
      if(fm.getCoordField(inputs_number - 1).value != ''){
        li_el = fm.addNewLocation(inputs_number + 1);
      } else {
        li_el = fm.getCoordField(inputs_number - 1).parentNode;  
      }
    }
    
    dm.refreshIcons();
    dm.activateFieldsControls();
    return li_el;
    
  },
  
  refreshIcons : function(){
    
    var _obj = this;
    
    var labels_list = $('#inputs_list').find('a.label');//children //$('#inputs_list').adjacent('a.label');
    for(var i=0; i<labels_list.length; i++){
      labels_list[i].innerHTML = directionsData.getPointName(i);
      (function(){
        var index = i;
        labels_list[index].onclick = function(){
          if(_obj.lonlats[index]){
            map.setCenter(_obj.lonlats[index]);
          }
        };
      })();
    }
    
  },
  
  reloadFields : function(){
    
    this._resetSetter();
    this.destroyPopups();
    this.filled_fields = [];
    this.fields_to_remove = [];
    this.validation_key = '';
    this.response_key = '';
    this.total_distance = 0;
    this.total_duration = 0;
    this._removePolyline();
    this.fieldsManager.resetCoordFields();
    
    for(var i=0; i<this.fieldsManager.getCoordFieldsNum(); i++){
      var field = this.fieldsManager.getCoordField(i);

      if(this.fieldsManager.getCoords(i)){
        var coords = this.fieldsManager.getCoords(i);
      }
      
      if ((field.value.match(/\d+(\.\d+)?/g) && field.value.match(/\d+(\.\d+)?/g).length == 2) || (coords && coords.match(/\d+(\.\d+)?/g) && coords.match(/\d+(\.\d+)?/g).length == 2 && field.value != '')) {
        this.filled_fields.push({'field':field, 'index':i});
      } else {
        this.fields_to_remove.push({'field':field, 'index':i});
      }
    }
    var filled_index;
    if(this.filled_fields.length >= 2){
      filled_index = 0;
    } else if (this.filled_fields.length == 0){
      filled_index = 2;
    } else {
      filled_index = this.filled_fields.length;
    }
    
    for(var i=filled_index; i<this.fields_to_remove.length; i++){
      this.destroyWaypoint(this.fields_to_remove[i].index);
    }
    
    this.field_from = this.fieldsManager.getCoordField(0);
    this.getRoutes();
    this.activateFieldsControls();
    this.refreshIcons();
	if (locMarker) {
		this.markers_layer.addFeatures([locMarker]);
	}
    
  },
  
  getRoutes : function(){

    this.removeMarkers();
    this.lonlats = [];
    this._requests = []; 
    
    for(var i=0; i<this.filled_fields.length; i++){
      var field = this.filled_fields[i].field;
      if(this.fieldsManager.getCoords(i)){
        var coords = this.fieldsManager.getCoords(i);
      }
	  var lat;
	  var lon;
      if (field.value.match(/\d+(\.\d+)/g) && field.value.match(/\d+(\.\d+)/g).length == 2) {
        lat = parseFloat(/^.+ /.exec(field.value).toString().replace(/\s/, ''));
        lon = parseFloat(/ .+$/.exec(field.value).toString().replace(/\s/, ''));
      } else if(coords && coords.match(/\d+(\.\d+)?/g) && coords.match(/\d+(\.\d+)?/g).length == 2 && field.value != ''){
        lat = parseFloat(/^.+ /.exec(coords).toString().replace(/\s/, ''));
        lon = parseFloat(/ .+$/.exec(coords).toString().replace(/\s/, ''));
      }
      var lonlat = new OpenLayers.LonLat(lat, lon);
      this.lonlats.push(lonlat);
    }
    
    directionsData.getPanel().innerHTML = '';
    
    this.permalink_control.update();
    
    if(this.lonlats.length > 1){
      var travel_mode = this.travel_mode;
      this.showIndicator();
      this.responses = [];
      for (i=0; i<(this.lonlats.length-1); i++) {
        this._requests.push(this.lonlats[i].lon.toString()+this.lonlats[i].lat.toString()+this.lonlats[i+1].lon.toString()+this.lonlats[i+1].lat.toString()+travel_mode.toString());
      }
      for (i=0; i<(this.lonlats.length-1); i++) {
        end_point = (i == (this.lonlats.length-2) ? true : false);
        this._sendRequest(this.lonlats[i], this.lonlats[i+1], i, end_point, travel_mode);
      }
    }
    
    if(this.lonlats.length > 0){
      $('#start_text').addClass('hidden');
      $('#clear_route').removeClass('unvisible');
    }

    this.addMarkers();

  },
  
  addMarkers : function(){
    var _obj = this;
    
    this.markers = [];
    if(!this.markers_layer){
	  //console("create markers layer");
      this.markers_layer = new OpenLayers.Layer.Vector('Markers');
	  map.addLayer(this.markers_layer);
    }
    /*this.drag_feature = new OpenLayers.Control.DragFeature(this.markers_layer, {
      'onComplete': function(){
        _obj.refreshMarkerCoordinates();
        _obj.dragging_on = false;
      },
      'onStart' : function(){
        _obj.dragging_on = true;
      }
    });
    map.addControl(this.drag_feature);
    
    this.drag_feature.activate();*/
    for(var i=0; i<this.lonlats.length; i++){
	  var marker;
      if(this.fieldsManager.getCoordField(0).value == '' && this.fieldsManager.getCoordFieldsNum() == 2){
        marker = this.getMarker(this.lonlats[i], i+1);
      } else {
        marker = this.getMarker(this.lonlats[i], i);
      }
      this.markers.push(marker);
      this.markers_layer.addFeatures([marker]);
      //marker.layer.div.style.zIndex = '999';
    }
  },
  
  removeMarkers : function(){
    if(this.markers_layer){
      this.markers_layer.destroyFeatures();
    }
  },
  
  getMarker : function(lonlat, i){
    var marker_style = {
            pointRadius: 17,
      externalGraphic: '/images/directions/markers/'+(i+1)+'.png',
      graphicXOffset: -17,
            graphicYOffset: -35
        };
    var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
        var point_feature = new OpenLayers.Feature.Vector(point, null, marker_style);
    return point_feature;
  },
  
  addWaypoint : function(lonlat, _obj){
    if (_obj.markers.length < 24) {
      var step = _obj.addRouteStep();
      _obj.fieldsManager.getCoordField(_obj.fieldsManager.getCoordFieldsNum() - 1).value = lonlat.lon+' '+lonlat.lat;
      _obj.reloadFields();
    }
  },
  
  addStartPoint : function(lonlat, _obj){
    _obj.field_from = _obj.fieldsManager.getCoordField(0);
    $(_obj.field_from).removeClass('hidden');
    _obj.field_from.value = lonlat.lon+' '+lonlat.lat;
    _obj.reloadFields();
  },
  
  addEndPoint : function(lonlat, _obj){
    _obj.field_to = _obj.fieldsManager.getCoordField(_obj.fieldsManager.getCoordFieldsNum() - 1);
    $(_obj.field_to).removeClass('hidden');
    _obj.field_to.value = lonlat.lon+' '+lonlat.lat;
    _obj.reloadFields();
  },
  
  refreshMarkerCoordinates : function(){
    for(var i=0; i<this.markers.length; i++){
	  this.fieldsManager.getCoordField(i).value = this.markers[i].geometry.x + ' ' + this.markers[i].geometry.y, i;//Missing semicolon.?
    }

    this.reloadFields();
  },
  
  showIndicator : function(){
    $('#loadingIndicator').removeClass('hidden');
  },
  
  hideIndicator : function(){
    $('#loadingIndicator').addClass('hidden');
  },
  
  destroyPopups : function(){
    for(var j=0; j<map.popups.length; j++){
      if(map.popups[j]){
        map.removePopup(map.popups[j]);
      };
    };
  },
  
  _resetSetter : function(){
    $('#map_OpenLayers_ViewPort').css({'cursor' : 'default'});
    $('#inputs_list').find('a.set_point').each(function(){
      $(this).removeClass('set_point_active');
    });
    $('#map').unbind('click', this.getCoords);
  },
  
  _sendRequest : function(a, b, i, end_point, travel_mode){
    var i = i;
    var a_osm = a;
    var b_osm = b;
    if(!this.cache){
      this.cache = {};
    };
    var a = Utils.transformLatLngToCM(a);
    var b = Utils.transformLatLngToCM(b);
    var requestId = this._generateId();
    var url = directionsData.getHost() + '/' + directionsData.getKey() + '/api/0.3/' + a.lat + ',' + a.lon + ',' + b.lat + ',' + b.lon + '/';
    url += this.travel_mode + '.js?callback=getRoute' + requestId;
    //url += this.travel_mode + '.js?lang=ro&callback=getRoute' + requestId;
    var cacheKey = a_osm.lon.toString()+a_osm.lat.toString()+b_osm.lon.toString()+b_osm.lat.toString() + travel_mode.toString();
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = 'requesting';
      Utils.getJson(url, function(response){
      this.cache[cacheKey] = response;
      this._checkIfReadyToRender();
      }, 'getRoute' + requestId, this);
    } else if (this.cache[cacheKey] != 'requesting') {
      this._checkIfReadyToRender();
    }
  },
  
  
  
  _checkIfReadyToRender: function() {
    var ready = true, res;
    
    for (i=0; i<(this.lonlats.length-1); i++) {
      res = this.cache[this._requests[i]];
      if (!res || res == 'requesting') {
        ready = false;
        break;
      };
    };

    if (ready && this._requests.length) {
      for (i = 0; i < this._requests.length; i++) {
        if(i == (this._requests.length - 1)){
          this._responseHandler(this.cache[this._requests[i]], i, true);
        } else {
          this._responseHandler(this.cache[this._requests[i]], i);
        };
      };
      this._requests = [];
      this.hideIndicator();
    };
  },
  
  
  
  _responseHandler : function(response, i, end_point) {
    if (response.status) {
      if(!this.error_messages){
        this.error_messages = [];
      };
      this.error_messages.push(directionsData.getNoResponseText());
      if(directionsData.getPanel()){
        this._displayError(response);
      };
    } else {
      this._addPolyline(response);
      if(directionsData.getPanel()) {
        this._displayRoute(response, i, end_point);
      };
    };
    
  },
  
  _addPolyline : function(response){
    var points = [];
    
    if(!this.polyline){
      this.polylines = [];
    };
    
    for(var i=0; i<response.route_geometry.length; i++){
      var lonlat = Utils.transformLatLngToOSM(new OpenLayers.LonLat(response.route_geometry[i][1],response.route_geometry[i][0]));
      var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
      points.push(point);
    };
    if(!this.vectors_layer){
      this.vectors_layer = new OpenLayers.Layer.Vector('Vectors');
	  map.addLayer(this.vectors_layer);
    };
    this.polyline = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(points), null, directionsData.getPolylineStyle());
    this.polylines.push(this.polyline);
    this.vectors_layer.addFeatures(this.polyline);
    
  },
  
  _removePolyline : function(){
    
    if(this.polylines){
      for(var i=0; i<this.polylines.length; i++){
        this.polylines[i].destroy();
      };
    };
    
  },
  

  _displayRoute : function(response, i, end_point){
    
    var _obj = this;
    
    var phrases = {
      'en' : {
        'total_length':'Total length',
        'total_duration':'Time',
        'route':'Route',
        'mile':'mile',
        'point':'Point',
        'total_route_distance':'Total route distance',
        'total_route_duration':'Total route time'
      },
      'de' : {
        'total_length':'Gesamtlange',
        'total_duration':'Zeit',
        'route':'Weg',
        'mile':'meile',
        'point':'Punkt',
        'total_route_distance':'Gesamtweg-Entfernung',
        'total_route_duration':'Gesamtweg-Zeit'
      },
      'ro' : {
        'total_length':'Lungimea totală',
        'total_duration':'Durata',
        'route':'Ruta',
        'mile':'mila',
        'point':'Punct',
        'total_route_distance':'Lungimea totală a rutei',
        'total_route_duration':'Durata totală a rutei'
      }
    };
    
    var routes_output_node = document.createElement('div');
      routes_output_node.className = 'osm-routes-output';

    if (document.getElementById('totalRoutesLength')) {
      var total_length = document.getElementById('totalRoutesLength');
      var total_length_value = total_length.getElementsByTagName('span')[0];
    } else {
      var total_length = document.createElement('div');
      total_length.id = 'totalRoutesLength';
      total_length.className = 'osm-total-length';
      
      //var total_length_text = document.createTextNode(phrases[directionsData.getRoutingOption('language')].total_length + ': ');
	  var total_length_text = document.createTextNode(phrases['ro'].total_length + ': ');
      var total_length_value = document.createElement('span');
      total_length_value.innerHTML = '0';
      total_length.appendChild(total_length_text);
      total_length.appendChild(total_length_value);
      routes_output_node.appendChild(total_length);
    };
    
    if (document.getElementById('totalRoutesDuration')) {
      var total_duration = document.getElementById('totalRoutesDuration');
      var total_duration_value = total_duration.getElementsByTagName('span')[0];
    } else {
      var total_duration = document.createElement('div');
      total_duration.id = 'totalRoutesDuration';
      total_duration.className = 'osm-total-duration';
      
      //var total_duration_text = document.createTextNode(phrases[directionsData.getRoutingOption('language')].total_duration + ': ');
	  var total_duration_text = document.createTextNode(phrases['ro'].total_duration + ': ');
      var total_duration_value = document.createElement('span');
      total_duration_value.innerHTML = '0';
      total_duration.appendChild(total_duration_text);
      total_duration.appendChild(total_duration_value);
      routes_output_node.appendChild(total_duration);
    };
    
    var route_waypoints_list = document.createElement('dl');
      route_waypoints_list.className = 'osm-waypoints-list';
    
    var route_title = document.createElement('dt');
    
    var route_number_icon = document.createElement('a');
      route_number_icon.href = "#";
      route_number_icon.className = 'osm-label-large';
      route_number_icon.innerHTML = directionsData.getPointName(i);

	var ddd = this.fieldsManager.getDescr(i);
	if (ddd=="") {
		this.fieldsManager.setDescr(response.route_summary.start_point, i);
	}
	else 
		if (ddd != response.route_summary.start_point) {
			response.route_summary.start_point = ddd;
		}
	  
    var route_description = document.createTextNode(response.route_summary.start_point);
    
      route_title.appendChild(route_number_icon);
      route_title.appendChild(route_description);
    
      route_waypoints_list.appendChild(route_title);
      
    for (var j=0; j<response.route_instructions.length; j++){
      (function(){
        var index = j;
        var waypoint = document.createElement('dd');
        var waypoint_link = document.createElement('a');
        waypoint_link.href = '#';
        
        var waypoint_distance = Utils.convertUnits(response.route_instructions[index][1]);
        waypoint_link.innerHTML = Utils.translate(response.route_instructions[index][0]) + ' <span>' + waypoint_distance.distance + '</span> ' + waypoint_distance.points;
        waypoint.appendChild(waypoint_link);
        route_waypoints_list.appendChild(waypoint);
        $(waypoint_link).bind('click', function(){
          var popup = new OpenLayers.Popup.FramedCloud("Popup", 
            Utils.transformLatLngToOSM(new OpenLayers.LonLat(response.route_geometry[response.route_instructions[index][2]][1], response.route_geometry[response.route_instructions[index][2]][0])),
            null,
            Utils.translate(response.route_instructions[index][0]) + ' <span>' + waypoint_distance.distance + '</span> ' + waypoint_distance.points,
            null,
            true);
            _obj.destroyPopups();
            map.addPopup(popup);
            popup.div.style.zIndex = '999999999';
        });
        
      })();
    };
    
    var total_route_length = document.createElement('div');
    total_route_length.className = 'osm-route-length';
    
    var total_route_duration = document.createElement('div');
    total_route_duration.className = 'osm-route-duration';
    
    //var total_route_length_text = document.createTextNode(phrases[directionsData.getRoutingOption('language')].total_route_distance+': ');
	var total_route_length_text = document.createTextNode(phrases['ro'].total_route_distance+': ');
    var total_route_length_value_node = document.createElement('span');
    
    //var total_route_duration_text = document.createTextNode(phrases[directionsData.getRoutingOption('language')].total_route_duration+': ');
	var total_route_duration_text = document.createTextNode(phrases['ro'].total_route_duration+': ');
    var total_route_duration_value_node = document.createElement('span');
    
    var converted_total_route_distance = Utils.convertUnits(response.route_summary.total_distance);
    var converted_total_route_duration = Utils.convertTime(response.route_summary.total_time);

    var total_route_length_value = document.createTextNode(converted_total_route_distance.distance + ' ' + converted_total_route_distance.points); 
    var total_route_duration_value = document.createTextNode(converted_total_route_duration.duration + ' ' + converted_total_route_duration.points); 
    
    total_route_length_value_node.appendChild(total_route_length_value);
    total_route_length.appendChild(total_route_length_text);
    
    total_route_duration_value_node.appendChild(total_route_duration_value);
    total_route_duration.appendChild(total_route_duration_text);
    
    total_route_length.appendChild(total_route_length_value_node);
    total_route_duration.appendChild(total_route_duration_value_node);

    this.total_distance += response.route_summary.total_distance;
    this.total_duration += response.route_summary.total_time;
    
    var converted_total_distance = Utils.convertUnits(this.total_distance);
    var converted_total_duration = Utils.convertTime(this.total_duration);

    total_length_value.innerHTML = converted_total_distance.distance + ' ' + converted_total_distance.points;
    total_duration_value.innerHTML = converted_total_duration.duration + ' ' + converted_total_duration.points;
    
    //this.fieldsManager.setDescr(response.route_summary.start_point, i);
    
    if(end_point == true){
      var route_end = document.createElement('dt');
    
      var route_number_icon_end = document.createElement('a');
        route_number_icon_end.href = "#";
        route_number_icon_end.className = 'osm-label-large';
        route_number_icon_end.innerHTML = directionsData.getPointName(i+1);
      
	  var ddd = this.fieldsManager.getDescr(i+1);
	  if (ddd=="") {
		this.fieldsManager.setDescr(response.route_summary.end_point, i+1);
	  }
	  else 
		if (ddd != response.route_summary.end_point) {
			response.route_summary.end_point = ddd;
		}
      var route_description_end = document.createTextNode(response.route_summary.end_point);
      
      route_end.appendChild(route_number_icon_end);
      route_end.appendChild(route_description_end);
      route_waypoints_list.appendChild(route_end);
      
      //this.fieldsManager.setDescr(response.route_summary.end_point, i+1);
    };

    routes_output_node.appendChild(route_waypoints_list);

    directionsData.getPanel().appendChild(routes_output_node);
    directionsData.getPanel().appendChild(total_route_length);
    directionsData.getPanel().appendChild(total_route_duration);
    
    if(end_point == true){
      for(var i=0; i<this.fieldsManager.getCoordsNum(); i++){
        this.fieldsManager.showDescr(i);
      };
    };
  },
  
  _displayError: function(response) {
    
    var error_message = document.createElement('div');
    error_message.className = 'osm-error-message';
    error_message.innerHTML = response.status_message;
    directionsData.getPanel().insertBefore(error_message, directionsData.getPanel().firstChild);

  },
  
  _generateId: function() {
    this._lastId = (this._lastId || 0) + 1;
    return this._lastId;
  },
  
  parseUrl: function(){
    var params = {};
    var url = window.location.href.replace(/^.+\?/, '').replace('#', '');
    var elements_array = url.split('&');
    var allow_directions_request = false;
    
    for (var i = 0; i < elements_array.length; i++) {
      var couple = elements_array[i].split('=');
      params[couple[0]] = couple[1];
    };
    for (var i in params) {
      if (i == 'waypoints') {
        allow_directions_request = true;
      };
    };
    
    if (allow_directions_request == true) {
      var points_array = [];
      this.permalink_params = params;
      var waypoints = unescape(this.permalink_params.waypoints);
      var waypoints_array = waypoints.split(',');
      for (var i = 0; i < waypoints_array.length; i++) {
        if (i % 2) {
          points_array.push([waypoints_array[i - 1], waypoints_array[i]]);
        }
      };
      $('#transport_switcher a').each(function(){
        $(this).parent().removeClass('active');
      });
      
      switch (params.travel_mode) {
      
        case 'car':
          $('#by_car').parent().addClass('active');
          $('#preferences')[0].selectedIndex = 0;
          $('#preferences')[0].disabled = '';
          this.travel_mode = directionsData.getTravelMode('DRIVING');
          break;
          
        case 'car/shortest':
          $('#by_car').parent().addClass('active');
          $('#preferences')[0].selectedIndex = 1;
          $('#preferences')[0].disabled = '';
          this.travel_mode = directionsData.getTravelMode('DRIVING') + '/shortest';
          break;
          
        case 'foot':
          $('#by_walking').parent().addClass('active');
          $('#preferences')[0].selectedIndex = 0;
          $('#preferences')[0].disabled = 'disabled';
          this.travel_mode = directionsData.getTravelMode('WALKING');
          break;
          
        case 'bicycle':
          $('#by_cycling').parent().addClass('active');
          $('#preferences')[0].selectedIndex = 0;
          $('#preferences')[0].disabled = 'disabled';
          this.travel_mode = directionsData.getTravelMode('CYCLING');
          break;
          
      };
      
      for (var i = 0; i < points_array.length; i++) {
        var point = Utils.transformLatLngToOSM(new OpenLayers.LonLat(points_array[i][0], points_array[i][1]));
        if (i == 0) {
          this.addStartPoint(point, this);    
        } else if (i == 1) {
          this.addEndPoint(point, this);
        } else {
          this.addWaypoint(point, this);
        };
      };

    };
    
  }
  
};

OSM.ContextMenu = function(params){
  
  this.params = params;
  this.menu_structure = {
    'links':[
      {'link':'#', 'params':{'id':'osm-menulink-from', 'className':''}, 'text':'Punct de plecare', 'action':this.params.obj.addStartPoint},
      {'link':'#', 'params':{'id':'osm-menulink-to', 'className':''}, 'text':'Punct de sosire', 'action':this.params.obj.addEndPoint},
      {'link':'#', 'params':{'id':'osm-menulink-addpoint', 'className':'hidden'}, 'text':'Adaugă destinație', 'action':this.params.obj.addWaypoint},
      {'link':'#', 'params':{'id':'osm-menulink-addmarker', 'className':''}, 'text':'Marchează locația', 'action':addLocMarker},
      {'link':'#', 'params':{'id':'osm-menulink-removemarker', 'className':'hidden'}, 'text':'Șterge marcaj', 'action':removeLocMarker}
    ]
  }
  this.createMarkup();
  
};

OSM.ContextMenu.prototype = {
  
  createMarkup : function(){
    
    var _obj = this;
    
    this.context_menu_bg = document.createElement('div');
    this.context_menu_bg.id = 'osm-context-menu';
    this.context_menu = document.createElement('ul');
    this.context_menu_bg.appendChild(this.context_menu);
    
    for (var i=0; i<this.menu_structure.links.length; i++){
      (function(){
        
        var index = i;
        var li_el = document.createElement('li');
        var link = document.createElement('a');
        
        link.href = _obj.menu_structure.links[index].link;
        link.innerHTML = _obj.menu_structure.links[index].text;
        
        $(link).bind('mousemove', function(){
          $(this).addClass('hover');//CHECK $link instead of $this?
        });
        
        $(link).bind('mouseout', function(){
          $(this).removeClass('hover');//CHECK $link instead of $this?
        });
        
        $(link).bind('click', function(){
          _obj.menu_structure.links[index].action(_obj.lonlat, _obj.params.obj);
          _obj.hide();
        });
        
        li_el.appendChild(link);
        
        for(var j in _obj.menu_structure.links[index].params){
          link.parentNode[j] = _obj.menu_structure.links[index].params[j];
        };
        
        _obj.context_menu.appendChild(li_el);
      })();
    }

    document.getElementById('map').appendChild(this.context_menu_bg);
    
  },
  
  show : function(e){
    var event = e || window.event;
    var destination_from = directionsManager.fieldsManager.getCoordField(0);
    var destination_to = directionsManager.fieldsManager.getCoordField(directionsManager.fieldsManager.getCoordFieldsNum()-1);

    var position = map.events.getMousePosition(event);
    this.lonlat = map.getLonLatFromViewPortPx(position);

    $(this.context_menu_bg).css({'left':position.x+'px', 'top':position.y+'px'})
    $(this.context_menu_bg).removeClass('hidden');
    
    this.hide.bind(this);
    $('#map').bind('click', this.hide);

    if(destination_from.value == ''){
      $('#osm-menulink-from').removeClass('hidden');
      $('#osm-menulink-addpoint').addClass('hidden');
    };
    
    if(destination_to.value == '') {
      $('#osm-menulink-to').removeClass('hidden');
      $('#osm-menulink-addpoint').addClass('hidden');
    };
    
    if(destination_from.value != '' && destination_to.value != ''){
      $('#osm-menulink-from').addClass('hidden');
      $('#osm-menulink-to').addClass('hidden');
      $('#osm-menulink-addpoint').removeClass('hidden');
    };
	if (locMarker) {
		$('#osm-menulink-removemarker').removeClass('hidden');
	}
	else {
		$('#osm-menulink-removemarker').addClass('hidden');
	}
  },
  
  hide : function(){
    
    $(map).unbind('click', this.hide);
    this.lonlat = null;
    $('#osm-context-menu').addClass('hidden');
    
  }
  
};

OSM.permalinkControl = function(target){
  
  this.target = document.getElementById(target);//$(target);
};

OSM.permalinkControl.prototype = {
  
  init : function(_obj){
    this._obj = _obj;
  },
  
  update : function(){
    this._getPermalinkParams();
    this._getRoutingParams();
  },
  
  _getPermalinkParams : function(){
    this.params = {};
    var url_base = /^.+\?/.exec(this.target.href)[0]
    this._url_base = url_base.replace(/\?$/, '').replace('#', '');
    this.params_string = /\?.+$/.exec(this.target.href)[0].replace(/^\?/, '');
    var params_number = this.params_string.split('&').length;
    for(var i=0; i<params_number; i++){
      if(!this.params[this.params_string.split('&')[i].split('=')[0]]){
        this.params[this.params_string.split('&')[i].split('=')[0]] = this.params_string.split('&')[i].split('=')[1];
      }
    };
  },
  
  _getRoutingParams : function(){

    if(this._obj.travel_mode){
      this.travel_mode = this._obj.travel_mode;
    };
    
    if(this._obj.lonlats){
      this.lonlats = this._obj.lonlats;
    };
    
    this._setParams();
    
  },
  
  _setParams : function(){
    
    var lonlats = [];
	if (this.lonlats) {
		for(var i=0; i<this.lonlats.length; i++){
			var lonlats_osm = Utils.transformLatLngToCM(this.lonlats[i]);
			lonlats.push((Math.round(lonlats_osm.lon*100000)/100000).toString() +','+(Math.round(lonlats_osm.lat*100000)/100000).toString());
		}
	}
	if (lonlats.length>0) {
		this.params.waypoints = lonlats.join(',');
		this.params.travel_mode = this.travel_mode;
	}
	else {
		delete this.params.waypoints;
		delete this.params.travel_mode;
	}
	if (locMarker) {
		var ll = Utils.transformLatLngToCM(new OpenLayers.LonLat(Math.round(locMarker.geometry.x*100000)/100000, Math.round(locMarker.geometry.y*100000)/100000));
		this.params.mlat = ll.lat;
		this.params.mlon = ll.lon;
	}
	else {
		delete this.params.mlat;
		delete this.params.mlon;
	}
    this.showParams();
    
  },
  
  showParams : function(){

    var tale = '?';
    for(var i in this.params){
      tale += (i+'='+this.params[i]) + '&';
    };
    tale = tale.replace(/\&$/, '');
    this.target.href = this._url_base + tale;
    
  }
  
}
