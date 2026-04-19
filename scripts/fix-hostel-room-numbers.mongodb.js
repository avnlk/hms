// Run with: mongosh <connection-string> scripts/fix-hostel-room-numbers.mongodb.js
// Or paste into mongosh after: use hostel_db
// 
// Sets roomNumber = roomId where roomNumber is null/missing (readable fallback).
// Review backup before running on production.

db.hostels.find().forEach(function (doc) {
  let modified = false;
  const bhavanas = doc.bhavanAs || [];
  bhavanas.forEach(function (bhavana) {
    (bhavana.blocks || []).forEach(function (block) {
      (block.floors || []).forEach(function (floor) {
        (floor.rooms || []).forEach(function (room) {
          const rn = room.roomNumber;
          const empty = rn == null || rn === "";
          if (empty && room.roomId != null && room.roomId !== "") {
            room.roomNumber = room.roomId;
            modified = true;
          }
        });
      });
    });
  });
  if (modified) {
    db.hostels.replaceOne({ _id: doc._id }, doc);
  }
});
