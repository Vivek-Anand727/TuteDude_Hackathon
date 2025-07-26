# SanchayKart Flex - Backend API

A comprehensive group buying and bulk purchasing platform that connects vendors and suppliers for better pricing through collective bargaining.

## 🚀 Features

### For Vendors
- **Individual Requests**: Create requests for specific items with desired pricing
- **Group Formation**: Create or join groups for bulk purchasing power  
- **Group Leadership**: Manage group members and negotiate on behalf of the group
- **Offer Management**: Review, accept, reject, or counter offers from suppliers

### For Suppliers
- **Request Discovery**: Browse individual and group requests
- **Competitive Bidding**: Submit offers with pricing, delivery options, and ETA
- **Negotiation**: Respond to counter offers and manage pricing discussions
- **Order Management**: Track accepted offers and delivery commitments

### Platform Features
- **Role-based Access**: Separate interfaces and permissions for vendors and suppliers
- **Real-time Updates**: Track offer status and group activities
- **Advanced Search**: Filter requests by item, location, price range
- **Secure Authentication**: JWT-based authentication with role management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sanchaykart-flex-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```bash
   MONGO_URI=mongodb://localhost:27017/sanchaykart-flex
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   - Visit: http://localhost:5000/health
   - Should return: `{"success": true, "message": "SanchayKart Flex API is running"}`

## 📚 API Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST   | `/register` | Register new user | Public |
| POST   | `/login` | User login | Public |
| GET    | `/profile` | Get user profile | Private |
| PUT    | `/profile` | Update profile | Private |

### Request Routes (`/api/requests`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST   | `/create` | Create individual request | Vendors |
| GET    | `/my-requests` | Get vendor's requests | Vendors |
| GET    | `/browse` | Browse open requests | Suppliers |
| GET    | `/stats/dashboard` | Get request statistics | Vendors |
| GET    | `/:requestId` | Get request details | All |
| PATCH  | `/update/:requestId` | Update request | Request Owner |
| PATCH  | `/close/:requestId` | Close request | Request Owner |
| DELETE | `/:requestId` | Delete request | Request Owner |

### Group Routes (`/api/groups`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST   | `/create` | Create new group | Vendors |
| GET    | `/my-groups` | Get user's groups | All |
| GET    | `/available` | Get available groups | Vendors |
| GET    | `/:groupId` | Get group details | All |
| POST   | `/:groupId/join` | Join group | Vendors |
| POST   | `/:groupId/leave` | Leave group | Group Members |
| POST   | `/:groupId/assign-leader` | Assign new leader | Group Leader |
| POST   | `/:groupId/create-request` | Create group request | Group Leader |
| GET    | `/:groupId/request` | Get group request | All |

### Offer Routes (`/api/offers`)

#### Individual Offers
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST   | `/create` | Create offer | Suppliers |
| GET    | `/request/:requestId` | Get offers for request | Request Owner |
| GET    | `/my-offers` | Get supplier's offers | Suppliers |
| GET    | `/browse-requests` | Browse open requests | Suppliers |
| POST   | `/:offerId/accept` | Accept offer | Request Owner |
| POST   | `/:offerId/reject` | Reject offer | Request Owner |
| POST   | `/:offerId/counter` | Counter offer | Request Owner |
| POST   | `/:offerId/respond-counter` | Respond to counter | Suppliers |

#### Group Offers  
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST   | `/group/create` | Create group offer | Suppliers |
| GET    | `/group/request/:groupRequestId` | Get group offers | Group Leader |
| GET    | `/group/my-offers` | Get supplier's group offers | Suppliers |
| GET    | `/group/browse-requests` | Browse group requests | Suppliers |
| POST   | `/group/:offerId/accept` | Accept group offer | Group Leader |
| POST   | `/group/:offerId/counter` | Counter group offer | Group Leader |
| POST   | `/group/:offerId/respond-counter` | Respond to group counter | Suppliers |

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'vendor' | 'supplier',
  phone: String,
  location: String,
  businessName: String,
  isActive: Boolean
}
```

### Request Model (Individual)
```javascript
{
  vendor: ObjectId (User),
  item: String,
  quantity: String,
  desiredPrice: Number,
  location: String,
  status: 'open' | 'fulfilled' | 'expired' | 'cancelled',
  acceptedOffer: ObjectId (Offer)
}
```

### Group Model
```javascript
{
  name: String,
  leader: ObjectId (User),
  members: [{ user: ObjectId, quantity: String, joinedAt: Date }],
  item: String,
  totalQuantity: String,
  desiredPrice: Number,
  location: String,
  status: 'forming' | 'active' | 'negotiating' | 'deal_closed' | 'cancelled',
  maxMembers: Number
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Request data validation
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Endpoint-level permission control

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start app.js --name "sanchaykart-api"
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/sanchaykart-flex
JWT_SECRET=your-production-secret-key
PORT=5000
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

## 🧪 Testing

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@sanchaykart.com

---

**SanchayKart Flex** - Empowering vendors and suppliers through collective bargaining! 🛒✨