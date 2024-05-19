const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Account = require('./models/Account');
const Building = require('./models/Building');
const BuildReq = require('./models/BuildReq');
const Discount = require('./models/Discount');
const InventoryItem = require('./models/InventoryItem');
const RevokedToken = require('./models/RevokedToken');
const AllianceEvent = require('./models/AllianceEvent');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const env = process.env.NODE_ENV;
const port = process.env.PORT || 3001;
const host = 'http://localhost'
const origin = env === 'production' ? 'https://fresh-fare-backend.vercel.app/' : host+':3000';

const corsOptions = {
	origin: true,
	credentials: true
}

// Middlewares
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.listen(port,() => {
    console.log("Server running on: " + host + ':' + port);
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

app.get("/", (req, res) => res.send("Express on Vercel"));

function log(message) {
	let datetime = new Date().toISOString();
	console.log(datetime + "	" + message);
}

async function verifyToken(req, res, next) {
	
	const token = req.cookies.token;
	
	if (!token) {
		log("No token sent");
		return res.status(401).json({message: 'No token provided'});
	}
	
	
	try {
		const revokedToken = await RevokedToken.findOne({token});
		if (revokedToken) {
			log("Revoked token");
			return res.status(401).json({message: 'Token has been revoked.'});
		}
	} catch (error) {
		return res.status(401).json({message: 'Failed to authenticate token.'});
	}	
		
	jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
		if (err) {
			return res.status(401).json({message: 'Token has expired.'});
		}
	});
		
	next();

}

// Register route
app.post('/register', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ $or: [{email },{username}]});
        if (user) return res.status(400).send('User already registered.');
		
        user = new User({ username, email, password });
        await user.save();

        res.status(201).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login route
app.post('/login', async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('Invalid username.');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid password.');

		const token = jwt.sign({ _id: user._id}, process.env.JWT_SECRET); // , {expiresIn: '4h'} on end to reinstate expire
        res.cookie('token', token, {httpOnly: true,sameSite: 'None', secure: true});
		const name = user.username;
        res.send({name});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login route
app.post('/logout',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { user } = req.body;
	const token = req.cookies.token;
	let revToken = new RevokedToken({token});
	await revToken.save();
	
	log(user + " successfully logged out.");
	res.json({message: 'Logout successful.'})
});

// Login route
app.post('/getAccounts',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { user } = req.body;
        const accs = await Account.find({ 'user': user });
        if (!accs) return res.status(400).send('Invalid username.');
        res.send({ accs });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// get user route
app.post('/addAccount',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { user, accName } = req.body;
	let buildings = [];
	
	//first get list of buildings to populate Account Array
	try {
		const buildingList = await Building.find().select('name');
		buildings = buildingList.map(building => ({'name': building.name, 'level': 0}));
	} catch (error) {
		res.status(500).send(error.message);
	}
	

	let account = new Account({'user': user, 'name': accName, 'buildings': buildings});
	await account.save();
	res.send({ account});
});

// get user route
app.post('/removeAccount',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { user, accName } = req.body;
	
	try {
		const acc = await Account.findOneAndDelete({ $and : [{ 'user' : user },{'name' : accName} ]});
	} catch (error) {
		res.status(500).send(error.message);
	}
	
	res.status(200).send('Successfully deleted: ' + accName);
});

// get user route
app.post('/updateGearLevel', verifyToken, async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ body: "OK" });
    }

    const { user, acToUpdate, newGear, type } = req.body;
    let gearPiece = JSON.parse(newGear);

    try {
        // Find the account
        const account = await Account.findOne({ 'user': user, 'name': acToUpdate });

        if (!account) {
            return res.status(404).send('Account not found');
        }

        // Ensure that boosts is initialized
        if (!account.boosts) {
            account.boosts = {};
        }

        // Ensure that buildergear is initialized
		if (type === 'build') {
			if (!account.boosts.buildergear) {
				account.boosts.buildergear = [];
			}
			
			// Find the index of the gearPiece in the buildergear array
			let index = account.boosts.buildergear.findIndex(item => item.name === gearPiece.name);

			// If gearPiece exists in the array, update its level property
			if (index !== -1) {
				account.boosts.buildergear[index].level = parseInt(gearPiece.level);
			} else {
				// If gearPiece doesn't exist, add it to the array
				account.boosts.buildergear.push({ name: gearPiece.name, level: gearPiece.level });
			}
			
		} else {
			if (!account.boosts.researchgear) {
				account.boosts.researchgear = [];
			}
			// Find the index of the gearPiece in the buildergear array
			let index = account.boosts.researchgear.findIndex(item => item.name === gearPiece.name);

			// If gearPiece exists in the array, update its level property
			if (index !== -1) {
				account.boosts.researchgear[index].level = parseInt(gearPiece.level);
			} else {
				// If gearPiece doesn't exist, add it to the array
				account.boosts.researchgear.push({ name: gearPiece.name, level: gearPiece.level });
			}
		}

		account.markModified('boosts');
        // Save the changes to the document
        await account.save();
		
        log("Updated " + user + "'s account named " + acToUpdate + " to have " + gearPiece.level + "* " + gearPiece.name + ".");
        res.status(200).send('Successfully updated: ' + acToUpdate + ' with new gear: ' + gearPiece);
    } catch (error) {
        log("Failed to update " + user + "'s account named " + acToUpdate + " to have " + gearPiece.level + "* " + gearPiece.name + ".");
        res.status(500).send(error.message);
    }
});

// get user route
app.post('/deleteGear',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { user, acToUpdate, gearPiece, type } = req.body;
	
	Account.updateOne({'user': user, 'name': acToUpdate},{ $pull: { 'boosts.buildergear': {'name': gearPiece}}}).then((result) => {
		log("Updated " + user + "'s account named " + acToUpdate + " to remove " + gearPiece + ".");
		res.status(200).send('Successfully updated: ' + acToUpdate + ' to remove: ' + gearPiece);
	}).catch((err) => {
		log("Failed to update " + user + "'s account named " + acToUpdate + " to remove " + gearPiece + ".");
		res.status(500).send(err.message);
	});

});

// get user route
app.post('/updateHeroLevel', verifyToken, async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ body: "OK" });
    }

    const { user, acToUpdate, newHero } = req.body;
    let hero = JSON.parse(newHero);

    try {
        // Find the account
        const account = await Account.findOne({ 'user': user, 'name': acToUpdate });

        if (!account) {
            return res.status(404).send('Account not found');
        }

        // Ensure that boosts is initialized
        if (!account.boosts) {
            account.boosts = {};
        }


		if (!account.boosts.heroes) {
			account.boosts.heroes = [];
		}
		
		// Find the index of the hero in the heroes array
		let index = account.boosts.heroes.findIndex(item => item.name === hero.name);

		// If hero exists in the array, update it
		if (index !== -1) {
			account.boosts.heroes[index] = hero;
		} else {
			// If hero doesn't exist, add it to the array
			account.boosts.heroes.push(hero);
		}


		account.markModified('boosts');
        // Save the changes to the document
        await account.save();
		
        log("Updated " + user + "'s account named " + acToUpdate + " to have +" + hero.plus + " " + hero.name + " at level " + hero.level + ".");
        res.status(200).send('Successfully updated: ' + acToUpdate + ' with new hero: ' + hero);
    } catch (error) {
        log("Failed to update " + user + "'s account named " + acToUpdate + " to have +" + hero.plus + " " + hero.name + " at level " + hero.level + ".");
        res.status(500).send(error.message);
    }
});

// get user route
app.post('/deleteHero',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { user, acToUpdate, hero } = req.body;
	
	Account.updateOne({'user': user, 'name': acToUpdate},{ $pull: { 'boosts.heroes': {'name': hero}}}).then((result) => {
		log("Updated " + user + "'s account named " + acToUpdate + " to remove " + hero + ".");
		res.status(200).send('Successfully updated: ' + acToUpdate + ' to remove: ' + hero);
	}).catch((err) => {
		log("Failed to update " + user + "'s account named " + acToUpdate + " to remove " + hero + ".");
		res.status(500).send(err.message);
	});

});

// get user route
app.post('/updateBoosts', verifyToken, async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ body: "OK" });
    }

    const { user, acToUpdate, newboost } = req.body;
    let boost = JSON.parse(newboost);

    try {
        // Find the account
        const account = await Account.findOne({ 'user': user, 'name': acToUpdate });

        if (!account) {
            return res.status(404).send('Account not found');
        }

        // Ensure that boosts is initialized
        if (!account.boosts) {
			log('Creating boosts list for ' + account.name);
            account.boosts = {};
        }


		if (!account.boosts.speeds) {
			log('Creating speed boosts list for ' + account.name);
			account.boosts.speeds = [];
		}
		
		// Find the index of the boost in the heroes array
		let index = account.boosts.speeds.findIndex(item => item.name === boost.name);

		// If boost exists in the array, update it
		if (index !== -1) {
			account.boosts.speeds[index] = boost;
		} else {
			// If boost doesn't exist, add it to the array
			account.boosts.speeds.push(boost);
		}


		account.markModified('boosts');
        // Save the changes to the document
        await account.save();
		
        log("Updated " + user + "'s account named " + acToUpdate + " to have " + boost.name + ": " + boost.value + "%.");
        res.status(200).send('Successfully updated: ' + acToUpdate + ' with new boost value: ' + boost.name + ": " + boost.value + "%.");
    } catch (error) {
        log("Failed to update " + user + "'s account named " + acToUpdate + " to have " + boost.name + ": " + boost.value + "%.");
        res.status(500).send(error.message);
    }
});

// get user route
app.post('/inventory',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { user, accName } = req.body;
        const account = await Account.findOne({ 'user': user, 'name': accName },'inventory');
        if (!account) return res.status(400).send('Invalid username or account name');
        res.send({ account});
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// get user route
app.post('/addToInventory',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	const { user, accName, newItem } = req.body;
	const newit = await new InventoryItem(newItem);
	
	Account.updateOne({'user': user, 'name': accName},{ $push: { 'inventory': newit}}).then((result) => {
		log("Added item to " + user + " account named " + accName + ".");
	}).catch((err) => {
		log("Failed to add item to " + user + " account named " + accName + ".");
		res.status(500).send(error.message);
	});
	
	res.status(200).send('Successfully added: ' + newItem + " to " + accName);
});

// get user route
app.post('/removeFromInventory',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user, accName, itrm } = req.body;
	const rmit = new InventoryItem(itrm);
	Account.updateOne({'user': user, 'name': accName},{ $pull: { 'inventory': rmit}}).then((result) => {
		log("Removed item from " + user + " account named " + accName + ".");
	}).catch((err) => {
		log("Failed to remove item from" + user + " account named " + accName + ".");
	});

});

app.post('/updateInventory',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user, accName, item, name } = req.body;
	
	await Account.updateOne({'user': user, 'name': accName, 'inventory.name': name},
	{ $set: { 'inventory.$.name': item.name, 'inventory.$.quantity': item.quantity}}).then((result) => {
		log("Updated item in " + user + " account named " + accName + ".");
	}).catch((err) => {
		log("Failed to update item in " + user + " account named " + accName + ".");
	});
});

// get user route
app.post('/sanctuary',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    try {
        const { user, accName } = req.body;
        const account = await Account.findOne({ 'user': user, 'name': accName },'buildings');
        if (!account) return res.status(400).send('Invalid username or account name');
        res.send({ account});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/updateSanctuary',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
    const { user, accName, building } = req.body;
	let name = building.name;
	let level = building.level;
	
	await Account.updateOne({'user': user, 'name': accName, 'buildings.name': name},
	{ $set: { 'buildings.$.level': level}}).then((result) => {
		log("Updated " + name + " in " + user + "'s account named " + accName + " to level " + level + ".");
	}).catch((err) => {
		log("Failed to update building in " + user + "'s account named " + accName + ".");
	});
});

app.post('/getBuildRequirements',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	try {
		const doc = await BuildReq.findOne({});
		if (!doc) return res.status(400).send('Could not get requirements collection');
		res.send({doc});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/getRSSRequirements',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const { names, gearLevel } = req.body;
	let neededBuildings = []
	try {
		for (let i = 0; i < names.length; i++) {
			const building = await Building.findOne({ 'name': names[i], 'gear_levels.gearlevel': gearLevel});
			if (!building) return res.status(400).send('Could not get rss requirements for: ' + names[i]);
			const buildLevels = building.gear_levels.find(({ gearlevel}) => gearlevel == gearLevel).buildlevels;
			neededBuildings.push({'name': names[i], 'buildLevels': buildLevels});
		}
		res.send({neededBuildings});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/getRSSDiscounts',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }

	try {
		const discounts = await Discount.findOne({});
		if (!discounts) return res.status(400).send('Could not get rss discounts.');
		res.send({discounts});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/getAllianceEvents',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }

	try {
		const events = await AllianceEvent.findOne({ 'alliance_name': "SYN"});
		if (!events) return res.status(400).send('Could not get alliance events.');
		res.send({events});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/updateAllianceEvent',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }

	const { tarEve, evIdx } = req.body;
	let eve = JSON.parse(tarEve);
	try {

			// Find the account
			const eventList = await AllianceEvent.findOne({ 'alliance_name': "SYN"});

			if (!eventList) {
				return res.status(404).send('Events not found');
			}

			// Ensure that events is initialized
			if (!eventList.events) {
				log('Creating events list for ' + eventList.alliance_name);
				eventList.events = [];
			} else if (eventList.length <= evIdx) {
				eventList.events.push(eve);
			} else {
				eventList.events[evIdx] = eve;
			}

			eventList.markModified('events');
			// Save the changes to the document
			await eventList.save();
			
			log("Updated " + eventList.alliance_name + "'s " + eve.title + " data.");
			res.status(200).send("Successfully updated " + eventList.alliance_name + "'s " + eve.title + " data.");
		} catch (error) {
			log("Failed to update " + eve.title + " data.");
			res.status(500).send(error.message);
		}
});

app.post('/removeAllianceEvent',verifyToken, async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }

	const { tarEve } = req.body;
	let eve = JSON.parse(tarEve);		
	AllianceEvent.updateOne({ 'alliance_name': "SYN"},{ $pull: { 'events': eve}}).then((result) => {
		log("Removed " + eve.title + " from the event list.");
		res.status(200).send("Successfully removed " + eve.title + " from the event list.");
	}).catch((err) => {
		log("Failed to remove " + eve.title + " from the event list.");
	});


});