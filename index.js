const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;


// MongoDB connection URL
const url = 'mongodb+srv://AINMY:AINMY2004@cluster0.89neimr.mongodb.net/';
const dbName = 'VisitorManagementSystem'; // database name


// Middleware for parsing JSON data
app.use(express.json());


// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Extracted Token:', token);   // Extract the token from the header

  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) {
      console.error(err);
      res.status(403).json({ message: 'Invalid token' });
      return;
    }
  
    console.log('Decoded Token:', decoded);
  
    req.userId = decoded.userId;
    next();
  });  
}


// swagger middleware
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VISITSPHERE VISITOR MANAGEMENT SYSTEM',
            version: '1.0.0',
        },
    },
    apis: ['./index.js'],
};


// swagger docs
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Connect to MongoDB
MongoClient.connect(url, /*{ useUnifiedTopology: true }*/)
  .then((client) => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);


/**
 * @swagger
 * /admin/login:
 *   post:
 *     description: Admin login to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply from the server
 */
// Admin login
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // For simplicity, you can have a predefined admin username and password
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword';

    if (username === adminUsername && password === adminPassword) {
      // Generate a JSON Web Token (JWT) for admin
      const token = jwt.sign({ userType: 'admin' }, 'adminSecretKey');

      res.status(200).json({ message: 'Admin login successful', token });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


/**
 * @swagger
 * /admin/logout:
 *   post:
 *     description: Admin logout from the system
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized, invalid token or credentials
 *       500:
 *         description: Internal Server Error
 */
// Admin logout with username and password (requires a valid JWT)
app.post('/admin/logout', verifyToken, async (req, res) => {
  try {
    const { username, password } = req.body;

    // You may want to validate the username and password before proceeding

    // Optionally, you can also check if the provided credentials match the current user's credentials
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword';

    if (username === adminUsername && password === adminPassword) {
      // Use the provided credentials for additional logic (if needed)
      console.log('Admin logout initiated with username and password');

      // Optionally use the provided credentials in your logout logic

      // Invalidating the token (assuming the token is stored on the client side)
      // Note: This doesn't directly revoke the token, but the client should stop using it
      res.status(200).json({ message: 'Admin logout successful' });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


/**
 * @swagger
 * /Logout:
 *   post:
 *     description: Logout from the system
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: For user
 *         in: body
 *         description: User (Please input your name and password)
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal Server Error
 */
// Logout for user (requires a valid JWT)
app.post('/logout', verifyToken, async (req, res) => {
  try {
    // Use the provided credentials for additional logic (if needed)
    const { name, password } = req.body;

    // Perform any necessary logout operations (ignoring the payload for now)
    await db.collection('users').insertOne({ action: 'Logout', userId: req.userId });

    // Optionally use the provided credentials in your logout logic
    console.log(`Logout initiated by user: ${name}`);

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


     /**
     * @swagger
     * /Login:
     *   post:
     *     description: Login to the system
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Reply from the server
     */
    // Login for user
    app.post('/login', async (req, res) => {
      try {
        const { username, password } = req.body;

        // Find the user in the "users" collection
        const user = await db.collection('users').findOne({ username });

        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        // Compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
          res.status(401).json({ message: 'Invalid password' });
          return;
        }

        // Insert into "visitors" collection
        await db.collection('visitors').insertOne({ name: 'Login Visitor', email: 'login@visitor.com' });

        // Generate a JSON Web Token (JWT)
        const token = jwt.sign({ userId: user._id }, 'secretKey');

        res.status(200).json({ message: 'Login successful', token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
      }
    });


/**
 * @swagger
 * /visitors:
 *   post:
 *     description: Create a new visitor
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               purpose:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visitor created successfully
 *       400:
 *         description: Bad Request, invalid input data
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal Server Error
 */
// Create a new visitor (requires a valid JWT)
app.post('/visitors', verifyToken, async (req, res) => {
    try {
      const { name, email, purpose } = req.body;
  
      // Insert into "visitors" collection
      await db.collection('visitors').insertMany([{ name, email, purpose }]);
  
      res.status(201).json({ message: 'Visitor created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });
  
  
/**
 * @swagger
 * /register:
 *   post:
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request, user already exists or invalid input data
 *       500:
 *         description: Internal Server Error
 */
// Register a new user
app.post('/register', async (req, res) => {
    try {
      const { username, password, email, address } = req.body;
  
      // Check if the user already exists
      const existingUser = await db.collection('users').findOne({ username });
      if (existingUser) {
        res.status(409).json({ message: 'User already exists' });
        return;
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the user into the "users" collection
      const result = await db
        .collection('users')
        .insertOne({ username, password: hashedPassword, email, address });
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });
  

/**
 * @swagger
 * /register-security:
 *   post:
 *     description: Register a new security personnel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Security registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request, security personnel already exists or invalid input data
 *       500:
 *         description: Internal Server Error
 */
// Register a new security
app.post('/register-security', async (req, res) => {
  try {
    const { name, username, password, email } = req.body;

    // Check if the security already exists
    const existingSecurity = await db.collection('security').findOne({ username });
    if (existingSecurity) {
      res.status(409).json({ message: 'Security already exists' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the security into the "security" collection
    const result = await db
      .collection('security')
      .insertOne({ name, username, password: hashedPassword, email });

    res.status(201).json({ message: 'Security registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});


        /**
         * @swagger
         * /visitors/{name}/{email}/access:
         *   get:
         *     description: Retrieve access information for a visitor
         *     parameters:
         *       - name: name
         *         in: path
         *         description: Name of the visitor
         *         required: true
         *         schema:
         *           type: string
         *       - name: email
         *         in: path
         *         description: Email of the visitor
         *         required: true
         *         schema:
         *           type: string
         *           format: email
         *     responses:
         *       200:
         *         description: Access information retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 // Define the properties of the access information here
         *       404:
         *         description: Access information not found
         *       500:
         *         description: Internal Server Error
         */
        // View access info for a visitor
        app.get('/visitors/:name/:email/access', async (req, res) => {
          try {
            const { name, email } = req.params;

            // Retrieve the access info for the visitor from the "visitors" collection
            const visitors = await db.collection('visitors').findOne({ name, email });

            if (!visitors) {
              return res.status(404).json({ message: 'Access information not found' });
            }

            res.status(200).json(visitors);
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
          }
        });


        /**
         * @swagger
         * /visitors:
         *   get:
         *     description: Retrieve all visitors
         *     responses:
         *       200:
         *         description: Visitors retrieved successfully
         *       500:
         *         description: Internal Server Error
         */
        // Retrieve all visitors
        app.get('/visitors', async (req, res) => {
          try {
            // Retrieve all visitors from the "visitors" collection
            const visitors = await db.collection('visitors').find().toArray();
    
            res.status(200).json(visitors);
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
          }
        });
    

/**
 * @swagger
 * /visitors/{id}:
 *   patch:
 *     description: Update a visitor
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the visitor to be updated
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               purpose:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visitor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request, invalid input data
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal Server Error
 */
// Update a visitor (requires a valid JWT)
app.patch('/visitors/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, purpose } = req.body;
  
      // Update the visitor in the "visitors" collection
      await db.collection('visitors').updateOne({ _id: id }, { $set: { name, email, purpose } });
  
      res.status(200).json({ message: 'Visitor updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });
  

  /**
   * @swagger
   * /visitors/{name}:
   *   delete:
   *     description: Delete a visitor
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - name: Visitor name
   *         in: path
   *         description: Name of the visitor to be deleted
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Visitor deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       401:
   *         description: Unauthorized, invalid token
   *       500:
   *         description: Internal Server Error
   */
  // Delete a visitor (requires a valid JWT)
  app.delete('/visitors/:id', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Delete the visitor from the "visitors" collection
      const result = await db.collection('visitors').deleteOne({ _id: id });
  
      res.status(200).json({ message: 'Visitor deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });
  


    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
