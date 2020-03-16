const Joi =require('joi')
const Sequelize =require('sequelize')
const Hapi = require('@hapi/hapi');
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const HapiSwagger = require("hapi-swagger");
const port = process.env.PORT || 3000;
const server = new Hapi.Server({port});
const Qs = require('qs');
const { Op } = require("sequelize");

const swaggerOptions = {
    info: {
        title: 'Node Server App Demo',
        version: '0.0.1',
    }
};

(async () => {

await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ]);

  const sequelize = new Sequelize('postgres://hs@localhost:5432/hapi_demo');
  
  sequelize.authenticate().then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });
  console.log("postgres is running");

  const User = sequelize.define("users", {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      isEmail: true 
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    surname: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  const Project = sequelize.define("projects", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status: {
      type: Sequelize.DataTypes.ENUM('active', 'inactive', 'declined', 'completed'),
      allowNull: false
    }
  });

  const Task = sequelize.define("tasks", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    score: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status: {
      type: Sequelize.DataTypes.ENUM('active', 'inactive', 'declined', 'completed'),
      allowNull: false
    }
  });


  User.hasMany(Project)
  User.belongsTo(Project)
  User.hasMany(Task)
  User.belongsTo(Task)
  
  Task.hasMany(Project)
  Task.belongsTo(Project)
  

  await User.sync({ force: true });
  await Project.sync({ force: true });
  await Task.sync({ force: true });
  

// Get complete user list
server.route({
    method: 'GET',
    path: '/api/users',
    options: {
        description: 'Get all users list',
        notes: 'Return the JSON of users',
        tags: ['api'],
        handler: async (req, h) => {
            return User.findAll();
        }
    }
});

// Filter users by name and surname
server.route({
    method: 'GET',
    path: '/api/users/{name}/{surname}',
    options: {
        description: 'Get users by name and surname',
        notes: 'Return the JSON of users',
        tags: ['api'],
        handler: async (req, h) => {
          return User.findAll({ where: { name: req.params.name, surname: req.params.surname } });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
                surname: Joi.string().min(2).max(10)
            })
        }
    }
});

// Create User
server.route({
    method: 'POST',
    path: '/users',
    options: {
        description: 'Create user',
        notes: 'Create new user',
        tags: ['api'],
        handler: async (req, h) => {
            const { payload } = req;
            return User.create(payload);
        }
    }
});

// Get complete project list
server.route({
    method: 'GET',
    path: '/api/projects',
    options: {
        description: 'Get all project list',
        notes: 'Return the JSON of projects',
        tags: ['api'],
        handler: async (req, h) => {
            return Project.findAll();
        }
    }
});

// Create Project
server.route({
    method: 'POST',
    path: '/projects',
    options: {
        description: 'Create project',
        notes: 'Create new project',
        tags: ['api'],
        handler: async (req, h) => {
            const { payload } = req;
            return Project.create(payload);
        }
    }
});

// Filter projects by name and surname : need the relationship fix
server.route({
    method: 'GET',
    path: '/api/projects/{name}/{surname}',
    options: {
        description: 'Get projects by name and surname',
        notes: 'Return the JSON of projects by name and surname',
        tags: ['api'],
        handler: async (req, h) => {
          return Projects.User.findAll({ where: { name: req.params.name, surname: req.params.surname } });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
                surname: Joi.string().min(2).max(10)
            })
        }
    }
});

// Filter projects by name, surname and id : need the relationship fix
server.route({
    method: 'GET',
    path: '/api/projects/{name}/{surname}/{id}',
    options: {
        description: 'Get projects by name and surname',
        notes: 'Return the JSON of projects by name and surname',
        tags: ['api'],
        handler: async (req, h) => {
          return Projects.User.findAll({ where: { name: req.params.name, surname: req.params.surname, id: req.params.id } });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
                surname: Joi.string().min(2).max(10),
                id: Joi.string().min(2).max(10)
            })
        }
    }
});

// filter by score: Task relationship fix
server.route({
    method: 'GET',
    path: '/api/projects/score/{score}',
    options: {
        description: 'Get projects by score',
        notes: 'Return the JSON of projects by score',
        tags: ['api'],
        handler: async (req, h) => {
          return Project.Tasks.findAll({ where: { score: req.params.score} });
        },
        validate: {
            params: Joi.object({
                score: Joi.string().min(1).max(10),
            })
        }
    }
});


// filter project by name
server.route({
    method: 'GET',
    path: '/api/projects/name/{name}',
    options: {
        description: 'Get projects by name',
        notes: 'Return the JSON of projects by name',
        tags: ['api'],
        handler: async (req, h) => {
          return Project.findAll({ where: { name: req.params.name} });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
            })
        }
    }
});

// filter project by description
server.route({
    method: 'GET',
    path: '/api/projects/description/{description}',
    options: {
        description: 'Get projects by description',
        notes: 'Return the JSON of projects by description',
        tags: ['api'],
        handler: async (req, h) => {
          return Project.findAll({ where: { description: req.params.description} });
        },
        validate: {
            params: Joi.object({
                description: Joi.string().min(1).max(10),
            })
        }
    }
});

// filter project by status array: http://localhost:3000/api/projects/status/[inactive,active]
server.route({
    method: 'GET',
    path: '/api/projects/status/{status}',
    options: {
        description: 'Get projects by description',
        notes: 'Return the JSON of projects by description',
        tags: ['api'],
        handler: async (req, h) => {
          return Projects.findAll({ where: { [Op.any]: [req.params.status]} });
        },
        validate: {
            params: Joi.object({
                status: Joi.string().min(1).max(10),
            })
        }
    }
});



// Get complete tasks list
server.route({
    method: 'GET',
    path: '/api/tasks',
    options: {
        description: 'Get all task list',
        notes: 'Return the JSON of tasks',
        tags: ['api'],
        handler: async (req, h) => {
            return Task.findAll();
        }
    }
});

// Filter tasks by name and surname : need the relationship fix
server.route({
    method: 'GET',
    path: '/api/tasks/{name}/{surname}',
    options: {
        description: 'Get tasks by name and surname',
        notes: 'Return the JSON of tasks by name and surname',
        tags: ['api'],
        handler: async (req, h) => {
          return Tasks.User.findAll({ where: { name: req.params.name, surname: req.params.surname } });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
                surname: Joi.string().min(2).max(10)
            })
        }
    }
});

// Filter tasks by name, surname and id : need the relationship fix
server.route({
    method: 'GET',
    path: '/api/tasks/{name}/{surname}/{id}',
    options: {
        description: 'Get tasks by name and surname',
        notes: 'Return the JSON of projects by name and surname',
        tags: ['api'],
        handler: async (req, h) => {
          return Tasks.User.findAll({ where: { name: req.params.name, surname: req.params.surname, id: req.params.id } });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
                surname: Joi.string().min(2).max(10),
                id: Joi.string().min(2).max(10)
            })
        }
    }
});


// filter tasks by score less than
server.route({
    method: 'GET',
    path: '/api/tasks/score/{score}',
    options: {
        description: 'Get tasks by score',
        notes: 'Return the JSON of tasks by score',
        tags: ['api'],
        handler: async (req, h) => {
          return Tasks.findAll({ where: { [Op.lt]: req.params.status} });
        },
        validate: {
            params: Joi.object({
                score: Joi.string().min(1).max(10),
            })
        }
    }
});



// filter tasks by name
server.route({
    method: 'GET',
    path: '/api/tasks/name/{name}',
    options: {
        description: 'Get tasks by name',
        notes: 'Return the JSON of tasks by name',
        tags: ['api'],
        handler: async (req, h) => {
          return Tasks.findAll({ where: { name: req.params.name} });
        },
        validate: {
            params: Joi.object({
                name: Joi.string().min(1).max(10),
            })
        }
    }
});

// filter tasks by description
server.route({
    method: 'GET',
    path: '/api/tasks/description/{description}',
    options: {
        description: 'Get tasks by description',
        notes: 'Return the JSON of tasks by description',
        tags: ['api'],
        handler: async (req, h) => {
          return Tasks.findAll({ where: { description: req.params.description} });
        },
        validate: {
            params: Joi.object({
                description: Joi.string().min(1).max(10),
            })
        }
    }
});

// filter tasks by status array: [inactive,active] - Parse the querystring for the array
server.route({
    method: 'GET',
    path: '/api/tasks/status/{status}',
    options: {
        description: 'Get tasks by status',
        notes: 'Return the JSON of tasks by status',
        tags: ['api'],
        handler: async (req, h) => {
          return Tasks.findAll({ where: { [Op.any]: [req.params.status]} });
        },
        validate: {
            params: Joi.object({
                status: Joi.string().min(1).max(10),
            })
        }
    }
});


// Create Task
server.route({
    method: 'POST',
    path: '/tasks',
    options: {
        description: 'Create task',
        notes: 'Create new task',
        tags: ['api'],
        handler: async (req, h) => {
            const { payload } = req;
            return Task.create(payload);
        }
    }
});


  await server.start();
  console.log("server running at", server.info.port);
})();
