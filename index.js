const express = require('express');
const { resolve } = require('path');
const fs = require('fs');
const app = express();
const port = 3010;


app.use(express.json());
app.use(express.static('static'));

const dataPath = './data.json';
let books = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.post('/books', (req, res) => {
  const newBook = req.body;

  if (!newBook.book_id || !newBook.title || !newBook.author || !newBook.genre || !newBook.year || !newBook.copies) {
    return res.status(400).json({ error: 'All book fields are required.' });
  }

  if (books.some(book => book.book_id === newBook.book_id)) {
    return res.status(400).json({ error: 'Book with this ID already exists.' });
  }

  books.push(newBook);
  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
  res.status(201).json(newBook);
});

app.get('/books', (req, res) => {
  res.status(200).json(books);
});

app.get('/books/:id', (req, res) => {
  const book = books.find(book => book.book_id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }
  res.status(200).json(book);
});

app.put('/books/:id', (req, res) => {
  const bookIndex = books.findIndex(book => book.book_id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  books[bookIndex] = { ...books[bookIndex], ...req.body };
  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
  res.status(200).json(books[bookIndex]);
});

app.delete('/books/:id', (req, res) => {
  const bookIndex = books.findIndex(book => book.book_id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const deletedBook = books.splice(bookIndex, 1);
  fs.writeFileSync(dataPath, JSON.stringify(books, null, 2));
  res.status(200).json({ message: 'Book deleted successfully.', book: deletedBook });
});

app.listen(port, () => {
  console.log(`Library API running at http://localhost:${port}`);
});
