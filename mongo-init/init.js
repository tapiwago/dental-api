// MongoDB initialization script
// This script ensures the database and collections are created properly

// Switch to the dental_db database (creates it if it doesn't exist)
db = db.getSiblingDB('dental_db');

// Create collections explicitly to ensure database creation
db.createCollection('patients');
db.createCollection('appointments');
db.createCollection('treatments');

print("✓ Created database 'dental_db' with collections");

// Insert sample patient data
const samplePatients = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    dateOfBirth: new Date("1985-06-15"),
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA"
    },
    emergencyContact: {
      name: "Jane Doe",
      phone: "+1234567899",
      relationship: "Spouse"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1234567891",
    dateOfBirth: new Date("1990-03-22"),
    address: {
      street: "456 Oak Ave",
      city: "Somewhere",
      state: "NY",
      zipCode: "67890",
      country: "USA"
    },
    emergencyContact: {
      name: "Bob Smith",
      phone: "+1234567892",
      relationship: "Brother"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    phone: "+1234567893",
    dateOfBirth: new Date("1978-11-10"),
    address: {
      street: "789 Pine Rd",
      city: "Elsewhere",
      state: "TX",
      zipCode: "54321",
      country: "USA"
    },
    medicalHistory: [{
      condition: "Diabetes Type 2",
      medications: ["Metformin"],
      allergies: ["Penicillin"],
      notes: "Regular blood sugar monitoring required"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Check if patients already exist, if not insert sample data
const existingPatients = db.patients.countDocuments();
if (existingPatients === 0) {
  db.patients.insertMany(samplePatients);
  print(`✓ Inserted ${samplePatients.length} sample patients`);
} else {
  print(`✓ Found ${existingPatients} existing patients`);
}

// Create indexes for better performance
db.patients.createIndex({ "email": 1 }, { unique: true });
db.patients.createIndex({ "phone": 1 });
db.patients.createIndex({ "lastName": 1, "firstName": 1 });
db.patients.createIndex({ "createdAt": 1 });

print("✓ Created database indexes");

// Create a simple appointments collection with sample data
const sampleAppointments = [
  {
    patientEmail: "john.doe@example.com",
    date: new Date("2025-08-15"),
    time: "10:00",
    type: "Cleaning",
    duration: 60,
    status: "scheduled",
    notes: "Regular 6-month cleaning",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    patientEmail: "jane.smith@example.com",
    date: new Date("2025-08-16"),
    time: "14:30",
    type: "Consultation",
    duration: 30,
    status: "scheduled",
    notes: "Initial consultation for new patient",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const existingAppointments = db.appointments.countDocuments();
if (existingAppointments === 0) {
  db.appointments.insertMany(sampleAppointments);
  print(`✓ Inserted ${sampleAppointments.length} sample appointments`);
}

// Create indexes for appointments
db.appointments.createIndex({ "patientEmail": 1 });
db.appointments.createIndex({ "date": 1, "time": 1 });
db.appointments.createIndex({ "status": 1 });

print("✓ Database initialization completed successfully");
print(`✓ Database: ${db.getName()}`);
print(`✓ Collections: ${db.getCollectionNames().join(', ')}`);
print(`✓ Total patients: ${db.patients.countDocuments()}`);
print(`✓ Total appointments: ${db.appointments.countDocuments()}`);
