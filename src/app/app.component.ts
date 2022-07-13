import {Component, OnInit} from '@angular/core';
import * as leaflet from 'leaflet';
import {RestService} from './rest.service';
import {Magnetic} from "./magnetic";
import {CircleMarker} from "leaflet";

declare const HeatmapOverlay: any;

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = leaflet.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
leaflet.Marker.prototype.options.icon = iconDefault;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    private map: any;
    private heatmapLayer: any;
    private interval: any;
    public objectsData: any;
    public fieldData: any;
    public title: string="Magnetic Field";
    public previousCirclesArray: CircleMarker[] = [];
    constructor(
        private restService: RestService) {
    }

    ngOnInit(): void {
        this.initMap();
        this.fetchData();
        this.interval = setInterval(() => {
            this.fetchData(); // api call
        }, 5000);
    }

    private initMap(): void {

        this.map = leaflet.map('map', {
            center: [46.112035, -74.595982],
            zoom: 12
        });

        const tiles = leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 3,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        tiles.addTo(this.map);
        const heatLayerConfig = {
            "radius": 0.04,
            "maxOpacity": .5,
            "scaleRadius": true,
            "useLocalExtrema": true,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'value'
        };
        this.heatmapLayer = new HeatmapOverlay(heatLayerConfig);
        this.heatmapLayer.addTo(this.map);
    }

    private fetchData(): void {
        this.restService.getData().subscribe(response => {

            this.objectsData = response.filter(o => o.type === 'object');
            this.fieldData = response.filter(o => o.type !== 'object');
            if (this.previousCirclesArray !== undefined) {
                this.previousCirclesArray.forEach(obj => {
                        obj.remove();
                })
            }
            let temp: CircleMarker[] = [];
            this.objectsData.forEach((p: Magnetic) => {
                let k: CircleMarker = leaflet.circleMarker([p.lat, p.lng], {radius: 6}).addTo(this.map);
                temp = [...temp, k]
            })
            this.previousCirclesArray = temp;

            this.heatmapLayer.setData({data: this.fieldData});
        })

        this.restService.getTitle().subscribe(response => {
            this.title =  response;
        })
    }

}
