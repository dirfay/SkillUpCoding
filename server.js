const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const secretKey = 'your_secret_key'; // Замініть на ваш секретний ключ

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Не вдалося підключитися до бази даних', err);
  } else {
    console.log('Підключено до бази даних SQLite');
  }
});

// === Створення таблиць, якщо їх немає ===
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    aboutMe TEXT,
    profilePhoto TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    testName TEXT NOT NULL,
    score INTEGER NOT NULL,
    timeTaken INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    codeText TEXT NOT NULL,
    language TEXT,
    dateCreated TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snippetId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    parentId INTEGER,
    commentText TEXT NOT NULL,
    dateCreated TEXT NOT NULL,
    FOREIGN KEY(snippetId) REFERENCES snippets(id),
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`);

/*
 * Варіант B: Перевіряємо, чи в таблиці snippets уже є поле likes.
 * Якщо ні — додаємо. Якщо так — пропускаємо.
 */
db.all("PRAGMA table_info(snippets)", [], (err, columns) => {
  if (err) {
    console.error("Помилка PRAGMA:", err);
  } else {
    const hasLikes = columns.some(col => col.name === 'likes');
    if (!hasLikes) {
      db.run("ALTER TABLE snippets ADD COLUMN likes INTEGER DEFAULT 0", (alterErr) => {
        if (alterErr) {
          console.log("Помилка при створенні колонки 'likes':", alterErr.message);
        } else {
          console.log("Колонка 'likes' успішно додана!");
        }
      });
    } else {
      console.log("Колонка 'likes' вже існує. Пропускаємо ALTER TABLE.");
    }
  }
});

// === authenticateToken ===
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Токен не надано' });
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Неправильний токен' });
    }
    req.user = user; 
    next();
  });
}

// ======= Маршрути =======

// *** Реєстрація ***
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ error: 'Будь ласка, заповніть всі поля' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);

  const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  stmt.run(name, email, hashedPassword, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.json({ error: 'Користувач з таким email вже існує.' });
      } else {
        res.json({ error: err.message });
      }
    } else {
      const newUserId = this.lastID;
      const token = jwt.sign({ userId: newUserId }, secretKey);
      res.json({
        userId: newUserId,
        name,
        email,
        token
      });
    }
  });
  stmt.finalize();
});

// *** Логін ***
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ error: 'Будь ласка, заповніть всі поля' });
  }
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.json({ error: err.message });
    if (!user) {
      return res.json({ error: 'Користувача не знайдено.' });
    }
    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.json({ error: 'Невірний пароль.' });
    }
    const token = jwt.sign({ userId: user.id }, secretKey);
    res.json({
      userId: user.id,
      name: user.name,
      email: user.email,
      token
    });
  });
});

// submit-result 
app.post('/submit-result', authenticateToken, (req, res) => {
  const { userId, testName, score, timeTaken } = req.body;
  if (!userId || !testName || score === undefined || timeTaken === undefined) {
    return res.json({ error: 'Неправильні дані' });
  }
  db.get(
    'SELECT id, score FROM results WHERE userId = ? AND testName = ?',
    [userId, testName],
    (err, row) => {
      if (err) return res.json({ error: err.message });
      if (!row) {
        const insertStmt = db.prepare(
          'INSERT INTO results (userId, testName, score, timeTaken) VALUES (?, ?, ?, ?)'
        );
        insertStmt.run(userId, testName, score, timeTaken, function(e2) {
          if (e2) return res.json({ error: e2.message });
          res.json({ resultId: this.lastID });
        });
        insertStmt.finalize();
      } else {
        if (score > row.score) {
          const updateStmt = db.prepare(
            'UPDATE results SET score = ?, timeTaken = ? WHERE id = ?'
          );
          updateStmt.run(score, timeTaken, row.id, function(e3) {
            if (e3) return res.json({ error: e3.message });
            res.json({ resultId: row.id });
          });
          updateStmt.finalize();
        } else {
          res.json({
            message: 'Стара спроба була краща або рівна, нічого не змінено.'
          });
        }
      }
    }
  );
});

// user-results
app.get('/user-results/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  if (parseInt(userId) !== req.user.userId) {
    return res.status(403).json({ error: 'Доступ заборонено' });
  }
  db.all('SELECT * FROM results WHERE userId = ?', [userId], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// user-info
app.get('/user-info', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  db.get('SELECT name, email, aboutMe, profilePhoto FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.json({ error: err.message });
    if (!row) return res.json({ error: 'Користувача не знайдено.' });
    res.json({
      name: row.name,
      email: row.email,
      aboutMe: row.aboutMe || '',
      profilePhoto: row.profilePhoto || ''
    });
  });
});

// update-profile (AboutMe + Фото)
app.post('/update-profile', authenticateToken, upload.single('profilePhoto'), (req, res) => {
  const userId = req.user.userId;
  const aboutMe = req.body.aboutMe || '';
  let photoPath = null;
  if (req.file) {
    photoPath = '/uploads/' + req.file.filename;
  }
  db.run(
    'UPDATE users SET aboutMe = ?, profilePhoto = ? WHERE id = ?',
    [aboutMe, photoPath, userId],
    function(err) {
      if (err) return res.json({ error: err.message });
      res.json({ success: true, profilePhoto: photoPath });
    }
  );
});

// --------------------- SNIPPETS ROUTES ---------------------

// 1) Створити новий snippet
app.post('/snippets', authenticateToken, (req, res) => {
  const { title, codeText, language } = req.body;
  const userId = req.user.userId;
  if (!title || !codeText) {
    return res.json({ error: 'Потрібно поле title і codeText.' });
  }
  const dateCreated = new Date().toISOString();

  db.run(`
    INSERT INTO snippets (userId, title, codeText, language, dateCreated)
    VALUES (?, ?, ?, ?, ?)
  `,
  [userId, title, codeText, language, dateCreated],
  function(err) {
    if (err) return res.json({ error: err.message });
    res.json({ success: true, snippetId: this.lastID });
  });
});

// 2) Отримати список snippet-ів (з підтримкою ?sort=likesDesc)
app.get('/snippets', (req, res) => {
  const sort = req.query.sort;
  let sql = `
    SELECT s.*, u.name as userName
    FROM snippets s
    JOIN users u ON s.userId = u.id
  `;

  if (sort === 'likesDesc') {
    sql += ' ORDER BY s.likes DESC';
  } else if (sort === 'dateAsc') {
    sql += ' ORDER BY s.dateCreated ASC';
  } else if (sort === 'languageAsc') {
    sql += ' ORDER BY s.language ASC';
  } else {
    sql += ' ORDER BY s.dateCreated DESC';
  }

  db.all(sql, [], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// 3) Оновити snippet
app.put('/snippets/:id', authenticateToken, (req, res) => {
  const snippetId = req.params.id;
  const { title, codeText, language } = req.body;
  db.get('SELECT userId FROM snippets WHERE id = ?', [snippetId], (err, row) => {
    if (err) return res.json({ error: err.message });
    if (!row) return res.json({ error: 'Snippet не знайдено' });
    if (row.userId !== req.user.userId) {
      return res.json({ error: 'Це snippet іншого користувача.' });
    }
    db.run(`
      UPDATE snippets
      SET title = ?, codeText = ?, language = ?
      WHERE id = ?
    `,
    [title, codeText, language, snippetId],
    function(e2) {
      if (e2) return res.json({ error: e2.message });
      res.json({ success: true });
    });
  });
});

// 4) Видалити snippet
app.delete('/snippets/:id', authenticateToken, (req, res) => {
  const snippetId = req.params.id;
  db.get('SELECT userId FROM snippets WHERE id = ?', [snippetId], (err, row) => {
    if (err) return res.json({ error: err.message });
    if (!row) return res.json({ error: 'Snippet не знайдено' });
    if (row.userId !== req.user.userId) {
      return res.json({ error: 'Недостатньо прав для видалення.' });
    }
    db.run('DELETE FROM snippets WHERE id = ?', [snippetId], function(e2) {
      if (e2) return res.json({ error: e2.message });
      res.json({ success: true });
    });
  });
});

// 5) Лайк snippet
app.post('/snippets/:id/like', authenticateToken, (req, res) => {
  const snippetId = req.params.id;
  db.run('UPDATE snippets SET likes = likes + 1 WHERE id = ?', [snippetId], function(err) {
    if (err) return res.json({ error: err.message });
    if (this.changes === 0) {
      return res.json({ error: 'Snippet не знайдено.' });
    }
    res.json({ success: true });
  });
});

// Додати коментар до snippet-a
app.post('/snippets/:snippetId/comments', authenticateToken, (req, res) => {
  const snippetId = req.params.snippetId;
  const userId = req.user.userId;  // з JWT
  const { commentText, parentId } = req.body;

  if (!commentText) {
    return res.json({ error: 'Текст коментаря не може бути порожнім.' });
  }
  const dateCreated = new Date().toISOString();

  db.run(`
    INSERT INTO comments (snippetId, userId, parentId, commentText, dateCreated)
    VALUES (?, ?, ?, ?, ?)
  `,
  [snippetId, userId, parentId || null, commentText, dateCreated],
  function(err) {
    if (err) return res.json({ error: err.message });
    res.json({ success: true, commentId: this.lastID });
  });
});

app.get('/snippets/:snippetId/comments', (req, res) => {
  const snippetId = req.params.snippetId;

  const sql = `
    SELECT c.*, u.name as userName
    FROM comments c
    JOIN users u ON c.userId = u.id
    WHERE c.snippetId = ?
    ORDER BY c.dateCreated ASC
  `;
  db.all(sql, [snippetId], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/comments/:commentId', authenticateToken, (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.userId;

  // Спочатку з'ясуємо, чий це коментар
  db.get('SELECT userId FROM comments WHERE id = ?', [commentId], (err, row) => {
    if (err) return res.json({ error: err.message });
    if (!row) return res.json({ error: 'Коментар не знайдено.' });

    // Перевіряємо, чи це автор
    if (row.userId !== userId) {
      return res.json({ error: 'Недостатньо прав для видалення.' });
    }

    db.run('DELETE FROM comments WHERE id = ?', [commentId], function(e2) {
      if (e2) return res.json({ error: e2.message });
      res.json({ success: true });
    });
  });
});

app.put('/comments/:commentId', authenticateToken, (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.userId;
  const { newText } = req.body;

  if (!newText) {
    return res.json({ error: 'Текст не може бути порожнім при редагуванні.' });
  }

  // Той самий підхід: перевірити, чи це автор
  db.get('SELECT userId FROM comments WHERE id = ?', [commentId], (err, row) => {
    if (err) return res.json({ error: err.message });
    if (!row) return res.json({ error: 'Коментар не знайдено.' });
    if (row.userId !== userId) {
      return res.json({ error: 'Недостатньо прав для редагування.' });
    }

    // Оновлюємо
    db.run(`
      UPDATE comments
      SET commentText = ?
      WHERE id = ?
    `,
    [newText, commentId],
    function(e2) {
      if (e2) return res.json({ error: e2.message });
      res.json({ success: true });
    });
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущений на порті ${port}`);
});