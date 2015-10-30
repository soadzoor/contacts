var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({
    identity: 'contact',
    connection: 'disk',
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        phone: {
            type: 'string',
            required: true
        },
        email: 'string',
        provider: 'string',
        user: {
            model: 'user'
        }
        
    }
});