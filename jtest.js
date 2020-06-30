const axios = require('axios');
var qs = require('qs');

function convertBase64(str) {
	return Buffer.from(str).toString('base64');
}

async function APIcall() {
	//Set locations and playlist id's then continue
	await fetch("Nederland", "3KuxYcB3SY9lCNMeVVq5wl");
};

async function unit_call(access_token,plaatsNaam, playlist_id, next = null) {
	var url = "https://api.spotify.com/v1/playlists/" + playlist_id + "?market=NL&fields=tracks.items(track(artists%2Cname%2Cid%2Cpopularity%2Cpreview_url))";
	var OAuth = {
		url: url,
		method: "GET",
		headers: {
			"contentType": "application/json",
			"Authorization": "Bearer " + access_token
		},
		muteHttpExceptions: true
	};

	//Parse API response
	var source = await axios(OAuth);
	console.log(JSON.stringify(source.data));
	var i = 0;
	var arrayIDs = [];
	var arrayTitles = [];
	var arrayTrackPopularity = [];
	var arrayArtists = [];
	var arrayArtists2 = [];
	var arrayArtistIDs = [];

	// loop through items -> track array
	for (i = 0; i < 50; i++) {

		var arrayData = [source.data['tracks']['items'][i]['track']];

		// Add the arrayProperties data to the arrays
		arrayData.forEach(function (el) {
			arrayIDs.push(el.id)
			arrayTitles.push(el.name)
			arrayTrackPopularity.push(el.popularity)
			arrayArtistIDs.push(el.artists[0].id)

			var arrayAllArtists = [];
			var arrayAllArtists2 = [];
			var i3 = 0;
			for (i3 = 0; i3 < el.artists.length; i3++) {
				arrayAllArtists.push(el.artists[i3].name)
				arrayAllArtists2.push(el.artists[i3].name)
			}
			arrayArtists.push(arrayAllArtists.join(', '))
			arrayArtists2.push(',' + arrayAllArtists2.join(',') + ',');
		});
	}


	//Create string from arrayArtistIDs and parse url2 API response
	var strArtistIDs = arrayArtistIDs.join('%2C');
	var url2 = "https://api.spotify.com/v1/artists/?ids=" + strArtistIDs;
	OAuth.url = url2;
	var source2 = await axios(OAuth);
	var data2 = source2.data;
	var i2 = 0;
	var arrayGenres = [];

	// loop through artists array
	for (i2 = 0; i2 < 50; i2++) {

		var arrayData2 = data2['artists'];

		// Add the arrayProperties data to the arrays
		arrayData2.forEach(function (el) {
			arrayGenres.push(el.genres);
		});
	}

	//Create single output array
	var values = [];

	// loop over the arrayIDs array
	for (var i = 0; i < arrayIDs.length; i++) {
		// push a row of data for each arrayId as 2nd array
		values.push(["date", "x", arrayTitles[i], arrayTrackPopularity[i], arrayArtists[i], arrayGenres[i].join(', '), plaatsNaam, arrayArtists2[i]])
	}

	// write data to sheet
	console.log(values);
	// console.log(values.length);
}

async function fetch(plaatsNaam, playlist_id) {
	//Spotify API authorization

	var clientId = "c2781a7fb45a4f60acf0390728ce3ead"; // Please set here.
	var clientSecret = "13f381d069d34bab8eb2b1b99d58c8ac"; // Please set here.
	var url_api = "https://accounts.spotify.com/api/token";

	var data = qs.stringify({
		'grant_type': 'client_credentials'
	});

	var headers = {
		"Authorization": "Basic " + convertBase64(clientId + ":" + clientSecret),
		"Content-Type": "application/x-www-form-urlencoded"
	};

	let res = await axios.post(url_api, data, { headers: headers })
	var access_token = "";
	if ('access_token' in res.data)
		access_token = res.data.access_token;
	console.log(access_token);

	unit_call(access_token,plaatsNaam, playlist_id);
};


console.log(APIcall());