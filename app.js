const express = require('express');
const path = require('path');
var plotly = require('plotly')("YaseenMM", "6spzddnl8t64CXAgxzSF")
const session = require('express-session');
const cookieParser = require('cookie-parser');


const port = 3000;

const publicPath = path.resolve(__dirname, 'public');

require('./db');
const mongoose = require('mongoose');
const Report = mongoose.model('Report');
const User = mongoose.model('User');
const Input = mongoose.model('Input');

const app = express();  
app.use(express.urlencoded({extended: false})); // keep them all as strings, gives us req.body 
app.set('view engine', 'hbs');
app.use(express.static(publicPath));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: true, 
    resave: true,
    cookie: {secure: false, httpOnly: false}
};
app.use(session(sessionOptions));
function getElitenessLevel(weight, standardArray){
    let key = {
      0: "New",
      1: "Beginner",
      2: "Intermediate",
      3: "Advanced",
      4: "Elite",
      5: "Beyond Elite"
  
    };
    standardArray.push(weight);
    console.log(standardArray);
    standardArray.sort(function(a,b){return a-b});
    console.log(standardArray);
    for (let i = 0; i < standardArray.length; i++){
      if (standardArray[i] === weight){
        return [i, key[i]];
      }
    }
  };
  function oneRepMaxCalculator(weight, reps){
    if (reps === 1){
      return weight;
    }
    else{
      return weight*(1+(reps/30));
    }
  }

function amountInArray(array, bodyPart) {
    return array.filter(item => item == bodyPart).length;
}
let exerciseList = [
    {
        bodyPart: 'Shoulders',
        Description: "A very small muscle group, the shoulders can be fixed by using very light weights and getting a fuller range of motion. Because of their small size, they can be sprinkled in often with very little risk to overtraining.",
        Exercises: ["Dumbell Lateral Raises", "Arnold Press"],
        Links: ["https://www.youtube.com/watch?v=q5sNYB1Q6aM", "https://www.youtube.com/watch?v=6Z15_WdXmVw"]
    },
    {
        bodyPart: 'Triceps',
        Description: "Comprising most of your arm, the triceps is vital for any pushing motion. Be sure to alternate angles of arms and the speed of the rep for optimal gains.",
        Exercises: ["Skullcrusher", "Close-Grip Bench Press"],
        Links: ["https://www.youtube.com/watch?v=d_KZxkY_0cM", "https://www.youtube.com/watch?v=cXbSJHtjrQQ"]
    },
    {
        bodyPart: 'Biceps',
        Description: "A good pair of biceps will give anyone the ability to stabalize their arms during push motions and facilitate pull motions with ease.",
        Exercises: ["Any sort of curl, so long as its done in multiple rep ranges and often enough."],
        Links: ["https://www.youtube.com/watch?v=woHSVvfb71Q"]
    },
    {
        bodyPart: 'Chest',
        Description: 'A downright requirement for filling up a shirt, a good chest is somewhat hard to come by. The secret is mind-muscle connection and volume.',
        Exercises: ["Cable Flyes", "Wide Push Ups"],
        Links: ["https://www.youtube.com/watch?v=Iwe6AmxVf7o", "https://www.youtube.com/watch?v=YwFmEsa_lIk"]
    },
    {
        bodyPart: 'Quads',
        Description: "The cause behind chicken legs, good quads are needed to make sure you don't get made fun of at the beach. Isolation helps, but you have to be smart about it - no leg extensions!",
        Exercises: ["Reverse Lunges", "Front Squats"],
        Links: ["https://www.youtube.com/watch?v=Q59ZvPhpySM", "https://www.youtube.com/watch?v=v-mQm_droHg"]
    },
    {
        bodyPart: 'Hamstrings',
        Description: 'Often the overlooked little brother of the quads, the hamstrings are needed to move big weight off the ground. Do NOT sleep on them!',
        Exercises: ['Romanian Deadlifts', 'Leg Curls'],
        Links: ["https://www.youtube.com/watch?v=_oyxCn2iSjU", "https://www.youtube.com/watch?v=1Tq3QdYUuHs&vl=en"]
    },
    {
        bodyPart: 'Glutes',
        Description: "The booty! Though it's just a small part of your body, its effect on stability on any heavy lifting is second to none. A priority to any athlete!",
        Exercises: ['Hip Thrusts', 'Glute Bridges'],
        Links: ["https://www.youtube.com/watch?v=xDmFkJxPzeM", "https://www.youtube.com/watch?v=8bbE64NuDTU"]
    },
    {
        bodyPart: 'Abs',
        Description: "Good for the beach, good for injury prevention and lifting a heavy load. Contrary to popular belief, only 3 times a week or so is necessary for strength and hypertrophy - don't overdo it!",
        Exercises: ["Reverse Crunches", "Leg Raises"],
        Links: ["https://www.youtube.com/watch?v=fhrkw1aaP8k", "https://www.youtube.com/watch?v=Pr1ieGZ5atk"]
    },
    {
        bodyPart: 'Forearms',
        Description: 'If you want to carry more things on the walk home from Trader Joes, you ought to work these. Note: a decrease in their strength is generally correlated with the need for a deload week.',
        Exercises: ["Dead Hangs",  "This One Athlean-X Baseball thing (it works I promise)"],
        Links: ["https://www.youtube.com/watch?v=ES--j0LOtaQ","https://www.youtube.com/watch?v=DUxd5EoiY4s"]
    }
];
app.get('/', (req, res) =>{
    console.log(req.sessionID);
    res.render('home', {layout: 'layout'});
});

app.get('/add', (req, res) =>{
    res.render('add', {layout: 'layout'});
})
app.get('/signup', (req, res) =>{
    res.render('signup', {layout: 'layout'});
});
app.post('/add', (req, res)=>{
    if (req.body.gender === '' || req.body.gender === null || req.body.gender === undefined || parseInt(req.body.weight) <= 0 || req.body.weight === null || req.body.weight === undefined || Number.isNaN(req.body.weight) || 
     req.body.weight === "" || Number.isNaN(req.body.b_weight) || parseInt(req.body.b_weight) <= 0 || Number.isNaN(req.body.b_reps) || parseInt(req.body.b_reps) <= 0 
     || Number.isNaN(req.body.s_weight) || parseInt(req.body.s_weight) <= 0 || Number.isNaN(req.body.s_reps) || parseInt(req.body.s_reps) <= 0 || Number.isNaN(req.body.d_weight) || parseInt(req.body.d_weight) <= 0 || Number.isNaN(req.body.d_reps) || parseInt(req.body.d_reps) <= 0 
     || Number.isNaN(req.body.o_weight) || parseInt(req.body.o_weight) <= 0 || Number.isNaN(req.body.o_reps) || parseInt(req.body.o_reps) <= 0 
     || Number.isNaN(req.body.r_weight) || parseInt(req.body.r_weight) <= 0 || Number.isNaN(req.body.r_reps) || parseInt(req.body.r_reps) <= 0 
     ){
         res.render('add', {layout: 'layout', message: 'Invalid input on one of the parameters, please try again.'});
     }
     else{
        new Input({
            date: new Date(Date.now()).toISOString(),
            gender: req.body.gender,
            weight: parseInt(req.body.weight),
            bench_reps: parseInt(req.body.b_weight),
            bench_sets: parseInt(req.body.b_reps),
            squat_reps: parseInt(req.body.s_weight),
            squat_sets: parseInt(req.body.s_reps),
            deadlift_reps: parseInt(req.body.d_weight),
            deadlift_sets: parseInt(req.body.d_reps),
            ohp_reps: parseInt(req.body.o_weight),
            ohp_sets: parseInt(req.body.o_reps),
            row_reps: parseInt(req.body.r_weight),
            row_sets: parseInt(req.body.r_reps),
            id: req.sessionID
        }).save(function (err, review){
            if (err){
                console.log(err);
            }
            else{
                let userWeight = parseInt(req.body.weight);
                let currGender = req.body.gender;
                let adjustedUserWeight = Math.round((userWeight-1)/50)*50;
                if (currGender === "male" || currGender === "NB"){
                    if (adjustedUserWeight > 300){
                        adjustedUserWeight = 300;
                    }
                    if (adjustedUserWeight < 100){
                        adjustedUserWeight = 100;
                    }
                } 
                else if (currGender === "female"){
                    if (adjustedUserWeight < 100){
                        adjustedUserWeight = 100;
                    }
                    if (adjustedUserWeight > 250){
                        adjustedUserWeight = 250;
                    }
                }
                let maleBenchStandards = {
                    100: [53, 84, 125, 173, 227],
                    150: [92, 132, 182, 240, 302],
                    200: [139, 187, 245, 312, 382],
                    250: [181, 236, 301, 374, 450],
                    300: [220, 280, 350, 428, 511]
                }
                let maleSquatStandards = {
                    100: [73, 114, 167, 229, 298],
                    150: [125, 177, 241, 315, 395],
                    200: [185, 248, 323, 408, 498],
                    250: [240, 310, 394, 487, 585],
                    300: [290, 367, 457, 557, 662]
                }
                let maleDeadliftStandards = {
                    100: [97, 144, 205, 275, 353],
                    150: [154, 213, 285, 368, 457],
                    200: [220, 289, 372, 466, 565],
                    250: [278, 356, 448, 550, 657],
                    300: [331, 416, 515, 624, 738]
                }
                let maleOHPStandards = {
                    100: [33, 54, 83, 117, 156],
                    150: [57, 85, 120, 161, 206],
                    200: [86, 119, 160, 207, 258],
                    250: [112, 150, 196, 247, 302],
                    300: [137, 178, 227, 283, 341]
                }
                let maleRowStandards = {
                    100: [46, 74, 112, 157, 207],
                    150: [78, 115, 160, 213, 271],
                    200: [116, 160, 213, 273, 338],
                    250: [151, 200, 259, 325, 396],
                    300: [183, 236, 300, 371, 446]
                }
                let femaleBenchStandards = {
                    100: [19, 41, 72, 111, 157],
                    150: [43, 73, 113, 162, 217],
                    200: [61, 96, 141, 195, 254],
                    250: [77, 115, 164, 222, 285]
                }
                let femaleSquatStandards = {
                    100: [39, 71, 113, 166, 226],
                    150: [73, 114, 167, 230, 300],
                    200: [96, 143, 201, 270, 345],
                    250: [116, 167, 230, 304, 383]
                }
                let femaleDeadliftStandards = {
                    100: [54, 90, 139, 198, 264],
                    150: [91, 138, 196, 265, 341],
                    200: [117, 169, 233, 308, 389],
                    250: [139, 195, 264, 343, 429]
                }
                let femaleOHPStandards = {
                    100: [19, 35, 56, 83, 114],
                    150: [31, 51, 76, 107, 142],
                    200: [42, 64, 92, 126, 163],
                    250: [51, 75, 106, 142, 181]
                }
                let femaleRowStandards = {
                    100: [22, 42, 70, 104, 143],
                    150: [36, 60, 92, 131, 175],
                    200: [45, 72, 107, 148, 194],
                    250: [53, 82, 118, 162, 210]
                }
                let bench1RM = oneRepMaxCalculator(req.body.b_weight, req.body.b_reps);
                let squat1RM = oneRepMaxCalculator(req.body.s_weight, req.body.s_reps);
                let deadlift1RM = oneRepMaxCalculator(req.body.d_weight, req.body.d_reps);
                let OHP1RM = oneRepMaxCalculator(req.body.o_weight, req.body.o_reps);
                let row1RM = oneRepMaxCalculator(req.body.r_weight, req.body.r_reps);
                let benchStandard;
                let squatStandard;
                let deadliftStandard;
                let OHPStandard;
                let rowStandard;
                if (currGender !== 'female'){
                    benchStandard = getElitenessLevel(bench1RM, maleBenchStandards[adjustedUserWeight]);
                    squatStandard = getElitenessLevel(squat1RM, maleSquatStandards[adjustedUserWeight]);
                    deadliftStandard = getElitenessLevel(deadlift1RM, maleDeadliftStandards[adjustedUserWeight]);
                    OHPStandard = getElitenessLevel(OHP1RM, maleOHPStandards[adjustedUserWeight]);
                    rowStandard = getElitenessLevel(row1RM, maleRowStandards[adjustedUserWeight]);
                }
                else{
                    benchStandard = getElitenessLevel(bench1RM, femaleBenchStandards[adjustedUserWeight]);
                    squatStandard = getElitenessLevel(squat1RM, femaleSquatStandards[adjustedUserWeight]);
                    deadliftStandard = getElitenessLevel(deadlift1RM, femaleDeadliftStandards[adjustedUserWeight]);
                    OHPStandard = getElitenessLevel(OHP1RM, femaleOHPStandards[adjustedUserWeight]);
                    rowStandard = getElitenessLevel(row1RM, femaleRowStandards[adjustedUserWeight]);
                }
             //   let totalAverage = benchStandard[0] + squatStandard[0] + deadliftStandard[0] + OHPStandard[0] + rowStandard[0];
          //      totalAverage = totalAverage/5;
                let averageBasisArray = [benchStandard[0], squatStandard[0], deadliftStandard[0], OHPStandard[0], rowStandard[0]];
                let totalAverage = averageBasisArray.reduce((a,b)=> a + b, 0);
                totalAverage = totalAverage/5;
                let userWeakpoint = '';
                let evaluationArray = [benchStandard, squatStandard, deadliftStandard, OHPStandard, rowStandard];
                let benchWeakpoints = ['Chest', 'Shoulders', 'Triceps', 'Biceps'];
                let squatWeakpoints = ['Quads', 'Glutes', 'Abs', 'Hamstrings'];
                let deadliftWeakpoints = ['Glutes', 'Forearms', 'Hamstrings'];
                let OHPWeakpoints = ['Shoulders', 'Triceps', 'Abs', 'Glutes'];
                let rowWeakpoints = ['Biceps', 'Forearms'];
                let bodyPartArray = [benchWeakpoints, squatWeakpoints, deadliftWeakpoints, OHPWeakpoints, rowWeakpoints];
                let weakpointArray = [];
                for (let i = 0; i < evaluationArray.length; i++){
                    if (evaluationArray[i][0] < totalAverage){
                        for (let j = 0; j < bodyPartArray[i].length; j++){
                            weakpointArray.push(bodyPartArray[i][j]);
                        }
                    } 
                };
                if (weakpointArray.length === 0){
                    userWeakpoint = "Nothing, quite balanced!";
                } 
                else{
                     let totalBodyPartList = ['Shoulders', 'Triceps', 'Chest', 'Biceps', 'Quads', 'Glutes', 'Abs', 'Hamstrings', 'Forearms'];
                     for (let z = 0; z < totalBodyPartList.length; z++){
                         if (amountInArray(weakpointArray, totalAverage[z]) > 1){
                             userWeakpoint = totalBodyPartList[z];
                             break;
                         }
                     }
                     if (userWeakpoint === ''){
                             let modifiedMinCreator = [benchStandard, squatStandard, deadliftStandard, OHPStandard, rowStandard];
                             let determinant = 5;
                             let currMinimum;
                             for (let q = 0; q < modifiedMinCreator.length; q++){
                                 if (modifiedMinCreator[q][0] < determinant){
                                     determinant = modifiedMinCreator[q][0]
                                     currMinimum = modifiedMinCreator[q];
                                 };

                             }
                             if (currMinimum === benchStandard){
                                 userWeakpoint = "Chest";
                             }
                             else if (currMinimum === squatStandard){
                                 userWeakpoint = "Quads";
                             }
                             else if (currMinimum === deadliftStandard){
                                 userWeakpoint = "Hamstrings";
                             }
                             else if (currMinimum === OHPStandard){
                                 userWeakpoint = "Shoulders";
                             }
                             else{
                                 currMinimum = "Biceps";
                             }
                     }
                }
                new Report({
                    id: req.sessionID,
                    date: new Date(Date.now()).toISOString(),
                    bench_rating: benchStandard[1],
                    squat_rating: squatStandard[1],
                    deadlift_rating: deadliftStandard[1],
                    ohp_rating: OHPStandard[1],
                    row_rating: rowStandard[1],
                    weakpoint: userWeakpoint
                }).save(function(err, newReport){
                    if (err){
                        throw err;
                    }
                    else{
                        console.log(newReport);
                        res.redirect('/history');
                    }
                })

            }
        }
    )
     }
});

app.get('/history', (req, res)=>{
    console.log(req.sessionID);
    Input.find({id: req.sessionID}, function(err, allInputs){
        if (err){
            throw err;
        }
        else{
            let exerciseType = req.query.exercise;
            if (exerciseType === null || exerciseType === undefined || exerciseType === ''){
                res.render('history', {layout: 'layout', Inputs: allInputs, answer: ""});
            }
            else if (exerciseType === "bench"){
                benchArray = [.62, .88, 1.21, 1.6, 2.02];
                dataArray = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
                res.render('history', {layout: 'layout', Inputs: allInputs, data: benchArray, labels: dataArray, type: 'Bench', answer: "Form recognized answer as bench, correct graph coming soon!"});
                console.log("Form recognized answer as bench, correct graph coming soon!");
              
            }
            else if (exerciseType === "squat"){
                squatArray = [.83, 1.18, 1.61, 2.1, 2.64]
                dataArray = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
                res.render('history', {layout: 'layout', Inputs: allInputs, data: squatArray, labels: dataArray, type: 'Squat', answer: "Form recognized answer as squat, correct graph coming soon!"});
                console.log("Form recognized answer as squat, correct graph coming soon!");
            }
            else if (exerciseType === "deadlift"){
                deadliftArray = [1.03, 1.42, 1.9, 2.45, 3.04]
                dataArray = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
                res.render('history', {layout: 'layout', Inputs: allInputs, data: deadliftArray, labels: dataArray, type: 'Deadlift', answer: "Form recognized answer as deadlift, correct graph coming soon!"});
                console.log("Form recognized answer as deadlift, correct graph coming soon!");
            }
            else if (exerciseType === "ohp"){
                ohpArray = [.4, .58, .8, 1.06, 1.34]
                dataArray = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
                res.render('history', {layout: 'layout', Inputs: allInputs, data: ohpArray, labels: dataArray, type: 'OHP', answer: "Form recognized answer as overhead press, correct graph coming soon!"});
                console.log("Form recognized answer as ohp, correct graph coming soon!");
            }
            else if (exerciseType === "row"){
                rowArray = [.52, .76, 1.07, 1.41, 1.78]
                dataArray = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
                res.render('history', {layout: 'layout', Inputs: allInputs, data: rowArray, labels: dataArray, type: 'Row', answer: "Form recognized answer as row, correct graph coming soon!"});
                console.log("Form recognized answer as row, correct graph coming soon!");
            }
           // res.render('history', {layout: 'layout', Inputs: allInputs});
        }
    })
})

app.get('/exercises', (req, res)=>{
    res.render('exercises', {layout: 'layout'});
});

app.get('/weakpoints', (req, res)=>{
    Report.find({id: req.sessionID}, function(err, allReports){
        if (err){
            throw err;
        }
        else{
            res.render('weakpoints', {layout: 'layout', Reports: allReports});
        }
    })
})

app.get('/shoulders', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[0].bodyPart, Description: exerciseList[0].Description, Exercises: exerciseList[0].Exercises, Links: exerciseList[0].Links});
});

app.get('/triceps', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[1].bodyPart, Description: exerciseList[1].Description, Exercises: exerciseList[1].Exercises, Links: exerciseList[1].Links});
});
app.get('/biceps', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[2].bodyPart, Description: exerciseList[2].Description, Exercises: exerciseList[2].Exercises, Links: exerciseList[2].Links});
});
app.get('/chest', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[3].bodyPart, Description: exerciseList[3].Description, Exercises: exerciseList[3].Exercises, Links: exerciseList[3].Links});
});
app.get('/quads', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[4].bodyPart, Description: exerciseList[4].Description, Exercises: exerciseList[4].Exercises, Links: exerciseList[4].Links});
});
app.get('/hamstrings', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[5].bodyPart, Description: exerciseList[5].Description, Exercises: exerciseList[5].Exercises, Links: exerciseList[5].Links});
});
app.get('/glutes', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[6].bodyPart, Description: exerciseList[6].Description, Exercises: exerciseList[6].Exercises, Links: exerciseList[6].Links});
});
app.get('/abs', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[7].bodyPart, Description: exerciseList[7].Description, Exercises: exerciseList[7].Exercises, Links: exerciseList[7].Links});
});
app.get('/forearms', (req, res)=> {
    res.render('exercises', {layout: 'layout', bodyPart: exerciseList[8].bodyPart, Description: exerciseList[8].Description, Exercises: exerciseList[8].Exercises, Links: exerciseList[8].Links});
});

app.get('/all', (req, res)=>{
    res.render('all', {layout: 'layout', items: exerciseList});
});
app.post('/all', (req, res)=>{
    let newArray = exerciseList.filter(item => item.bodyPart === req.body.part);
    res.render('all', {layout: 'layout', items: newArray});
});
app.get('/graph', (req, res)=>{
    let dateArray = [];
    let graphBench = [];
    let graphSquat = [];
    let graphDL = [];
    let graphOHP =[];
    let graphRow = [];
    Input.find({id: req.sessionID}, function(err, myInput){
            if (err){
                throw err;
            }
            else{
                myInput.forEach(function(element){
                    dateArray.push(element.date);
                    graphBench.push(oneRepMaxCalculator(element.bench_reps, element.bench_sets));
                    graphSquat.push(oneRepMaxCalculator(element.squat_reps, element.squat_sets));
                    graphDL.push(oneRepMaxCalculator(element.deadlift_reps, element.deadlift_sets));
                    graphOHP.push(oneRepMaxCalculator(element.ohp_reps, element.ohp_sets));
                    graphRow.push(oneRepMaxCalculator(element.row_reps, element.row_sets));
                })
                res.render('graph', {layout: 'layout', dates: dateArray, bench: graphBench, squat: graphSquat, deadlift: graphDL, ohp: graphOHP, row: graphRow});
            }
       
    })
});
app.get('/secret', (req, res)=>{
    res.render('secret', {layout: 'layout', id: req.sessionID});
});

app.post('/secret', (req, res)=>{
    Input.find({id: req.query.searchID}, function(err, secretInputs){
        if (err){
            throw err;
        }
        else{
            res.render('secret', {layout: 'layout', id: req.sessionID, Inputs: secretInputs});
        }
    })
});
app.listen(process.env.PORT || 3000);