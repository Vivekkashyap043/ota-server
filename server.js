const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
app.use(cors());
app.use(fileUpload());

const BUNDLE_DIR = path.join(__dirname, 'bundles');
const VERSION_FILE = path.join(__dirname, 'versions.json');

if (!fs.existsSync(BUNDLE_DIR)) {
  fs.mkdirSync(BUNDLE_DIR, { recursive: true });
}

// API to check for updates
app.get('/update', (req, res) => {
  if (!fs.existsSync(VERSION_FILE)) {
    return res.status(404).json({ error: 'No updates available' });
  }
  const metadata = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
  res.json(metadata);
});

// API to upload a new update
app.post('/upload', (req, res) => {
  if (!req.files || !req.files.bundle) {
    return res.status(400).json({ error: 'No bundle file uploaded.' });
  }

  const bundleFile = req.files.bundle;
  const bundlePath = path.join(BUNDLE_DIR, 'update.zip');

  bundleFile.mv(bundlePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed', details: err });
    }

    const newVersion = Date.now().toString(); // Unique version identifier
    const newMetadata = {
      version: newVersion,
      bundleUrl: `https://your-server.com/bundles/update.zip`
    };

    fs.writeFileSync(VERSION_FILE, JSON.stringify(newMetadata, null, 2));

    res.json({ message: 'Bundle uploaded successfully', version: newVersion });
  });
});

// Serve bundle files
app.use('/bundles', express.static(BUNDLE_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ OTA Server running on port ${PORT}`);
});
