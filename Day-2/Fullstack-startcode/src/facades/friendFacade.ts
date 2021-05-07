import { IFriend } from '../interfaces/IFriend';
import { Db, Collection, ObjectID } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from '../errors/apiError';
import Joi, { ValidationError } from "joi"

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(30).required()
})

const USER_INPUT_EDIT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40),
  lastName: Joi.string().min(2).max(50),
  password: Joi.string().min(4).max(30),
  email: Joi.string().email().required()
})

class FriendsFacade {
  db: Db
  friendCollection: Collection

  constructor(db: Db) {
    this.db = db;
    this.friendCollection = db.collection("friends");
  }

  /* NEW STUFF YOU SHOULD ADD TO YOUR OWN CODE */

  //This version returns the new Friend, including default role and id
  async addFriendV2(friend: IFriend): Promise<IFriend> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw, role: "user", createTime: new Date() }
    const result = await this.friendCollection.insertOne(f);
    return { ...f, id: result.insertedId }
  }

  /* This version returns the updated Friend
     IMPORTANT --> Observe INPUT VALIDATION is different compared to when adding a new Friend */
  async editFriendV2(email: string, friend: IFriend): Promise<IFriend> {
    const status = USER_INPUT_EDIT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    let f = { ...friend }
    if (friend.password) {
      const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
      f = { ...friend, password: hashedpw }
    }

    const fieldsToUpdate: any = {}
    f.firstName && (fieldsToUpdate.firstName = f.firstName)
    f.lastName && (fieldsToUpdate.lastName = f.lastName)
    f.password && (fieldsToUpdate.password = f.password)

    const result = await this.friendCollection.findOneAndUpdate(
      { email },
      {
        $set: fieldsToUpdate,
        $currentDate: { lastModified: true }
      },
      { returnOriginal: false }
    )

    if (!result.ok) {
      throw new ApiError("User email not found", 404)
    }
    return (result.value)
  }

  async deleteFriendV2(id: string) {
    const res = await this.friendCollection.deleteOne({  _id: new ObjectID(id) })
    if (res.deletedCount === 1) {
      return "Succesfully deleted a friend"
    }
    throw new Error("Could not delete a friend with the provided id")
  }

  /*
  Unless you already have taken care of this we need to convert the ObjectId returned by Mongo
  into a plain string several places in the factory.
  Use this, unless already done */
  convertObjectIdToId(friend: any) {
    const clone = { ...friend }
    clone.id = clone._id.toString();
    delete clone._id;
    return clone;
  }


  //YOU should just remove the original getAllFriends and replace with this one
  async getAllFriendsV2(): Promise<Array<IFriend>> {
    const users: Array<any> = await this.friendCollection.find(
      {},
      { projection: { password: 0 } }
    ).toArray();
    const allFriends = users.map(user => this.convertObjectIdToId(user))
    return allFriends as Array<IFriend>
  }

  //We need the ability to both find a friend by id (generated by Mongo) and the original, by email = userName
  private async findOne(idOrEmail: object) {
    const f = await this.friendCollection.findOne(
      idOrEmail,
      { projection: { password: 0 } }
    )
    if (f === null) {
      throw new ApiError("User not found", 404)
    }
    const friend = this.convertObjectIdToId(f);
    return friend
  }

  async getFriendFromId(id: string): Promise<IFriend> {
    return this.findOne({ _id: new ObjectID(id) })
  }

  // You should remove the original getFriend and refactor with this one (also in your tests)
  async getFriendFromEmail(friendEmail: string): Promise<IFriend> {
    return this.findOne({ email: friendEmail })
  }

  /* END OF ALL THE NEW STUFF YOU SHOULD ADD TO YOUR OWN CODE */


  /* OLD FACADE */
  /**
   * 
   * @param friend 
   * @throws ApiError if validation fails
   */
  async addFriend(friend: IFriend): Promise<{ id: String }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }

    try {
      const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
      const f = { ...friend, password: hashedpw }

      await this.friendCollection.insertOne(
        {
          firstName: f.firstName,
          lastName: f.lastName,
          email: f.email,
          password: f.password,
          role: "user",
          createTime: new Date()
        }
      )

      return this.friendCollection.findOne({ email: f.email })
    } catch (error) {
      throw new ApiError(error);
    }
  }

  /**
   * TODO
   * @param email 
   * @param friend 
   * @throws ApiError if validation fails or friend was not found
   */
  async editFriend(email: string, friend: IFriend): Promise<{ modifiedCount: number }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }

    try {
      const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
      const f = { ...friend, password: hashedpw }

      return await this.friendCollection.updateOne(
        { email: email },
        {
          $set: {
            firstName: f.firstName,
            lastName: f.lastName,
            email: f.email,
            password: f.password,
            role: "user"
          },
          $currentDate: { lastModified: true },

        }
      )

      //return this.friendCollection.findOne({ email: f.email })
    } catch (error) {
      throw new ApiError(error);
    }

  }

  /**
   * 
   * @param friendEmail 
   * @returns true if deleted otherwise false
   */
  async deleteFriend(friendEmail: string): Promise<boolean> {
    try {
      const friend = await this.friendCollection.findOne({ email: friendEmail });
      if (!friend) return false;
      await this.friendCollection.deleteOne(friend);
      return true;

    } catch (error) {
      throw new ApiError(error);
    }
  }

  async getAllFriends(): Promise<Array<IFriend>> {
    try {
      const users: unknown = await this.friendCollection.find({}).toArray();
      return users as Array<IFriend>

    } catch (error) {
      throw new ApiError(error);
    }
  }

  /**
   * 
   * @param friendEmail 
   * @returns 
   * @throws ApiError if not found
   */
  async getFriend(friendEmail: string): Promise<IFriend> {
    try {
      const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail });
      return friend;

    } catch (error) {
      throw new ApiError(error);
    }
  }

  /**
   * Use this method for authentication
   * @param friendEmail 
   * @param password 
   * @returns the user if he could be authenticated, otherwise null
   */
  async getVerifiedUser(friendEmail: string, password: string): Promise<IFriend | null> {
    const friend: IFriend = await this.friendCollection.findOne({ email: friendEmail })
    if (friend && await bcrypt.compare(password, friend.password)) {
      return friend
    }
    return Promise.resolve(null)
  }

}

export default FriendsFacade;

