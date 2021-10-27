//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://sohamkanji2001:ank123@ankush.9quzp.mongodb.net/todolistretryWrites=true&w=majority")
//create a new schema :-
 const itemschema= {
   name:String
 };
 //create a mongoose model:-
 const Item =mongoose.model("Item",itemschema);
const item1 =new Item({
  name:"welcome to your todolist!"
});
const item2 =new Item({
  name:"hit the + button to add a new file."
});
const item3= new Item({
  name:"<-- hit this to delete an item."
});
const defaultItems=[item1,item2,item3];
const listschema ={
  name:String,
  items:[itemschema]

};
const  List=mongoose.model("List", listschema );

app.get("/", function(req, res) {
//checking if the list is empty or not:-
  Item.find({},function (err,founditems) {
    if (founditems.length===0){
      Item.insertMany(defaultItems,function (err) {
        if(err){
          console.log(err);
        }else {
          console.log("successfully saved defaultItems to the database");
        }
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems:founditems});

    }
  });




});
app.get("/:customlistname",function (req,res) {
  const customlistname=_.capitalize(req.params.customlistname);
  List.findOne({ name:customlistname},function (err,foundList) {
    if(!err){
    if(!foundList){
      //create a new list
      const list =new List({
        name:customlistname,
        items: defaultItems
    });
      list.save();
      res.redirect("/"+ customlistname);

      console.log("doesnt exist");
    }else {
      //show an existing list
      res.render("list",{listTitle: foundList.name, newListItems:foundList.items});
      console.log("exists");
    }
  }
  });


})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item =new Item({
    name: itemName
  });
  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name:listName},function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);

    })
  }

})
  app.post("/delete",function (req,res) {
    const checkedItemId= req.body.checkbox;
    const listname =req.body.listname;
    if (listname==="Today") {
      Item.findByIdAndRemove(checkedItemId,function (err) {
        if (!err) {
          console.log("successfully deleted checked items");
          res.redirect("/")
        }

    });
  }else {
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedItemId}}},function(err,foundList) {
      if(!err){
        res.redirect("/" + listname);
      }

    }  )
  }

  });

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has  started successfully!");
});
