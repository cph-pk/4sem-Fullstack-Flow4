declare module 'geojson-utils' {
    //export type Position = [latitude: number, longitude: number, elevation?: number]
  
    // export interface Point {
    //   type: "Point",
    //   coordinates: number[]
    // }
  
    // export interface Polygon {
    //   type: "Polygon",
    //   coordinates: number[][][]
    // }
  
    export interface Point {
      type: string,
      coordinates: number[]
    }
  
    export interface Polygon {
      type: string,
      coordinates: number[][][]
    }
    export function pointDistance(p1: Point, p2: Point): number
    export function pointInPolygon(point: Point, polygon: Polygon): boolean
    export function geometryWithinRadius(point: Point, center: Point, radius: number): boolean
  }