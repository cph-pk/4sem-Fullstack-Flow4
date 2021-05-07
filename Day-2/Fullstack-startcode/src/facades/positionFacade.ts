import path from "path"
require('dotenv').config({ path: path.join(__dirname, "..", "..", '.env') })
import { Db, Collection, ObjectID } from "mongodb";
import IPosition from '../interfaces/IPosition'
import FriendsFacade from './friendFacade';
import { DbConnector } from "../config/dbConnector"
import { ApiError } from "../errors/apiError";

class PositionFacade {
    db: Db
    positionCollection: Collection
    friendFacade: FriendsFacade;

    constructor(db: Db) {
        this.db = db;
        this.positionCollection = db.collection("positions");
        this.friendFacade = new FriendsFacade(db);
    }

    async addOrUpdatePosition(email: string, longitude: number, latitude: number): Promise<IPosition> {
        const friend = await this.friendFacade.getFriendFromEmail(email)
        const name = friend.firstName + " " + friend.lastName
        const query = { email }
        const pos: IPosition = {
            lastUpdated: new Date(),
            email: email,
            name: name,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        }
        const update = {
            $set: { ...pos }
        }
        const options = { upsert: true, returnOriginal: false } //Upsert betyder lav hvis ikke findes
        // const result = await this.positionCollection.findOneAndUpdate(query, update, options)
        // return result.value;
        return (await this.positionCollection.findOneAndUpdate(query,update,options)).value
    }

    async findNearbyFriends(email: string, password: string, longitude: number, latitude: number, distance: number): Promise<Array<IPosition>> {
        // 1) check om han findes
        // const friend = await this.friendFacade.getFriendFromEmail(email)
        await this.addOrUpdatePosition(email, longitude, latitude);
        //this.friendFacade.getVerifiedUser
        // 2) Opdater position

        return this.positionCollection.find({
            email: {$ne:email}, // not equal own email
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: distance,
                }
            }
        }
        ).toArray()




    }

    async getAllPositions(): Promise<Array<IPosition>> {
        return this.positionCollection.find({}).toArray();
    }


}

export default PositionFacade;

async function tester() {
    const client = await DbConnector.connect()
    const db = client.db(process.env.DB_NAME)
    const positionFacade = new PositionFacade(db)
    await positionFacade.addOrUpdatePosition("pp@b.dk", 5, 5)
    process.exit(0)
}

//tester()