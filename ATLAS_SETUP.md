# MongoDB Atlas Setup Guide

## Quick Setup with Your Atlas Cluster

### Step 1: Update Environment File

1. **Open the `.env` file in your project**
2. **Replace the placeholders in the MongoDB URI:**

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.payfq.mongodb.net/dental_db?retryWrites=true&w=majority&appName=Cluster0
```

**Replace:**
- `your_username` with your MongoDB Atlas username
- `your_password` with your MongoDB Atlas password

### Step 2: MongoDB Atlas Configuration

1. **Ensure Network Access:**
   - Go to MongoDB Atlas Dashboard
   - Navigate to "Network Access"
   - Add your IP address or use `0.0.0.0/0` for development (allows all IPs)

2. **Database User:**
   - Go to "Database Access"
   - Ensure you have a database user with read/write permissions
   - Note the username and password for the connection string

### Step 3: Start the Application

```bash
npm start
```

### Expected Output

When everything is configured correctly, you should see:

```
Starting Dental API...
Environment: development
Port: 3000
Database Configuration:
- Type: MongoDB Atlas (Cloud)
- Database Name: dental_db
- Auto-create database: Enabled
Connecting to MongoDB...
✓ Connected to MongoDB successfully
✓ Using database: dental_db
📝 Database 'dental_db' exists but is empty - will initialize with sample data
🔧 Initializing database...
📝 Creating initial patient data...
✓ Created 3 sample patients
✓ Database will be automatically created in MongoDB Atlas
✅ Database initialization complete
Dental API server is running on port 3000
Health check available at: http://localhost:3000/health
```

### Test the API

1. **Health Check:** http://localhost:3000/health
2. **List Patients:** http://localhost:3000/api/patients
3. **API Root:** http://localhost:3000/

### Database Auto-Creation

✅ **The database will be automatically created when:**
- First connection is established
- First document is inserted
- Collections are created automatically by Mongoose

### Troubleshooting

**Connection Issues:**
- ❌ **Wrong credentials:** Double-check username/password
- ❌ **Network access:** Ensure IP is whitelisted
- ❌ **Cluster paused:** Check if Atlas cluster is running

**Common Fixes:**
1. Verify connection string format
2. Check Atlas cluster status
3. Confirm database user permissions
4. Review network access settings

### Example .env File

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://admin:mypassword123@cluster0.payfq.mongodb.net/dental_db?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=dental_db
```
