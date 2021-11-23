require('dotenv').config();

const express = require('express');
const cors = require('cors');

const api = require('./routes/index');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

connectDB();

app.get('/', (req, res) => {
    res.status(200).json({message: 'This API is working!!!'})
})

app.use('/api', api);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});