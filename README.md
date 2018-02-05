# Bamf-Store
Model Storage System Angular 2+ NG*

## Installation
```
npm i bamfstore
```

## Purpose
This is made to access and store data in the browser that is easily retrieved from different components in Angular. This is very similar to a model base system like an ODM. the syntax is very similar to mongoose.
It stores the data as a json string in the browser, and then queries and parses it to retrieve the data. This helps eliminate the need for redundant Http requests, and also complex ways of storing and retrieving data.
This uses already familiar known backend language. 

If you refresh the browser the data still exists inside, and is easily retrievable. Pretty awesome!

### Example Model
```
import { Model } from 'bamfstore';

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
Removes objkect from web storage
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
## find
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
returns once instance with given id in webstorage
```
let user1 = User.findById(2);
```

