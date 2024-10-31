const express = require('express');
const router = express.Router();
const Event = require('../models/event');



router.get('/', async (req, res) => {
    try {
      const userId = req.session.user._id;
  
      // find  events for an attendee
      const invitations = await Event.find({ 'attendees.user': userId })
        .populate('owner', 'username')
        .populate('attendees.user', 'username');
  
      // render  invitations 
      res.render('invitations/index.ejs', { invitations, user: req.session.user });
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  });


module.exports = router;
