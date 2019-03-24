import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import leaflet from 'leaflet';

import { Hose, hType } from '../../app/shared/hose/hose';
import { Pump, pType } from '../../app/shared/pump/pump';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('LMap') mapContainer: ElementRef;
  map: any;
  lat = 51.704791;
  lng = 8.772462;
  markerGroup;
  equipmentGroup;
  lastWayPoint = [];
  wayPoints= [];
  wayLength = 0;
  calcEnabled = false;
  hoseLists = [];
  pumpLists = [];
  totalGPSPoints = [];
  lx_pumpList = [["Hannibal",125,3,1,1],["Wilo",34,1.9,3,3],["Chiemsee",30,1.4,3,3]]; //Tuple aus Name,maxFlow und maxBar,maxPumps,leftPumps
  lx_hoseList = [["F",20,30,30],["A",20,30,30],["B",20,30,30]]; //Name,Länge,MaxSchläuche,leftSchläuche


  //settings
  interpolationDistance = 10;

  //Leaflet-Icons
  userIcon = leaflet.icon({
    iconUrl: '/assets/icon/hard-hat-solid.svg',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  //Icon für Pumpe Hannibal
  pumpIcon = leaflet.icon({
    iconUrl: '/assets/icon/hannibal-pump-icon.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

   //Icon für Pumpe Chiemsee
  chiPumpIcon = leaflet.icon({
    iconUrl: '/assets/icon/zwischenpumpe-icon.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

   //Icon für Pumpe Wilo
 wilPumpIcon = leaflet.icon({
    iconUrl: '/assets/icon/saugpumpe-icon.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
     //Icon für Out of Pumps
 ooPumpIcon = leaflet.icon({
    iconUrl: '/assets/icon/oo-pumps-icon.png',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });



  constructor(public navCtrl: NavController, private alertCtrl: AlertController, public modalCtrl: ModalController) {

  }

  ionViewDidEnter() {
    this.loadMap();
    this.hoseLists = this.setHoseList();
    this.pumpLists = this.setPumpList(); 
  }

  reset() {
    this.lastWayPoint = [];
    this.wayPoints= [];
    this.wayLength = 0;
    this.calcEnabled = false;
    this.hoseLists = [];
    this.pumpLists = [];
    this.totalGPSPoints = [];

    for(let m in this.wayPoints) {
      this.map.removeLayer(m);
    }
    //this.navCtrl.setRoot(this.navCtrl.getActive().component);

  }

  loadMap() {
    this.map = new leaflet.map("LMap").setView([this.lat, this.lng], 16);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'BeWaFoe',
      maxZoom: 18
      }).addTo(this.map);

      this.map.locate({
        setView: true,
        maxZoom: 18
      }).on('locationfound', (e) => {
        console.log('UserLocation found');
      });

      //marker for current position
      //TODO: maybe change if moving
      this.markerGroup = new leaflet.featureGroup();
      let marker: any = leaflet.marker([this.lat, this.lng], {icon: this.userIcon}).on('click', () => {
        alert('This is your position!');
      });
      this.markerGroup.addLayer(marker);
      this.map.addLayer(this.markerGroup);

      //OnClick in Map
      this.map.on('click', (e) => {
        this.addMapMarker(e.latlng.lat, e.latlng.lng);
      });

      //FeatureGroup for equipment
      this.equipmentGroup = new leaflet.featureGroup();

  }

  openRessources() {
    //TODO Listenobjekt
    var data = { list : 'hello world' };

    let modalPage = this.modalCtrl.create('RessourceModalPage', data);
    modalPage.present(); 
  }


  addMapMarker(posLat, posLng) {

    let newWayMarker: any = leaflet.marker([posLat, posLng]).on('click', () => {
      alert('This is a wayPoint! ' + posLat + " " + posLng);
    });
    this.markerGroup.addLayer(newWayMarker);
    this.map.addLayer(this.markerGroup);

    this.wayPoints.push(newWayMarker);

    //draw lines between new and last Point
    if (this.lastWayPoint.length > 0) {
      let newWayLine: any = leaflet.polyline([[this.lastWayPoint[0],this.lastWayPoint[1]],[posLat, posLng]]);
      newWayLine.setStyle({
            color: 'black'
        });
      this.markerGroup.addLayer(newWayLine);
      this.map.addLayer(this.markerGroup);
    }

    this.lastWayPoint = [posLat, posLng];
    

    if (this.wayPoints.length > 1) {
      this.calcEnabled = true;
      this.wayLength = Math.round(this.getWayLength());
    }
  }


  getDistance(p1, p2){
    //TODO: New function to calc with elevation
    let m1: any = leaflet.marker(p1);
    let m2: any = leaflet.marker(p2)
    return m1.getLatLng().distanceTo(m2.getLatLng());
  }


  getWayLength(){
    let distanceSum = 0;
    for(var _i = 0; _i < this.wayPoints.length; _i++) {
      if (_i > 0) {
        let m1 = this.wayPoints[_i-1];
        let m2 = this.wayPoints[_i];

        let points = [];

        let p1 = [m1.getLatLng().lat, m1.getLatLng().lng];
        let p2 = [m2.getLatLng().lat, m2.getLatLng().lng];

        if (this.getDistance(p1, p2) > this.interpolationDistance) {
          points = this.calcInterpolation(p1, p2);
        } else {
          points = [p1, p2]
        }

        for(var _j = 0; _j < points.length; _j++) {
          if (_j > 0) {
            distanceSum += this.getDistance(points[_j - 1], points[_j]);
          }
        }
        //TODO: goonwithpoints;
        //distanceSum += this.wayPoints[_i-1].getLatLng().distanceTo(this.wayPoints[_i].getLatLng());
      }
    }
    return distanceSum;
  }


  calcInterpolation(p1, p2) {

    let points = [];
    points.push(p1);

    //vector between p1 & p2
    let v = [p2[0]-p1[0], p2[1]-p1[1]];

    //amount of vector between p1 & p2
    let vb = Math.sqrt(v[0]*v[0] + v[1]*v[1]);

    //normalized vector between P1 & p2
    let vn = [v[0]/vb, v[1]/vb];

    //1m in degreesystem
    let vbn = vb / this.getDistance(p1, p2);

    let dist = this.getDistance(p1, p2) / this.interpolationDistance;

    for(let i = 0; i < dist - 1; i++) {
      let pi = [p1[0] + this.interpolationDistance * vbn * vn[0], p1[1] + this.interpolationDistance * vbn * vn[1]];
      points.push(pi);

      p1 = pi;
    }

    points.push(p2);

    return points;

  }
  drawHardcodedPumps() {
   this.calcAllGPSPoints();
   let pumpMarker: any = leaflet.marker(this.totalGPSPoints[0], {icon: this.pumpIcon}).on('click', () => {
          alert('This is a Hannibal Pump!');});
   var gpspointlength = this.totalGPSPoints.length;
   var aktivePoint = 10; 
   while (this.totalGPSPoints.length > aktivePoint)
    {
      if (this.lx_pumpList[1][5] >= this.lx_pumpList[1][4])
        {
        let pumpMarker: any = leaflet.marker(this.totalGPSPoints[aktivePoint], {icon: this.wilPumpIcon}).on('click', () => {
            alert('This is a Wilo Pump!');});
            aktivePoint = aktivePoint + 5
        }
      else
        {
        if (this.lx_pumpList[2][5] >= this.lx_pumpList[2][4])
        {
        let pumpMarker: any = leaflet.marker(this.totalGPSPoints[aktivePoint], {icon: this.chiPumpIcon}).on('click', () => {
            alert('This is a Chiemsee Pump!');});
            aktivePoint = aktivePoint + 2
        }
      else
      {
      let pumpMarker: any = leaflet.marker(this.totalGPSPoints[aktivePoint], {icon: this.ooPumpIcon}).on('click', () => {
            alert('Out of Pumps!');});
      } 
       
       }
    }
        this.equipmentGroup.addLayer(pumpMarker);
        this.map.addLayer(this.equipmentGroup);
      //  document.getElementById("lengthsplit").innerHTML = gpspointlength;
  }

/*
  // Auf der Map die Pumpen zeichnen
  drawPumps()
  {
  var startpoint = this.totalGPSPoints[0]; //GPS points haben 10m unterschied, 1. & Letze Punkt ~10m
  let pumpMarker: any = leaflet.marker(startpoint, {icon: this.pumpIcon}).on('click', () => {
          alert('This is a Hannibal Pump!'); });
  var hanniAmmount = 1;
  var chiemAmmount = 0;
  var wiloAmmount = 0;
  var pumpAmmount = 1;
  var reachedLength = 200;
  while (pumpAmmount <= this.totalGPSPoints.length)
    {
      if (this.lx_pumpList[0][5] >= this.lx_pumpList[0][4])
      {
      var ppoint = this.totalGPSPoint[reachedLength/20];
      var pumpname = "Hannibal";
      drawNextPump(ppoint,pumpname);
      }
      
    }
  }

  drawNextPump(point,pumpname)
  {
  
  }
  */
  calc() {
    //STEP 1: Check if total waylength > totalthoselength

    //buildtrack

    
  }


  getElevation(p){
    return 0;
    //tbd wget
    // BSP: https://api.open-elevation.com/api/v1/lookup?locations=41.161758,-8.583933
  }






  //
  //
  //
  //Aus JS-Script
  //
  //
  //


  createHanniPump(){
    var hPump = new Pump(pType.allroundPump, hType.f);
    hPump.name = "Hannibal NRS 150-315";
    hPump.id = "h1";
    hPump.pressure = 3.0;
    hPump.flowVolume = 125;
    return hPump;
  }

  createChiemPump(){
    var cPump = new Pump(pType.inlinePump, hType.a);
    cPump.name = "Chiemsee EX V06B";
    cPump.id = "c1";
    cPump.pressure = 1.4;
    cPump.flowVolume = 30;
    return cPump;
  }

  createWiloPump(){
    var wPump = new Pump(pType.suctionPump, hType.a);
    wPump.name = "WILO TP100E230-70";
    wPump.id = "w1";
    wPump.pressure = 1.9;
    wPump.flowVolume = 34;
    return wPump;
  }


  setPumpList() {
    var pumpLists = [];

    var hanniList = [];


    for (var i = 0; i < 1; i++) {
        hanniList.push(this.createHanniPump());
    }

    pumpLists["h" + 125] = hanniList;

    var chiemList = [];


    pumpLists["c" + 30] = chiemList;

    for (var i = 0; i < 4; i++) {
        chiemList.push(this.createChiemPump());
    }

    var wiloList = [];


    pumpLists["w" + 34] = wiloList;

    for (var i = 0; i < 4; i++) {
        wiloList.push(this.createWiloPump());
    }

    return pumpLists;
  }

  createFHose(){
    var fHose = new Hose(hType.f);
    fHose.name = "Schlauch Typ F";
    fHose.id = "f1";
    fHose.length = 20;
    return fHose;
  }

  createBHose(){
    var bHose = new Hose(hType.b);
    bHose.name = "Schlauch Typ B";
    bHose.id = "b1";
    bHose.length = 20;
    return bHose;
  }

  createAHose(){
    var aHose = new Hose(hType.a);
    aHose.name = "Schlauch Typ A";
    aHose.id = "a1";
    aHose.length = 20;
    return aHose;
  }

  setHoseList() {
    var hoseLists = [];

    var fHoseList = [];


    for (var i = 0; i < 30; i++) {
        fHoseList.push(this.createFHose());
    }

    hoseLists["f" + 20] = fHoseList;

    var bHoseList = [];


    for (var i = 0; i < 30; i++) {
        bHoseList.push(this.createBHose());
    }

    hoseLists["b" + 20] = bHoseList;

    var aHoseList = [];


    for (var i = 0; i < 30; i++) {
        aHoseList.push(this.createAHose());
    }
    hoseLists["a" + 20] = aHoseList;

    return hoseLists;
  }

   
  getPressureDiff(hose, heightDiff, flow) {
    return -(heightDiff / 10 + hose.pLoss(flow));
  }

  calcTrack(gpsList, hoseLists, pumpLists) {
    var totalDistance = 0;
    for (var i = 0; i < gpsList.length - 1; i++) {
        totalDistance += this.getDistance(gpsList[i], gpsList[i + 1]);
    }

    var fLength = 0;
    var aLength = 0;
    var bLength = 0;

    for (let hId in hoseLists) {
        var hose = hoseLists[hId][0];
        if (hose.type == hType.f) {
            fLength += hose.length * hoseLists[hId].length;
        }

        if (hose.type == hType.a) {
            aLength += hose.length * hoseLists[hId].length;
        }

        if (hose.type == hType.b) {
            bLength += hose.length * hoseLists[hId].length;
        }
    }

    if (totalDistance > fLength + aLength + bLength) {
        alert("Strecke zu lang, mehr Schläuche benötigt.");
        return;
    }
    var totalPressure = 0;

    for (let pId in pumpLists) {
        var list = pumpLists[pId];
        var p = list[0].pressure;
        totalPressure += p * list.length;
    }

    var neededPreasure = totalDistance / 100 + (this.getElevation(gpsList[0]) - this.getElevation(gpsList[gpsList.length - 1])) / 10;
    if (neededPreasure > totalPressure * 1.5) {
        alert("Nicht genügend Pumpen, um die Strecke zu überwinden");
        return;
    }

  }

  sortHoseLists(hoseLists){
    var hLists = [];
     for (let hId in hoseLists) {
        hLists.push(hoseLists[hId])
    }

    hLists.sort(function (a, b) {
        return (b[0].flowMax + b[0].length) - (a[0].flowMax + a[0].length);
    });

    var sortHLists = [];

    for (var i = 0; i < hLists.length; i++) {
        for (var j = 0; j < hLists[i].length; j++) {
            sortHLists.push(hLists[i][j]);
        }
    }

    return sortHLists;
  }
  sortPumpLists(pumpLists) {
    
    var pLists = [];

    for (let pId in pumpLists) {
        pLists.push(pumpLists[pId])
    }

   
    pLists.sort(function (a, b) {
        return (b[0].flowVolume) - (a[0].flowVolume);
    });

    var sortPumpLists = [];

    for (var i = 0; i<pLists.length; i++) {
        for (var j = 0; j < pLists[i].length; j++) {
            sortPumpLists.push(pLists[i][j]);
        }
    }

    return sortPumpLists;
  }



  buildTrack(gpsList, hoseLists, pumpLists, maxFlow) {
    var shLists = this.sortHoseLists(hoseLists);
    var spLists = this.sortPumpLists(pumpLists);

    var coveredLength = 0;
    var coveredHeight = 0;

    var usedPumps = [];
    var pressure = 0;
    var actHoseLength = 0;
    var saveGPS = 0;
    var startPump;
    usedPumps.push(startPump);


    if(spLists[0].type == pType.inlinePump){
      var h = false;
      for(var i = 0; i<spLists.length; i++){
        if(spLists[i].type != pType.inlinePump){
          startPump = spLists.splice(i, 1);
          break;
        }
      }
      if(h) {
        alert("Nur Verstärkerpumpen vorhanden, bitte Tauchpumpe oder Ansaugpumpe hinzufügen!");
        return;
      }
    } else{
      startPump = spLists.shift();
    }

    pressure = startPump.pressure;

    if (startPump.out != hType.f) {
        while (shLists.length > 0 && shLists[0].out == hType.f) shLists.shift();
    }

    var startHose = shLists.shift();
    actHoseLength = startHose.length;

    if(startPump.flowVolume<maxFlow){
      return this.buildTrack(gpsList, hoseLists, pumpLists, startPump.flowVolume)
    }

    if(startHose.maxFlow<maxFlow){
      return this.buildTrack(gpsList, hoseLists, pumpLists, startHose.maxFlow)
    }

    var lastGPS = gpsList[0];
    saveGPS = 0;

    var trackList = [];

    startPump.pos = gpsList[0];
    trackList.push(startPump);

    startHose.pos = gpsList[0];
    trackList.push(startHose);

    var gpsIterator = 1;

    // run drawn track to the end
    while (gpsIterator < gpsList.length) {
      
      //if (shLists.length == 0) {
      //  alert('Nicht genügend Schläuche!');
      //  return;
      //}

      var newGPS = gpsList[gpsIterator];

      var dist = this.getDistance(lastGPS, newGPS);

      var pDiff = this.getPressureDiff(startHose, this.getElevation(newGPS) - this.getElevation(lastGPS), maxFlow);

      if(pressure + pDiff < 1){
        
        if(gpsIterator==gpsList.length){
          alert("Nicht genügend Pumpen!!");
          return;
        }
        var nextPump = spLists.shift();
        if(nextPump.flowVolume<maxFlow) return this.buildTrack(gpsList, hoseLists, pumpLists, nextPump.flowVolume);
        if(nextPump.type == pType.inlinePump) pressure += nextPump.pressure;
        else pressure = nextPump.pressure;
        newGPS = gpsList[saveGPS];
        var nHose = trackList.pop();
        if(nHose instanceof Hose) {
          if (nextPump.out == hType.f && nHose.type != hType.f) {
            while (shLists.length > 0 && shLists[0].out == hType.f) shLists.shift();
            nHose = shLists.shift(); //WARNUNG nicht ganz korrekt
            if(nHose.maxFlow<maxFlow){
              return this.buildTrack(gpsList, hoseLists, pumpLists, nHose.maxFlow)
            }
            nextPump.pos = newGPS;
            trackList.push(nextPump);
            actHoseLength = nHose.length;
            nHose.pos = newGPS;
            trackList.push(nHose);
          }else{
            nHose = shLists.shift();
            if(nHose.maxFlow<maxFlow){
              return this.buildTrack(gpsList, hoseLists, pumpLists, nHose.maxFlow)
            }
            trackList.push(nextPump);
            trackList.push(nextPump);
            actHoseLength = nHose.length;
            nHose.pos = newGPS;
            trackList.push(nHose);
          }
          gpsIterator = saveGPS;
          pressure += pDiff;
        } else {
          alert("two pumps in the same spot!!");
          return;
        }
      }
      else{
        if(actHoseLength-dist>0){
          actHoseLength -= dist;
          lastGPS = newGPS;
          pressure += pDiff;
        }
        else{
          var nHose = shLists.shift();
          actHoseLength += nHose.length - dist;
          nHose.pos = lastGPS;
          trackList.push(nHose);
          gpsIterator--;
        }
      }

      gpsIterator++;
      lastGPS = newGPS;
      if(gpsIterator == gpsList.length) break;
    }

    return trackList;

  }


  calcAllGPSPoints(){
    //alle GPS-Punkte laden
    var splitlength = 0;
    var activeA = 0;
    var activeB = 1;
    var totalGPSPoints = [];
    var reachedLengthAB = 0;
    while (splitlength < this.getWayLength())
    {
      var splitpointA = this.wayPoints[activeA];
      var splitpointB = this.wayPoints[activeB];
      splitlength = splitlength + this.getDistance(splitpointA, splitpointB);
      for (let x in this.calcInterpolation(splitpointA, splitpointB))
      {
        totalGPSPoints.push(x);
      }
      activeA++;
      activeB++;
    
     }




    /*
    for(var _i = 0; _i < this.wayPoints.length; _i++) {

     let points = [];

      
      if (_i > 0) {
        let m1 = this.wayPoints[_i-1];
        let m2 = this.wayPoints[_i];

        let p1 = [m1.getLatLng().lat, m1.getLatLng().lng];
        let p2 = [m2.getLatLng().lat, m2.getLatLng().lng];


        if(_i == 1) {
          this.totalGPSPoints.push(p1);
        }
        if (this.getDistance(p1, p2) > this.interpolationDistance) {
          points = this.calcInterpolation(p1, p2);
          points.shift();
        } else {
          points = [p2];
        }

        this.totalGPSPoints.concat(points);

      }
    }
    */
  }



  drawResult(){
    var pumpList = this.setPumpList();
    var hoseList = this.setHoseList();

    this.calcAllGPSPoints();

    this.calcTrack(this.totalGPSPoints, hoseList, pumpList);

   let tList = this.buildTrack(this.totalGPSPoints, hoseList, pumpList, 7500);

   let lastPoint = [];

    for(let tPoint of tList) {

      //Pumpe zeichnen [lat, long]
      if (tPoint instanceof Pump){        
        lastPoint = tPoint.pos;
        let pumpMarker: any = leaflet.marker(tPoint.pos, {icon: this.pumpIcon}).on('click', () => {
          alert('This is a pump!');
        });
        this.equipmentGroup.addLayer(pumpMarker);
        this.map.addLayer(this.equipmentGroup);
      }

      if(tPoint instanceof Hose) {
        //Schlauch zeichen [[lat, long],[lat, long]]
        let hoseLine: any = leaflet.polyline([lastPoint, tPoint.pos]);
        hoseLine.setStyle({
            color: 'blue'
        });
        this.equipmentGroup.addLayer(hoseLine);
        this.map.addLayer(this.equipmentGroup);

        lastPoint = tPoint.pos;
      }
    }

   
    

    
  }
}
