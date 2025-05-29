require('dotenv').config(); // Loads environment variables from a .env file
const express = require('express'); // Web server framework
const cors = require('cors'); // Allows your site to be accessed from other places
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your website files

// These lines connect your main server to the code that handles each part of your app
const leadsRouter = require('./routes/leads');
const customersRouter = require('./routes/customers');
const inventoryRouter = require('./routes/inventory');
const calendarRouter = require('./routes/calendar');

// These lines tell your server to use the routers above for different types of data
app.use('/api/leads', leadsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/calendar', calendarRouter);

// This line makes sure your website loads correctly if someone visits a page directly
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// This starts your server on the correct port (from .env or default 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});