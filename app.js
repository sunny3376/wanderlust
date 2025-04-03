const express = require("express");
const app = express();
const mongoose = require('mongoose');
const listing =  require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


main().then(()=>{
    console.log("connected")
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

app.get("/",(req,res)=>{
    res.send("you are on root page");
});


//Index Route
app.get("/listings", async (req,res)=>{
    const allListings = await  listing.find({})
    res.render("listings/index.ejs",{allListings});
});

// New Route
app.get("/listings/new",(req,res)=> {
    res.render("listings/new.ejs");
})


//Show Route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/show.ejs", {Listing});
});

//Create Route
app.post("/listings", wrapAsync(async (req,res,next) => {
            const newlisting = new listing(req.body.listing);
            await newlisting.save();
            res.redirect("/listings");
      
   
}));

//Edit Route
app.get("/listings/:id/edit",async (req,res)=>{
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/edit.ejs", {Listing});

})


//Update Route
app.put("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect(`/listings/${id}`)
})

//delete Route
app.delete("/listings/:id", async (req,res) => {
    let {id} = req.params;
   let deletedItem = await listing.findByIdAndDelete(id);
   console.log(deletedItem);
    res.redirect("/listings")
})



///testinglisting
// app.get("/testListing", async (req,res)=>{
//     let samplListing = new listing({
//         title : "my home",
//         description : "bay of sea",
//         price: 1200,
//         location :"Goa",
//         country : "India"

//     });
//  await samplListing.save();
//     console.log("samplListing");
//     res.send("successful testing")
// })


app.all("*", (req,res,next) =>{
    next(new ExpressError(404,"Page Not Found !"));
})

app.use((err,req,res,next)=>{
    let {status, message} = err;
    res.status(status).send(message);
})


//listing Route
app.listen(8080,(req,res)=>{
    console.log("app is listen to port 8080");
});