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
        }

        storage: {
				  active: 'ghost-google-drive',
				  'ghost-google-drive': {
				    key: {
				            "private_key_id": "36e871aab45f5d29bbe432d64aab067391e5a050",
				            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDS7M+6nzKoAYeI\noBSD1GcpoTebHIVjvzDRZSq6nv/1yalf/wOF4Q/9pzwEULPqRjMSfRY2GQN/pOKe\nD5GW+MD5A9euyfkiU8JzAMicmJ49sNpIqwGP/+gX2xxjK1MCwedtEIzi42MoIFAd\n7Lyu0PTQXk5GmJPUQ9xdadHMkaI8eu/PUjnDCFHzokz0s0r8lirar/Xgjyb1pfcI\ne8+NK4GKX5d6r0u32SOgqA0woGl1zZ3W2sb1ehjAZne0uDItcgmSdwCsy9Kpif+f\nu38Sta4J2MiH0Mf/lpYoRWlkq8cpwis5HUsahDpQoeWRj2kFNGyBepKNfQQBsFoe\nnES+XnupAgMBAAECggEBAJm8scw8rRd3xen3g/xynJ7jOzx7lV4WxOZa7sIHklj8\nG9A0d8TlPlqLwlsC16AyepdHRSE5KiunauX6QwvfVAgsnNBxtn0mv9xC/fXl57Df\nbrr4qbLju69nrVE7Cs4/twbvwUC+rE9a/gpRu1VQSKB3nGYoX9effsc3kguhOrcJ\nMSUnQe+sn2Rkg7Vm3ee47JLGRa57UIYzk0p6NcrSKITZU0SUuXIe2cPeLKKHkAFl\nJYMQRi6GvUzIP1mbhQ2UEVDKJEBK8EOMiY6lE0lupojNAdylsiHdzMQqZL/t3WFe\nvFZigYvbNeBcVKSptuWz1NRbymuznVtZE4BxqQRFCmECgYEA8nVnAUDZNKzumqxy\nWc911kD25HJAuPWAIcHTkWRD4rRKw5uVJxZhSHiRHP/I/UtyO9VLQ1/TEvrP3xXu\nSpQfU/ES+XoXU/lzC9dUNbLrrxH8g+pJ5MtAoDKGLHCe4Nbd2ABhp8CzrQPQeDjk\ny8TacnPSxZSNHZE6MUcNSOsFBJsCgYEA3rSNVPCMlZ4kzBUBbZqW8INT1yPJRMpn\novPWlontu8gNPQJuJMP65pbgRXaTJ1kE3oLAYjE3JOEgXubuGPDdlX3qXi0Xya6x\nJG15q05fMoFse0VLeIla5gsPUlW++CnW6ve+ChXgfeOi98fj3+xjyAS8ADWdO86J\nB7w4XuAX6wsCgYAFx1qPIxaKNNzy/s0y6sjqNF4uD7MPNXq6Uz5RpswfaSCnDNw/\nND9ZVNZQlKAbuWKdnnXOw0fqmeO+c21cha9Bdut22rwXmkhtrdIp/Xu0jn8wPbNJ\nKrb9mnasNHr07OoYrdml/+fIZeDgHKsHWEfElpIdd27tl3qFliXw6PkTpQKBgQC4\nGwaja2Cs51mAJPVTSHLzTX3n4rumVLUsLuv88vVHQXBAOVwYpLMsIRoyEn5ADwVJ\ndUnZYto1cK60BbBbifOEe91eEWUS44mplZ75kQZ92CR4G6bydIpilk4KQLxopx32\njOvbpo45RBAbSnIFUYSDe/Z3LdtX77u0W1M2i4b6VQKBgQCwwqoxMveUrvPDE6gN\nBqgIeHpX1+9QHyqCBvLPBhLBFoaSymLzr4QybqRCBpd3S7aWFGgYSF8/OQO0LgNN\nmnB4Ip/6IGDAoNYmyjOKATh39zCyoqFon4/4dSMxtVpcmNy5oL5yAc7GE5r9Jauf\nSo1Q5WfO3Rn2Dqieo3QjUpn/Qg==\n-----END PRIVATE KEY-----\n",
				            "client_email": "ghost-445@ghost-blog-147816.iam.gserviceaccount.com",
				            "client_id": "100837011272165597817",
				          }
				  }
				}
    }
};
module.exports = config;