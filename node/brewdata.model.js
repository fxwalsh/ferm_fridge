import mongoose from 'mongoose'
const Schema = mongoose.Schema

const BrewDataSchema = new Schema({
  beer_temp: Number,
  fridge_temp: Number,
  set_point: Number,
  fridge_state: Number,
  runningTime: Number
})

export default mongoose.model('BrewData', BrewDataSchema)
