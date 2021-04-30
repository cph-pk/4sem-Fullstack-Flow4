import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';


const typeDefs = `#graphql
 
type Status{
  """TRUE if coordinates was inside gameArea, otherwise FALSE"""
  status: String
 
  """Contains a string with a description of whether given coordinates was inside or not inside the gameArea"""
  msg: String
}
 
type Coordinate {
  latitude: Float!
  longitude:Float!
}
 
type CoordinatesPelle {
  coordinates: [[[Float]]]
}

type Coordinates {
  coordinates: [Coordinate]
}
 
type Point {
 
  """Will ALWAYS have the value Point"""
  type : String
  
  """Array with longitude followed by latitude [lon,lat]"""
  coordinates: [Float]
}
 
 
type Player {
  """userName of Player (or Team)"""
  name : String
  
  """GeoJson Point with the users location"""
  point : Point
}
 
"""Represents a user found, with the distance to the caller"""
type User {
  """Distance to the user searched for"""
  distance: Float
 
  """userName of the user found"""
  to: String
}
 
"""
Error for a call, with msg and statuscode
"""
type Error {
  msg: String
  statuscode : Int
}
 
type Query {
 
  """Returns a GeoJson Polygon representing the legal gameArea"""
  gameArea : Coordinates
 
  gameArea_VersionPelle : CoordinatesPelle

   """Check whether caller, given his latitude and longitude, is inside the gameArea"""
   isUserInArea("Callers latitude" latitude: Float!,"Callers longitude" longitude:Float!) : Status!
 
   """Given callers latitude and longitude all nearby Teams will be found (inside the given radius)"""
   findNearbyPlayers(latitude: Float!, longitude: Float!,distance: Int!):[Player]!
   
   """
   Given callers latitude and longitude, and the userName of the Team to find, returns 
   an object with the distance and the name of the user found (team)
   """
   distanceToUser("callers latitude" latitude: Float!, 
                  "callers longitude" longitude: Float!, 
                  "user to find" userName: String) : User 
}`

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };