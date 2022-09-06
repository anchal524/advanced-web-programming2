const express = require("express");
const router = express.Router();
const people = require("../data/index");
const flat = require("flat");
const unflatten = flat.unflatten;
const redis = require("redis");
const client = redis.createClient();

function validateStringParams(param, paramName) {
    if (!param) {
        throw `No ${paramName} entered`;
    } else if (typeof param !== "string") {
        throw ` Argument ${param} entered is not a string ${paramName}`;
    } else if (param.length === 0) {
        throw ` No ${paramName} entered`;
    } else if (!param.trim()) {
        throw ` Empty spaces entered to ${paramName}`;
    }
}

function validateNumber(param, paramName) {
    element = parseInt(param);
    if (element !== 0 && (!element || typeof element !== "number")) {
        throw `Argument ${param} entered is not a numeric ${paramName}`;
    }
}

async function connect() {
    await client.connect();
}
connect();

router.get("/history", async (req, res) => {
    try {
        let history = await client.lRange("History", 0, 19);
        let jsonHistory = history.map(JSON.parse);
        res.status(200).json(jsonHistory);
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

router.get("/:id", async (req, res) => {
    try {
        validateStringParams(req.params.id, "User id");
        validateNumber(req.params.id, "User id");
    } catch (e) {
        res.status(400).json({error: e});
        return;
    }
    try {
        req.params.id = req.params.id.trim();
        let doesUserExist = await client.hExists(
            "visitingUsers",
            req.params.id
        );
        let jsonUserForm;
        let userFound;
        if (doesUserExist) {
            const jsonUserForm = await client.hGet(
                "visitingUsers",
                req.params.id
            );
            userFound = JSON.parse(jsonUserForm);
            let settingInHistoryCache = await client.lPush(
                "History",
                JSON.stringify(userFound)
            );
        } else {
            let idToBeSearched = parseInt(req.params.id);
            userFound = await people.getById(idToBeSearched);
            jsonUserForm = JSON.stringify(userFound);
            let settingInUserCache = await client.hSet(
                "visitingUsers",
                req.params.id,
                jsonUserForm
            );
            let settingInHistoryCache = await client.lPush(
                "History",
                jsonUserForm
            );
        }

        res.status(200).json(userFound);
    } catch (e) {
        res.status(400).json({error: e.message});
    }
});

module.exports = router;
