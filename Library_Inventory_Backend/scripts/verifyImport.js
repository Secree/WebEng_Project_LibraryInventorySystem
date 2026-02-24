// Quick script to verify imported resources
import { db } from '../server/src/config/firebase.js';

async function verifyImport() {
  try {
    const snapshot = await db.collection('resources').get();
    console.log(`✅ Total resources in database: ${snapshot.size}`);
    
    // Show sample of imported data
    console.log('\n📋 Sample resources:');
    let count = 0;
    snapshot.forEach(doc => {
      if (count < 5) {
        const data = doc.data();
        console.log(`\n${count + 1}. ${data.title}`);
        console.log(`   Type: ${data.type}`);
        console.log(`   Quantity: ${data.quantity}`);
        console.log(`   Status: ${data.status}`);
        count++;
      }
    });
    
    // Group by type
    const types = {};
    snapshot.forEach(doc => {
      const type = doc.data().type;
      types[type] = (types[type] || 0) + 1;
    });
    
    console.log('\n📊 Resources by type:');
    Object.entries(types).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyImport();
