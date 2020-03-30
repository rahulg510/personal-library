/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;

var ObjectId = require('mongodb').ObjectId;

module.exports = function (app,db) {

    app.route('/api/books')
      .get(function (req, res){
        db.find().toArray((err,docs) =>{
          let arr = [];
          for(var i = 0; i < docs.length; i++){
            let book = {
              title: docs[i]['title'],
              _id: docs[i]['_id'],
              commentCount: docs[i]['comments'] !=null ? docs[i]['comments'].length : 0
            }
            arr.push(book);
          }
          res.send(arr);
       })
      })
      
      .post(function (req, res){
        var book= {
          title: req.body.title,
          comments: []
        }
        db.insert(book,function(err,doc){
          if(err) res.send('error' + err);
          else{
            res.send(doc.ops[0]);
          }
        })
        
      })
      
      .delete(function(req, res){
        db.remove({},function(e,d){
          if(e) return res.send("Unable to delete all the books");
          res.send('All books deleted');
        });
      });

    app.route('/api/books/:id')
      .get(function (req, res){
        var bookid = req.params.id;
        db.findOne(ObjectId(bookid),(err,doc)=>{
          if(err) return res.send("No book exists");
          else{
            return res.send(doc);
          }
        })
        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      })
      
      .post(function(req, res){
        var bookid = req.params.id;
        var comment = req.body.comment;
        if(comment != null){
        db.findOneAndUpdate({_id: ObjectId(bookid)},{$push: {comments: comment}},(err,doc)=>{
         if (err) return res.send("No book exists");
         else{
          return res.send(doc['value']);
         }
       })
      }
        else return res.send("Input a comment");
      })
      
      .delete(function(req, res){
        var bookid = req.params.id;
        db.remove({_id: ObjectId(bookid)},function(err,status){
          if(err) return res.send("Unable to delete the book" + err);
          return res.send("Book deleted");

        })
      });

};

