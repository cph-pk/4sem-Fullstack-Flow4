import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `#graphql

type Coordinate {
  latitude: Float!
  longitude: Float!
}

type Coordinates {
  coordinates: [Coordinate]
}

type Status {
  """TRUE if coordinates was inside gameArea, otherwise FALSE"""
  status: String
  """Contains a string with a description of whether given coordinates was inside or not inside the gameArea"""
  msg: String
}

type Name {
  name: String
}

type Point {
  """Will ALWAYS have the value Point"""
  type: String
  """Array with longitude followed by latitude [lon,lat]"""
  coordinates: [Float]
}

type Player {
  """Will ALWAYS have the value --> Feature <--"""
  type: String
  """userName of Player (or Team)"""
  properties: Name
  """GeoJson Point with the users location"""
  geometry: Point
}

type User {
  """Distance to the user seached for"""
  distance: Float
  """userName of the user found"""
  to: String
}

type Query {

  """Returns a GeoJson Polygon representing the legal gameArea"""
  gameArea : Coordinates 

  """Check whether caller, given his latitude and lontitude, is inside the gameArea"""
  isUserInArea(latitude:Float!,longtitude:Float!):Status!

  """Given callers latitude and longitude all nearby Teams will be found (inside the given radius)"""
  findNearbyPlayer(latitude:Float!,longtitude:Float!,distance:Int!):[Player]!

  """Given callers latitude and longitude, and the userName of the Team to find, returs the distance to this Team"""
  distanceToUser(latitude:Float!,longtitude:Float!,userName:String):User!
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };
