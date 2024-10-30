const express = require('express');
const router = express.Router();

const Event = require('../models/event');
const User = require('../models/user');


router.get('/', async (req, res) => {
    try {
      const populatedEvents = await Event.find({}).populate('owner')
      console.log('events: ', populatedEvents)
      res.render('events/index.ejs', {
        event: populatedEvents})
    } catch (error) {
      console.log(error)
      res.redirect('/')
    } })

  router.get('/new', (req, res) => {
    res.render('events/new.ejs');
});


router.post('/', async (req, res) => {
    req.body.owner = req.session.user._id; // Set the owner of the event
    await Event.create(req.body);
    res.redirect('/events'); // Redirect to the events index
});

router.get('/:eventId', async (req, res) => {
    try {
    
      const populatedEvents = await Event.findById(
        req.params.eventId
      ).populate('owner');
  
      res.render('events/show.ejs', {
        event: populatedEvents,
      });
  
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });




  router.get('/:eventId/edit', async (req, res) => {
    try {
        const currentEvent = await Event.findById(req.params.eventId);
        res.render('events/edit.ejs', {
            event: currentEvent,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});


router.put('/:eventId', async (req, res) => {
    try {
        const currentEvent = await Event.findById(req.params.eventId);
        if (currentEvent.owner.equals(req.session.user._id)) {
            await currentEvent.updateOne(req.body);
            res.redirect('/events');
        } else {
            res.send("You don't have permission to do that.");
        }
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.delete('/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (event.owner.equals(req.session.user._id)) {
            await event.deleteOne();
            res.redirect('/events');
        } else {
            res.send("You don't have permission to do that.");
        }
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});














module.exports = router;