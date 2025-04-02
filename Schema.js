const joi = require("joi");

module.exports = joi.object({
    listing : joi.object({
        title : joi.string().required(),
        location : joi.string().required(),
        country : joi.string().required(),
        price : joi.number().required().min(0),
        image : joi.string().allow("",null),
        description : joi.string().required(),
    }).required()
});