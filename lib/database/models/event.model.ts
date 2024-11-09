import { model, models, Schema } from "mongoose";



const EventsSchema = new Schema({
    title: {type: String, required:true},
    description: {type:String},
    location: {type:String},
    createdAt:{type: Date, default: Date.now},
    imageUrl:{type:String, required:true},
    startDateTime:{type: Date, default: Date.now},
    endDateTime:{type: Date, default: Date.now},
    price:{type:String},
    isFree:{ type:Boolean, default: false},
    url:{type:String},
    category: {type:Schema.Types.ObjectId, ref: 'Category'},
    organizer: {type:Schema.Types.ObjectId, ref: 'User'}
    
})

const Event = models.Event || model('Event', EventsSchema);

export default Event