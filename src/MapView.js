import React, { useState, useRef } from "react";
import ReactMapboxGl, {
  Layer,
  GeoJSONLayer,
  Source,
  Feature,
  Popup,
} from "react-mapbox-gl";
import MapPopup from "./MapPopup";
import bank2 from "./61258.geojson";
import spaces from "./spaces.json";
import colors from "./colors.json";

const testCenter = [-122.40082, 37.79339];

const locations = [
  {
    longitude: -93.260418,
    latitude: 44.972232,
    imageSrc: "https://i.ibb.co/P5WNt04/Screenshot-2020-08-14-at-13-44-09.png",
  },
  {
    longitude: -93.251493,
    latitude: 44.946258,
    imageSrc: "https://i.ibb.co/P5WNt04/Screenshot-2020-08-14-at-13-44-09.png",
  },
  {
    longitude: -93.297557,
    latitude: 44.914635,
    imageSrc: "https://i.ibb.co/P5WNt04/Screenshot-2020-08-14-at-13-44-09.png",
  },
  {
    longitude: -93.305915,
    latitude: 44.826991,
    imageSrc: "https://i.ibb.co/P5WNt04/Screenshot-2020-08-14-at-13-44-09.png",
  },
  {
    longitude: -93.126403,
    latitude: 44.815478,
    imageSrc: "https://i.ibb.co/P5WNt04/Screenshot-2020-08-14-at-13-44-09.png",
  },
];

// const getCenter = coordinates => {}

const MapGl = ReactMapboxGl({
  // minZoom: 8,
  maxZoom: 25,
  accessToken:
    "pk.eyJ1IjoibWlsZS1mZiIsImEiOiJja2J0OWM3cW4wN3Q2MnVwY2dxbjM4Y3B0In0.X-ZKLHTLah0_hDDiussOQQ",
});

const paintRooms = {
  "fill-color": [
    "match",
    ["get", "facility"],
    "hall area",
    "#808080",
    "hallway",
    "#808080",
    "cafe",
    "#808080",
    "collaborative area",
    "#808080",
    "room",
    "#808080",
    "wall",
    "#000000",
    "lab",
    "grey",
    "elevator",
    "#808080",
    "stairs",
    "#808080",
    "bathroom",
    "#808080",
    "reception",
    "#808080",
    "unit",
    "#808080",
    "rgba(0,0,0,0)",
  ],
  "fill-opacity": 0.4,
};

const paintChairs = {
  "fill-color": [
    "match",
    ["get", "furnishing"],
    "desk",
    "black",
    "table",
    "#808080",
    "chair",
    "#808080",
    "rgba(0,0,0,0)",
  ],
  "fill-opacity": 0.8,
};

const paintSelected = {
  "fill-color": "#7747FF",
  "fill-opacity": 1,
};

const fillLayout = {};

const MapView = ({
  style,
  className,
  onViewportChange,
  onStyleLoad,
  history,
  location,
  route,
  ...other
}) => {
  const [viewport, setViewport] = useState({
    center: testCenter,
    zoom: [17],
  });
  const [popup, setPopup] = useState({ longitude: null, latitude: null });
  const [floor, setFloor] = useState(bank2);
  const [polygonColor, setPolygonColor] = useState(null);
  const [map, setMap] = useState(null);
  // const [zoom, setZoom] = useState(17)
  const zoomRef = useRef(17);
  const [showFloorplan, setShowFloorplan] = useState(false);

  // pull locations from the store
  // global state for viewport. on sidebar building click, apply center and zoom

  const geoJsonData = {
    type: "geojson",
    data: floor,
  };
  // swap longitude and latitude order
  const getHighlightShapes = (spaces) => {
    return spaces.data[0].data.spaces.map((space) => {
      const newPolygon = space.polygon[0].map((point) => [point[1], point[0]]);
      return { ...space, polygon: [newPolygon] };
    });
  };

  const getMatchingColor = (spaces, colors) => {
    const fallbackColor = "#FFCCCB";
    const matchingColor = colors.data.filter(
      (col) => col.attributes?.kind === spaces.type
    );

    return matchingColor?.[0]?.attributes?.color?.[0] || fallbackColor;
  };

  const changeFloorplanView = () => {
    zoomRef.current = map.getZoom();
    if (zoomRef.current > 19 && !showFloorplan) {
      setShowFloorplan(true);
    }
    if (zoomRef.current < 19 && showFloorplan) {
      setShowFloorplan(false);
    }
  };

  return (
    <>
      <MapGl
        {...viewport}
        containerStyle={style}
        className={className}
        trackResize
        style="mapbox://styles/mile-ff/cke8ypb9b5ige19lq2itb77d9"
        animationOptions={{
          animate: true,
        }}
        flyToOptions={{ speed: 0.8 }}
        {...other}
        onStyleLoad={(el) => {
          // map should also be ref
          setMap(el);
        }}
        onZoom={changeFloorplanView}
      >
        <Source id="floorplan" geoJsonSource={geoJsonData} />
        {/* <Layer
        type="circle"
        id="cirlces"
        paint={{
          'circle-radius': 10,
          'circle-color': '#7747FF'
        }}
      >
        {locations.map((location, index) => (
          <Feature
            coordinates={[location.longitude, location.latitude]}
            key={index}
            onClick={() => {
              setViewport({
                ...viewport,
                center: [location.longitude, location.latitude]
              })
              setPopup({
                longitude: location.longitude,
                latitude: location.latitude,
                imageSrc: location.imageSrc
              })
            }}
          />
        ))}
      </Layer> */}
        {showFloorplan && (
          <>
            <Layer
              sourceId="floorplan"
              id="layer_rooms"
              type="fill"
              paint={paintRooms}
              filter={["==", "$type", "Polygon"]}
              onClick={(e) => console.log(e.features[0])}
            />
            <Layer
              sourceId="floorplan"
              id="layer_chair"
              type="fill"
              paint={paintChairs}
              filter={["==", "$type", "Polygon"]}
            />
            {/* map through spaces, display them and match colors */}
            {getHighlightShapes(spaces).map((space) => {
              console.log(getMatchingColor(space, colors));
              if (space.position) {
                return (
                  <Layer
                    key={space.id}
                    type="circle"
                    id={`circle${space.id}`}
                    paint={{
                      "circle-color": getMatchingColor(space, colors),
                      "circle-radius": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        // zoom is 5 (or less) -> circle radius will be 1px
                        17,
                        1,
                        // zoom is 15 (or greater) -> circle radius will be 5px
                        25,
                        40,
                      ],
                      "circle-opacity": 0.4,
                    }}
                  >
                    <Feature
                      coordinates={[space.position[1], space.position[0]]}
                    />
                  </Layer>
                );
              }
              return (
                <Layer
                  key={space.id}
                  type="fill"
                  id={`fill${space.id}`}
                  paint={{
                    "fill-color": getMatchingColor(space, colors),
                    "fill-outline-color": "black",
                    "fill-opacity": 0.4,
                  }}
                >
                  <Feature coordinates={space.polygon} />
                </Layer>
              );
            })}
          </>
        )}
        {!showFloorplan && (
          <>
            <Layer
              sourceId="floorplan"
              id="layer_selected"
              type="fill"
              paint={paintSelected}
              filter={["==", "$type", "Polygon"]}
            />
            <Popup coordinates={[-122.4005954, 37.7933139]}>
              <MapPopup
                imageSrc={
                  "https://i.ibb.co/P5WNt04/Screenshot-2020-08-14-at-13-44-09.png"
                }
              />
            </Popup>
          </>
        )}
        {/* {locations.map((location, index) => (
          <Popup
            key={index}
            coordinates={[-122.40082001784597, 37.79339001037386]}
          >
            <div>
              <button onClick={() => setFloor(bank1)}>F1</button>
              <button onClick={() => setFloor(bank2)}>F2</button>
            </div>
          </Popup>
        ))} */}
      </MapGl>
    </>
  );
};

export default MapView;
