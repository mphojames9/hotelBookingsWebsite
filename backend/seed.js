// Fills the database with sample rooms (photos included). Run once:  npm run seed
// Add --reset to delete the existing rooms first.
import 'dotenv/config'
import fs from 'fs'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { LOCATIONS } from './config/locations.js'
import roomModel from './models/roomModel.js'
import imageModel from './models/imageModel.js'

const ROOMS = [
  ['standard-queen','Standard Queen','Standard','Bright, quiet room with a queen bed, work desk and fast Wi-Fi.',1200,2,6,[['Bed','Queen'],['Size','24 m²'],['Wi-Fi','Free']]],
  ['standard-city','Standard City View','Standard','Comfortable room with floor-to-ceiling windows and a city outlook.',1350,2,6,[['Bed','Queen'],['View','City'],['Wi-Fi','Free']]],
  ['standard-garden','Garden Double','Standard','Colourful double room that opens onto the garden courtyard.',1280,2,4,[['Bed','Double'],['View','Garden'],['Breakfast','Optional']]],
  ['deluxe-sea','Deluxe Sea View','Deluxe','Spacious room with a private balcony and a sweeping view of the sea.',2100,3,5,[['Bed','King'],['Balcony','Private'],['View','Sea']]],
  ['deluxe-balcony','Deluxe Balcony King','Deluxe','King bed, lounge corner and a balcony made for sunrise coffee.',1950,2,5,[['Bed','King'],['Balcony','Yes'],['Shower','Rain']]],
  ['deluxe-twin','Deluxe Twin','Deluxe','Two large beds and a bright seating area, perfect for friends or colleagues.',1850,3,4,[['Beds','2 x Twin'],['Size','32 m²'],['Minibar','Yes']]],
  ['executive-city','Executive Studio','Executive','Work-friendly studio with a big desk, lounge access and skyline views.',2600,2,4,[['Bed','King'],['Lounge','Access'],['Breakfast','Included']]],
  ['executive-lounge','Executive Suite','Executive','Separate living area, premium linen and complimentary breakfast.',2900,3,3,[['Bed','King'],['Living area','Yes'],['Breakfast','Included']]],
  ['family-apartment','Family Apartment','Family','Four bedrooms of space with a full living area, ideal for big families.',4200,8,2,[['Bedrooms','4'],['Kitchen','Yes'],['Sleeps','8']]],
  ['family-suite','Family Suite','Family','Two connected rooms with a living area and room for the whole family.',3100,4,3,[['Bedrooms','2'],['Living area','Yes'],['Kitchenette','Yes']]],
  ['suite-living','Junior Suite','Suite','Elegant suite with a lounge, dining nook and a king bed.',3400,3,3,[['Bed','King'],['Lounge','Yes'],['Size','48 m²']]],
  ['studio-corner','Corner Studio','Studio','Open-plan corner studio with a full kitchenette, built for longer stays.',1700,2,4,[['Bed','Double'],['Kitchenette','Full'],['Laundry','On site']]],
  ['studio-king','King Studio','Studio','Modern studio with a king bed, dark wood finishes and a work nook.',1900,2,4,[['Bed','King'],['Desk','Yes'],['Kitchenette','Yes']]],
  ['accessible-living','Accessible Suite','Accessible','Step-free suite with a wide bathroom, roll-in shower and a sunny lounge.',2200,3,2,[['Access','Step-free'],['Shower','Roll-in'],['Bed','King']]],
  ['penthouse-sunset','Sunset Penthouse','Penthouse','Top-floor penthouse with a private terrace and the best sunset in the city.',5400,4,1,[['Bed','King'],['Terrace','Private'],['Views','180°']]],
]

await connectDB()
if (process.argv.includes('--reset')) {
  await roomModel.deleteMany({})
  console.log('Existing rooms removed')
} else if (await roomModel.countDocuments() > 0) {
  console.log('Rooms already exist. Use "npm run seed -- --reset" to replace them.')
  await mongoose.disconnect()
  process.exit(0)
}

for (const [index,[key,name,category,description,price,maxGuests,totalRooms,specs]] of ROOMS.entries()) {
  const filename = `seed-${key}.jpg`
  await imageModel.deleteOne({filename})
  await imageModel.create({filename,contentType:'image/jpeg',data:fs.readFileSync(`seed/images/${key}.jpg`)})
  await roomModel.create({name,description,price,image:filename,images:[filename],category,location:LOCATIONS[index % LOCATIONS.length],maxGuests,totalRooms,specs:specs.map(([label,value])=>({label,value}))})
  console.log('Added', name)
}
await mongoose.disconnect()
console.log('Done.')
