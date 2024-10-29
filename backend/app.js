require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const cors = require('cors');
const app = express();

app.use(
	cors({
		origin: '*',
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => {
	res.json({
		message: 'success',
	});
});
app.post('/create-user', async (req, res) => {
	try {
		const { username, email, number } = req.body;
		if (!username || !email || !number) {
			return res.status(400).json({
				error: true,
				message: `All field is required`,
			});
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				error: true,
				message: 'Email already exists',
			});
		}

		const newUser = new User({
			username,
			email,
			number,
		});
		await newUser.save();
		const accessToken = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: '1d',
		});
		return res.json({
			message: 'User added successfully',
			error: false,
			user: newUser,
			accessToken,
		});
	} catch (error) {
		console.error('Error creating user:', error);
		return res.status(500).json({
			error: true,
			message: 'An error occurred while creating the user',
		});
	}
});

app.get('/get-user/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const user = await User.findById(id);
		if (!user) {
			return res.status(500).json({
				message: 'User not found',
			});
		}
		return res.status(200).json({
			message: 'Successfuly founded user',
			user,
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: 'An error occurred while creating the user',
		});
	}
});

app.put('/update-user/:id', async (req, res) => {
	try {
		const id = req.params.id;
		console.log(req.body)
		const { username, email, number } = req.body;
		const user = await User.findById(id);
		if (!user) {
			return res.status(400).json({
				message: 'User not found',
				error: true,
			});
		}

		const updatedUser = await User.findByIdAndUpdate(
			id,
			{
				username,
				email,
				number,
			},
			{
				new: true,
			}
		);

		return res.status(200).json({
			message: 'Successfuly updated user',
			updatedUser,
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Something went wrong while updating user',
			error,
		});
	}
});

app.delete('/remove-user/:id', async (req, res) => {
	try {
		const id = req.params.id;
		const user = await User.findById(id);
		if (!user) {
			return res.status(400).json({
				message: 'User not found',
				error: true,
			});
		}

		const removedUser = await User.findByIdAndDelete(id);

		return res.status(200).json({
			message: 'Successfuly deleted account',
			removedUser,
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Something went wrong while updating user',
			error,
		});
	}
});

app.get('/get-all-users', async (req, res) => {
	try {
		const users = await User.find();
		if (!users) {
			return res.status(400).json({
				message: 'Users not found',
				users: null,
			});
		}
		return res.status(200).json({
			message: 'Users found successfuly',
			users,
		});
	} catch (error) {
		return res.status(500).json({
			message: 'Something went wrong while updating user',
			error,
		});
	}
});

app.listen(PORT, () => {
	try {
		mongoose
			.connect(process.env.MONGO_URL, {})
			.then(() => {
				console.log('DB connected');
			})
			.catch((err) => {
				console.error('Error connecting to database:', err);
			});
	} catch (error) {
		console.log('Error while connectind data base', error);
	}
	console.log(`Server has been started on PORT: ${PORT}`);
});
