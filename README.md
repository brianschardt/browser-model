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
  
  # Instance Methods
  ### save
  
  ### toObject
  
  # Static Methods
  ### create
  ### remove
  ### update
  ### updateOne
  ### find
  ### findOne
  ### findOneAndUpdate
  ### findById
