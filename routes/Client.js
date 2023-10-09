const express = require('express');
const CustomError = require('../errors/custom-error');
const Link = require('../models/links');
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get('/create', authMiddleware,  async(req, res) => {

    const userId = req.user__id;
    // const {clientId, clientCode} =  
    const createUser = {
        userId,

    }
    
    res.status(302).redirect(urlData.originalUrl);

})

module.exports = router