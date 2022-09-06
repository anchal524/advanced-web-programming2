const peopleData = require("./peopleData");

function validateNumber(param, paramName) {
    element = parseInt(param);
    if (element !== 0 && (!element || typeof element !== "number")) {
        throw `Argument ${param} entered is not a numeric ${paramName}`;
    }
}
getById = (id) => {
    validateNumber(id, "User id");
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let personFound = peopleData.people.find(function (personFound) {
                return personFound.id === id;
            });
            if (personFound) {
                resolve(personFound);
            } else {
                let errorMessage = `User with id ${id} not found`;
                reject(new Error(errorMessage));
            }
        }, 5000);
    });
};

module.exports = {getById};
