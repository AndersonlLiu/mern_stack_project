import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fileUpload from 'express-fileupload';
import * as bibtexParse from 'bibtex-parser-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import Publication from "../models/Publication.js";
import User from "../models/User.js";
import auth from "../auth.js";

const router = express.Router();

router.use(fileUpload());
sgMail.setApiKey('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'); 


// POST Method for creating publications
router.get("/", (req, res) => {
  // 返回HTML响应
  res.send("<h1>publication</h1>");
});

// POST Method for upload bibtex file
/*
router.post('/uploadd', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
  }

  let bibtexFile = req.files.sampleFile;

  if (!bibtexFile) {
      return res.status(400).send('Bibtex file is missing.');
  }

  try {
      // Dynamically import the parser
      console.log("bibtexParse:",bibtexParse);
      
      // Parse the .bibtex file
      let parsedData = bibtexParse.toJSON(bibtexFile.data.toString());
      console.log("parsedData:", parsedData)

      // Transform parsed data to fit your needs (adapt as necessary)
      let publications = Object.values(parsedData).map(entry => ({
          title: entry.entryTags.TITLE,
          authors: entry.entryTags.AUTHOR,
          year: entry.entryTags.YEAR,
          type: entry.entryTags.TYPE,
          topic: entry.entryTags.TOPIC,
          url: entry.entryTags.URL,
          doi: entry.entryTags.DOI
      }));
      console.log(publications)

      // Batch insert into the database
      await Publication.insertMany(publications);
      res.send('Publications added successfully');
  } catch (err) {
      console.log(err)
      res.status(500).send('Error adding publications: ' + err.message);
  }
});
*/

router.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const bibtexFile = req.files.sampleFile;

  if (!bibtexFile) {
    return res.status(400).send('Bibtex file is missing.');
  }

  try {
    // Parse the .bibtex file
    const bibtexData = bibtexFile.data.toString();

    const parsedData = bibtexParse.toJSON(bibtexData);

    // Create an array to store publications
    const publications = [];

    Object.values(parsedData).forEach(entry => {
      const topics = entry.entryTags.TOPIC ? entry.entryTags.TOPIC.split(',').map(topic => topic.trim()) : [];

      // Create a publication object with an array of topics
      const publication = {
        title: entry.entryTags.TITLE,
        authors: entry.entryTags.AUTHOR,
        year: entry.entryTags.YEAR,
        type: entry.entryTags.TYPE,
        topic: topics, // Store topics as an array
        url: entry.entryTags.URL,
        doi: entry.entryTags.DOI,
      };

      publications.push(publication);
    });

    // Batch insert into the database
    await Publication.insertMany(publications);
    res.send('Publications added successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding publications: ' + err.message);
  }
});


// POST method for User Register
router.post("/users/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            email: result.email,
            _id: result._id,
            isAdmin: result.isAdmin || false
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// POST method for User Registration with email send
router.post("/users/requestEmailConfirmation", async (request, response) => {
  try {
      const { email } = request.body;

      // Generate a unique token
      const token = crypto.randomBytes(20).toString('hex');
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 2); // token expires in 2 hours

      // create a new user instance and collect the data
      const user = new User({
          email,
          confirmationToken: token,
          tokenExpiration: expiration
      });

      // save the new user details
      await user.save();

      // Email content
      const msg = {
          to: email,
          from: 'kechengliu16@163.com',
          subject: 'Complete your registration',
          text: `Click the link to set your password and complete the registration process: http://localhost:3000/Register?complete=true&token=${token}`,
      };

      // Send the email
      await sgMail.send(msg);

      response.status(201).send({ message: 'Check your email to complete registration.' });

  } catch (error) {
      response.status(500).send({
          message: "Error occurred",error
          
      });
  }
});

// POST method for email confirmation to finish the register
router.post("/users/completeRegistration/:token", async (request, response) => {
  try {
      const { token } = request.params;
      const { password } = request.body;

      const user = await User.findOne({ confirmationToken: token, tokenExpiration: { $gt: new Date() } });

      if (!user) {
          return response.status(400).send({
              message: "Invalid or expired token."
              // Removed the _id return here since the user doesn't exist in this case
          });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.isConfirmed = true;
      user.confirmationToken = undefined; // clear the token
      user.tokenExpiration = undefined; // clear the token expiration

      await user.save();

      response.status(200).send({
          message: 'Registration complete. You can now login.',
          _id: user._id
      });

  } catch (error) {
      response.status(500).send({
          message: "Error occurred",
          error
      });
  }
});



// POST method for User SignIn
router.post("/users/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
            _id: user._id,
            isAdmin: user.isAdmin || false
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// PUT method to change password
router.put("/users/:id/password", async (request, response) => {
  const userId = request.params.id;
  const currentPassword = request.body.currentPassword;
  const newPassword = request.body.newPassword;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).send({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return response.status(401).send({
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    response.status(200).send({
      message: "Password updated successfully",
    });

  } catch (e) {
    response.status(500).send({
      message: "Error updating password",
      error: e,
    });
  }
});


// PUT method for change admin status
router.put("/users/:id/admin", async (request, response) => {
  try {
      // Fetch the user by the ID provided in the request parameter
      const user = await User.findById(request.params.id);

      // Check if the user exists
      if (!user) {
          return response.status(404).send({ message: "User not found" });
      }

      // Ensure we don't change the admin status for "admin@mola.lab"
      if (user.email === "admin@mola.lab") {
          return response.status(403).send({ message: "Cannot change the admin status for this user." });
      }

      // Toggle the isAdmin value
      user.isAdmin = !user.isAdmin;

      // Save the updated user
      await user.save();

      response.status(200).send({ message: "isAdmin status updated successfully", user });

  } catch (error) {
      response.status(500).send({ message: "Error updating user's admin status", error });
  }
});

// DELETE method for deleting a user
router.delete("/users/:userId/delete", async (req, res, next) => {
  try {
    const { userId } = req.params;  // Destructure userId from req.params

    const user = await User.findByIdAndRemove(userId);
    
    if (user) {
      return res.status(200).json({
        status: 200,
        message: "User deleted successfully",
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No user found",
      });
    }

  } catch (err) {
    return next(err);
  }
});

// GET method for fetching a user by their email
router.get("/users", async (request, response) => {
  try {
      // Get the email from the query parameter
      const { email } = request.query;

      if (!email) {
          return response.status(400).send({ message: "Email query parameter is required." });
      }

      // Fetch the user by email
      const user = await User.findOne({ email: email });

      // Check if the user exists
      if (!user) {
          return response.status(404).send({ message: "User not found." });
      }

      // Send the user data as response
      response.status(200).send(user);

  } catch (error) {
      response.status(500).send({ message: "Error fetching user by email.", error });
  }
});

// authentication endpoint
router.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "You are authorized to access me" });
});


// GET method for listing all posts
router.get("/list", async (_, res, next) => {
  try {
    const posts = await Publication.find();
    res.status(200).json({
      status: 200,
      data: posts,
    });
  } catch (err) {
    next(err);
  }
});

// Filter method
router.get("/filter", async (req, res) => {
  try {
    const query = {};

    if (req.query.title) query.title = req.query.title;
    if (req.query.authors) query.authors = { $regex: req.query.authors, $options: "i" };
    if (req.query.year) query.year = query.year = { $numberInt: req.query.year.toString() };
    if (req.query.type) query.type = req.query.type;
    if (req.query.topic) query.topic = req.query.topic;

    const publications = await Publication.find(query);
    res.status(200).json(publications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Searching method
/*
router.get('/searchh', async (req, res) => {
  try {
      const { q, year, type, topic } = req.query;

      const query = {};

      if (q) {
          const searchOrQueries = [
            { title: new RegExp(q, 'i') },
            { authors: new RegExp(q, 'i') },
            { type: new RegExp(q, 'i') },
            { topic: new RegExp(q, 'i') }
          ];

          // Check if q can be parsed into a number, and if so, include it in the search criteria for year
          const parsedYear = parseInt(q, 10);
          if (!isNaN(parsedYear)) {
            searchOrQueries.push({ year: parsedYear });
          }

          query.$or = searchOrQueries;
      }

      if (year) {
          query.year = parseInt(year);
      }

      if (type) {
          query.type = type;
      }

      if (topic) {
          query.topic = topic;
      }

      const publications = await Publication.find(query);
      res.status(200).json(publications);

  } catch (error) {
      res.status(500).json({ error: 'An error occurred while searching for publications.' });
  }
});
*/

router.get('/search', async (req, res) => {
  try {
    const { q, year, type, topic } = req.query;

    const query = {};

    if (q) {
      const searchOrQueries = [
        { title: new RegExp(q, 'i') },
        { authors: new RegExp(q, 'i') },
        { type: new RegExp(q, 'i') }
      ];

      // Check if q can be parsed into a number, and if so, include it in the search criteria for year
      const parsedYear = parseInt(q, 10);
      if (!isNaN(parsedYear)) {
        searchOrQueries.push({ year: parsedYear });
      }

      query.$or = searchOrQueries;
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (type) {
      query.type = type;
    }

    if (topic) {
      // Split the comma-separated topics into an array
      const topicsArray = topic.split(',');
      
      // Use the $in operator to search for publications with any of the specified topics
      query.topic = { $in: topicsArray };
    }

    const publications = await Publication.find(query);
    res.status(200).json(publications);

  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching for publications.' });
  }
});





// GET method for fetching a single post with "postId"
router.get("/:postId", async ({ params: { postId } }, res, next) => {
  try {
    const post = await Publication.findById(postId);
    if (post) {
      return res.status(200).json({
        status: 200,
        data: post,
      });
    }
    res.status(404).json({
      status: 404,
      message: "No post found",
    });
  } catch (err) {
    next(err);
  }
});

// PUT method for updating a single publication with "postId"
router.put("/:postId", async ({ params: { postId }, body }, res, next) => {
  try {
    const publication = await Publication.findByIdAndUpdate(postId, body, {
      new: true,
    });
    if (publication) {
      return res.status(200).json({
        status: 200,
        data: publication,
      });
    }
    res.status(404).json({
      status: 404,
      message: "No post found",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE method for deleting a single publication
router.delete("/:postId", async ({ params: { postId } }, res, next) => {
  try {
    const post = await Publication.findByIdAndRemove(postId);
    if (post) {
      return res.status(200).json({
        status: 200,
        message: "Post deleted successfully",
      });
    }
    res.status(404).json({
      status: 404,
      message: "No post found",
    });
  } catch (err) {
    next(err);
  }
});


// Error handling middleware
router.use((err, req, res, next) => {
  res.status(400).json({
    status: 400,
    message: err.message,
  });
});

export default router;
