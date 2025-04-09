const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder if not exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// Route to generate and return public link to prescription PDF
app.post('/share-prescription', async (req, res) => {
  try {
    const { prescriptionText, phoneNumber } = req.body;

    if (!prescriptionText || !phoneNumber) {
      return res.status(400).json({ success: false, error: 'Missing text or phone number' });
    }

    const fileName = `prescription-${Date.now()}.pdf`;
    const filePath = path.join(uploadsPath, fileName);

    // Generate PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    doc.fontSize(14).text(prescriptionText);
    doc.end();

    writeStream.on('finish', () => {
      const publicLink = `http://localhost:3000/uploads/${fileName}`;
      res.json({
        success: true,
        message: 'PDF created successfully',
        link: publicLink,
      });
