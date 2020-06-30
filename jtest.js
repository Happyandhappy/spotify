const axios = require('axios');
var qs = require('qs');

function convertBase64(str) {
	return Buffer.from(str).toString('base64');
}

async function APIcall() {
	//Set locations and playlist id's then continue
	await fetch("Nederland", "3KuxYcB3SY9lCNMeVVq5wl");
}

function get_value(arr, name) {
	if (name in arr)
		return arr[name]
	return ""
}


async function unit_call(access_token, plaatsNaam, playlist_id) {
	var url = "https://api.spotify.com/v1/playlists/" + playlist_id + "?market=NL&fields=tracks.items(track(artists%2Cname%2Cid%2Cpopularity%2Cpreview_url%2Cexternal_urls%2Calbum))";
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

	var i = 0;
	var Hits = [];
	var Artists = [];
	var arrayTrackIDs = [];
	var arrayArtistIDs = [];

	// loop through items -> track array
	items = source.data['tracks']['items']
	items.forEach(function (el) {
		ele = el.track;
		arrayArtistIDs.push(ele.artists[0].id);

		Hits.push({
			title: ele.name,
			preview_url: ele.preview_url,
			external_url: ele.external_urls ? ele.external_urls.spotify : "",
			spotify_id: ele.id,
			album_img: ele.album && ele.album.images ? ele.album.images[0].url : "",
			danceability: 0,
			tempo: 0
		});
		arrayTrackIDs.push(ele.id);
	});

	// get artist details
	var art_ids = [
		arrayArtistIDs.slice(0, 50),
		arrayArtistIDs.slice(50, 100)
	]

	//Create string from arrayArtistIDs and parse url2 API response
	for (i = 0; i < 2; i++) {
		var strArtistIDs = art_ids[i].join('%2C');

		var url2 = "https://api.spotify.com/v1/artists/?ids=" + strArtistIDs;
		OAuth.url = url2;
		var source2 = await axios(OAuth);
		var data2 = source2.data.artists;
		data2.forEach(function(el){
			Artists.push({
				name: el.name,
				spotify_id: el.id,
				spotify_followers:el.followers.total,
				image: el.images[0].url,
				genre: el.genres.join(', ')
			})
		})
	}
	// console.log(Artists);

	// create string from arrayTrackIDs and parse url API response for audio-features
	var strTrackIDs = arrayTrackIDs.join("%2C");
	url2 = "https://api.spotify.com/v1/audio-features/?ids=" + strTrackIDs;
	OAuth.url = url2;
	var source2 = await axios(OAuth);
	data = source2.data.audio_features;
	for (i = 0; i < data.length; i++){
		Hits[i].danceability = data[i].danceability;
		Hits[i].tempo = data[i].tempo;
	}
	// console.log(Hits)
	return;
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

	unit_call(access_token, plaatsNaam, playlist_id);
};


console.log(APIcall());