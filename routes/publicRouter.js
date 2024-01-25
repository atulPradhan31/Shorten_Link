const mongoose = require('mongoose');
const express = require('express');
const CustomError = require('../errors/custom-error');
const Link = require('../models/links');
const router = express.Router();

router.get('/:id', async(req, res) => {

    const urlId = req.params.id;
    const urlData = await Link.findOne({urlId })
    if(!urlData ) {
        throw new CustomError('Invalid Url, Please check your URL', 404)
    }
    res.status(302).redirect(urlData.originalUrl);

})

router.get('/', async(req, res) => {
    
    res.status(302).redirect("https://dashboard.trimurl.online");

})

module.exports = router
