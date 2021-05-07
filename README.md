# Learning goals: Period 4 Geo-location on the backend (GeoJson, MongoDB and and geoqueries)

Updated continuously

**Study group**

- [Alexander Pihl](https://github.com/AlexanderPihl)
- [Jean-Poul Leth-Møller](https://github.com/Jean-Poul)
- [Mick Larsen](https://github.com/micklarsen/)
- [Morten Rasmussen](https://github.com/Amazingh0rse)
- [Per Kringelbach](https://github.com/cph-pk)

# Exercises:

For exercises, please check the folders above or use the list here:

- [Day 1](https://github.com/cph-pk/4sem-Fullstack-Flow4/tree/main/Day-1)
- [Day 2](https://github.com/cph-pk/4sem-Fullstack-Flow4/tree/main/Day-2)
- Fullstack startcode [link](https://github.com/cph-pk/Fullstack-startcode)

## MongoDB indexes and Geo-features

### Explain about indexes in MongoDB, how to create them, and demonstrate how you have used them.

From the manual of mongodb:

> <small>A unique index ensures that the indexed fields do not store duplicate values; i.e. enforces uniqueness for the indexed fields. By default, MongoDB creates a unique index on the \_id field during the creation of a collection.</small>

<br>
To create an index in MongoDB we use the following method:

```javascript 
db.collection.createIndex()
```

We make use of the following index in our start code:
The first one is to make an email unique for our friend collection.
1 means in ascending order and -1 means in descending order.

 ```javascript 
 friendsCollection.createIndex({ email: 1 }, { unique: true })
 ```

The second one is to be able to create an index with the property lastUpdated, rank them in ascending order and make them expire after 60 seconds. When we set a boolean to true we assign a date far in the future so the object wont expire within 60 seconds.

 ```javascript  
 await positionCollection.createIndex({ "lastUpdated": 1 }, { expireAfterSeconds: 60 })
 ```

The third is so we can be able to calculate on a sphere (see below for more info)

```javascript 
await positionCollection.createIndex({ location: "2dsphere" })
```

<br>

### Explain, using your own code examples, how you have used some of MongoDB's "special" indexes like TTL and 2dsphere and perhaps also the Unique Index.

To create a 2dsphere index, use the db.collection.createIndex() method and specify the string literal "2dsphere" as the index type:

```javascript
db.collection.createIndex( { <location field> : "2dsphere" } )
```

where the `<location field>` is a field whose value is either a GeoJSON object or a legacy coordinates pair.

A 2dsphere index supports queries that calculate geometries on an earth-like sphere. 2dsphere index supports all MongoDB geospatial queries: queries for inclusion, intersection and proximity.
If we have a flat plain we can make use of "2d" to calculate.

Version 2 and later 2dsphere indexes are always sparse and ignore the sparse option. If a document lacks a 2dsphere index field (or the field is null or an empty array), MongoDB does not add an entry for the document to the index. For inserts, MongoDB inserts the document but does not add to the 2dsphere index.

For a compound index that includes a 2dsphere index key along with keys of other types, only the 2dsphere index field determines whether the index references a document.

For spherical queries, use the 2dsphere index result.

The use of 2d index for spherical queries may lead to incorrect results, such as the use of the 2d index for spherical queries that wrap around the poles.

<br>

## Geo-location and Geojson

### Explain and demonstrate basic Geo-JSON, involving as a minimum, Points and Polygons

Geo-Json consists of coordinates using longitude and latitude.  
It can also contain a position with types like:

**Geometry**

Geometries are shapes and consists of a type and a collection of coordinates.

**Points**

A point is the simplest type indicating a position and contains a single coordinate consisting of longitude and latitude.  
```javascript
{ "type": "Point", "coordinates": [0, 0] }
```

**LineStrings**

A linestring is a line consisting of two coordinates.  
```javascript
{ "type": "LineString", "coordinates": [[0, 0], [10, 10]] }
```

**Polygons**

Polygons are shapes that have insides and outsides and can also have "Holes" in the insides - Think of a donut shape.

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [0, 0],
      [10, 10],
      [10, 0],
      [0, 0]
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

Flow of data: schema with query structure and types. These types are used in resolvers which are the functions that make use of
the functions in `geoUtilsTester.ts` and the object(game area) and array(players) from `gameData.js`. `geojson-utils.d.ts` was made
since there were problems with using geojson without that.

<br>

### Explain and demonstrate ways to create Geo-JSON test data

To make Geo-JSON test data I first have to go to geojson.io, where a polygon has been made with to discribe the game area and points
have been made to simulate players. The data is then striped from `json "type": "Feature", "properties": {}, "geometry": {`. The points
are seperated from the polygon so they can be stored in there own const. Players are made as follows with a unique property name to be able to identify them: 

```javascript
const players = 
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
}
```

We export the gameArea and players with

```javascript
export { gameArea, players } 
```

gameArea and players are used in `resolvers.ts`

```javascript
import { gameArea, players } from './gameData'
````

<br>

### Explain the typical order of longitude and latitude used by Server-Side APIs and Client-Side APIs

Historically, people usually talk about coordinates in the order `latitude, longitude, elevation`. Depending on which format you use for math in relation to coordinates this order can be different.  
For GeoJSON, the order is `longitude, latitude`. A table of commonly used formats can be found [here](https://macwright.com/lonlat/).  
It is worth noting that google uses the reverse order `latitude, longitude`.

On the client side it makes good sense to sanitize your inputs to secure the correct order for the server-side, but in reality you could enforce sanitization on the server-side, though it can be tricky.

A rule of thumb, for Denmark, could be, that the latitude always will be about 55-57 degrees. This rule cannot be applied everywhere of course, which is why it makes sense to pay close attention to how the data is used on client-side and server-side.

> A general rule of thumb is, that when doing math with coordinates, you can expect the coordinate order to be `longitude, latitude`<br>

### Explain and demonstrate a GraphQL API that implements geo-features, using a relevant geo-library and plain JavaScript

Start with ```npm run dev``` and then have the queries ready to show how queries are handled.
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

In schema

```javascript
import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const schema = makeExecutableSchema({ typeDefs, resolvers });
export { schema };
```

<br>

### Explain and demonstrate a GraphQL API that implements geo-features, using Mongodb’s geospatial queries and indexes.

Walk-through(startcode):

1. We made two mutations in schema

```javascript
addPosition(input: PositionInput): Boolean
findNearbyFriends(input: PostionNearbyInput): [PositionOnNearbyFriend]!
```

followed by four types (return values, see in graphql)

```javascript
    type PositionOnNearbyFriend{
        email: String
        name: String
        location: Point
    }

    type Coordinate {
        latitude: Float!
        longitude: Float!
    }

    type Coordinates{
        coordinates: [Coordinates]
    }

    type Point{
        type: String
        coordinates: [Float]
    }
```

and two inputs (input for graphql)

```javascript
    input PositionInput {
        email: String!
        longitude: Float!
        latitude: Float!
    }

    input PostionNearbyInput {
        email: String!
        password: String
        longitude: Float!
        latitude: Float!
        distance: Int!
    }
```
2. Hereafter we made two resolver functions which is the functions that does fetch or data in conjunction with the facade (friend, position)
The first function which is used to add a location or update:
```javascript
addPosition: async (_: object, { input }: { input: IPositionInput }) => {
    try {
        await positionFacade.addOrUpdatePosition(input.email, input.longitude, input.latitude)
        return true
    } catch (err) {
        throw new ApiError("User not found", 404)
    }
}
```
This resolver calls our positionFacade.addOrUpdatePosition() function in the positionFacade where we create our mongodb query.

<br>

The second function is used to locate a nearby friend on a given distance
```javascript
findNearbyFriends: async (_: object, { input }: { input: IPositionFindInput }) => {
    try {
        const result = await positionFacade.findNearbyFriends(input.email, input.password, input.longitude, input.latitude, input.distance)
        //   console.log(result);

        return result
    } catch (err) {
        throw new ApiError("User not found", 404)
        // console.log(err)
        // return false
    }
}
```
This resolver calls our positionFacade.findNearbyFriends() function (returns an array) in the positionFacade where we create our mongodb query. Here we search for friends that are not equal to ourself with the command ```$ne: email```. We also make use of ```$near:```(Returns geospatial objects in proximity to a point. Requires a geospatial index. The 2dsphere and 2d indexes support ```$near```). ```$near and $ne```is called Geospatial Query Operators.

We make use of two mongodb queries in the form of 
```javascript 
return (await this.positionCollection.findOneAndUpdate(query, update, options)).value 
```
and 
```javascript
await this.positionCollection.find({ 
    email: { $ne: email }, // not equal to my own email
    location: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            $maxDistance: distance,
            // $minDistance: 2
        }
    }
}).toArray()
```

Playground/GraphiQL queries:
```graphql
mutation {
  addPosition(input: {
    email: "pp@b.dk"
    longitude: 5
    latitude: 6
  })
}
```

<br>

```graphql
mutation {
  findNearbyFriends(input: {
    email: "dd@b.dk"
    password: "secret"
    longitude: 12.48
    latitude: 55.77
    distance: 5000
  })
  {
    name
    email
    location {
      type
      coordinates
    }
  }
}
```

For index se see the first two questions also see makeTestPostion.ts in the folder utils.

<br>

### Explain and demonstrate how you have tested the geo-related features in you start code

Mocho: describe, it, before, beforeEach
Chai: expect, to.be.equal, to.be.rejectedWith

To begin with we setup a inMemory database so we don't have to query/setup the real database all the time. Herafter we setup all the test with the help of mocha and chai. 

```javascript
describe("## Verify the Positions Facade ##", () => { ... }
```

is the outter wrapper which contains all our test.

```javascript
before(async function () { } 
```

runs once before all test. Here we make our inMemory database, get our friend and position facade and create our indexes.

`beforeEach()` runs before every test and here we first of clean our database and then insert our users. Thereafter we clean our position collection and then insert our locations to our users.

*Note to self remember geoUtils.ts is only used in test (getLatitudeInside, getLatitudeOutside, positionCreator).*

Before and beforeEach are hooks (like we know from react).

Now all the single test are made wrapped in another describe function with the it and what we expect to happend. We make a positive test and a negative test for `positionFacade.addOrUpdatePosition()` and `positionFacade.findNearbyFriends()`.

<br>

