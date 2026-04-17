const http = require('http');

const orderData = {
  orderItems: [
    {
      name: "Test Product",
      qty: 1,
      image: "https://via.placeholder.com/150",
      price: 100,
      product: "69d1f5b89d8b647edbba0e79"
    }
  ],
  shippingAddress: {
    fullName: "Debug User",
    addressLine1: "123 Debug St",
    city: "Debug City",
    state: "DefaultState",
    zipCode: "123456",
    phone: "9876543210"
  },
  paymentMethod: "COD",
  itemsPrice: 100,
  taxPrice: 5,
  shippingPrice: 0,
  totalPrice: 105
};

// We need a token because of auth middleware
// Since we have the secret, we can generate a temporary one if we had jsonwebtoken installed here
// But we can also look at the server logs after a cart attempt.

const data = JSON.stringify(orderData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
    // NO TOKEN - Expecting 401, but we want to see if we can trigger the 500 if we bypass auth or if auth is failing
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
