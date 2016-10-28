var path = require('path'),
    config;

config = {
	production: {
        url: 'https://rakshan.herokuapp.com',
        mail: {},
        database: {
		    client: 'postgres',
		    connection: {
		          host: 'ec2-54-225-90-198.compute-1.amazonaws.com',
		          user: 'kfhbfwhumwtgkn',
		          password: 'GUpQPpfZhv9TQg5tBWY3JpqU8J',
		          database: 'd9sge3dnme1b4u',
		          port: '5432'
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
				        cloud_name: 'hdunvneld',
				        api_key: '388153881578662',
				        api_secret: 'oGk1zXCOAKhmab4mxR30BHoRx4c'
				    }
				}
    }
};
module.exports = config;