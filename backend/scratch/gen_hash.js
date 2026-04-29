import bcrypt from 'bcrypt';

bcrypt.hash('password', 10).then(hash => {
  console.log('New Hash:', hash);
});
