import { getDatabase, queryAll, runSql, saveDatabase } from '../config/database';

async function main() {
  await getDatabase();

  const templeImages = [
    { id: 'temple-palani', url: '/images/temples/temple-palani.jpg' },
    { id: 'temple-madurai', url: '/images/temples/temple-madurai.jpg' },
    { id: 'temple-rameswaram', url: '/images/temples/temple-rameswaram.jpg' },
    { id: 'temple-srirangam', url: '/images/temples/temple-srirangam.jpg' },
    { id: 'temple-thanjavur', url: '/images/temples/temple-thanjavur.jpg' },
    { id: 'temple-tiruchendur', url: '/images/temples/temple-tiruchendur.jpg' },
    { id: 'temple-samayapuram', url: '/images/temples/temple-samayapuram.jpg' },
    { id: 'temple-kapaleeshwarar', url: '/images/temples/temple-kapaleeshwarar.jpg' },
    { id: 'temple-arunachaleswarar', url: '/images/temples/temple-arunachaleswarar.jpg' },
    { id: 'temple-kanchi-kamakshi', url: '/images/temples/temple-kanchi-kamakshi.jpg' },
    { id: 'temple-ekambareswarar', url: '/images/temples/temple-ekambareswarar.jpg' },
    { id: 'temple-chidambaram', url: '/images/temples/temple-chidambaram.jpg' }
  ];

  for (const item of templeImages) {
    runSql('UPDATE temples SET image_url = ? WHERE id = ?', [item.url, item.id]);
    console.log(`Updated ${item.id} -> ${item.url}`);
  }

  saveDatabase();
  console.log('Saved changes to database.sqlite');

  const rows = queryAll('SELECT id, name, image_url FROM temples ORDER BY name ASC');
  console.log('\n--- Current Temples in Database ---');
  for (const r of rows) {
    console.log(`${r.id}: ${r.name} => ${r.image_url}`);
  }
}

main().catch(err => {
  console.error('Error updating temple images:', err);
  process.exit(1);
});
