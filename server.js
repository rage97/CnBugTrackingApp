const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up MongoDB connection
mongoose.connect('mongodb://localhost:27017/projectDB');


// Create a Project model
const Project = mongoose.model('Project', {
    name: String,
    description: String,
    author: String,
    bugReports: [{
      title: String,
      description: String,
      author: String,
      priority: { type: String, enum: ['low', 'medium', 'high'] },
      severity: { type: String, enum: ['low', 'medium', 'high'] },
    }],
  });

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
// ...

app.get('/', async (req, res) => {
    try {
      // Fetch all projects from the database
      const projects = await Project.find();
  
      // Render the index.ejs template and pass the projects data
      res.render('index', { projects });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.get('/projects/:projectId', async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).send('Project not found');
      }
  
      res.render('projectDetails', { project });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  //Delete
  app.get('/delete/:projectId', async (req, res) => {
    try {
      const projectId = req.params.projectId;
  
      // Delete the project from the database
      await Project.findByIdAndDelete(projectId);
  
      // Redirect back to the project list
      res.redirect('/');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  //update

  app.get('/update/:projectId', async (req, res) => {
    try {
      const projectId = req.params.projectId;
  
      // Fetch the project from the database
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).send('Project not found');
      }
  
      // Render the update form with the project data
      res.render('updateProject', { project });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  //search

  app.get('/search', async (req, res) => {
    try {
      const searchTerm = req.query.search;
      const searchType = req.query.searchType || 'title';
  
      let query = {};
  
      // Use a regular expression for case-insensitive search
      const regex = new RegExp(searchTerm, 'i');
  
      // Determine the field to search based on the selected type
      if (searchType === 'title') {
        query = { name: regex };
      } else if (searchType === 'author') {
        query = { author: regex };
      }
  
      // Find projects that match the search term and type
      const projects = await Project.find(query);
  
      // Render the index.ejs template with the filtered projects and search type
      res.render('index', { projects, searchTerm, searchType });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.post('/update/:projectId', async (req, res) => {
    try {
      const projectId = req.params.projectId;
  
      // Update the project in the database
      await Project.findByIdAndUpdate(projectId, {
        name: req.body.name,
        description: req.body.description,
        author: req.body.author,
      });
  
      // Redirect back to the project list
      res.redirect('/');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  

app.get('/newProject', (req, res) => {
  res.render('newProject');
});

app.post('/newProject', async (req, res) => {
  try {
    // Create a new project using the Project model
    const newProject = new Project({
      name: req.body.name,
      description: req.body.description,
      author: req.body.author,
    });

    // Save the new project to the database
    await newProject.save();

    // Redirect to the home page
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//bug report

app.post('/reportBug/:projectId', async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { bugTitle, bugDescription, bugAuthor, bugPriority, bugSeverity } = req.body;
  
      // Find the project by ID and update the bugReports array
      await Project.findByIdAndUpdate(projectId, {
        $push: {
          bugReports: {
            title: bugTitle,
            description: bugDescription,
            author: bugAuthor,
            priority: bugPriority,
            severity: bugSeverity,
          },
        },
      });
  
      // Redirect back to the project details page
      res.redirect(`/projects/${projectId}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get('/deleteBug/:projectId/:bugId', async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const bugId = req.params.bugId;
      
      // Remove the bug report from the project
      await Project.findByIdAndUpdate(projectId, {
        $pull: { bugReports: { _id: bugId } },
      });
      
      // Redirect back to the project details page
      res.redirect(`/projects/${projectId}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
