const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {Feedback, feedbackSchema} = require('./models/Feedback');
const User = require('./models/User');
const Account = require('./models/Account');
const Building = require('./models/Building');
const BuildReq = require('./models/BuildReq');
const Discount = require('./models/Discount');
const {InventoryItem, itemSchema} = require('./models/InventoryItem');
const RevokedToken = require('./models/RevokedToken');
const AllianceEvents = require('./models/AllianceEvents');
const allEventSchema = require('./models/AllEvent');
const {gearSchema, boostSchema, heroSchema} = require('./models/Misc');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {body, cookie, validationResult} = require('express-validator');
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

// Define generalized validation middleware
const validateJsonStructure = (jsonField) => {
  return (req, res, next) => {
    try {
      const obj = JSON.parse(req.body[jsonField]);
      req.body[`parsed${jsonField.charAt(0).toUpperCase() + jsonField.slice(1)}`] = obj; // Store parsed JSON for the next middleware
      next();
    } catch (error) {
      return res.status(400).json({ errors: [{ msg: 'Invalid JSON format' }] });
    }
  };
};

const validateJsonEntries = (jsonField, schema) => {
  return (req, res, next) => {
    const errors = [];
    const obj = req.body[`parsed${jsonField.charAt(0).toUpperCase() + jsonField.slice(1)}`];
	log(obj);
    for (const [key, rule] of Object.entries(schema)) {
      if (!obj.hasOwnProperty(key)) {
        errors.push({ key, msg: `${key} is required` });
        continue;
      }

      const value = obj[key];
	  log(value + ' ' + rule.type);
      if (rule.required && (typeof value !== rule.type || (typeof value === 'string' && value.trim() === ''))) {
        errors.push({ key, msg: `${key} must be a non-empty ${rule.type}` });
      }

      // Add more custom rules as needed, e.g., format checks, value ranges, etc.
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

// Feedback route
app.post('/feedback',[
	validateJsonStructure('feedback'), 
	validateJsonEntries('feedback',feedbackSchema)
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			
			const feedback = req.body.parsedFeedback;
			feed = new Feedback(feedback);
			await feed.save();

			res.status(201).send();
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
);

// Register route
app.post('/register',
	[
	  body("username").trim().notEmpty().escape(),
	  body("email").trim().isEmail().normalizeEmail().escape(),
	  body("password").trim().notEmpty().escape(),
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { username, email, password } = req.body;
			let user = await User.findOne({ $or: [{email },{username}]});
			if (user) return res.status(400).send('User already registered.');
			
			user = new User({ username, email, password });
			await user.save();

			res.status(201).send();
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
);

// Login route
app.post('/login',
	[
	  body("username").trim().notEmpty().escape(),
	  body("password").trim().notEmpty().escape(),
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			
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
	}
);

// Login route
app.post('/logout',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").notEmpty().trim().escape(),
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		
		const { user } = req.body;
		const token = req.cookies.token;
		let revToken = new RevokedToken({token});
		await revToken.save();
		
		log(user + " successfully logged out.");
		res.json({message: 'Logout successful.'})
	}
);

// Login route
app.post('/getAccounts',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken, 
	[
		body("user").notEmpty().trim().escape(),
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		try {
			
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			
			const { user } = req.body;
			const accs = await Account.find({ 'user': user });
			if (!accs) return res.status(400).send('Invalid username.');
			res.send({ accs });
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
);

// get user route
app.post('/addAccount',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
 	[
		body("user").notEmpty().trim().escape(),
		body("accName").notEmpty().trim().escape(),
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		
		
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
	}
);

// get user route
app.post('/removeAccount',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken, 
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
	],
	async (req, res) => {
		if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
		
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { user, accName } = req.body;
		
		try {
			const acc = await Account.findOneAndDelete({ $and : [{ 'user' : user },{'name' : accName} ]});
		} catch (error) {
			res.status(500).send(error.message);
		}
		
		res.status(200).send('Successfully deleted: ' + accName);
	}
);

// get user route
app.post('/updateGearLevel',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("acToUpdate").trim().notEmpty().escape(),
		body("newGear").notEmpty().isJSON().escape(),
		body("type").notEmpty().isIn(['build','research']).escape().withMessage('Type must be either build or research'),
		validateJsonStructure('newGear'), 
		validateJsonEntries('newGear',gearSchema)
	], 
	async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ body: "OK" });
    }
	
	  const errors = validationResult(req);
	  if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	  }

    const { user, acToUpdate, type } = req.body;
    let gearPiece = req.body.parsedNewGear;

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
app.post('/deleteGear',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("acToUpdate").trim().notEmpty().escape(),
		body("newGear").notEmpty().isJSON().escape(),
		body("type").notEmpty().isIn(['build','research']).escape().withMessage('Type must be either build or research'),
		validateJsonStructure('newGear'), 
		validateJsonEntries('newGear',gearSchema)
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	const { user, acToUpdate, type } = req.body;
	const gearPiece = req.body.parsedNewGear;
	
	Account.updateOne({'user': user, 'name': acToUpdate},{ $pull: { 'boosts.buildergear': {'name': gearPiece}}}).then((result) => {
		log("Updated " + user + "'s account named " + acToUpdate + " to remove " + gearPiece + ".");
		res.status(200).send('Successfully updated: ' + acToUpdate + ' to remove: ' + gearPiece);
	}).catch((err) => {
		log("Failed to update " + user + "'s account named " + acToUpdate + " to remove " + gearPiece + ".");
		res.status(500).send(err.message);
	});

});

// get user route
app.post('/updateHeroLevel',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("acToUpdate").trim().notEmpty().escape(),
		body("newHero").notEmpty().isJSON().escape(),
		validateJsonStructure('newHero'), 
		validateJsonEntries('newHero',heroSchema)
	],
	async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ body: "OK" });
    }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

    const { user, acToUpdate } = req.body;
    let hero = req.body.parsedNewHero;

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
app.post('/deleteHero',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("acToUpdate").trim().notEmpty().escape(),
		body("hero").notEmpty().isAlpha().escape(),
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
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
app.post('/updateBoosts',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("acToUpdate").trim().notEmpty().escape(),
		body("newBoost").notEmpty().isJSON().escape(),
		validateJsonStructure('newBoost'), 
		validateJsonEntries('newBoost',boostSchema)
	],
	async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ body: "OK" });
    }

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

    const { user, acToUpdate } = req.body;
    let boost = parsedNewboost;

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
		
		// Find the index of the boost in the speeds array
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
app.post('/inventory',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

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
app.post('/addToInventory',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
		body("newItem").notEmpty().isJSON().escape(),
		validateJsonStructure('newItem'), 
		validateJsonEntries('newItem',itemSchema)
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	const { user, accName } = req.body;
	const newit = await new InventoryItem(req.body.parsedNewItem);
	
	Account.updateOne({'user': user, 'name': accName},{ $push: { 'inventory': newit}}).then((result) => {
		log("Added item to " + user + " account named " + accName + ".");
	}).catch((err) => {
		log("Failed to add item to " + user + " account named " + accName + ".");
		res.status(500).send(error.message);
	});
	
	res.status(200).send('Successfully added: ' + newItem + " to " + accName);
});

// get user route
app.post('/removeFromInventory',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
		body("itrm").notEmpty().isJSON().escape(),
		validateJsonStructure('itrm'), 
		validateJsonEntries('itrm',itemSchema)
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
    const { user, accName } = req.body;
	const rmit = new InventoryItem(req.body.parsedItrm);
	Account.updateOne({'user': user, 'name': accName},{ $pull: { 'inventory': rmit}}).then((result) => {
		log("Removed item from " + user + " account named " + accName + ".");
	}).catch((err) => {
		log("Failed to remove item from" + user + " account named " + accName + ".");
	});

});

app.post('/updateInventory',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
		body("item").trim().notEmpty().escape(),
		body("name").trim().notEmpty().escape(),
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
    const { user, accName, item, name } = req.body;
	
	await Account.updateOne({'user': user, 'name': accName, 'inventory.name': name},
	{ $set: { 'inventory.$.name': item.name, 'inventory.$.quantity': item.quantity}}).then((result) => {
		log("Updated item in " + user + " account named " + accName + ".");
	}).catch((err) => {
		log("Failed to update item in " + user + " account named " + accName + ".");
	});
});

// get user route
app.post('/sanctuary',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
    try {
        const { user, accName } = req.body;
        const account = await Account.findOne({ 'user': user, 'name': accName },'buildings');
        if (!account) return res.status(400).send('Invalid username or account name');
        res.send({ account});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/updateSanctuary',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("user").trim().notEmpty().escape(),
		body("accName").trim().notEmpty().escape(),
		body("building").notEmpty().escape(),
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
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

app.post('/getBuildRequirements',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	try {
		const doc = await BuildReq.findOne({});
		if (!doc) return res.status(400).send('Could not get requirements collection');
		res.send({doc});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/getRSSRequirements',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("names").notEmpty().isArray({min: 0}).escape(),
		body("gearLevel").trim().notEmpty().escape(),
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
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

app.post('/getRSSDiscounts',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const discounts = await Discount.findOne({});
		if (!discounts) return res.status(400).send('Could not get rss discounts.');
		res.send({discounts});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/getAllianceEvents',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const events = await AllianceEvents.findOne({ 'alliance_name': "SYN"});
		if (!events) return res.status(400).send('Could not get alliance events.');
		res.send({events});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/updateAllianceEvent',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("tarEve").notEmpty().isJSON(),
		body("evIdx").trim().notEmpty().isNumeric().escape(),
		validateJsonStructure('tarEve'), 
		validateJsonEntries('tarEve',allEventSchema)
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const {  evIdx } = req.body;
	let eve = req.body.parsedTarEve;
	try {

			// Find the account
			const eventList = await AllianceEvents.findOne({ 'alliance_name': "SYN"});

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

app.post('/removeAllianceEvent',
	[
		// Validate that the token is a JWT
		cookie('token').isJWT().withMessage('Invalid token format')
	],
	verifyToken,
	[
		body("tarEve").notEmpty().isJSON(),
		validateJsonStructure('tarEve'), 
		validateJsonEntries('tarEve',allEventSchema)
	],
	async (req, res) => {
	if(req.method === 'OPTIONS') { return res.status(200).json(({ body: "OK" })) }
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	let eve = req.body.parsedTarEve;		
	AllianceEvents.updateOne({ 'alliance_name': "SYN"},{ $pull: { 'events': eve}}).then((result) => {
		log("Removed " + eve.title + " from the event list.");
		res.status(200).send("Successfully removed " + eve.title + " from the event list.");
	}).catch((err) => {
		log("Failed to remove " + eve.title + " from the event list.");
	});


});