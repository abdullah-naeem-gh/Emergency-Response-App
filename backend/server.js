const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = 'mongodb+srv://nabdullahself_db_user:S628k222F9fLlh2x@cluster0.pmkxu8p.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  lastLocation: {
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
  }
});

const ReportSchema = new mongoose.Schema({
  userId: String,
  type: String, // flood, fire, etc.
  description: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  timestamp: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false } // for predictive confirmations
});

const User = mongoose.model('User', UserSchema);
const Report = mongoose.model('Report', ReportSchema);

// Routes

// 1. Register/Update User Location
app.post('/api/user/location', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const update = {
      lastLocation: {
        latitude,
        longitude,
        timestamp: new Date()
      }
    };

    const user = await User.findOneAndUpdate(
      { userId },
      update,
      { upsert: true, new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Submit Report
app.post('/api/reports', async (req, res) => {
  try {
    const { userId, type, description, latitude, longitude, confirmed } = req.body;

    const report = new Report({
      userId,
      type,
      description,
      location: { latitude, longitude },
      confirmed: !!confirmed
    });

    await report.save();
    console.log(`[Report] Saved report from ${userId} at ${latitude}, ${longitude}`);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Predictive Check (Poll)
// Logic: Find if there are multiple reports of the same type near the user within X minutes
app.post('/api/predictive/check', async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    // Settings
    const RADIUS_KM = 2.0; // Check within 2km
    const TIME_WINDOW_MIN = 30; // Reports from last 30 mins
    const THRESHOLD = 2; // At least 2 reports to trigger alert

    const timeThreshold = new Date(Date.now() - TIME_WINDOW_MIN * 60000);

    // Simple Haversine approximation or just basic lat/lon range
    // 1 deg lat ~ 111km. 2km ~ 0.018 deg
    const range = 0.5; // DEBUG: Increased range to ~50km for testing

    const nearbyReports = await Report.find({
      'location.latitude': { $gte: latitude - range, $lte: latitude + range },
      'location.longitude': { $gte: longitude - range, $lte: longitude + range },
      timestamp: { $gte: timeThreshold },
      // userId: { $ne: userId } // DEBUG: Commented out to allow self-reports for testing
    });

    console.log(`[Predictive] Check for user ${userId} at ${latitude}, ${longitude}`);
    console.log(`[Predictive] Found ${nearbyReports.length} reports nearby.`);

    // Aggregate by type
    const reportCounts = {};
    nearbyReports.forEach(r => {
      reportCounts[r.type] = (reportCounts[r.type] || 0) + 1;
    });
    
    console.log(`[Predictive] Counts:`, reportCounts);

    // Find significant threat
    let significantThreat = null;
    let count = 0;

    for (const [type, c] of Object.entries(reportCounts)) {
      if (c >= THRESHOLD) {
        significantThreat = type;
        count = c;
        break; // Just take the first one for now
      }
    }

    if (significantThreat) {
      console.log(`[Predictive] THREAT CONFIRMED: ${significantThreat}`);
      res.json({
        hasThreat: true,
        type: significantThreat,
        count: count,
        location: { latitude, longitude }
      });
    } else {
      res.json({ hasThreat: false });
    }

  } catch (error) {
    console.error('Error checking predictive:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
