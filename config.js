var path = require('path'),
    config;

config = {
	production: {
        url: 'https://rakshan.herokuapp.com',
        mail: {},
        database: {
		    client: 'postgres',
		    connection: {
		          host: process.enc.DATABASE_HOST,
		          user: process.enc.DATABASE_USER,
		          password: process.enc.DATABASE_PASSWORD,
		          database: process.enc.DATABASE_DATABASE,
		          port: process.enc.DATABASE_PORT
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