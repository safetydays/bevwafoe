import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import leaflet from 'leaflet';

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
  lastWayPoint = [];
  wayPoints= [];
  wayLength = 0;
  calcEnabled = false;

  //settings
  interpolationDistance = 10;

  constructor(public navCtrl: NavController, private alertCtrl: AlertController) {

  }

  ionViewDidEnter() {
    this.loadMap();
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
      //TODO: change if moving
      this.markerGroup = new leaflet.featureGroup();
      let marker: any = leaflet.marker([this.lat, this.lng]).on('click', () => {
        alert('This is your position!');
      });
      this.markerGroup.addLayer(marker);
      this.map.addLayer(this.markerGroup);

      //OnClick in Map
      this.map.on('click', (e) => {
        this.addMapMarker(e.latlng.lat, e.latlng.lng);
      });
  }

  addMapMarker(posLat, posLng) {

    let newWayMarker: any = leaflet.marker([posLat, posLng]).on('click', () => {
      alert('This is a wayPoint!');
    });
    this.markerGroup.addLayer(newWayMarker);
    this.map.addLayer(this.markerGroup);

    this.wayPoints.push(newWayMarker);

    //draw lines between new and last Point
    if (this.lastWayPoint.length > 0) {
      let newWayLine: any = leaflet.polyline([[this.lastWayPoint[0],this.lastWayPoint[1]],[posLat, posLng]]);
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



  calc() {
    //STEP 1: Check if total waylength > totalthoselength


    
  }


  getElevationFromMarker(marker){
    return 0;
    //tbd wget
    // BSP: https://api.open-elevation.com/api/v1/lookup?locations=41.161758,-8.583933
  }


}
