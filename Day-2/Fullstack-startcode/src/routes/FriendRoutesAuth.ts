import express from "express";
import { Router } from "express"
const router = Router();
import { ApiError } from "../errors/apiError"
import FriendFacade from "../facades/friendFacade"
import base64 from "base-64";
const debug = require("debug")("friend-routes")

let facade: FriendFacade;

router.use(express.json());

// Initialize facade using the database set on the application object
router.use(async (req, res, next) => {
    if (!facade) {
        const db = req.app.get("db")
        debug("Database used: " + req.app.get("db-type"))
        facade = new FriendFacade(db)
    }
    next()
})

// This does NOT require authentication in order to let new users create themself
router.post('/', async function (req, res, next) {
    try {
        let newFriend = req.body;
        const status = await facade.addFriend(newFriend)
        res.json({ status })
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            next(err)
        } else {
            next(new ApiError(err.message, 400));
        }
    }
})

router.post("/login", async (req, res, next) => {
    const { userName, password } = req.body;
    const user = await facade.getVerifiedUser(userName, password)
    if (!user) {
        return next(new ApiError("Failded to login", 400))
    }
    const base64AuthString = "Basic " + base64.encode(userName + ":" + password)
    res.json({ base64AuthString, user: user.email, role: user.role })
})

// ALL ENDPOINTS BELOW REQUIRES AUTHENTICATION

import authMiddleware from "../middleware/basic-auth"
const USE_AUTHENTICATION = !process.env["SKIP_AUTHENTICATION"];

if (USE_AUTHENTICATION) {
    router.use(authMiddleware);
}

router.get("/all", async (req: any, res) => {
    const friends = await facade.getAllFriends();

    const friendsDTO = friends.map(friend => {
        const { firstName, lastName, email, role } = friend
        return { firstName, lastName, email, role }
    })
    res.json(friendsDTO);
})

/**
 * authenticated users can edit himself
 */
router.put('/editme', async function (req: any, res, next) {
    try {
        if (!USE_AUTHENTICATION) {
            throw new ApiError("This endpoint requires authentication", 500)
        }
        const email = req.credentials.userName;
        let newFriend = req.body;
        const friend = await facade.editFriend(email, newFriend)
        res.json(friend)
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            return next(err)
        }
        next(new ApiError(err.message, 400));
    }
})

router.get("/me", async (req: any, res, next) => {
    try {
        if (!USE_AUTHENTICATION) {
            throw new ApiError("This endpoint requires authentication", 500)
        }
        const emailId = req.credentials.userName;
        const friend = await facade.getFriend(emailId);

        const { firstName, lastName, email, role } = friend;
        const friendDTO = { firstName, lastName, email, role }
        res.json(friendDTO);

    } catch (err) {
        next(err)
    }
})

//These endpoint requires admin rights

//An admin user can fetch everyone
router.get("/find-user/:email", async (req: any, res, next) => {
    try {
        if (USE_AUTHENTICATION && !req.credentials.role || req.credentials.role !== "admin") {
            throw new ApiError("Not Authorized", 401)
        }
        const userId = req.params.email;
        const friend = await facade.getFriend(userId);
        if (friend == null) {
            throw new ApiError("user not found", 404)
        }
        const { firstName, lastName, email, role } = friend;
        const friendDTO = { firstName, lastName, email, role }
        res.json(friendDTO);
    } catch (err) {
        next(err)
    }
})


//An admin user can edit everyone
router.put('/:email', async function (req: any, res, next) {

    try {
        if (USE_AUTHENTICATION && !req.credentials.role || req.credentials.role !== "admin") {
            throw new ApiError("Not Authorized", 401)
        }
        const email = req.params.email;

        const f = await facade.getFriend(email);
        if (f == null) {
            throw new ApiError("user not found", 404)
        }

        let newFriend = req.body;
        const friend = await facade.editFriend(email, newFriend)
        res.json(friend)
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            return next(err)
        }
        next(new ApiError(err.message, 400));
    }
})

//An admin user can delete everyone
router.delete('/:email', async function (req: any, res, next) {

    try {
        if (USE_AUTHENTICATION && !req.credentials.role || req.credentials.role !== "admin") {
            throw new ApiError("Not Authorized", 401)
        }
        const userId = req.params.email;
        const friend = await facade.deleteFriend(userId);

        if (friend == false) {
            throw new ApiError("user not found", 404)
        }
        res.json("User deleted");
    } catch (err) {
        debug(err)
        if (err instanceof ApiError) {
            return next(err)
        }
        next(new ApiError(err.message, 400));
    }
})
export default router