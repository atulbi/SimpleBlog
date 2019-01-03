var express = require("express"),
	app = express(),
	methodOverride = require("method-override")
	parser = require("body-parser"),
	mongo = require("mongoose"),
	request = require("request"),
	sanitizer = require("express-sanitizer");

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(parser.urlencoded({extended:true}));
app.use(sanitizer());
app.use(methodOverride("_method"));
mongo.connect("mongodb://localhost/blog");

var blogSchema = mongo.Schema({
	title:String,
	body: String,
	image: {
		type : String,
		default: "https://frettboard.com/wp-content/uploads/2017/12/Travel-Blog-1.jpg"
	},
	created : {
		type: Date,
		default: Date.now()
	}
});
var blog = mongo.model("blog",blogSchema);



app.get("/",function(req , res){
	res.redirect("/blogs");
})

app.get("/blogs" , function(req , res){
	blog.find({} , function(err , blogs){
		if(err){
			console.log(err);
		}else{

			res.render("index", {blogs:blogs});
		}
	});
});

app.post("/blogs", function(req , res){

	req.body.body = req.sanitize(req.body.body);
	if(req.body.image == ""){
		req.body.image = "https://frettboard.com/wp-content/uploads/2017/12/Travel-Blog-1.jpg";
	}
	blog.create({
			title: req.body.title,
			body: req.body.body,
			image : req.body.image
		},function (err , blog) {
			if(err){
				console.log(err);
			}else{
				console.log(blog);
				res.redirect("/blogs");
			}
	});
});

app.get("/blogs/new" , function(req , res){
	res.render("new");
});

app.get("/blogs/:id" , function(req ,res){

	blog.findById(req.params.id , function(err , blog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show" , {data:blog});
		}

	});
});

app.put("/blogs/:id" , function(req , res){
	req.body.body = req.sanitize(req.body.body);
	if(req.body.image == ""){
		req.body.image = "https://frettboard.com/wp-content/uploads/2017/12/Travel-Blog-1.jpg";
	}
	blog.findByIdAndUpdate(req.params.id , {
		title: req.body.title,
		image: req.body.image,
		body : req.body.body
	} ,function(err ,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}
		res.redirect("/blogs/"+req.params.id);
	});
});

app.delete("/blogs/:id" , function(req , res){
	blog.findByIdAndRemove(req.params.id , function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id/edit" , function(req,res){

	blog.findById(req.params.id , function(err , blog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit" , {data:blog} )
		}
	});

});

app.listen(3000 , function () {
	console.log("Server Started");
});