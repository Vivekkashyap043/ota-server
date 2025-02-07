const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const app = express();
app.use(cors());
app.use(fileUpload());

const BUNDLE_DIR = path.join(__dirname, 'public');
const VERSION_FILE = path.join(__dirname, 'versions.json');

app.get('/update', (req, res) => {
  if (!fs.existsSync(VERSION_FILE)) {
    return res.status(404).json({ error: 'No updates available' });
  }
  const metadata = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
  res.json(metadata);
});

app.post('/upload', (req, res) => {
  if (!req.files || !req.files.bundle) {
    return res.status(400).send('No bundle file uploaded.');
  }

  const bundleFile = req.files.bundle;
  const bundlePath = path.join(BUNDLE_DIR, 'index.bundle');

  bundleFile.mv(bundlePath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Update versions.json with the new version
    const newVersion = (Date.now()).toString(); // Unique version identifier
    const newMetadata = {
      version: newVersion,
      bundleUrl: `https://your-hosted-server.com/bundles/index.bundle`
    };

    fs.writeFileSync(VERSION_FILE, JSON.stringify(newMetadata, null, 2));

    res.json({ message: 'Bundle uploaded successfully', version: newVersion });
  });
});

app.use('/bundles', express.static(BUNDLE_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OTA Server running on port ${PORT}`);
});
