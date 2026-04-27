INSERT INTO users (id, name, email, password_hash, role)
VALUES (
  'usr_admin_bootstrap',
  'Administrador Inicial',
  'admin@desafioscorrida.local',
  'pbkdf2_sha256$120000$QxKOZWWGBcJLU6rUEQ6cWjQ=$GZaf0iE1O+Zes20m6q4DOasblRtYkWaX6sTbTC4XuDo=',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
