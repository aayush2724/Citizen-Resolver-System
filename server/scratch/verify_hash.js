import bcrypt from 'bcrypt';

const hash = '$2b$10$EP/D2.K.OtkK.oP1iI/0.e8sB0LhX1JjN2W5S2l2b1q7Y0/q3U/yW';
const password = 'password';

bcrypt.compare(password, hash).then(res => {
  console.log('Match:', res);
});
