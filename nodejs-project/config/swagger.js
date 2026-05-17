const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NodeJS Project API',
      version: '1.0.0',
      description: 'API backend pour le projet PFE avec gestion des utilisateurs et rôles',
      contact: {
        name: 'Support',
        email: 'support@nodejs-project.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.nodejs-project.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenu via /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de l\'utilisateur',
              example: 1
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Nom de l\'utilisateur',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur (unique)',
              example: 'john.doe@example.com'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone (optionnel)',
              example: '+33612345678'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rôle de l\'utilisateur',
              example: 'user'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
              example: '2024-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour',
              example: '2024-01-01T00:00:00.000Z'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de l\'utilisateur',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              description: 'Mot de passe de l\'utilisateur',
              example: 'password123'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              description: 'Prénom (min 2 caractères)',
              example: 'John'
            },
            lastName: {
              type: 'string',
              description: 'Nom (min 2 caractères)',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email valide et unique',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              description: 'Mot de passe (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)',
              example: 'Password123!'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone (optionnel)',
              example: '+33612345678'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message de succès',
              example: 'Connexion réussie'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT token pour l\'authentification',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token pour renouveler le JWT',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message d\'erreur',
              example: 'Email ou mot de passe incorrect'
            },
            errors: {
              type: 'array',
              description: 'Liste des erreurs de validation',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string',
                    description: 'Message d\'erreur',
                    example: 'Le prénom doit contenir au moins 2 caractères'
                  },
                  param: {
                    type: 'string',
                    description: 'Paramètre concerné',
                    example: 'firstName'
                  },
                  location: {
                    type: 'string',
                    description: 'Localisation de l\'erreur',
                    example: 'body'
                  }
                }
              }
            }
          }
        },
        StatsResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message de succès',
              example: 'Statistiques utilisateurs récupérées avec succès'
            },
            stats: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  description: 'Nombre total d\'utilisateurs',
                  example: 150
                },
                admins: {
                  type: 'integer',
                  description: 'Nombre d\'administrateurs',
                  example: 5
                },
                users: {
                  type: 'integer',
                  description: 'Nombre d\'utilisateurs standards',
                  example: 145
                },
                recentUsers: {
                  type: 'integer',
                  description: 'Nombre d\'utilisateurs créés les 30 derniers jours',
                  example: 12
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./index.js'], // Chemin vers les fichiers contenant les annotations Swagger
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
