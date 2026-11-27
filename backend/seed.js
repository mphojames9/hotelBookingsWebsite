// Fills the database with sample rooms (each with a photo gallery). Run once:  node seed.js
// Add --reset to delete the existing rooms (and their photos) first:           node seed.js --reset
import 'dotenv/config'
import fs from 'fs'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { LOCATIONS } from './config/locations.js'
import roomModel from './models/roomModel.js'
import imageModel from './models/imageModel.js'

// [key, name, type, description, price per night, sleeps, rooms available, amenities, number of photos]
// Photos are seed/images/<key>-1.jpg, <key>-2.jpg ...
const ROOMS = [
  ['standard-queen','Standard Queen','Standard','A bright, quiet room with a queen bed, a work desk and fast Wi-Fi. Everything you need for a restful night.',850,2,6,[['Bed','Queen'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Desk','Yes'],['Size','24 m²']],2],
  ['standard-city','City View Room','Standard','Floor-to-ceiling windows, soft linen and a city outlook from your bed. A modern base for business or a short break.',980,2,6,[['Bed','Double'],['Wi-Fi','Free'],['View','City'],['Coffee machine','Yes'],['Mini fridge','Yes']],2],
  ['standard-garden','Garden Double','Standard','A warm double room with wooden shutters and a calm, leafy outlook. Quiet, cosy and very good value.',920,2,4,[['Bed','Double'],['Wi-Fi','Free'],['Breakfast','Included'],['Coffee machine','Yes'],['Swimming pool','Yes']],2],
  ['deluxe-queen','Deluxe Queen Room','Deluxe','Our Deluxe rooms come with a queen bed, working station, a coffee maker, a mini fridge and more.',1380,2,5,[['Coffee machine','Yes'],['Bed','Queen'],['Swimming pool','Yes'],['Wi-Fi','Free'],['Breakfast','Included']],2],
  ['deluxe-triple','Deluxe Triple Room','Deluxe','Space for three, with a double and a single bed, a seating corner and a large desk. Ideal for friends or a small family.',1650,3,4,[['Beds','Double + single'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Mini fridge','Yes'],['Swimming pool','Yes']],1],
  ['deluxe-twin','Deluxe Twin Room','Deluxe','Two generous single beds, warm lighting and a lounge nook by the window. Perfect for colleagues or friends.',1450,2,4,[['Beds','2 x Single'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Desk','Yes'],['Breakfast','Included']],1],
  ['deluxe-balcony','Deluxe King with Bench','Deluxe','A king bed dressed in soft blues, a velvet bench and a bright working corner. Calm, elegant and spacious.',1750,2,5,[['Bed','King'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Breakfast','Included'],['Swimming pool','Yes']],2],
  ['executive-studio','Executive Studio','Executive','An open-plan studio with a full kitchen counter, a lounge area and a king bed. Built for longer stays.',2300,2,4,[['Bed','King'],['Kitchenette','Full'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Breakfast','Included']],2],
  ['executive-suite','Executive Suite','Executive','A separate bedroom and lounge with a large desk, premium linen and complimentary breakfast every morning.',2750,3,3,[['Bed','King'],['Living area','Yes'],['Desk','Yes'],['Breakfast','Included'],['Swimming pool','Yes']],1],
  ['junior-suite','Junior Suite','Suite','A light-filled suite with a king bed, a living area and floor-to-ceiling windows, plus a spa-style stone bathroom.',3200,3,3,[['Bed','King'],['Living area','Yes'],['View','City'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Shower','Rain']],3],
  ['suite-double','Deluxe Suite','Suite','Our Deluxe Suite offers a king bed, a working station, a lounge corner and sweeping views of the city.',3450,3,3,[['Bed','King'],['View','City'],['Living area','Yes'],['Coffee machine','Yes'],['Swimming pool','Yes'],['Breakfast','Included']],1],
  ['family-suite','Family Suite','Family','A spacious suite with a double and a single bed plus a sofa lounge, made for a family of four.',3100,4,3,[['Beds','Double + 2 single'],['Living area','Yes'],['Wi-Fi','Free'],['Mini fridge','Yes'],['Breakfast','Included']],1],
  ['family-double','Family Twin Suite','Family','Two large beds, a dining table and a deep seating area in a warm, golden suite. Space for everyone to spread out.',3600,4,2,[['Beds','2 x Double'],['Living area','Yes'],['Wi-Fi','Free'],['Coffee machine','Yes'],['Swimming pool','Yes']],1],
]

await connectDB()
if (process.argv.includes('--reset')) {
  const old = await roomModel.find({}, 'images image')
  const files = new Set(old.flatMap(r => [...(r.images || []), r.image].filter(Boolean)))
  await roomModel.deleteMany({})
  if (files.size) await imageModel.deleteMany({filename:{$in:[...files]}})
  console.log('Existing rooms and their photos removed')
} else if (await roomModel.countDocuments() > 0) {
  console.log('Rooms already exist. Run "node seed.js --reset" to replace them.')
  await mongoose.disconnect()
  process.exit(0)
}

for (const [index,[key,name,category,description,price,maxGuests,totalRooms,specs,photos]] of ROOMS.entries()) {
  const filenames = []
  for (let n = 1; n <= photos; n++) {
    const filename = `seed-${key}-${n}.jpg`
    await imageModel.deleteOne({filename})
    await imageModel.create({filename,contentType:'image/jpeg',data:fs.readFileSync(`seed/images/${key}-${n}.jpg`)})
    filenames.push(filename)
  }
  await roomModel.create({name,description,price,image:filenames[0],images:filenames,category,location:LOCATIONS[index % LOCATIONS.length],maxGuests,totalRooms,specs:specs.map(([label,value])=>({label,value}))})
  console.log('Added', name, `(${filenames.length} photo${filenames.length === 1 ? '' : 's'})`)
}
await mongoose.disconnect()
console.log('Done.')
