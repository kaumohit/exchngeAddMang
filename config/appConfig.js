require('dotenv').config();
const PRIV_KEY_MAP = {
	'0x599c1d74B9C103Ddb509cCC723d91e56c1C931e8': process.env.PRIVATE_KEY_1,
	'0x07B99Ab633C32607B56c167BC8296f3381a7B67f': process.env.PRIVATE_KEY_2
}
module.exports = {
	PRIV_KEY_MAP,
	TXN_DISPLAY_LIMIT: process.env.TX_LIST_DEF_LIMIT,
	ACTIVE_NETWORK: process.env.activeNetwork, 
	NETWORK: process.env.activeNetwork == 'test' ? 'kovan' : 'mainnet', 
	PORT: process.env.PORT || 3001,
	HOST: process.env.HOST,
	DB_URL: process.env.MONGODB_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	PARENT_CONTRACT: process.env.PARENT_CONTRACT,
	FACTORY_CONTRACT_ADDRESS: process.env.FACTORY_ADDR,
	SALT: String(process.env.SALT),
	PASS: String(process.env.PASS),
	KEYSIZE: Number(process.env.KEYSIZE),
	ITERATION: Number(process.env.ITERATION)
}
