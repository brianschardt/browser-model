# Browser-Model
Simple state management with minimalistic API. This is similar to how mongoose / sequalize (any orm) accesses and uses data on the backend. Bringing this functionality to the frontend is game changer, since anyone familiar with an orm can jump right in.

## Installation
```
npm i browser-model
```

## Doc Menu
1. [Purpose](#purpose)
++. [Example Model](#example-model)
++ [Example Component](#example-component)
++ [Instance Methods](#instance-methods)
    - [save](#save)
    - [remove](#remove)
    - [toObject](#toobject)
    - [reload](#reload)
    - [Storage Differences](#storage-and-instance-differences)
++ [Instance Hooks & Events](#instance-events--hooks)
    - [On Save](#on-save)
    - [On Remove](#on-remove)
    - [On Reload](#on-reload)
    - [On Change](#on-change)
    - [Custom Events](#on-change)
++ [Static Methods](#static-methods)
    - [create](#create)
    - [remove](#remove-1)
    - [update](#update)
    - [updateOne](#updateone)
    - [find](#find)
    - [findOne](#findone)
    - [findOneAndUpdate](#findoneandupdate)
    - [findById](#findbyid)
++ [Static Events & Hooks](#static-events--hooks)
    - [On Create](#on-create)
    - [On Remove](#on-remove-1)
    - [On Change](#on-change-1)
    - [Custom Events](#custom-events-1)
++ [Associations](#)
    - [One to One](#)
        - [hasOne](#)
        - [belongsTo](#)
    - [One to Many](#)
    - [Many to Many](#)

    
## Purpose
This is made to access and store data in the browser that is easily retrieved from different components in Angular. This is very similar to a model base system like an ODM. the syntax is very similar to mongoose.
It stores the data as a json string in the browser, and then queries and parses it to retrieve the data. This helps eliminate the need for redundant Http requests, and also complex ways of storing and retrieving data.
This uses already familiar known backend language. 

If you refresh the browser the data still exists inside, and is easily retrievable. Pretty awesome!

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
