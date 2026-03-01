// Script to update MongoDB resources with local image URLs
// Images are in public/resources/ and served as /resources/image_993852797_N.jpg
// They correspond to the first 66 rows of the CSV (by index order)

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resource from '../server/src/models/Resource.js';

dotenv.config();

// Map of row index -> resource title (from CSV row order)
const imageMap = [
  [0,  'Glass Stirring Rod'],
  [1,  'Test Tube Brush'],
  [2,  'Double Convex Glass Lens'],
  [3,  'Glass Alcohol Burner Lamp'],
  [4,  'Borosilicate Glass Funnel (75mm)'],
  [5,  'Porcelain Spatula'],
  [6,  'Glass Test Tube (16 X 150)'],
  [7,  'Glass Beaker (50 mL)'],
  [8,  'Glass Beaker (250 mL)'],
  [9,  'Glass Jar Bottle (Medium)'],
  [10, 'Glass Jar Bottle (Small)'],
  [11, 'Tripod Stand or Cast Iron Stand'],
  [12, 'Erlenmeyer Flask (250 mL)'],
  [13, 'Magnifying Glass (50mm)'],
  [14, 'Double Beam Balance'],
  [15, 'Safety Goggles'],
  [16, 'Super Nitrile Gloves'],
  [17, 'Anemometer with Wind Vane (Cup Type)'],
  [18, 'Polycarbonate Thermometer'],
  [19, 'Aneroid Barometer (Wall Mount)'],
  [20, 'Aneroid Barometer Set (Demonstration Type)'],
  [21, 'Human Nose Model'],
  [22, 'Human Torso'],
  [23, 'Human Anatomy Half Body'],
  [24, 'Tailoring Rule'],
  [25, 'Hanging Scale'],
  [26, 'Mechanical dial kitchen scale'],
  [27, 'Mechanical Scale'],
  [28, 'Measuring spoons (Set of 6)'],
  [29, 'Measuring Jars (Set of 5pcs)'],
  [30, 'Meauring Cups (Set of 5pcs)'],
  [31, 'Measuring Pitchers (Set of 3pcs)'],
  [32, 'Ruler (student type)'],
  [33, 'Protractor, Student-type'],
  [34, 'Alphabetong  Filipino Flashcards'],
  [35, 'Pentaminoes Set'],
  [36, 'Geoboard, 5x5'],
  [37, 'Probability Kit'],
  [38, 'Cuisenaire Rods, set of 5'],
  [39, 'Base Ten Blocks'],
  [40, 'Plastic Two colored Counters, 1-inch diameter, 200 pcs/set'],
  [41, 'Elapsed Time (Clock) Set'],
  [42, 'Pattern Blocks, 250 pcs/set'],
  [43, 'Geostrips'],
  [44, 'Round Plastic Beads (Different Colors)'],
  [45, 'Linking Cubes'],
  [46, 'Number Blocks (5 sets)'],
  [47, 'Math Set Geometry Stencil'],
  [48, 'Dry Cell, 1.5 volts, Size D'],
  [49, 'Dry Cell Holder (Size D)'],
  [50, 'Pair of Bar Magnets'],
  [51, 'Switch, Knife type, Single Pole Single Throw'],
  [52, 'Connector, Black'],
  [53, 'Connector, Red'],
  [54, 'Miniature Light Bulb'],
  [55, 'Filipino (Marungko Approach) "Magbasa Tayo - Level A"'],
  [56, 'Filipino (Marungko Approach) "Magbasa Tayo - Level B"'],
  [57, 'Filipino (Marungko Approach) "Magbasa Tayo - Level C"'],
  [58, 'Filipino (Marungko Approach) "Magbasa Tayo - Level D"'],
  [59, 'Filipino (Marungko Approach) "Magbasa Tayo - Level E"'],
  [60, 'Ang Mga Bidang Basura'],
  [61, 'Si Tila at si Polka'],
  [62, 'Baryo Bantas'],
  [63, 'Superhero ba ang Lola ko?'],
  [64, 'Brownout'],
  [65, 'Ang Pagbabago ni Nato'],
];

async function updateImages() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}\n`);

  let updated = 0;
  let notFound = 0;

  for (const [index, title] of imageMap) {
    const imageUrl = `/resources/image_993852797_${index}.jpg`;

    const result = await Resource.findOneAndUpdate(
      { title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      { $set: { pictureUrl: imageUrl, imageUrl: imageUrl } },
      { new: true }
    );

    if (result) {
      console.log(`  ✅ [${index}] "${title}" → ${imageUrl}`);
      updated++;
    } else {
      console.log(`  ⚠️  [${index}] NOT FOUND: "${title}"`);
      notFound++;
    }
  }

  console.log(`\n✅ Done! Updated: ${updated}, Not found: ${notFound}`);
  await mongoose.disconnect();
}

updateImages().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
