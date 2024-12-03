
Event Notification System

A simple server-side application using Express.js, WebSocket, and Node.js that allows clients to create events, receive notifications when events are starting soon, and log completed events. The server includes a cron job that checks the events and sends notifications to connected WebSocket clients.

Features
Event Management: Users can create and view upcoming events.
Real-Time Notifications: WebSocket clients are notified when an event is about to start (5 minutes before).
Event Logging: Completed events are logged to a file (completed_events.log).
Cron Job: A cron job runs every minute to check and notify clients about upcoming events, and remove past events.
Technologies Used
Express.js: For setting up the API server.
WebSocket: For real-time communication with clients.
Node-Cron: For scheduling recurring tasks (notifications).
File System (fs): For logging completed events to a file.
