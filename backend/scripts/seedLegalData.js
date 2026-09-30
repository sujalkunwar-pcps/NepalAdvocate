const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const LegalDocument = require('../models/LegalDocument');

const nepalLawsPath = path.join(__dirname, '../data/nepal_laws.json');
const precedentsPath = path.join(__dirname, '../data/supreme_court_precedents.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepaladvocate';

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Clear existing documents
    await LegalDocument.deleteMany({});
    console.log('Cleared existing LegalDocument collection.');

    // 1. Seed laws
    if (fs.existsSync(nepalLawsPath)) {
      const lawsData = JSON.parse(fs.readFileSync(nepalLawsPath, 'utf8'));
      const lawsToSeed = lawsData.laws.map((law, index) => ({
        title: law.title,
        docType: 'LAW',
        content: law.content,
        keywords: law.keywords,
        externalId: `law-${index + 1}`,
      }));

      await LegalDocument.insertMany(lawsToSeed);
      console.log(`Successfully seeded ${lawsToSeed.length} laws.`);
    } else {
      console.warn('nepal_laws.json not found, skipping laws seeding.');
    }

    // 2. Seed precedents
    if (fs.existsSync(precedentsPath)) {
      const precedentsData = JSON.parse(fs.readFileSync(precedentsPath, 'utf8'));
      const precedentsToSeed = precedentsData.map((prec) => ({
        title: prec.title,
        docType: 'PRECEDENT',
        caseNo: prec.caseNo,
        summary: prec.summary,
        precedentRule: prec.precedentRule,
        category: prec.category,
        keywords: prec.keywords,
        citedLaws: prec.citedLaws,
        externalId: prec.id,
      }));

      await LegalDocument.insertMany(precedentsToSeed);
      console.log(`Successfully seeded ${precedentsToSeed.length} Supreme Court precedents.`);
    } else {
      console.warn('supreme_court_precedents.json not found, skipping precedents seeding.');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedData();
