//1st draft data model
const mongoose = require('mongoose');
/*
The schema for the user, who has:
1. a username
2. a password
3. a report history (array containing old reports)
*/ 
const Report = new mongoose.Schema({
    id: String,
    date: {type: String, required: true},
    bench_rating: {type: String, default: 'N/A'},
    squat_rating: {type: String, default: 'N/A'},
    deadlift_rating: {type: String, default: 'N/A'},
    ohp_rating: {type: String, default: 'N/A'},
    row_rating: {type: String, default: 'N/A'},
    weakpoint: String
});

const User = new mongoose.Schema({
    // username provided by authentication plugin
    // password hash provided by authentication plugin
    totalReports:[Report] // all old reports
});
// schema representing the input of the user.
// NOTE: this could very well turn into an HTML form that is taken in once 
// and never stored; it all depends on whether the app will show the report or the input and the report.
// implementation to be finalized within the coming weeks.
const Input = new mongoose.Schema({
    date: String,
    gender: String,
    weight: Number,
    bench_reps: Number,
    bench_sets: Number,
    squat_reps: Number,
    squat_sets: Number,
    deadlift_reps: Number,
    deadlift_sets: Number,
    ohp_reps: Number,
    ohp_sets: Number,
    row_sets: Number, 
    row_reps: Number,
    id: String
});
// the report done from the user input. This will be saved on the app
// so that the user can evaluate their past reports and see if they've made 
// progress 
// note that these are numbers calculated from the user input and strength levels/calculators 
// that are currently available. 
// N/A is used for when there is no input, i.e. the user did not care to discuss that lift. 
mongoose.model('Report', Report);
mongoose.model('User', User);
mongoose.model('Input', Input);

let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/ym1466';
}
mongoose.connect(dbconf, {useNewUrlParser: true, useUnifiedTopology: true });