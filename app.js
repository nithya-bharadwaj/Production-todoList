const express = require('express');
// body-parser is a middleware function that is used to parse the body of an incoming request and make it available on the request object as req.body. This is useful when you're expecting data to be sent from the client, such as when submitting a form or sending data via AJAX.


// body - parser supports different types of data, including JSON and URL - encoded data.When you use body - parser, you need to tell it which type of data you 're expecting so that it can parse it correctly
const bodyparser = require("body-parser");
//creating an instance of express to use its features
const app = express();
//requiring mongoose module for data storing and all
const mongoose = require("mongoose");
//requiring lodash for any additional unctionality with strings,etc
// Lodash offers a wide range of functions, including those for manipulating arrays, objects, strings, numbers, and functions. Some of the commonly used functions include map, filter, reduce, forEach, find, groupBy, orderBy, clone, merge, isEqual, debounce, throttle, and memoize
const _ = require("lodash");

//requiring date file to store the current day along with date,month, and year
const date = require(__dirname + "/date.js");
//declaring the day variable as it is used in multiple locations to make it easier to use it whenever required
let day = date();

//declared array before using database to store the tasks
// let items = [];
// let item = "";
// let workItems = [];
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
//connecting to mongodb
//todolistDB is the name of the database if it is present it connects to it if not creates and then connects
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
//instead of using local server we are using mongodb cluster for cloud service and the special characters must be encoded so @ is encoded as %40
// mongo "mongodb+srv://cluster0.zgobaev.mongodb.net/todolistDB" --apiVersion 1 --username nithya
// the above command is to be used
mongoose.connect("mongodb+srv://nithya:nithya%40123@cluster0.zgobaev.mongodb.net/?retryWrites=true&w=majority");
//create database schema
const itemsSchema = {
        name: {
            type: String
        }
    }
    //creates collections called items and while passing the name of passing the name of collections, pass it in it singular form
const Item = mongoose.model("Item", itemsSchema);
//creating 3 default tasks in the collection
const item1 = new Item({
    name: "Welcome to your todolist"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});
//creating array of items
const defaultItems = [item1, item2, item3];
//creating list collections to store items in custom lists other than root one
const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

// insert();



//when yo open the root route,the following gets executed
app.get('/', function(req, res) {
    // res.send("Hello");
    // console.log("testing ")
    // reading data from database
    async function readData() {
        try {
            await Item.find().then((items) => {
                    //if no items are there or the collection is empty then insert otherwise no
                    if (items.length === 0) {
                        async function insert() {
                            await Item.insertMany(defaultItems).then(() => {

                                // c onsole.log("Succesfully saved to todoListDB");

                            }).catch((err) => {
                                // console.log("error" + err);
                            })
                        };
                        insert();
                        //after inserting in order to display redirect to home/root route to go to else condition and print the data
                        res.redirect("/");
                    } else {
                        //console log the data
                        // console.log(items);
                        // let day = date();
                        res.render("list", { listTitle: day, newListItems: items });
                    }
                })
                .catch((err) => {
                    // console.log("error" + err)
                })
        } catch (err) {
            // console.log("error" + err);
        };

    }
    //call the function
    readData();

});
//whenever a new task is added, post request is to be made
app.post("/", function(req, res) {
    //newitem is the name of the task/input's name attribute which is used to get the value and do operations
    let item = req.body.newitem;
    //list is the value of attribute of submit button in list.ejs file with name attribute set to list whic is the name of the list like home, work,etc
    const listname = req.body.list;
    // console.log("listname" + listname);
    //creating a new item to add in the database with name attribute set to input provided by user
    const itemname = new Item({
        name: item
    });
    // let day = date();
    //checking if listname is day if it is day then user in current/root page hence redirect to root route or else redirect to custom list route
    if (listname === day) {
        itemname.save();
        res.redirect("/");
    } else {
        // if not root route first find the list and then add the input to items array of the list collection
        async function find() {
            await List.findOne({ name: listname }).then((query, error) => {
                // console.log(query);
                //pushing the itemname to the items array
                query.items.push(itemname);
                query.save();
                //saving it and redirecting to customlist name
                res.redirect("/" + listname);

            })
        }
        find();

    }
});
app.post("/delete", function(req, res) {
    //to delete checked items
    //getting the id of checked item to delete from database using checkeditemid from ejs file
    const checkedItemId = req.body.checkbox;
    const day = date();
    const listname = req.body.listname;

    async function deleteData() {
        //checking listname if it is day it is root route and hence delete the item and redirect to root route
        if (listname === day) {
            await Item.findByIdAndRemove(checkedItemId).then((query, err) => {
                if (err) {
                    // console.log("Error");
                } else {
                    // console.log("Successfully deleted the item");
                    res.redirect("/");
                }
            });
        } else {
            //otherwise find the list by listname and then go to the items array and find the item and then remove it and update and then redirect to customlist route
            await List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: checkedItemId } } })
            res.redirect("/" + listname);


        }
    }

    deleteData();

})

// app.post("/work", function(req, res) {

//     let item = req.body.newitem;
//     workItems.push(item);

//     res.redirect("/work");

// });

//using express route parameters to redirect to routes which are not predefined that is customListName could be anything
app.get("/:customListName", function(req, res) {
    console.log(req.params.customListName);
    //using lodash to capitalize the list name to avoid confusions as home and Home mean the same thing in this context
    const customListName = _.capitalize(req.params.customListName);
    //find function to find if the list name is already there in the collections if it is not there create it and then redirect to same route that is customlist route and if it is already present pass the list name and items inside the items array of list schema to list ejs file to render
    async function find() {
        await List.findOne({ name: customListName }).exec().then((query, error) => {
            if (error) {

                // console.log("Error occured while finding");
            } else {

                if (query === null) {
                    // console.log("doesn't exist");
                    //insert it to collections
                    const list = new List({
                        name: customListName,
                        items: [item1, item2, item3]
                    });
                    list.save();
                    res.redirect("/" + customListName)
                } else {
                    // console.log("exists already");

                    res.render("list", { listTitle: customListName, newListItems: query.items })
                }
            }
        })
    }
    find();


});
app.post("/new", function(req, res) {
    const listname = req.body.newlist;
    res.redirect("/" + listname);

})

app.listen(3000, function() {
    // console.log("Server started on port 3000");
});
//mongoose has been updated recently so now most of the operations are async await format so i have created template file in mongodb folder which contains all crud operations and anything else should be referred from documentation and not some random videos