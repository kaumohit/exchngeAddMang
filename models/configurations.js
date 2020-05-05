const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({    
    /* JWT token for standard APIs */
    JWT: {
        token: {type: String, default: null},
        generated_At: { type: Date, default: Date.now },
        expires_At: { type: Date, default: null }
    },
    /* JWT token for critical APIs (viz. User Withdrawal) */
    JWT_HIGH: {
        token: {type: String, default: null},
        generated_At: { type: Date, default: Date.now },
        expires_At: { type: Date, default: null }
    },
    /* SC Address generation Auto-mode
     * If set to true: deploys SCs automatically when requirement 
     * goes below buffer_limit value.
     * If set to false: SCs are deployed on manually executing the 
     * generation script only.
    */
    GEN_ADDRESS_AUTO_MODE: {
        type: Boolean,
        default: false,
    },
    LEX_MASTER_PWD: {
        type: String,
        default: null,
    },  
    CONTRACT_BATCH_SIZE: {
        type: Number,
        default: null,
        required: true
    },
    /* The Percentage value (0-100) below which
     * Address Generation Cron will start
     */    
    BUFFER_LIMIT: {
        type: Number,
        default: null,
        required: true
    },
    created_At: { type: Date, default: Date.now },
    updated_At: { type: Date, default: Date.now }
});

module.exports = mongoose.model('configuration', addressSchema);
