const gameArea = {
    "type": "Polygon",
    "coordinates": [
      [
        [
          12.548961639404297,
          55.78675729599251
        ],
        [
          12.553939819335938,
          55.78222055335638
        ],
        [
          12.579517364501953,
          55.7805312057019
        ],
        [
          12.584924697875977,
          55.78941152809666
        ],
        [
          12.571105957031248,
          55.79640818226839
        ],
        [
          12.557458877563475,
          55.79452644712383
        ],
        [
          12.548961639404297,
          55.78675729599251
        ]
      ]
    ]
  }
   
   
  const players = [
    {
      "type": "Feature",
      "properties": {
        "name": "p2-outside"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.550077438354492,
          55.791872563546214
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "p1-outside"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.54913330078125,
          55.78279974140604
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "p3-inside" },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.56338119506836,
          55.79240335472841
        ]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "p4-inside" },
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.566814422607422,
          55.78526119456843
        ]
      }
    }
  ]
   
  //module.exports = { gameArea, players }
  export {gameArea, players}