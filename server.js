const express = require('express');
const WebSocket = require('ws')
const cron = require('node-cron');
const fs = require('fs');

const wsServer = new WebSocket.Server({ port: 8082 });

wsServer.on('connection', (socket) => {
  console.log('WebSocket client connected');

  socket.on('close', () => console.log('WebSocket client disconnected'));
});

const app = express();
app.use(express.json());

// In-memory storage for events
let events = [];

// Event Class
class Event {
  constructor(title, description, scheduledTime) {
    this.id = Date.now(); // Unique identifier
    this.title = title;
    this.description = description;
    this.scheduledTime = new Date(scheduledTime);
    this.isNotified = false; // To track if notification was sent
  }
}




// POST /events: Add a new event
app.post('/events', (req, res) => {
  const { title, description, scheduledTime } = req.body;

  // Validate input
  if (!title || !description || !scheduledTime || isNaN(Date.parse(scheduledTime))) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const newEvent = new Event(title, description, scheduledTime);
  events.push(newEvent);
  events.sort((a, b) => a.scheduledTime - b.scheduledTime); // Sort events by time
  res.status(201).json(newEvent);
});

// GET /events: Fetch all upcoming events
app.get('/events', (req, res) => {
  const now = new Date();
  const upcomingEvents = events.filter(event => event.scheduledTime > now);
  res.json(upcomingEvents);
});

// Cron Job for Notifications
cron.schedule('* * * * *', () => {
  const now = new Date();

  // Notify for events starting in 5 minutes
  events.forEach(event => {
    if (!event.isNotified && event.scheduledTime - now <= 300000 && event.scheduledTime > now) {
      wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ message: 'Event starting soon!', event }));
        }
      });
      event.isNotified = true; // Mark as notified
    }
  });

  // Log and remove completed events
  const completedEvents = events.filter(event => event.scheduledTime <= now);
  if (completedEvents.length > 0) {
    fs.appendFile(
      'completed_events.log',
      JSON.stringify(completedEvents, null, 2) + '\n',
      (err) => {
        if (err) console.error('Error logging completed events:', err);
      }
    );
    events = events.filter(event => event.scheduledTime > now); // Remove completed events
  }
});

// Start the Express server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});
