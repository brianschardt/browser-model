# Bamf-Store
Model Storage System Angular 2+ ng*

## Installation
npm i bamfstore

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
ngOnInit() {

      User.removeAllData();//this deletes local storage
      let user1 = User.findOneAndUpdate({first:'Miranda', last:'Bashore'}, {}, {upsert:true});
      let user2 = User.findOneAndUpdate({first:'Brian', last:"schardt"},{}, {upsert:true});

      console.log('user1', user1.fullname());
      console.log('user2', user2.fullname());
  }
  ```
