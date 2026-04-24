# 🛒 Full E-Commerce RESTful API

A robust, scalable, and secure E-Commerce backend built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. This API provides a comprehensive set of features for managing an online store, including user authentication, product management, shopping carts, orders, and payment integration.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- User Registration and Login.
- Password Hashing with **Bcrypt**.
- **JWT (JSON Web Tokens)** for secure authentication.
- Role-based Access Control (Admin, User, Manager).
- Password Reset via Email.

### 📦 Product Management
- Full CRUD for **Categories**, **Subcategories**, **Brands**, and **Products**.
- Product Search, Filtering, Sorting, and Pagination.
- Image Upload and Optimization using **Multer** and **Sharp**.
- Dynamic Slugs for SEO-friendly URLs.

### 🛒 Shopping Experience
- **Shopping Cart**: Add, update, and remove items.
- **Wishlist**: Save favorite products for later.
- **Reviews & Ratings**: User feedback on products.
- **Address Management**: Multiple shipping addresses per user.

### 💳 Checkout & Orders
- **Coupons**: Discount management for orders.
- **Orders**: Full lifecycle from creation to delivery.
- **Payment Integration**: Secure payments via **Stripe**.
- **Webhooks**: Automated order status updates.

### 🛡️ Security & Performance
- **Data Sanitization**: Against NoSQL Injection & XSS.
- **Security Headers**: Using **Helmet**.
- **Rate Limiting**: To prevent Brute-force attacks.
- **HPP**: Protection against HTTP Parameter Pollution.
- **Compression**: Response optimization.
- **Logging**: Request logging with **Morgan**.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) (v5.x)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Validation**: [Express Validator](https://express-validator.github.io/docs/)
- **File Upload**: [Multer](https://github.com/expressjs/multer)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Mail**: [Nodemailer](https://nodemailer.com/)

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/adelahmed0/NodeJS-Full-ECommerce-APIs.git
   cd NodeJS-Full-ECommerce-APIs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE_TIME=90d
   
   # Email Config
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_app_password

   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run the application**:
   ```bash
   # Development mode
   npm run dev

   # Build for production
   npm run build

   # Start production
   npm start
   ```

---

## 📂 Project Structure

```text
src/
├── config/         # Database and environment configurations
├── controllers/    # Request handlers
├── helpers/        # Utility functions for specific modules
├── middleware/     # Custom Express middlewares (Auth, Error, etc.)
├── models/         # Mongoose schemas and models
├── routes/         # API route definitions
├── services/       # Business logic (Optional layering)
├── types/          # TypeScript interfaces and types
├── utils/          # Global utility functions
└── validators/     # Request validation logic
```

---

## 📜 Scripts

- `npm run dev`: Runs the app in development mode with hot-reloading.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm run check-types`: Performs type checking without emitting files.
- `npm run db:seed`: Populates the database with dummy data.
- `npm run db:destroy`: Clears all data from the database.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [ISC License](LICENSE).
