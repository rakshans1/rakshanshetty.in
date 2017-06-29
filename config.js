var path = require('path'),
    config,

config = {
	production: {
        url: 'http://rakshanshetty.in',
        mail: {
              from: '"Rakshan Shetty" <shetty.raxx555@gmail.com>',
              transport: 'SMTP',
              options: {
                service: 'Sendgrid',
                auth: {
                  user: process.env.SENDGRID_USERNAME,
                  pass: process.env.SENDGRID_PASSWORD
                }
              }
            },
            
        database: {
                client: 'postgres',
                connection: process.env.DATABASE_URL,
                debug: false
            },

        server: {
            host: '0.0.0.0',
            port: process.env.PORT
        },

        paths: {
		      contentPath: path.join(__dirname, '/content/')
		    },

        storage: {
				    active: 'ghost-cloudinary-store',
				    'ghost-cloudinary-store': {
				        secure: true,
				        cloud_name: process.env.CLOUDINARY_NAME,
				        api_key: process.env.CLOUDINARY_API,
				        api_secret: process.env.CLOUDINARY_SECRET
				    }
				}
    },
	development: {
    url: 'http://localhost:3000',
    server: {
        host: '0.0.0.0',
        port: 3000
    },
    paths: {
      contentPath: path.join(__dirname, '/content/')
    },
		database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost-dev.db')
            },
            debug: false
        }
    }
};
module.exports = config;