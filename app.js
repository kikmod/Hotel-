const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const port = 8800;
const helmet = require('helmet');
const session = require('express-session');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './public/img');
    },
    filename: function (request, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 3,
    },
});
app.use(
    session({
        secret: 'your-secret-key', // Replace with a strong and unique secret key
        resave: false,
        saveUninitialized: true,
    })
);

app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
const Book = require('./models/bookschema');
const Node = require('./models/nodeschema');
const Review = require('./models/review');
const Payment = require("./models/payment");
const path = require('path');

const mongoose = require('mongoose');

mongoose
    .connect('mongodb+srv://mahmoudali:kikmod@cluster0.olpza7c.mongodb.net/all-data?retryWrites=true&w=majority')
    .then((result) => {
        app.listen(process.env.PORT || port, () => {
            console.log(`Example app listening at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

app.use(helmet());

app.get('/', (req, res) => {
    res.redirect('/html');
});

app.get('/html', (req, res) => {

    Review.find()
        .then((result) => {

            res.render('index.ejs', { arrReview: result, userIsAuthenticated: req.session.userIsAuthenticated });
        })
        .catch((err) => {
        })
        .catch((err) => {
            console.log(err);
        });

});


app.get('/payment.ejs', (req, res) => {
    res.render('payment.ejs');
});
app.post("/payment", (req, res) => {
    const {
        cardNumber,
        cardHolder,
        expirationMonth,
        expirationYear,
        cvv
    } = req.body;

    // Create a new Payment object
    const payment = new Payment({
        cardNumber,
        cardHolder,
        expirationMonth,
        expirationYear,
        cvv
    });

    // Save the payment object to the database
    payment.save()
        .then(() => {
            res.redirect('/html');
        })
        .catch((error) => {
            res.status(500).send("Error saving payment: " + error);
        });
});




function calculatePrice(checkinDate, checkoutDate, adultCount, childrenCount, roomCount) {
    // Calculate the number of nights
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const numberOfNights = Math.ceil((checkout - checkin) / (1000 * 3600 * 24));

    // Calculate the total price based on the number of nights, room count, adults, and children
    const pricePerNight = 150; // Assuming the price is $100 per night
    const basePrice = pricePerNight * numberOfNights;
    const adultPrice = basePrice * adultCount;
    const childrenPrice = (basePrice / 2) * childrenCount;
    const totalPrice = (adultPrice + childrenPrice) * roomCount;

    // Return the calculated price
    return totalPrice;
}


app.post("/html", (req, res) => {
    const { checkindate, checkoutdate, adult, children, rooms } = req.body;

    // Calculate the price
    const totalPrice = calculatePrice(checkindate, checkoutdate, adult, children, rooms);

    const book = new Book(req.body);
    book
        .save()
        .then((result) => {
            // Pass the totalPrice to the payment.ejs template
            res.render('payment.ejs', { totalPrice });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('An error occurred during booking');
        });
});
app.get("/add-new-opinion.ejs", (req, res) => {
    res.render("add-new-opinion.ejs")
});
app.get('/sign-out', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while logging out:', err);
        }
        // Redirect the user to the homepage or any other desired page after logout
        res.redirect('/html');
    });
});
app.post('/add-new-opinion', async (req, res) => {
    try {
        const { reviews, name1, country } = req.body;

        const newReview = new Review({
            reviews,
            name1: name1,
            country
        });

        await newReview.save();

        res.redirect('/html');
    } catch (error) {
        console.error('Review saving error:', error);
        res.status(500).send('An error occurred while saving the review');
    }
});


app.get('/sign-up.ejs', (req, res) => {
    res.render('sign-up.ejs');
});

// Add a new route to handle the logout action



app.post('/sign-up', async (req, res) => {
    try {
        const { name, email, password, cpassword, role } = req.body;

        // Handle the errors
        if (password !== cpassword) {
            return res.render('sign-up.ejs', { error: 'Passwords do not match. Please try again.' });
        }

        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.render('sign-up.ejs', { error: 'Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit. Please try again.' });
        }

        const existingUser = await Node.findOne({ email });

        if (existingUser) {
            return res.render('sign-up.ejs', { error: 'Email already exists. Please try again with a different email.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const node = new Node({
            name,
            email,
            password: hashedPassword,
            cpassword,
            role
        });
        await node.save();

        req.session.userIsAuthenticated = true;
        if (role === 'admin') {
            // Render the admin.ejs template with necessary data
            Promise.all([Node.find(), Review.find(), Payment.find(), Book.find()])
                .then((results) => {
                    const [arrNode, arrReview, arrPayment, arrBook] = results;
                    res.render('admin.ejs', {
                        name,
                        email,
                        role,
                        arrNode,
                        arrReview,
                        arrPayment,
                        arrBook,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('An error occurred');
                });
        } else if (role === 'user') {
            // Redirect to a different page for users
            res.redirect('/html');
        } else {
            // Handle unrecognized role
            throw new Error('Unrecognized role');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        return res.render('sign-up.ejs', { error: 'An error occurred during sign-up. Please try again.' });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const node = await Node.findOne({ email });

        if (!node) {
            return res.render('login.ejs', { error: 'Invalid email or password. Please try again.' });
        }

        const passwordMatch = await bcrypt.compare(password, node.password);

        if (!passwordMatch) {
            return res.render('login.ejs', { error: 'Invalid email or password. Please try again.' });
        }
        req.session.userIsAuthenticated = true;
        // Redirect based on the user's role

        if (role === 'admin') {
            // Render the admin.ejs template with necessary data
            Promise.all([Node.find(), Review.find(), Payment.find(), Book.find()])
                .then((results) => {
                    const [arrNode, arrReview, arrPayment, arrBook] = results;
                    res.render('admin.ejs', {
                        name,
                        email,
                        role,
                        arrNode,
                        arrReview,
                        arrPayment,
                        arrBook,
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('An error occurred');
                });
        } else if (role === 'user') {
            // Redirect to a different page for users
            res.redirect('/html');
        } else {
            // Handle unrecognized role
            throw new Error('Unrecognized role');
        }


    } catch (error) {
        console.error('Login error:', error);
        return res.render('login.ejs', { error: 'An error occurred during login. Please try again.' });
    }


});
app.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while logging out:', err);
        }
        // Redirect the user to the homepage or any other desired page after logout
        res.redirect('/html');
    });
});


app.get('/login.ejs', (req, res) => {
    res.render('login.ejs');
});




app.get('/html/:id', (req, res) => {
    Node.findById(req.params.id)
        .then((result) => {
            res.render('', { objNode: result });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.delete('/html/:id', (req, res) => {
    Node.findByIdAndDelete(req.params.id)
        .then((params) => {
            res.json({ mylink: '/html' });
        })
        .catch((err) => {
            console.log(err);
        });
});



app.use((req, res) => {
    res.status(404).send("Sorry, can't find that");
});
