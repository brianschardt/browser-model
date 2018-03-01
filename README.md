# Browser-Model
Simple state management with minimalistic API for angular 2+. This is similar to how mongoose / eloquent(laravel) (any orm) accesses and manages data on the backend. Bringing this functionality to the frontend is game changer, since anyone familiar with an orm can jump right in. This is made for Angular 2+ but may also work with react. Although redux is great this is meant to be a simpler and more effective solution to state managment. 

## Installation
```
npm i browser-model
```

## Doc Menu
1. [Purpose](#purpose)
2. [Getting Started](#getting-started)
3. [Example Model](#example-model)
4. [Example Component](#example-component)
5. [Instance Methods](#instance-methods)
    - [save](#save)
    - [remove](#remove)
    - [toObject](#toobject)
    - [reload](#reload)
    - [Storage Differences](#storage-and-instance-differences)
6. [Instance Hooks & Events](#instance-events--hooks)
    - [On Save](#on-save)
    - [On Remove](#on-remove)
    - [On Reload](#on-reload)
    - [On Change](#on-change)
    - [Custom Events](#on-change)
7. [Static Methods](#static-methods)
    - [create](#create)
    - [createOrUpdate](#createorupdate)
    - [remove](#remove-1)
    - [update](#update)
    - [updateOne](#updateone)
    - [find](#find)
    - [findOne](#findone)
    - [findOneAndUpdate](#findoneandupdate)
    - [findById](#findbyid)
8. [Static Events & Hooks](#static-events--hooks)
    - [On Create](#on-create)
    - [On Remove](#on-remove-1)
    - [On Change](#on-change-1)
    - [Custom Events](#custom-events-1)
9. [Associations](#associations)
    - [One to One](#one-to-one)
        - [hasOne](#hasone)
        - [belongsTo](#belongsto)
    - [One to Many](#one-to-many)
        - [hasMany](#hasmany)
    - [Many to Many](#many-to-many)
        - [belongsToMany](#belongstomany)

    
## Purpose
This is made to access and store data in the browser that is easily retrieved from different components in Angular. This is very similar to a model base system like an ODM/ORM. the syntax is very similar to Laravel's Eloquent. Each model has events that are triggered which allows for realtime view change. This is very useful for large apps when actively checking data slows down the app significantly.

This package may actually work with react. TBD

If you refresh the browser the data still exists inside, and is easily retrievable. Pretty awesome!

### Getting Started
The standard way of getting set up is to create a directory called: models
Then lets say I have user data, and post data.
I create 2 files in the models directory called
1. user.model.ts
2. post.model.ts

My user model looks like:
### Example Model
```
import { Model } from 'browser-model';

export class User extends Model {
    first;
    last;
    static SCHEMA = {
        _id:{type:'string', primary:true},
        first:{type:'string'},
        last:{type:'string'},
    }


    fullname(){
        return this.first + ' ' + this.last;
    }

}
```

### Example Component
```
import { User } from './../models/user.model';

ngOnInit() {

  let user1 = User.findOneAndUpdate({first:'Scott', last:'Thomas'}, {}, {upsert:true});
  let user2 = User.findOneAndUpdate({first:'Brian', last:"Alois"},{}, {upsert:true});

  console.log('user1', user1.fullname());
  console.log('user2', user2.fullname());

  user1.first = 'Jordan';
  user1.save();

  console.log('user1', user1.fullname());
}
```

## Instance Methods
### save
saves instance in web storage
```
let company = Company.findOne({name:'facebook'});
company.value = 500;
company.save()
```
### remove
Removes object from web storage
```
let company = Company.findOne({name:'facebook'});
company.remove()
```
### toObject
converts model to Javascript Object
```
let company = Company.findOne({name:'facebook'});
obj = company.toObject();
```
### reload
reloads models instance data to match what is in browser storage
```
let company = Company.findOne({name:'facebook'});
company.name = 'google';
company.reload()
console.log(company.name); // will print out facebook

company.name = 'google';
company.save()
console.log(company.name); // will print out google
```
### storage and instance differences
reloads models instance data to match what is in browser storage
```
let company = Company.findOne({name:'facebook'});
company.name = 'google';

let storage_dif = company.storageDifference();
console.log(storage_dif);//log {name:'facebook'}

let instance_dif = company.instanceDifference();
console.log(instance_dif);//log {name:'google'}

```

## Instance Events & Hooks
### On Save

```
company.on('save', ()=>{
    console.log('company was saved');
});
```

### On Remove

```
company.on('remove', ()=>{
    console.log('company was deleted');
});
```

### On Reload

```
company.on('reload', ()=>{
    console.log('company was reloaded');
});
```
### On Change

```
company.on('change', ()=>{
    console.log('company was changed');
});
```

### Custom Events
This is for the specific company 
```
company.emit('added user');

company.on('added user', ()=>{
    console.log('added user');
});


company.emit(['added product', 'created product'], {name:'shoes'});

company.on('added product', (product)=>{
    console.log('added product: ', product.name);
});

//watch for 2 events at the same time
company.on(['added product', 'created product'], (product)=>{
    console.log('added product: ', product.name);
});

```

Note: If you want the event to be thrown also as a static event add 3rd parameter as true
```
company.emit(['added product', 'created product'], {name:'shoes'}, true);

Company.on('added product', (data)=>{
    console.log('product added');
});
```

## Static Methods
### create
creates new Instance of model
```
let company = Company.create({name:'google', value:'600'})
```
### createOrUpdate
This will either create a new instance using the data, or given a primary key will update an already existing model with that key and return the corresponding instance.
```
let company = Company.createOrUpdate({id:4, name:'google', value:'600'})
```
### remove
Removes all instances with the given value from web storage
```
Company.remove({name:'microsoft'})
```
### update
Updates all instances with given value in web storage
Company.update([query params], [new_data])
```
Company.update({value:500}, {name:'Orange'});
```
### updateOne
Updates one instances with given value in web storage
Company.update([query params], [new_data])
```
Company.updateOne({value:500}, {name:'Orange'});
```
### find
returns an array of company instances with given value from web storage
```
let companies = Company.find({value:500});
```
### findOne
returns an instance with given value from web storage
```
let company = Company.findOne({value:500});
```
### findOneAndUpdate
Searches web storage for instance and then updates it. if option upsert is set to true, if it doesn't find the instance with the given object in web storage, it will create it.
```
let user1 = User.findOneAndUpdate({first:'Scott', last:'Thomas'}, {}, {upsert:true});
```
### findById
returns one instance with given id in webstorage
```
let user1 = User.findById(2);
```

## Static Events & Hooks
### On Create

```
Company.on('create', ()=>{
    console.log('A company was created and added to the web storage');
});
```

### On Remove

```
Company.on('remove', ()=>{
    console.log('a company was removed');
});
```

### On Change

```
Company.on('change', ()=>{
    console.log('any company was changed');
});
```

### Custom Events
This is for any and all data in your model
```
Company.emit('added user');

Company.on('added user', ()=>{
    console.log('added user');
});


Company.emit(['added product', 'created product'], {name:'shoes'});

Company.on('added product', (product)=>{
    console.log('added product: ', product.name);
});

Company.on(['added product', 'created product'], (product)=>{
    console.log('added product: ', product.name);
});
```
## Associations

### One to One
One-To-One associations are associations between exactly two models connected by a single foreign key.
A simple example would be User that owns only one Post
#### hasOne
Example Model
```
import { Model }            from 'browser-model';

export class User extends Model {
  _id;
  name;

  static SCHEMA = {
    _id:{type:'string', primary:true},//this means every time you make a new object you must give it a _id
    name:{type:'string'},
  };

  constructor(obj:object){
    super(obj);
  }

  Post(){
    return this.hasOne(Post, 'user_id', '_id');
  }

}

export class Post extends Model {
  _id;
  post_name;

  static SCHEMA = {
    _id:{type:'string', primary:true},//this means every time you make a new object you must give it a _id
    post_name:{type:'string'},
  };

  constructor(obj:object){
    super(obj);
  }

}
```
Then in the Component
```
ngOnInit() {
    this.user  = User.Auth();
    this.post = this.user.Post();
    console.log('post name', this.post.post_name);
}
```

#### belongsTo
Example Model
```
import { Model }            from 'browser-model';

export class User extends Model {
  _id;
  name;

  static SCHEMA = {
    _id:{type:'string', primary:true},//this means every time you make a new object you must give it a _id
    name:{type:'string'},
  };

  constructor(obj:object){
    super(obj);
  }

  Post(){
    return this.hasOne(Post, 'user_id', '_id');
  }

}

export class Post extends Model {
  _id;
  post_name;

  static SCHEMA = {
    _id:{type:'string', primary:true},//this means every time you make a new object you must give it a _id
    post_name:{type:'string'},
  };

  constructor(obj:object){
    super(obj);
  }
  
  User(){
    return this.belongsTo(User, 'user_id', '_id');
  }

}
```
Then in the Component
```
ngOnInit() {
    this.post = Post.findById(1);
    let user = this.post.User();
    console.log('user name', user.name);
}
```
### One to Many
#### hasMany
Lets say the user has many posts
Example Model
```
import { Model }            from 'browser-model';

export class User extends Model {
  _id;
  name;

  static SCHEMA = {
    _id:{type:'string', primary:true},//this means every time you make a new object you must give it a _id
    name:{type:'string'},
  };

  constructor(obj:object){
    super(obj);
  }

  Posts(){
    return this.hasMany(Post, 'user_id', '_id');
  }

}

export class Post extends Model {
  _id;
  post_name;

  static SCHEMA = {
    _id:{type:'string', primary:true},//this means every time you make a new object you must give it a _id
    post_name:{type:'string'},
  };

  constructor(obj:object){
    super(obj);
  }
  
  User(){
    return this.belongsTo(User, 'user_id', '_id');
  }

}
```
Then in the Component
```
ngOnInit() {
    this.user = User.findById(1);
    let posts = this.user.Posts();
    for(let i in posts){
        let post = posts[i];
        console.log('post name', post.post_name);
    }
}
```
### Many to Many
This gets more complicated. Functionality is completed, but has not been documented please comment here if you want this to be documented.
#### belongsToMany
