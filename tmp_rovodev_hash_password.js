import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('\n🔐 Bcrypt Password Hash Generated:\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\n📝 SQL to create admin account:\n');
console.log('-- Run this in Supabase SQL Editor:');
console.log(`\nINSERT INTO admin_accounts (id, username, password, email, full_name, is_active)`);
console.log(`VALUES (`);
console.log(`  gen_random_uuid()::text,`);
console.log(`  'admin',`);
console.log(`  '${hash}',`);
console.log(`  'admin@masterstudent.com',`);
console.log(`  'System Administrator',`);
console.log(`  true`);
console.log(`)`);
console.log(`ON CONFLICT (username) DO UPDATE`);
console.log(`SET password = '${hash}';`);
console.log('\n');
