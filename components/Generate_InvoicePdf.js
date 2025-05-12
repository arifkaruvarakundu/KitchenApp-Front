import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateInvoice = async (cartItems, address, calculateSubtotal) => {
  try {
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const date = new Date().toLocaleDateString();

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #2e86de;
            }
            .header, .footer {
              margin-bottom: 30px;
            }
            .customer-info {
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table, th, td {
              border: 1px solid #ccc;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            .total {
              text-align: right;
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice</h1>
            <p>Invoice #: ${invoiceNumber}</p>
            <p>Date: ${date}</p>
          </div>

          <div class="customer-info">
            <h3>Customer Information</h3>
            <p>Name: ${address.first_name} ${address.last_name}</p>
            <p>Email: ${address.email}</p>
            <p>Phone: ${address.phone_number}</p>
            <p>Address: ${address.street_address}, ${address.city}, ${address.country} - ${address.zipcode}</p>
          </div>

          <h3>Order Summary</h3>
          <table>
            <tr>
              <th>Item</th>
              <th>Brand</th>
              <th>Quantity</th>
              <th>Price (KD)</th>
              <th>Subtotal (KD)</th>
            </tr>
            ${cartItems.map(item => {
              const price = parseFloat(item.price).toFixed(2);
              const subtotal = (item.quantity * item.price).toFixed(2);
              return `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.brand}</td>
                  <td>${item.quantity}</td>
                  <td>${price}</td>
                  <td>${subtotal}</td>
                </tr>
              `;
            }).join('')}
          </table>

          <p class="total">Total: ${calculateSubtotal()} KD</p>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error("PDF Generation error", error);
  }
};
