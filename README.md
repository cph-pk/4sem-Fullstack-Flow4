# Learning goals: Period 4

Updated continuously

**Study group**

- [Alexander Pihl](https://github.com/AlexanderPihl)
- [Jean-Poul Leth-Møller](https://github.com/Jean-Poul)
- [Mick Larsen (Me)](https://github.com/micklarsen/)
- [Morten Rasmussen](https://github.com/Amazingh0rse)
- [Per Kringelbach](https://github.com/cph-pk)

# Exercises:

For exercises, please check the folders above or use the list here:

- [Week 1]()
- [Week 2]()
- Fullstack startcode [link](https://github.com/micklarsen/FullstackTS_Startcode)

## MongoDB indexes and Geo-features

### Explain about indexes in MongoDB, how to create them, and demonstrate how you have used them.
To create an index in MongoDB we use the following method:
```javascript
db.collection.createIndex()
```

<br>

### Explain, using your own code examples, how you have used some of MongoDB's "special" indexes like TTL and 2dsphere and perhaps also the Unique Index.
To create a 2dsphere index, use the db.collection.createIndex() method and specify the string literal "2dsphere" as the index type:
```javascript
db.collection.createIndex( { <location field> : "2dsphere" } )
```
where the <location field> is a field whose value is either a GeoJSON object or a legacy coordinates pair.
For more information on the 2dsphere index, see 2dsphere Indexes.

<br>

## Geo-location and Geojson 

### Explain and demonstrate basic Geo-JSON, involving as a minimum, Points and Polygons

Geo-Json consists of coordinates using longitude and latitude.  
It can also contain a position with types like: 
**Geometry**
Geometries are shapes and consists of a type and a collection of coordinates.

**Points**
A point is the simplest type indicating a position and contains a single coordinate consisting of longitude and latitude.  
`{ "type": "Point", "coordinates": [0, 0] }`

**LineStrings**
A linestring is a line consisting of two coordinates.  
`{ "type": "LineString", "coordinates": [[0, 0], [10, 10]] }`

**Polygons**
Polygons are shapes that have insides and outsides and can also have "Holes" in the insides - Think of a donut shape.
```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [0, 0], [10, 10], [10, 0], [0, 0]
    ]
  ]
}
```
Geo-JSON can be generated from a source like [geojson.io](https://geojson.io/)  
A Geo-JSON example structure is provided below: 

```json
const gameArea = {
    "type": "Polygon",
    "coordinates": [
        [
            [
                12.575139999389648,
                55.80668374690706
            ],
            [
                12.553167343139648,
                55.79944771620931
            ],
            [
                12.547674179077147,
                55.787770751411436
            ],
            [
                12.549819946289062,
                55.7763799260891
            ],
            [
                12.568359375,
                55.77396618813479
            ],
            [
                12.58432388305664,
                55.777104018325915
            ],
            [
                12.589216232299805,
                55.7895562991921
            ],
            [
                12.575139999389648,
                55.80668374690706
            ]
        ]
    ]
}


const players = [
    {
        "type": "Feature",
        "properties": {
            "name": "p1-outside"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.549819946289062,
                55.80099151560747
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "p2-outside"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.54638671875,
                55.784344200781206
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "p3-inside"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.572307586669922,
                55.792451608113566
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "p4-inside"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.56132125854492,
                55.78786726960013
            ]
        }
    }
]
```


<br>


### Explain and demonstrate ways to create Geo-JSON test data
To make Geo-JSON test data I first have to go to geojson.io, where a polygon has been made with to discribe the game area and points
have been made to simulate players. The data is then striped from 
```javascript
json "type": "Feature", "properties": {}, "geometry": {
. The points
```
are seperated from the polygon so they can be stored in there own const. Players are made as follows with a unique property name to be able to identify them: 
```javascript
json const players= [
  {
    "type": "Feature",
    "properties": {"name":"Peter"},
    "geometry": {
      "type": "Point",
      "coordinates": [
        12.576169967651367,
        55.784488990708795
      ]
    }
  },
```
We export the gameArea and players with 
```javascript
json export { gameArea, players } 
```
gameArea and players are used in `resolvers.ts`
```javascript
import { gameArea, players } from './gameData'
```
<br>

### Explain the typical order of longitude and latitude used by Server-Side APIs and Client-Side APIs
Historically, people usually talk about coordinates in the order `latitude, longitude, elevation`. Depending on which format you use for math in relation to coordinates this order can be different.  
For GeoJSON, the order is `longitude, latitude`. A table of commonly used formats can be found [here](https://macwright.com/lonlat/).  
It is worth noting that google uses the reverse order `latitude, longitude`.  
  
>Pay attention to what format you are using, and make sure that the backend recieves the correct order of longitude and latitude.

<br>

### Explain and demonstrate a GraphQL API that implements geo-features, using a relevant geo-library and plain JavaScript
Start with ```json npm run dev``` and then have the queries ready to show how queries are handled.
First of we make a gameArea with geojson.io (explain and show how we made a polygon). After that we added points to be able to simulate players.
All the data generated from here is thrown in gameData.js where the gameArea is stored as an object and players are stored in an array.
These are imported 
```javascript
import { gameArea, players } from './gameData' 
``` 
in resolvers.ts to be able to see if players are within a gameArea
or to find a distance between players.
Resolvers are functions used in conjunction with schema.ts which is the "formula" all graphql queries need to follow to be able to get the right
data.
 
Geo library used:
```javascript
npm install geojson-utils

```
Geo features used:
To be abe to see if a player is within our gameArea we make use of
```javascript
let distance = gju.pointDistance({ type: "Point", coordinates: [2, 3] }, { type: "Point", coordinates: [3, 4] })
```
resolvers.ts
```javascript
isUserInArea: (_: any, { longitude, latitude }: { longitude: number, latitude: number }) => {
```

To be able to find near by players from a given point the following geo feature is used
```javascript
if (gju.geometryWithinRadius(p, center, 200000)) {
    console.log(`Found. Distance to center is ${gju.pointDistance(p, center)}`)
  } else {
    console.log(`Not Found. Distance to center is ${gju.pointDistance(p, center)}`)
  }
```
resolvers.ts
```javascript
findNearbyPlayers: (_: any, { longitude, latitude, distance }: { longitude: number, latitude: number, distance: number }) => {
```

To be able to find the distance between players the following geo feature has been used
```javascript
let distance = gju.pointDistance({ type: "Point", coordinates: [2, 3] }, { type: "Point", coordinates: [3, 4] })
```

resolvers.ts
```javascript
distanceToUser: async (_: any, { longitude, latitude, userName }: { longitude: number, latitude: number, userName: string }) => {
``` 


<br>

### Explain and demonstrate a GraphQL API that implements geo-features, using Mongodb’s geospatial queries and indexes.
asd

<br>


### Explain and demonstrate how you have tested the geo-related features in you start code
asd

<br>