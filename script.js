
/*
 *  LEAFLET JS PART
 */


let mymap;

var icon_red = L.icon({
    iconUrl: 'icons/marker-icon-2x-red.png',
    shadowUrl: 'icons/marker-shadow.png',

	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var icon_blue = L.icon({
    iconUrl: 'icons/marker-icon-2x-blue.png',
    shadowUrl: 'icons/marker-shadow.png',

	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var icon_green = L.icon({
    iconUrl: 'icons/marker-icon-2x-green.png',
    shadowUrl: 'icons/marker-shadow.png',

	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var icon_orange = L.icon({
    iconUrl: 'icons/marker-icon-2x-orange.png',
    shadowUrl: 'icons/marker-shadow.png',

	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});


$(document).ready(function() {


    mymap = L.map('mapid').setView(L.latLng(46.521902, 6.629844), 15);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/light-v9',
		tileSize: 512,
		zoomOffset: -1
	}).addTo(mymap);

	read_json();

	write_index();

	$("#filter_debut").change( function(){
		write_index();
		console.log($("#filter_debut").val());
	});

	$("#filter_fin").change( function(){
		write_index();
	});

	$("#filter_date").change(function(){
		write_index();
		console.log($("#filter_date").val());
	});

	$("#filter_theme").change( function(){
		write_index();
	});

	$("#filter_theme_val").change( function(){
		write_index();
	});

	$("#filter_epoch").change( function(){
		write_index();
	});

	$("#filter_epoch_val").change( function(){
		write_index();
	});





});




/*
 *  JSON DECIPHERER
 */

let database = [];
let max_videos = 100;
let point_stack = [];
let trace_stack = [];
let overlay_stack = [];



function read_json() {

	console.log(database)
	for (i = 0; i < max_videos; i++) {
		let meta_data_tmp = meta_data.filter(function(item) {
			index = parseInt(item["numero"]);
			if(index == i) {
				return item;
			}
		});
		let main_tmp = main.filter(function(item) {
			index = parseInt(item["numero"]);
			if(index == i) {
				return item;
			}
		});
		let traces_tmp = traces["features"].filter(function(item) {
			index = item["properties"]["number"];
			if(index == i) {
				return item;
			}
		});
		let points_tmp = points["features"].filter(function(item) {
			index = item["properties"]["number"];
			if(index == i) {
				return item;
			}
		});
		if(main_tmp.length > 0) {
			main_tmp = main_tmp[0];
		}
		date = [];
		if(meta_data_tmp.length > 0) {
			meta_data_tmp = meta_data_tmp[0];
			date_str = meta_data_tmp["date"].split('/');
			//console.log(date_str)
			date = new Date(parseInt(date_str[2]), parseInt(date_str[1])-1, parseInt(date_str[0]));

			console.log("meta_data date", date_str, date, i);
		}
		if(points_tmp.length > 0) {

			date_str = points_tmp[0]["properties"]["date"].split('/');
			date = new Date(parseInt(date_str[0]), parseInt(date_str[1])-1, parseInt(date_str[2]));
			console.log("points date", date_str, date, i);

		}

		database.push({
			"main" : main_tmp,
			"meta_data" : meta_data_tmp,
			"traces" : traces_tmp,
			"points" : points_tmp,
			"date"	 : date
			});
	  
	} 
}


function write_index_element(item, index) {
	properties = item["points"][0]["properties"];
	title = properties["name"];
	id = index;
	year = properties["date"];
	$("#index_table").append(`<tr onclick='open_video(${index})' class="video_item"><td>${id}</td><td>${title}<br>${year}</td></tr>`)

	
	point_tmp = L.geoJSON(item["points"], {
		pointToLayer: function(feature, latlng) {
			if(properties["thème"] == "Loisirs") {
				return L.marker(latlng, {icon : icon_green});
			}
			if(properties["thème"] == "Expression populaire") {
				return L.marker(latlng, {icon : icon_orange});
			}
			if(properties["thème"] == "Expression officielle") {
				return L.marker(latlng, {icon : icon_orange});
			}
			if(properties["thème"] == "Parade") {
				return L.marker(latlng, {icon : icon_red});
			}
		},
		onEachFeature: function(feature, layer) {
			layer.on("click", function() {
                open_video(index);
            });
		}
	});

	mymap.addLayer(point_tmp);
	point_stack.push(point_tmp);


	//$("#index_table").append(`<div onclick="open_video(${index})" class="video_item horz_container"><div class="video_id">${id}</div><div class="video_name">${title}</div><div class="video_year">${year}</div></div>`);
}


function write_index() {
	$("#index_table").html('');
	point_stack.forEach( function(item) {
		mymap.removeLayer(item)
	});
	point_stack = [];
	database.forEach(function(item, index) {
		if(item["points"].length > 0) {
			properties = item["points"][0]["properties"];
			//DATE
			var date_f = false;
			
			if($("#filter_date").is(':checked')) {
				var date_1 = false;
				var date_2 = false;
				console.log(item["date"])
				if(item["date"] >= new Date($("#filter_debut").val())) {
					date_1 = true;
				}
				if(item["date"] <= new Date($("#filter_fin").val())) {
					date_2 = true;
				}
				date_f = date_1 && date_2;
			} else {
				date_f = true;
			}



			//THEME
			var theme_f = false

			if($("#filter_theme").is(":checked")) {
				if(properties["thème"] == $("#filter_theme_val").val()) {
					theme_f = true;
				}
			}else{
				theme_f = true;
			}

			//EPOCH
			var epoch_f = false

			if($("#filter_epoch").is(":checked")) {
				if(properties["époque"] == $("#filter_epoch_val").val()) {
					epoch_f = true;
				}
			}else{
				epoch_f = true;
			}



			var final = date_f && theme_f && epoch_f;


			if(final) {
				write_index_element(item, index);
			}


		}
	});
}







/*
 *  INDEXED FUNCTIONS
 */


function load_player(index) {
	video = database[index];
 	link = video["main"]["video"];
 	console.log("opening video...", link);
 	$("#video").html(`<video preload='auto' controls autoplay loop class='inner_video' src='${link}'></video>`);
}


function load_articles(index) {
	video = database[index];
	articles = video["main"]["articles"];

	$("#map_desc").html('');


	articles.forEach(function(item) {
		$("#map_desc").append(`<div class="article_title">${item["name"]}</div>`);
		$("#map_desc").append(`<div class="article_text">${item["text"]}</div>`);
		$("#map_desc").append(`<div class="article_citation"><a href="${item['link']}">[${item["auteur"]}, ${item["name"]}, ${item["journal"]}, ${item["date"]}, page ${item["page"]}</a></div><hr>`);

	});




}

function load_metadata(index) {
	video = database[index];
	meta_data = video["meta_data"];
	properties = video["points"][0]["properties"];
	$("#video_desc").html("");
	$("#video_desc").html('<table style="width:100%">');
	$("#video_desc").append(`<tr class="video_desc_item"><td>Nom</td><td>${properties["name"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Epoque</td><td>${properties["époque"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Thème</td><td>${properties["thème"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Lieu</td><td>${properties["place"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Date</td><td>${properties["date"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Auteur</td><td>${meta_data["author"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Evènement</td><td>${meta_data["event"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Personnalités</td><td>${meta_data["persons"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Données techniques</td><td>${meta_data["data"]}</td></tr>`);
	$("#video_desc").append(`<tr class="video_desc_item"><td>Description</td><td>${meta_data["desc"]}</td></tr>`);
	$("#video_desc").append('</table>');
}

function load_trace(index) {
	item = database[index];
	trace = database[index]["traces"];
	trace_stack.forEach( function(item) {
		mymap.removeLayer(item)
	});
	overlay_stack.forEach( function(item) {
		mymap.removeLayer(item)
	});
	trace_stack = [];
	trace_tmp = L.geoJSON(trace)
	mymap.addLayer(trace_tmp);
	trace_stack.push(trace_tmp);

	point_tmp = L.geoJSON(item["points"], {
		pointToLayer: function(feature, latlng) {
			return L.marker(latlng, {icon : icon_blue});
		}
	});

	mymap.addLayer(point_tmp);
	overlay_stack.push(point_tmp);

}

function load_view(index) {
	coordinates = video["points"][0]["geometry"]["coordinates"];
	console.log(coordinates)
	mymap.panTo(new L.LatLng(coordinates[1], coordinates[0]));
}


 function open_video(index) {
 	load_player(index);
 	load_metadata(index);
 	load_trace(index);
 	load_view(index);
 	load_articles(index);
 }







/*
 *   FILTER
 */



function open_filter(){
	$("#filter_pane").toggle();
}



function open_page() {
	$("#acceuil").css("height", "100vh");
}

function close_page() {
	$("#acceuil").css("height", "0%");
}
