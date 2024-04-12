const express = require('express');
const connectToDB = require('./config/connectToDB');
const { errorHandler, notFound } = require('./middlewares/error');
require('dotenv').config();

connectToDB();
const app = express();
app.use(express.json());

app.use('/api/user', require('./routes/authRoute'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/posts', require('./routes/postsRoutes'));
app.use('/api/comments', require('./routes/commentsRoutes'));
app.use('/api/categories', require('./routes/categoriesRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => {
    console.log(`The Server is running on port ${PORT}`)
});
