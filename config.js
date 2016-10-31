var path = require('path'),
    config;

config = {
	production: {
        url: 'http://rakshanshetty.in',
        mail: {},
        database: {
		    client: 'postgres',
		    connection: {
		          host: process.env.DATABASE_HOST,
		          user: process.env.DATABASE_USER,
		          password: process.env.DATABASE_PASSWORD,
		          database: process.env.DATABASE_DATABASE,
		          port: process.env.DATABASE_PORT
		        }
		    },

        server: {
            host: '0.0.0.0',
            port: process.env.PORT
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
    }
};
module.exports = config;