
//////////////////// -- STANDARD SEARCH CLASS
class standardSearch {
  constructor() {
    this.searches = [];
    this.selectedSearch = null;
    this.oldSearches = [];
  }
  //getters e setters
  getSelectedSearch() {  //serve per quando si preme il tasto allTweets
    return this.selectedSearch;
  }
  getOldSearches() {
    return this.oldSearches;
  }
  getSearches() {
    return this.searches;
  }
  //aggiunta, selezione ed eliminazione delle ricerche
  addSearch(_search) {
    if (_search.tweets.length > 0) {
      this.searches.push(_search);
      myGeoMap.addSearchMarkers(_search, this.searches.length - 1);
      myHome.change(_search.tweets);
      if ($("#allTweets").hasClass("ptrue")) {
        myGeoMap.displaySearch(this.searches.length - 1);
        myWordMap.empty();
        var searchesTweets = [];
        for (let searchIndex = 0; searchIndex < this.searches.length; searchIndex++) {
          for (let tweetIndex = 0; tweetIndex < this.searches[searchIndex].tweets.length; tweetIndex++) {
            searchesTweets.push(this.searches[searchIndex].tweets[tweetIndex]);
          }
        }
        myWordMap.createWordMap(searchesTweets);
      } else {
        myGeoMap.changeDisplayedSearch(this.selectedSearch, this.searches.length - 1);
        myWordMap.empty();
        myWordMap.createWordMap(_search.tweets);
        //CHANGE WORDMAP
      }
      this.selectedSearch = this.searches.length - 1;
      addSearchToHTML(_search, this.searches.length - 1);
      setStyles();
    } else {
      myErrorHandler.displayError('Didn\'t find any tweets');
    }
  }
  addSearches(_searches) {
    for (let searchIndex = 0; searchIndex < _searches.length; searchIndex++) {
      this.addSearch(_searches[searchIndex]);
    }
  }
  selectSearch(_index, forceReload) {
    if (_index === null && this.selectedSearch !== null) {  //se index è null, allora azzera la home, la geoMap e la wordMap
      this.selectedSearch = null;
      myGeoMap.deleteAllMarkers();
      myHome.empty();
      myWordMap.empty();
      setLogoInHome();
    } else {  //altrimenti
      if (this.selectedSearch !== _index || forceReload) { //se la ricerca selezionata non era già in focus la impostiamo come tale
        myHome.change(this.searches[_index].tweets);
        myWordMap.empty();
        if ($("#allTweets").hasClass("pfalse")) {
          myWordMap.createWordMap(this.searches[_index].tweets);
          myGeoMap.changeDisplayedSearch(this.selectedSearch, _index);
        } else {
          var searchesTweets = [];
          for (let searchIndex = 0; searchIndex < this.searches.length; searchIndex++) {
            for (let tweetIndex = 0; tweetIndex < this.searches[searchIndex].tweets.length; tweetIndex++) {
              searchesTweets.push(this.searches[searchIndex].tweets[tweetIndex]);
            }
          }
          myWordMap.createWordMap(searchesTweets);
        }
        this.selectedSearch = _index;
      }
    }
  }
  deleteSearch(_index) {
    $("#card" + _index).remove();
    for (let i = _index + 1; i < this.searches.length; i++) {

      $("#search_n" + i).attr("onclick", "selectSearchByType(" + (i - 1) + ", false)");
      $("#search_n" + i).prop("id", "search_n" + (i - 1));

      $("#delete_n" + i).attr("onclick", "deleteSearchByType(" + (i - 1) + ")");
      $("#delete_n" + i).prop("id", "delete_n" + (i - 1));

      $("#card" + i).prop("id", "card" + (i - 1));
    }
    this.searches.splice(_index, 1);
    if (this.searches.length > 0) {
      myGeoMap.deleteSearchMarkers(_index);
      this.selectSearch(this.searches.length - 1, true);
    } else {
      this.selectSearch(null, false);
    }
  }
  deleteSearches() {
    $("#listatabella").empty();
    this.searches = [];
    this.selectSearch(null, false);
  }
  changeSearces(_searches) {
    this.deleteSearches();
    this.addSearches(_searches);
  }
  saveToServer() {
    if (this.searches.length > 0) {
      var s = this.searches;
      $.ajax({
        url: '/api/tweets/tweetsave',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(s),
        type: 'POST',
        success: function (result) {
          console.log('Tutto salvato');
        },
        error: function () {
          console.log('Qualcosa è andato storto');
        }
      });
    } else {
      myErrorHandler.displayError('No searches to save');
    }
  }
  loadOldSearchesList(_oldSearches) {
    this.oldSearches = _oldSearches;
  }
}
var myStandard = new standardSearch();


//////////////////// -- FOLLOW SEARCH CLASS
class followSearch {
  constructor() {
    this.user = null;
    this.oldSearches = [];
  }
  getOldSearches() {
    return this.oldSearches;
  }
  getUser() {
    return this.user;
  }
  deleteUser(){
    myGeoMap.changeUserMarkers(null);
    myHome.empty();
    myWordMap.empty();
    setLogoInHome();
    this.user = null;
  }
  switchUser(_search) {
    if (_search.tweets.length > 0) {
      if(this.user !== null){
        if(_search.title !== this.user.title){
          console.log('da angy a ilapale');
        } else {
          for (let oldIndex = 0; oldIndex < this.user.tweets.length; oldIndex++) {
            var found = false;
            var newIndex = 0;
            while(newIndex < _search.tweets.length && !(found)){
                if(_search.tweets[newIndex].id === this.user.tweets[oldIndex].id){
                    found = true;
                }
                newIndex = newIndex + 1;
            }
            if(!found){
              _search.tweets.push(this.user.tweets[oldIndex]);
            }
          }
        }
        $("#userCard").remove();
      }
      this.user = _search;
      myGeoMap.changeUserMarkers(_search.tweets);
      myHome.changeFollow(_search);
      myWordMap.empty();
      myWordMap.createWordMap(_search.tweets);      
      addUserToHtml(_search);
      setStyles();
    }
    console.log(this.user.tweets.length);
  }
  saveToServer() {
    if(this.user !== null){
      if (this.user.tweets.length > 0) {
        var u = this.user;
        $.ajax({
          url: '/api/tweets/usersave',
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(u),
          type: 'POST',
          success: function (result) {
            console.log('Tutto salvato');
          },
          error: function () {
            console.log('Qualcosa è andato storto');
          }
        });
      } else {
        myErrorHandler.displayError('No tweets to save');
      }
    }{
      myErrorHandler.displayError('No user to save');
    }
  }
  loadOldSearchesList(_oldSearches) {
    this.oldSearches = _oldSearches;
  }
}
var myFollow = new followSearch();


//////////////////// -- LIVE SEARCH CLASS
class liveSearch {
  constructor() {
    this.searches = [];
    this.selectedSearch = null;
    this.oldSearches = [];
    this.activeStream = null;
    this.requestLoop = null;
  }
  //getters e setters
  getSelectedSearch() {  //serve per quando si preme il tasto allTweets
    return this.selectedSearch;
  }
  getOldSearches() {
    return this.oldSearches;
  }
  getSearches() {
    return this.searches;
  }
  getActiveStream() {
    return this.activeStream;
  }
  stopRequestLoop() {
    if (this.requestLoop !== null) {
      console.log('proviamo a stoppare ' + this.activeStream);
      clearInterval(this.requestLoop);
      this.activeStream = null;
      this.requestLoop = null;
    } else {
      console.log('reqLoop already null');
    }
  }
  //aggiunta, selezione ed eliminazione delle ricerche
  addToSearch(tweets) {
    if (this.selectedSearch !== null) {
      for (let i = 0; i < tweets.length; i++) {
        this.searches[this.activeStream].tweets.push(tweets[i]);
        myGeoMap.addMark(this.searches[this.activeStream].place, this.searches[this.activeStream].importance, tweets[i].geo_lon, tweets[i].geo_lat, tweets[i].id, this.activeStream);
        if (this.selectedSearch === this.activeStream) {
          if(this.searches[this.activeStream].tweets.length < 2){
            myHome.empty();
          }
          myHome.addLive(tweets[i]);
        }
        if ($("#allTweets").hasClass("ptrue")) {
          myGeoMap.displayMark(this.activeStream, this.searches[this.activeStream].tweets.length-1);
          myWordMap.empty();
          var searchesTweets = [];
          for (let searchIndex = 0; searchIndex < this.searches.length; searchIndex++) {
            for (let tweetIndex = 0; tweetIndex < this.searches[searchIndex].tweets.length; tweetIndex++) {
              searchesTweets.push(this.searches[searchIndex].tweets[tweetIndex]);
            }
          }
          if (searchesTweets.length > 0) {
            setLogoInWordMap();
          } else {
            setLogoInHome();
          }
        } else {
          if (this.selectedSearch === this.activeStream) {
            myGeoMap.displayMark(this.activeStream, this.searches[this.activeStream].tweets.length-1);
            myWordMap.empty();
          if (this.searches[this.activeStream].tweets.length > 0) {
            setLogoInWordMap();
            } else {
              setLogoInHome();
            }
          }
        }
      }
    }
  }
  activateStream(_search) {
    this.stopRequestLoop();
    var tmpSearchIndex = null;
    for (let searchIndex = 0; searchIndex < this.searches.length; searchIndex++) {
      if (this.searches[searchIndex].title === _search.title && this.searches[searchIndex].place === _search.place) {
        tmpSearchIndex = searchIndex;
      }
    }
    if (tmpSearchIndex === null) {
      this.addSearch(_search);
      this.activeStream = this.searches.length - 1;
    } else {
      this.activeStream = tmpSearchIndex;
      this.selectSearch(tmpSearchIndex, false);
    }
    if($('#Home_Label').hasClass('active')){
      $("#home").css('height', '75vh');
      $("#loadingDiv").show();
    }
    this.requestLoop = setInterval(requestLiveRetrieve, 1000);
  }
  addSearch(_search) {
    this.searches.push(_search);
    myGeoMap.addSearchMarkers(_search, this.searches.length - 1);
    myHome.changeLive(_search.tweets);
    if ($("#allTweets").hasClass("ptrue")) {
      myGeoMap.displaySearch(this.searches.length - 1);
      myWordMap.empty();
      var searchesTweets = [];
      for (let searchIndex = 0; searchIndex < this.searches.length; searchIndex++) {
        for (let tweetIndex = 0; tweetIndex < this.searches[searchIndex].tweets.length; tweetIndex++) {
          searchesTweets.push(this.searches[searchIndex].tweets[tweetIndex]);
        }
      }
      if (searchesTweets.length > 0) {
        setLogoInWordMap();
      } else {
        setLogoInHome();
      }
    } else {
      myGeoMap.changeDisplayedSearch(this.selectedSearch, this.searches.length - 1);
      myWordMap.empty();
      if (_search.tweets.length > 0) {
        setLogoInWordMap();
      } else {
        setLogoInHome();
      }
    }
    this.selectedSearch = this.searches.length - 1;
    addSearchToHTML(_search, this.searches.length - 1);
    setStyles();
  }
  addSearches(_searches) {
    for (let searchIndex = 0; searchIndex < _searches.length; searchIndex++) {
      this.addSearch(_searches[searchIndex]);
    }
  }
  selectSearch(_index, forceReload) {
    console.log(_index, this.selectedSearch)
    if (_index === null && this.selectedSearch !== null) {  //se index è null, allora azzera la home, la geoMap e la wordMap
      this.selectedSearch = null;
      myGeoMap.deleteAllMarkers();
      myHome.empty();
      myWordMap.empty();
      setLogoInHome();
      this.stopRequestLoop();
    } else {  //altrimenti
      if (this.selectedSearch !== _index || forceReload) { //se la ricerca selezionata non era già in focus la impostiamo come tale
        myHome.changeLive(this.searches[_index].tweets);
        myWordMap.empty();
        myGeoMap.changeDisplayedSearch(this.selectedSearch, _index);
        if(this.activeStream === null){
          myWordMap.createWordMap(this.searches[_index].tweets);
        }
        
        this.selectedSearch = _index;
      }
    }
  }
  deleteSearch(_index) {
    $("#card" + _index).remove();
    console.log(this.activeStream + ' dovrebbe indicare quella da cancellare')
    if (this.activeStream !== null) {
      if (_index === this.activeStream) {
        this.stopRequestLoop();
        stopRequestLiveRetrieve();
        $('#loadingDiv').hide();
        $('#home').css('height', '80vh');
      } else if (_index < this.activeStream) {
        this.activeStream = this.activeStream - 1;
      }
    }
    for (let i = _index + 1; i < this.searches.length; i++) {

      $("#search_n" + i).attr("onclick", "selectSearchByType(" + (i - 1) + ", false)");
      $("#search_n" + i).prop("id", "search_n" + (i - 1));

      $("#delete_n" + i).attr("onclick", "deleteSearchByType(" + (i - 1) + ")");
      $("#delete_n" + i).prop("id", "delete_n" + (i - 1));

      $("#card" + i).prop("id", "card" + (i - 1));
    }

    this.searches.splice(_index, 1);
    if (this.searches.length > 0) {
      myGeoMap.deleteSearchMarkers(_index);
      this.selectSearch(this.searches.length - 1, true);
    } else {
      this.selectSearch(null, false);
    }
  }
  deleteSearches() {
    $("#listatabella").empty();
    this.searches = [];
    this.selectSearch(null, false);
  }
  changeSearces(_searches) {
    this.deleteSearches();
    this.addSearches(_searches);
  }
  saveToServer() {
    if (this.searches.length > 0) {
      var s = this.searches;
      $.ajax({
        url: '/api/tweets/liveSave',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(s),
        type: 'POST',
        success: function (result) {
          console.log('Tutto salvato');
        },
        error: function () {
          console.log('Qualcosa è andato storto');
        }
      });
    } else {
      myErrorHandler.displayError('No streams to save');
    }
  }
  loadOldSearchesList(_oldSearches) {
    this.oldSearches = _oldSearches;
  }
}
var myLive = new liveSearch();


//////////////////// -- GEOMAP CLASS
class geoMap {
  constructor() {
    this.controls = {};
    this.searchesMarkers = [];
    this.vectorLayer = {};
    this.userMarkers = [];
  }

  // map creation and centering
  createGeoMap() { //Call this to make a new map
    window.map = new OpenLayers.Map("geoMap");
    var osmlayer = new OpenLayers.Layer.OSM()
    map.addLayer(osmlayer);

    //imposto il centro della mappa iniziale
    this.setGeoMapCenter(12.492347, 41.890183, 6);

    //aggiungo la capacità di premere sui marker e chiuderli
    this.vectorLayer = new OpenLayers.Layer.Vector("Overlay");
    map.addLayer(this.vectorLayer);
    this.controls = {
      selector: new OpenLayers.Control.SelectFeature(this.vectorLayer, { onSelect: this.createPopup, onUnselect: this.destroyPopup })
    };
    map.addControl(this.controls['selector']);
    this.controls['selector'].activate();
    //DECIDERE SE MOSTRARE IL COPYRIGHT O NO
    $('#OpenLayers_Control_Attribution_7').hide();
  }
  setGeoMapCenter(lon, lat, zoom) {  //lon, lat son stringhe, zoom è numeri //Call this to change the map view
    // imposto lon e lat, e trasformo l'oggetto layer in modo che sia applicabile alla nostra mappa, perchè la terra non è piatta
    var LonLat = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
    //imposto il centro della mappa
    map.setCenter(LonLat, zoom);
  }
  createPopup(feature) {
    feature.popup = new OpenLayers.Popup.FramedCloud("pop",
      feature.geometry.getBounds().getCenterLonLat(),
      new OpenLayers.Size(200, 200),
      '<div class="markerContent">' + feature.attributes.description + '</div>',
      null,
      true,
    );
    //feature.popup.closeOnMove = true;
    feature.popup.setSize(new OpenLayers.Size(500, 400))
    map.addPopup(feature.popup);
  }
  destroyPopup(feature) {
    feature.popup.destroy();
    feature.popup = null;
  }
  changeUserMarkers(tweets){
    for (let userIndex = 0; userIndex < this.userMarkers.length; userIndex++) {
      this.vectorLayer.removeFeatures(this.userMarkers[userIndex]);
    }
    this.userMarkers = [];
    if(tweets !== null){
      for (let tweetIndex = 0; tweetIndex < tweets.length; tweetIndex++) {
        if((typeof tweets[tweetIndex].geo_lon === 'string' || typeof tweets[tweetIndex].geo_lon === 'number') && tweets[tweetIndex].geo_lon !== null && tweets[tweetIndex].geo_lon !== ''){
          var lon = tweets[tweetIndex].geo_lon;
          var lat = tweets[tweetIndex].geo_lat;
          var id = tweets[tweetIndex].id;
          var coord = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
          var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coord.lon, coord.lat), { description: '<p style="width: 600px;"><amp-twitter width = "5" height = "2" layout = "responsive" data-tweetid ="' + id + '" ></amp-twitter></h3>' }, { externalGraphic: 'images/iconM.png', graphicHeight: 25, graphicWidth: 25, graphicXOffset: -12, graphicYOffset: -25 });
          this.userMarkers.push(feature);
          this.vectorLayer.addFeatures(this.userMarkers[this.userMarkers.length - 1]);
        }
      }
    }
  }
  // marker creation, registration and deletion
  addMark(place, importance, lon, lat, id, searchIndex) {
    if (this.searchesMarkers.length <= searchIndex) { //se nuova, la ricerca va creata vuota
      console.log('entra qui una volta');
      this.searchesMarkers.push([]);
    } //altrimenti è vecchia, non ha bisogno di essere inizializzata

    if (place !== '') { //se con posizione, aggiungiamo il marker alla ricerca ora sempre esistente grazie all'if precedente
      lon = parseFloat(lon) + (Math.random() * (importance + importance) - importance);
      lat = parseFloat(lat) + (Math.random() * (importance + importance) - importance);

      // imposto lon e lat, trasformo l'oggetto layer in modo che sia applicabile alla nostra mappa, perchè la terra non è piatta
      var coord = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());

      //creo un marker
      var feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coord.lon, coord.lat), { description: '<p style="width: 600px;"><amp-twitter width = "5" height = "2" layout = "responsive" data-tweetid ="' + id + '" ></amp-twitter></h3>' }, { externalGraphic: 'images/iconM.png', graphicHeight: 25, graphicWidth: 25, graphicXOffset: -12, graphicYOffset: -25 });

      //aggiungo il marker nell'apposita ricerca
      this.searchesMarkers[searchIndex].push(feature);
    } //se senza posizione, allora non dobbiamo fare nulla
  }
  addSearchMarkers(_search, searchIndex) {
    if (_search.tweets.length < 1) {
      this.searchesMarkers.push([]);
    } else {
      for (let tweetIndex = 0; tweetIndex < _search.tweets.length; tweetIndex++) {
        this.addMark(_search.place, _search.importance, _search.tweets[tweetIndex].geo_lon, _search.tweets[tweetIndex].geo_lat, _search.tweets[tweetIndex].id, searchIndex);
      }
    }
  }
  addSearchesMarkers(_searches) {
    for (let searchIndex = 0; searchIndex < _searches.length; searchIndex++) {
      this.addSearchMarkers(_searches[searchIndex], searchIndex);
    }
  }
  deleteSearchMarkers(searchIndex) {
    this.removeDisplayedSearch(searchIndex);
    this.searchesMarkers.splice(searchIndex, 1);
  }
  deleteAllMarkers() {
    for (let searchIndex = 0; searchIndex < this.searchesMarkers.length; searchIndex++) {
      this.deleteSearchMarkers(searchIndex);
    }
  }
  changeSearchMarkers(_searches) {
    this.deleteAllMarkers();
    this.addSearchesMarkers(_searches);
  }
  //marker display and removal
  displayMark(searchIndex, tweetIndex) {
    if (this.searchesMarkers[searchIndex].length > 0) {
      this.vectorLayer.addFeatures(this.searchesMarkers[searchIndex][tweetIndex]);
    } else {
      console.log('la ricerca non aveva posizione');
    }
  }
  displaySearch(searchIndex) {
    for (let tweetIndex = 0; tweetIndex < this.searchesMarkers[searchIndex].length; tweetIndex++) {
      this.displayMark(searchIndex, tweetIndex);
    }
  }
  displaySearches() {
    for (let searchIndex = 0; searchIndex < this.searchesMarkers.length; searchIndex++) {
      this.displaySearch(searchIndex);
    }
  }
  removeDisplayedSearch(searchIndex) {
    this.vectorLayer.removeFeatures(this.searchesMarkers[searchIndex]);
  }
  removeAllDisplayed() {
    for (let searchIndex = 0; searchIndex < this.searchesMarkers.length; searchIndex++) {
      this.removeDisplayedSearch(searchIndex);
    }
  }
  changeDisplayedSearch(currentSearch, newSearch) {
    this.removeDisplayedSearch(currentSearch);
    this.displaySearch(newSearch);
  }
}
var myGeoMap = new geoMap();


//////////////////// -- HOME CLASS
class Home {
  constructor() {}
  add(tweet) {

    var images = ``;

    if(tweet.media.length === 1){
      images = `
        <div class="text-center row">
          <div class = " text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover pl-4 ml-4">
          </div>
        </div>`
    } else if (tweet.media.length === 2){
      images = `
        <div class="text-center row">
          <div class = " text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover">
          </div>
          <div class = " text-center col pl-0">
            <img src="${tweet.media[1]}" class="img-fluid m-2 cover">
          </div>
        </div>`
    } else if (tweet.media.length === 3){
      images = `
        <div class="text-center row">
          <div class=" text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover">
          </div>
          <div class=" text-center col pl-0">
            <img src="${tweet.media[1]}" class="img-fluid m-2 cover">
          </div>
          <div class=" text-center col pl-0">
            <img src="${tweet.media[2]}" class="img-fluid m-2 cover">
          </div>
        </div>`
    } else if (tweet.media.length > 3) {
      images = `
        <div class = "row text-center">
          <img src="${tweet.media[0]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
          <img src="${tweet.media[1]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
        </div>
        <div class = "row text-center">
          <img src="${tweet.media[2]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
          <img src="${tweet.media[3]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
        </div>`
    }

    var tw = `<div class="card border-info mb-3 mx-auto" style="width: 70%; border-radius: 10px;">
            <div class="card-body">
                <div class="row ml-1 d-flex justify-content-between">
                  <div class="d-flex flex-row">
                    <div class="p-0 m-0" >
                      <img style="border-radius: 100%;" src="${tweet.profile_img}">
                    </div>
                    <div class="col">
                      <h5 class="card-title d-flex align-items-center row m-0">${tweet.name}</h5>
                      <h6 class="row m-0" style="color:dimgrey">${"@" + tweet.user_name}</h6>
                    </div>
                  </div>
                    <div class="col-4">
                      <img class="card-img-top img-fluid float-right" style="max-width: 20%"
                      src="images/logo.png">
                    </div>
                </div>
                <p class="card-text mt-2 ml-0" style="font-size: 150%">${tweet.text}
                </p>
                ${images}
                <div class="row pl-3">
                    <small class="m-0 pl-0 col" style="color:dimgrey; font-size: 100%;">${tweet.time}</small>
                    <a class="m-0 col-4 text-right" href="${tweet.link}" target=”_blank” style="color:dimgrey; font-size: 100%;">Vai al Tweet</a>
                </div>
            </div>
        </div>`

    $('#home').append(tw);
  }
  addLive(tweet) {

    var images = ``;

    if(tweet.media.length === 1){
      images = `
        <div class="text-center row">
          <div class = " text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover pl-4 ml-4">
          </div>
        </div>`
    } else if (tweet.media.length === 2){
      images = `
        <div class="text-center row">
          <div class = " text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover">
          </div>
          <div class = " text-center col pl-0">
            <img src="${tweet.media[1]}" class="img-fluid m-2 cover">
          </div>
        </div>`
    } else if (tweet.media.length === 3){
      images = `
        <div class="text-center row">
          <div class=" text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover">
          </div>
          <div class=" text-center col pl-0">
            <img src="${tweet.media[1]}" class="img-fluid m-2 cover">
          </div>
          <div class=" text-center col pl-0">
            <img src="${tweet.media[2]}" class="img-fluid m-2 cover">
          </div>
        </div>`
    } else if (tweet.media.length > 3) {
      images = `
        <div class = "row text-center">
          <img src="${tweet.media[0]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
          <img src="${tweet.media[1]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
        </div>
        <div class = "row text-center">
          <img src="${tweet.media[2]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
          <img src="${tweet.media[3]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
        </div>`
    }

    var tw = `
      
    <div class="card border-info mb-3 mx-auto" style="width: 70%; border-radius: 10px;">
            <div class="card-body">
                <div class="row ml-1 d-flex justify-content-between">
                  <div class="d-flex flex-row">
                    <div class="p-0 m-0" >
                      <img style="border-radius: 100%;" src="${tweet.profile_img}">
                    </div>
                    <div class="col">
                      <h5 class="card-title d-flex align-items-center row m-0">${tweet.name}</h5>
                      <h6 class="row m-0" style="color:dimgrey">${"@" + tweet.user_name}</h6>
                    </div>
                  </div>
                    <div class="col-4">
                      <img class="card-img-top img-fluid float-right" style="max-width: 20%"
                      src="images/logo.png">
                    </div>
                </div>
                <p class="card-text mt-2 ml-0" style="font-size: 150%">${tweet.text}
                </p>
                ${images}
                <div class="row pl-3">
                    <small class="m-0 pl-0 col" style="color:dimgrey; font-size: 100%;">${tweet.time}</small>
                    <a class="m-0 col-4 text-right" href="${tweet.link}" target=”_blank” style="color:dimgrey; font-size: 100%;">Vai al Tweet</a>
                </div>
            </div>
        </div>`

    $('#home').prepend(tw);
  }
  fill(tweets) {
    for (let i = 0; i < tweets.length; i++) {
      this.add(tweets[i]);
    }
  }
  fillLive(tweets) {
    for (let i = 0; i < tweets.length; i++) {
      this.addLive(tweets[i]);
    }
  }
  addUser(tweet){
    var images = ``;

    if(tweet.media.length === 1){
      images = `
        <div class="text-center row">
          <div class = " text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover pl-4 ml-4">
          </div>
        </div>`
    } else if (tweet.media.length === 2){
      images = `
        <div class="text-center row">
          <div class = " text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover">
          </div>
          <div class = " text-center col pl-0">
            <img src="${tweet.media[1]}" class="img-fluid m-2 cover">
          </div>
        </div>`
    } else if (tweet.media.length === 3){
      images = `
        <div class="text-center row">
          <div class=" text-center col pl-0">
            <img src="${tweet.media[0]}" class="img-fluid m-2 cover">
          </div>
          <div class=" text-center col pl-0">
            <img src="${tweet.media[1]}" class="img-fluid m-2 cover">
          </div>
          <div class=" text-center col pl-0">
            <img src="${tweet.media[2]}" class="img-fluid m-2 cover">
          </div>
        </div>`
    } else if (tweet.media.length > 3) {
      images = `
        <div class = "row text-center">
          <img src="${tweet.media[0]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
          <img src="${tweet.media[1]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
        </div>
        <div class = "row text-center">
          <img src="${tweet.media[2]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
          <img src="${tweet.media[3]}" class="img-fluid m-2" style="max-width: 40%; object-fit: cover;">
        </div>`
    }

    var tw = `<div class="card border-info mb-3 mx-auto" style="width: 70%; border-radius: 10px;">
            <div class="card-body">
                <div class="row ml-1 d-flex justify-content-between">
                  <div class="d-flex flex-row">
                    <div class="p-0 m-0" >
                      <img style="border-radius: 100%;" src="${tweet.profile_img}">
                    </div>
                    <div class="col">
                      <h5 class="card-title d-flex align-items-center row m-0">${tweet.name}</h5>
                      <h6 class="row m-0" style="color:dimgrey">${"@" + tweet.user_name}</h6>
                    </div>
                  </div>
                    <div class="col-4">
                      <img class="card-img-top img-fluid float-right" style="max-width: 20%"
                      src="images/logo.png">
                    </div>
                </div>
                <p class="card-text mt-2 ml-0" style="font-size: 150%">${tweet.text}
                </p>
                ${images}
                <div class="row pl-3">
                    <small class="m-0 pl-0 col" style="color:dimgrey; font-size: 100%;">${tweet.time}</small>
                    <a class="m-0 col-4 text-right" href="${tweet.link}" target=”_blank” style="color:dimgrey; font-size: 100%;">Vai al Tweet</a>
                </div>
            </div>
        </div>`

    $('#home').append(tw);
  }
  changeFollow(user){
    $('#home').empty();
    for (let tweetIndex = 0; tweetIndex < user.tweets.length; tweetIndex++) {
      this.addUser(user.tweets[tweetIndex]);
    }
  }
  empty() {
    $('#home').empty();
  }
  change(tweets) {
    this.empty();
    this.fill(tweets);
  }
  changeLive(tweets) {
    this.empty();
    this.fillLive(tweets);
  }
}
var myHome = new Home();


//////////////////// -- ERRORHANDLER CLASS
class errorHandler{
  constructor(){
    this.currentTimeOut = null;
  }
  displayError(errorText){
    if(this.currentTimeOut !== null){
      clearTimeout(this.currentTimeOut);
    }
    $("#Error_msg").text(errorText);
    this.currentTimeOut = setTimeout(myErrorHandler.timeOutFunction, 5000);
  }
  timeOutFunction(){
    $("#Error_msg").text('');
    this.currentTimeOut = null;
  }
}
var myErrorHandler = new errorHandler();


function setStyles() {
  $(".close").click(function (event) {
    event.stopPropagation();
  });
}

function addUserToHtml(user) {//ex ListElement
  var newEl = `
    <div class = "d-flex flex-row searchbox cursor_pointer p-1" id="userCard">
      <div class="list-group-item list-group-item-action flex-column d-flex contentbox">
        <div class = "d-flex w-100 justify-content-between">
          <h5 class = "mb-1">
            <t>${user.title}</t>
          </h5>
        </div>
        <small>
          <div>${user.date} </div>
        </small>
      </div>
    </div>`
  $("#listatabella").prepend(newEl);
}

function addSearchToHTML(search, index) {//ex ListElement
  var newEl = `
    <div class = "d-flex flex-row searchbox cursor_pointer p-1" id="card${index}">
      <div class="list-group-item list-group-item-action col-10 flex-column d-flex contentbox" onclick="selectSearchByType(${index}, false)" id="search_n${index}" >
        <div class = "d-flex w-100 justify-content-between">
          <h5 class = "mb-1">
            <t>${search.title}</t>
          </h5>
        </div>
        <small>
          <div>${search.date} </div>
        </small>
        <small>
          <div>${search.place}</div>
        </small>
      </div>
      <div class= "btn-danger d-flex col-2 p-0 m-0 deletebox" id="delete_n${index}" onclick="deleteSearchByType(${index})">
        <img src="./images/iconwastebin.png" class = "bin_img">
      </div>
    </div>`
  $("#listatabella").prepend(newEl);
}

function addSearchesToHTML(searches) {
  $("#listatabella").empty();
  for (let i = 0; i < searches.length; i++) {
    addSearchToHTML(searches[i], i)
  }
}

function setLogoInHome() {
  $('#home').append('\
  <div id="homePlaceHolder" class="d-flex justify-content-center align-items-center">\
    <img src="images/logo.png" class="alpha75" alt="Twitter Tracker Logo" width="40%">\
  </div>\
  ');
  $('#wordMap').append('\
  <div id="homePlaceHolder" class="d-flex justify-content-center align-items-center">\
    <img src="images/logo.png" class="alpha75" alt="Twitter Tracker Logo" width="40%">\
  </div>\
  ');
}
function setLogoInWordMap(){
  $('#wordMap').append('\
  <div id="homePlaceHolder" class="d-flex justify-content-center align-items-center">\
    <img src="images/logo.png" class="alpha75" alt="Twitter Tracker Logo" width="40%">\
  </div>\
  ');
}

function insertWordsByCount(array, word){
  var isDup = false;
  var s = 0;
  while ((s < array.length) && (!isDup)) {
    if (word === array[s].x) {
      isDup = true;
    }
    s++;
  }
  if (!isDup) {
    array.push({ x: word, value: 1 });
  }
  else {
    array[s - 1].value = array[s - 1].value + 1;
  }
}


class wordMap {
  constructor() {
    this.wordCount = [];  //ordinato per value
    this.count = { top: 0, bottom: 0, amount: 0 };
    this.chart = null;
    this.rangeScale = {};
  }
  getChart(){
    return this.chart;
  }
  saveAsPng() {

    // Saves into PNG file.
    this.chart.saveAsPng(360, 500, 0.3, 'PngChart');
  }
  createWordMap(tweets) {
    console.log('nella wordmap')

    //alla creazione
    var parole;
    var paroleSenzaDuplicati = [{ text: "", occ: 0 }];
  
    var ignoredWord = ["the", "il", "ai", "hai", "ha", 'ho', 'rt', 'com', 'it', 'en', 'co', 'by', 'to', 'on', 'that', 'but', 'from', 'with', 'for', 'this', 'is', 'me', 'an', 'so', 'not', 'you', 'my', "lo", "la", "gli", "le", "di", "del", "dal", "dell", "dei", "degli", "a", "all", "alla", "alle", "agli", "è", "é", "e", "i", "o", "u", "da", "al", "della", "de", "dagli", "dalle", "dai", "in", "con", "su", "sui",
      "per", "tra", "fra", "un", "nel", "uno", "una", "ci", "vi", "ti", "sul", "sulle", "sulla", "sugli", "mi", "http", "https", "si", "ma", "l'", "un'", "che", "and", "or", "thy", "of", "non", "che", ",", "...", "..", ".", "?", "'", "!", "-", "|"];
  
    const regexp = /(\w\w*)[A-Za-z0-9À-ú]/g;
  
    //per ogni ricerca
    for (let i = 0; i < tweets.length; i++) {
      var lowerTweet = tweets[i].text.toLowerCase()
  
      var parole = [];
      try { parole = [...(lowerTweet.match(regexp))]; }
      catch (err){ 
        console.log('regexp esplode')
        console.log(err);
      }
  
      for (let p = 0; p < parole.length; p++) {
  
        let s = 0;
        let isDup = false;
        //alert(parole[p]);
        var toIgnore = (ignoredWord.indexOf(parole[p]) > -1);
        //alert(toIgnore);
        if (!toIgnore) {
          while ((s < paroleSenzaDuplicati.length) && (!isDup)) {
            if (parole[p] === paroleSenzaDuplicati[s].text) {
              isDup = true;
            }
            s++;
          }
          if (!isDup) {
            paroleSenzaDuplicati.push({ text: parole[p], occ: 1 });
          }
          else {
            paroleSenzaDuplicati[s - 1].occ = paroleSenzaDuplicati[s - 1].occ + 1;
          }
        }
      }
    }
  
    //CREO LA WORD CLOUD
    anychart.onDocumentReady(function () {
      
      console.log('nella anychart ready')
  
      var data = [], ind = 0
      for (let k = 0; k < paroleSenzaDuplicati.length; k++) {
        if ((paroleSenzaDuplicati[k].occ > 3) && (paroleSenzaDuplicati[k].text.length >= 2)) { //minimo 4 occorrenze, minimo parole con 3 caratteri
          data[ind] = { "x": paroleSenzaDuplicati[k].text, "value": paroleSenzaDuplicati[k].occ };
          ind++
        }
      }
  
      myWordMap.chart = anychart.tagCloud(data);
      myWordMap.chart.title('Most used words');       //TITOLO
      myWordMap.chart.angles([0, 90]);
      myWordMap.chart.mode("spiral");
  
      var customColorScale = anychart.scales.ordinalColor();
      customColorScale.ranges([
        { less: 4 },
        { from: 5, to: 8 },
        { from: 9, to: 20 },
        { from: 21, to: 40 },
        { from: 41, to: 70 },
        { greater: 71 }
      ]);
      customColorScale.colors(["#4814AA", "#3783FF", "#4DE94C", "#FFEE00", "#FF8C00", "#F60000"]);
  
      // set the color scale as the color scale of the chart
      myWordMap.chart.colorScale(customColorScale);
  
      // add a color range
      myWordMap.chart.colorRange().enabled(true);
  
  
      //chart.colorRange(false);
      myWordMap.chart.colorRange().length('80%');
      myWordMap.chart.container("wordMap");
      myWordMap.chart.background().fill({
        keys: ["#fff"],  //#182E58 per il colore dello sfondo
        angle: 0
      })
  
        .stroke({
          color: "#0097f0",
          thickness: 5,
          lineJoin: 'bevel',
          lineCap: 'round'
        })
        myWordMap.chart.draw();
        anychart.exports.twitter(
          'https://export.anychart.com/sharing/twitter',
          '595',
          '842'
      );
    });
  }
  setCount(n) {
    this.count = { top: n, bottom: this.wordCount.length, amount: 0 };
    var oneTime = [];
    var found = false;
    var countIndex = 0;

    for (let wordIndex = 0; wordIndex < this.wordCount.length; wordIndex++) {
      if (this.wordCount[wordIndex].value > this.count.top) {
        this.count.top = this.wordCount[wordIndex].value;
      }
      if (this.wordCount[wordIndex].value < this.count.bottom) {
        this.count.bottom = this.wordCount[wordIndex].value;
      }

      found = false;
      while (countIndex < oneTime.length || found) {
        if (oneTime[this.countIndex] === this.wordCount[wordIndex].value) {
          found = true
        } else {
          countIndex = countIndex + 1;
        }
      }

      if (!found) {
        oneTime.push(this.wordCount[wordIndex].value);
      }
    }

    this.count.amount = oneTime.length;
  }
  noLessThanN(n) {
    var i = 0, iterations = this.wordCount.length, current = 0;

    while (i < iterations) {
      if (this.wordCount[current].value < n) {
        this.wordCount.splice(current, 1);
      } else {
        current = current + 1;
      }
      i = i + 1;
    }
  }
  insertToWordCount(word) {
    var i = 0;
    var added = false;

    while (i < this.wordCount.length && !added) {
      if (this.wordCount[i].x === word) {
        this.wordCount[i].value = this.wordCount[i].value + 1;
        added = true;
        console.log('added true per sempre in insert');
      } else {
      }
      console.log('i+1 per sempre in insert');
      i = i + 1;
      console.log('insertToWordCount');
    }

    if (added === false) {
      this.wordCount.push({ x: word, value: 1 });
    }
  }
  checkIgnored(word) {
    var ignoredWords = ["the", "il", "ai", "hai", "ha", "lo", "la", "gli", "le", "di", "del", "dal", "dell", "dei", "degli", "a", "all", "alla", "alle", "agli", "è", "é", "e", "i", "o", "u", "da", "al", "della", "de", "dagli", "dalle", "dai", "in", "con", "su", "sui", "per", "tra", "fra", "un", "nel", "uno", "una", "ci", "vi", "ti", "sul", "sulle", "sulla", "sugli", "mi", "http", "https", "si", "ma", "l'", "un'", "che", "and", "or", "thy", "of", "non", "che", ",", "...", "..", ".", "?", "'", "!", "-", "|"];
    var found = false;
    var i = 0;

    console.log(word + ' in checkIgnored');
    while (i < ignoredWords.length && !found) {
      if (word === ignoredWords[i]) {
        found = true;
        console.log(found)
      }
      i = i + 1;
      console.log('checkIgnored');
    }

    return found;
  }
  addTweet(tweetText) {
    const regexp = /(\w\w*)[A-Za-z0-9À-ú]/g;
    var words = [];

    tweetText = tweetText.toLowerCase();

    try { words = [...(tweetText.match(regexp))]; }
    catch { }

    for (let i = 0; i < words.length; i++) {
      if (!this.checkIgnored(words[i]) && words[i].length > 3) {
        this.insertToWordCount(words[i]);
      }
      console.log('added word: ' + words[i]);
    }
    console.log('added all words from a tweet')
  }
  addSearch(_search) {
    for (let tweetIndex = 0; tweetIndex < _search.tweets.length; tweetIndex++) {
      console.log('tweetIndex: ' + tweetIndex);
      console.log(_search.tweets[tweetIndex].text);
      this.addTweet(_search.tweets[tweetIndex].text);
    }
  }
  addSearches(_searches) {
    for (let searchIndex = 0; searchIndex < _searches.length; searchIndex++) {
      this.addSearch(_searches[searchIndex]);
    }
  }
  changeRange() {
    this.rangeScale = {};
    var ranges = 10;
    var group = 0;
    var margin = 0;
    var colourRange = []

    var rangesObj = [];

    if (this.count.amount < 10) {
      ranges = this.count.amount;
    }

    margin = this.count.top - this.count.bottom;

    group = (margin - (margin % ranges)) / ranges;

    this.rangeScale = anychart.scales.ordinalColor();

    if (ranges > 0) {
      rangesObj.push({ less: group + 1 })
      for (let index = 1; index < ranges; index++) {
        rangesObj.push({ from: (group * index) + 1, to: group * (index + 1) })
      }
      if (margin % ranges > 0) {
        rangesObj.push({ greater: group * ranges })
      }

      colourRange = this.calcColourRanges(rangesObj.length);
    }

    this.rangeScale.ranges(rangesObj);

    this.rangeScale.colors(colourRange);
  }
  calcColourRanges(dividedIn) {
    var colourRanges = [];
    var oneRange = (796 - (796 % dividedIn)) / dividedIn;
    var currentRange = oneRange;
    var r = 224;
    var g = 25;
    var b = 25;

    while (r === 0 && g < 222 && b === 222 && dividedIn > 0) {
      colourRanges.splice(0, 0, rgbToHex(r, g, b));
      dividedIn = dividedIn - 1;
      if (222 - g >= currentRange) {
        g = g + currentRange;
        currentRange = oneRange;
      } else {
        currentRange = currentRange - (222 - g);
        g = 222;
      }
    }
    while (r === 0 && g === 222 && b > 0 && dividedIn > 0) {
      colourRanges.splice(0, 0, rgbToHex(r, g, b));
      dividedIn = dividedIn - 1;
      if (b >= currentRange) {
        b = b - currentRange;
        currentRange = oneRange;
      } else {
        currentRange = currentRange - b;
        b = 0;
      }
    }
    while (r < 222 && g === 222 && b === 0 && dividedIn > 0) {
      colourRanges.splice(0, 0, rgbToHex(r, g, b));
      dividedIn = dividedIn - 1;
      if ((222 - r) >= currentRange) {
        r = r + currentRange;
        currentRange = oneRange;
      } else {
        currentRange = currentRange - (222 - r);
        r = 222;
      }
    }
    while (r === 222 && g > 0 && b === 0 && dividedIn > 0) {
      colourRanges.splice(0, 0, rgbToHex(r, g, b));
      dividedIn = dividedIn - 1;
      if (g >= currentRange) {
        g = g - currentRange;
        currentRange = oneRange;
      } else {
        currentRange = currentRange - g;
        g = 0;
      }
    }

    return (colourRanges);
  }
  empty() {
    $('#wordMap').empty();
  }
  changeSearch(_search) {
    this.empty();
    this.addSearch(_search);
  }
  changeSearches(_searches) {
    this.empty();
    this.addSearches(_searches)
  }
}
var myWordMap = new wordMap();


function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function chooseSearch() {
  
  if ($('#option_Search').hasClass('active')) {
    if ($('#Tweet_src').val() === '') {
      myErrorHandler.displayError('Search Bar Empty');
    } else {
      requestTweets();
    }
  } else if ($('#option_Live').hasClass('active')) {
      requestLiveStart();
  } else {
    if ($('#Tweet_src').val() === '') {
      myErrorHandler.displayError('Search Bar Empty');
    } else {
      requestUser();
    }
  }
  
}

function selectSearchByType(index, forceReload) {
  if ($('#option_Search').hasClass('active')) {
    myStandard.selectSearch(index, forceReload);
  } else if ($('#option_Live').hasClass('active')) {
    myLive.selectSearch(index, forceReload);
  } else {
  }
}

function deleteSearchByType(index) {
  if ($('#option_Search').hasClass('active')) {
    myStandard.deleteSearch(index);
  } else if ($('#option_Live').hasClass('active')) {
    myLive.deleteSearch(index);
  } else {
  }
}


function requestLiveStart() {
  myWordMap.empty();
  setLogoInWordMap();
  var search = {
    importance: 0,
    tweets: [],
    title: "",
    place: "",
    lat: 0,
    lon: 0,
    date: ""
  }
  if (($('#locInput').val() != '') && (($("#locCheck").prop('checked')) == true)) { //se la stringa place non è vuota
    search.place = $('#locInput').val();
    $.ajax({
      url: "https://nominatim.openstreetmap.org/search?q=" + search.place + "&format=geojson",

      success: function (dati) {
        if (dati.features[0] != undefined) { //SE LA CITTA' INSERITA VIENE TROVATA
          search.lon = dati.features[0].geometry.coordinates[0];
          search.lat = dati.features[0].geometry.coordinates[1];
          search.importance = (dati.features[0].properties.importance) / 9;
          search.lon = parseFloat(parseInt(search.lon*10))/10;
          search.lat = parseFloat(parseInt(search.lat*10))/10;
          var sendData = {  // inizializzazione dati da inviare
            q: "a",
            lat1: search.lat-0.3,
            long1: search.lon-0.3,
            lat2: search.lat+0.3,
            long2: search.lon+0.3
          }
          sendData.q = $('#Tweet_src').val(); // impostato la query alla parola scritta nella barra della ricerca
          search.title = sendData.q;
          $.ajax({
            url: '/api/tweets/startStream',
            type: 'POST',
            data: JSON.stringify({ term: sendData.q, lon1: sendData.long1, lat1: sendData.lat1, lon2: sendData.long2, lat2: sendData.lat2}),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
              var currentdate = new Date();
              var datetime = "" + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " +
                currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
              search.date = datetime;
              myLive.activateStream(search);
            },
            error: function (response) {
              myErrorHandler.displayError("Stream didn't start, please try again");
              // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
            }
          });
        } else {   //SE LA CITTA' INSERITA NON VIENE TROVATA
        myErrorHandler.displayError("City not found");
        }
      },
      error: function (response) {
        myErrorHandler.displayError("City not found");
      }
    })
  } else {
    var sendData = {  // inizializzazione dati da inviare
      q: "a",
      lat1: '',
      long1: '',
      lat2: '',
      long2: ''
    }
    sendData.q = $('#Tweet_src').val(); // impostato la query alla parola scritta nella barra della ricerca
    search.title = sendData.q;
    $.ajax({
      url: '/api/tweets/startStream',
      type: 'POST',
      data: JSON.stringify({ term: sendData.q, lon1: sendData.long1, lat1: sendData.lat1, lon2: sendData.long2, lat2: sendData.lat2}),
      contentType: "application/json; charset=utf-8",
      success: function (response) {
        var currentdate = new Date();
        var datetime = "" + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " +
          currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
        search.date = datetime;
        myLive.activateStream(search);
      },
      error: function (response) {
        myErrorHandler.displayError("Stream didn't start, please try again");
        // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      }
    });
  }
}

function requestUser() {
  var search = {
    tweets: [],
    title: "",
    date: ""
  }
  var sendData = {  // inizializzazione dati da inviare
    q: "a"
  }
  sendData.q = $('#Tweet_src').val(); // impostato la query alla parola scritta nella barra della ricerca
  search.title = sendData.q;
  $.ajax({
    url: '/api/tweets/followList?q=' + sendData.q,
    success: function (response) {
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati
      search.tweets = response;
      var currentdate = new Date();
      var datetime = "" + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " +
      currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
      search.date = datetime;
      myFollow.switchUser(search);
      },
      error: function (response) {
        myErrorHandler.displayError('User not found');
        // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      }
    });
}


function requestTweets() {
  var search = {
    importance: 0,
    tweets: [],
    title: "",
    place: "",
    lat: 0,
    lon: 0,
    date: ""
  }
  //CONTROLLARE STRINGA VUOTA INPUT
  if (($('#locInput').val() != '') && (($("#locCheck").prop('checked')) == true)) { //se la stringa place non è vuota
    search.place = $('#locInput').val();
    $.ajax({
      url: "https://nominatim.openstreetmap.org/search?q=" + search.place + "&format=geojson",

      success: function (dati) {
        if (dati.features[0] != undefined) { //SE LA CITTA' INSERITA VIENE TROVATA
          search.lon = dati.features[0].geometry.coordinates[0];
          search.lat = dati.features[0].geometry.coordinates[1];
          search.importance = (dati.features[0].properties.importance) / 9;
          var sendData = {  // inizializzazione dati da inviare
            q: "a",
            count: 100,
            lat: search.lat,
            long: search.lon,
            range: (search.importance * 90) + 'mi'
          }
          sendData.q = $('#Tweet_src').val(); // impostato la query alla parola scritta nella barra della ricerca
          search.title = sendData.q
          $.ajax({
            url: '/api/tweets/tweetlist?q=' + sendData.q + '&count=' + sendData.count + '&lat=' + sendData.lat + '&long=' + sendData.long + '&range=' + sendData.range,
            success: function (response) {
              //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati

              search.tweets = response;
              var currentdate = new Date();
              var datetime = "" + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " +
                currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
              search.date = datetime;
              myStandard.addSearch(search);

              //tweetArray.id = searchesArray.length - 1
              //createHome()
              //ListElement();
            },
            error: function (response) {
              myErrorHandler.displayError("Couldn't find tweets");
              // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
            }
          });
        }
        else {   //SE LA CITTA' INSERITA NON VIENE TROVATA
        myErrorHandler.displayError("City not found");
        }
      },
      error: function (response) {
        myErrorHandler.displayError("City not found");
      }
    })
  }
  else { //senza geolocalizzazione
    var sendData = {  // inizializzazione dati da inviare
      q: "a",
      count: 100
    }
    sendData.q = $('#Tweet_src').val(); // impostato la query alla parola scritta nella barra della ricerca
    search.title = sendData.q;
    $.ajax({
      url: '/api/tweets/tweetlist?q=' + sendData.q + '&count=' + sendData.count,
      success: function (response) {
        //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati
        for (let i = 0; i < response.length; i++) {
          response[i].geo_lat = "";
          response[i].geo_lon = "";
        }
        search.tweets = response;
        var currentdate = new Date();
        var datetime = "" + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " +
          currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
        search.date = datetime;
        myStandard.addSearch(search)
        //tweetArray.id = searchesArray.length - 1
      },
      error: function (response) {
        myErrorHandler.displayError("Couldn't find tweets");
        // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      }
    });
  }

}

function chooseRequestOldSearches(){
  if ($('#option_Search').hasClass('active')) {
    requestOldSearches();
  } else if ($('#option_Live').hasClass('active')) {
    requestOldStreams();
  } else {
    requestOldFollows();
  }
}

function chooseRequestSearch(index){
  if ($('#option_Search').hasClass('active')) {
    requestSearch(index);
  } else if ($('#option_Live').hasClass('active')) {
    requestStream(index);
  } else {
    requestFollow(index);
  }
}

function chooseSaveToServer(){
  if ($('#option_Search').hasClass('active')) {
    myStandard.saveToServer();
  } else if ($('#option_Live').hasClass('active')) {
    myLive.saveToServer();
  } else {
    myFollow.saveToServer();
  }
}

function requestOldFollows() {
  var list = document.getElementById("oldSearches_list");
  list.innerHTML = "";
  $.ajax({
    url: '/api/tweets/loadUserList',
    success: function (response) {
      myFollow.loadOldSearchesList(response);
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati
      for (let index = response.length - 1; index >= 0; index--) {
        const o = response[index];
        var title = (response.length - index) + ') ' + o.replace(".json", "")
        list.innerHTML += `<li onclick="chooseRequestSearch(${index})"><a class="list-item small dropdown-item p-2" href="#"><span> ${title} </span></a></li> `
      }

    },
    error: function (response) {
      // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      if(response.responseJSON.msg === 'empty'){
        myErrorHandler.displayError('There are no previously saved users');
      } else {
        myErrorHandler.displayError("Couldn't find any saved users");
      }
    }
  });
}

function requestOldStreams() {
  var list = document.getElementById("oldSearches_list");
  list.innerHTML = "";
  $.ajax({
    url: '/api/tweets/loadStreamList',
    success: function (response) {
      console.log(response);
      myLive.loadOldSearchesList(response);
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati
      for (let index = response.length - 1; index >= 0; index--) {
        const o = response[index];
        var title = (response.length - index) + ') ' + o.replace(".json", "")
        list.innerHTML += `<li onclick="chooseRequestSearch(${index})"><a class="list-item small dropdown-item p-2" href="#"><span> ${title} </span></a></li> `
      }

    },
    error: function (response) {
      // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      if(response.responseJSON.msg === 'empty'){
        myErrorHandler.displayError('There are no previously saved streams');
      } else {
        myErrorHandler.displayError("Couldn't find any saved streams");
      }
    }
  });
}

function requestOldSearches() {
  var list = document.getElementById("oldSearches_list");
  list.innerHTML = "";
  $.ajax({
    url: '/api/tweets/loadSearchList',
    success: function (response) {
      myStandard.loadOldSearchesList(response);
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati
      for (let index = response.length - 1; index >= 0; index--) {
        const o = response[index];
        var title = (response.length - index) + ') ' + o.replace(".json", "")
        list.innerHTML += `<li onclick="chooseRequestSearch(${index})"><a class="list-item small dropdown-item p-2" href="#"><span> ${title} </span></a></li> `
      }

    },
    error: function (response) {
      // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      if(response.responseJSON.msg === 'empty'){
        myErrorHandler.displayError('There are no previously saved searches');
      } else {
        myErrorHandler.displayError("Couldn't find any saved searches");
      }
    }
  });
}

function requestFollow(index) {
  var filename = myFollow.getOldSearches();
  $.ajax({
    url: '/api/tweets/loadUser?id=' + filename[index],
    success: function (response) {
      myFollow.switchUser(response);
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati

    },
    error: function (response) {
      // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      myErrorHandler.displayError("Couldn't load user");
    }
  });
}

function requestSearch(index) {
  var filename = myStandard.getOldSearches();
  $.ajax({
    url: '/api/tweets/loadSearch?id=' + filename[index],
    success: function (response) {
      myStandard.changeSearces(response);
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati

    },
    error: function (response) {
      // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      myErrorHandler.displayError("Couldn't load searches");
    }
  });
}

function requestStream(index) {
  var filename = myLive.getOldSearches();
  $.ajax({
    url: '/api/tweets/loadStream?id=' + filename[index],
    success: function (response) {
      if(myLive.getActiveStream !== null){
        stopStreaming();
      }
      myLive.changeSearces(response);
      //qui dentro hai response che rappresenta l'array che arriva dal server, in più get è asincrono, perciò DEVI scrivere qui quello che deve succedere una volta che i dati sono arrivati
    },
    error: function (response) {
      // qui dentro hai di nuovo response, ma non saranno tweet, sarà invece un messaggio di errore da handlare sempre qui con magari uno switch statement
      myErrorHandler.displayError("Couldn't load streams");
    }
  });
}

function allTweetsClick() {
  //aggiorno le mappe e la home
  if (myStandard.getSelectedSearch() !== null) {
    var searches = myStandard.getSearches();
    if ($("#allTweets").hasClass("pfalse")) {
      myGeoMap.removeDisplayedSearch(myStandard.getSelectedSearch());
      myWordMap.empty();
      myGeoMap.displaySearches();
      var searchesTweets = [];
      for (let searchIndex = 0; searchIndex < searches.length; searchIndex++) {
        for (let tweetIndex = 0; tweetIndex < searches[searchIndex].tweets.length; tweetIndex++) {
          searchesTweets.push(searches[searchIndex].tweets[tweetIndex]);
        }
      }
      myWordMap.createWordMap(searchesTweets);
    } else {
      myGeoMap.removeAllDisplayed();
      myWordMap.empty();
      myGeoMap.displaySearch(myStandard.getSelectedSearch());
      myWordMap.createWordMap(searches[myStandard.getSelectedSearch()].tweets);
    }
  }
  //settiamo il toggle correttamente usando delle classi vuote
  if ($("#allTweets").hasClass("pfalse")) {
    $("#allTweets").removeClass("pfalse").addClass("ptrue");
  } else {
    $("#allTweets").removeClass("ptrue").addClass("pfalse");
  }
}

function stopRequestLiveRetrieve() {
  $.ajax({
    url: '/api/tweets/stopStream',
    type: 'DELETE',
    contentType: "application/json; charset=utf-8",
    success: function (response) {                        // -- What happens on success
      console.log(response);
    },
    error:                                               // -- What happens on error and handling
      function (response) {
        console.log(response);
      }
  });
}

function requestLiveRetrieve() {
  $.ajax({
    url: '/api/tweets/getStreamedTweets',
    type: 'GET',
    contentType: "application/json; charset=utf-8",
    success: function (response) {                        // -- What happens on success
      myLive.addToSearch(response);
    },
    error:                                               // -- What happens on error and handling
      function (response) {
        console.log(response);
      }
  });
}

function stopStreaming(){
  myWordMap.empty();
  myWordMap.createWordMap(myLive.getSearches()[myLive.getSelectedSearch()].tweets);
  myLive.stopRequestLoop();
  stopRequestLiveRetrieve();
  $('#loadingDiv').hide();
  $('#home').css('height', '80vh');
}

function checkAcceptedWord(word){
  var notAccepted = ["the", "il", "ai", "hai", "ha", 'ho', "lo", "la", "gli", "le", "di", "del", "dal", "dell", "dei", "degli", "all", "alla", "alle", "agli", "da", "al", "della", "de", "dagli", "dalle", "dai", "in", "con", "com", "en", "it", "su", "sui",
    "per", "tra", "fra", "un", "nel", "uno", "una", "ci", "vi", "ti", "sul", "sulle", "sulla", "sugli", "mi", "http", "https", "si", "ma", "un'", "che", "and", "or", "thy", "of", "non", "che"];
  var accepted = true;
  for (let index = 0; index < notAccepted.length; index++) {
    if(word === notAccepted[index]){
      accepted = false;
    }
  }

  return accepted;
}

function checkAcceptedChar(letter){
  notAccepted = ['\'', '"', ',', '.', ':', ';', '-', '_', '#', ' ', '§', '°', '@', 'ç', '(', ')', '[', ']', '{', '}', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '^', '?', '\\', '=', '/', '&', '%', '$', '£', '!', '|', '+', '`'];
  var accepted = true;
  for (let index = 0; index < notAccepted.length; index++) {
    if(letter === notAccepted[index]){
      accepted = false;
    }
  }
  return accepted;
}


$(document).ready(function () {
  $('#loadingDiv').hide();

  myGeoMap.createGeoMap();

  //inizializzo la colonna centrale
  $("#geoMap").hide();
  $("#wordMap").hide();
  $("#home").show();

  $("#option_WordMap").click(function (e) {
    $("#home").hide();
    $("#geoMap").hide();
    $("#wordMap").show();
    $('#loadingDiv').hide();
    $('#home').css('height', '80vh');
  })
  $("#option_Map").click(function (e) {
    $("#home").hide();
    $("#wordMap").hide();
    $("#geoMap").show();
    $('#loadingDiv').hide();
    $('#home').css('height', '80vh');
  })
  $("#option_Home").click(function (e) {
    $("#geoMap").hide();
    $("#wordMap").hide();
    $("#home").show();
    if(myLive.activeStream !== null){
      $('#loadingDiv').show();
      $('#home').css('height', '75vh');
    }
  })

  //LIVE
  $("#Live_input").change(function () {
    if ($(this).prop('checked')) {
      section = -1 //Setto la sezione
      var form = document.getElementById("twt_settings")
      var nodoLive = document.createElement("button")
      nodoLive.setAttribute("class", "btn btn-danger mt-5")
      nodoLive.setAttribute("id", "stop_btn")
      nodoLive.setAttribute("onclick", "stopStreaming()")
      nodoLive.innerHTML = "STOP";
      form.replaceChild(nodoLive, form.childNodes[4]);
    }
    myStandard.deleteSearches();
    myFollow.deleteUser();
    myHome.empty();
    myWordMap.empty();
    myGeoMap.changeUserMarkers(null);
    myGeoMap.deleteAllMarkers();
    setLogoInHome();
    if($("#allTweets").hasClass('ptrue')){
      $("#allTweets").removeClass('ptrue').addClass('pfalse');
    }
    $("#allTweets").hide();
    $('#optionsDiv').css('visibility', 'visible');
    $('#Tweet_src').attr('placeholder', 'Search for Tweets...');
})

  //SEARCH
  $("#Search_input").change(function () {
    if ($(this).prop('checked')) {
      section = 0
      var form = document.getElementById("twt_settings")
      var nodoLive = document.createElement("div")
      form.replaceChild(nodoLive, form.childNodes[4]);
    }
    myLive.deleteSearches();
    stopRequestLiveRetrieve();
    myFollow.deleteUser();
    myHome.empty();
    myWordMap.empty();
    myGeoMap.changeUserMarkers(null);
    myGeoMap.deleteAllMarkers();
    setLogoInHome();
    if($("#allTweets").hasClass('ptrue')){
      $("#allTweets").removeClass('ptrue').addClass('pfalse');
    }
    $("#allTweets").show();
    
  $('#loadingDiv').hide();
  $('#home').css('height', '80vh');
  $('#optionsDiv').css('visibility', 'visible');
  $('#Tweet_src').attr('placeholder', 'Search for Tweets...');
  })

  //FOLLOW
  $("#Follow_input").change(function () {
    if ($(this).prop('checked')) {
      section = 1
      var form = document.getElementById("twt_settings")
      var nodoLive = document.createElement("input")
      nodoLive.setAttribute("type", "text")
      nodoLive.setAttribute("class", "mt-5")
      nodoLive.setAttribute("placeholder", "Username...")
      form.replaceChild(nodoLive, form.childNodes[4]);
    }
    myStandard.deleteSearches();
    myLive.deleteSearches();
    stopRequestLiveRetrieve();
    myHome.empty();
    myWordMap.empty();
    myGeoMap.deleteAllMarkers();
    setLogoInHome();
    if($("#allTweets").hasClass('ptrue')){
      $("#allTweets").removeClass('ptrue').addClass('pfalse');
    }
    $("#allTweets").hide();
    $('#loadingDiv').hide();
    $('#home').css('height', '80vh');
    $('#optionsDiv').css('visibility', 'hidden');
    $('#Tweet_src').attr('placeholder', 'Search by screen name...  i.e. emmawatson');
    
  })
  //------------------------------------------

  //disabilito l'inserimento della localizzazione se il checkbox non è spuntato e viceversa
  $("#locCheck").click(function () {
    if (($("#locCheck").prop('checked')) == false)
      $("#locInput").prop("disabled", true);
    if (($("#locCheck").prop('checked')) == true)
      $("#locInput").prop("disabled", false);
  });

  $('#Tweet_src').on('keydown', function (e) {
    if (/^(13)$/.test(e.which)) {
      e.preventDefault();
      $("#search").click();
    }
  });

});

