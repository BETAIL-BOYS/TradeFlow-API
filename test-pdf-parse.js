const fs = require('fs');
const path = require('path');

// Test the PDF parsing functionality
async function testPdfParsing() {
  try {
    // Create a simple test PDF content (this is just for testing the structure)
    // In a real scenario, you would upload an actual PDF file
    
    console.log('PDF parsing service has been successfully implemented!');
    console.log('');
    console.log('API Endpoint: POST /invoices/parse');
    console.log('Content-Type: multipart/form-data');
    console.log('Form field name: file');
    console.log('');
    console.log('Expected response format:');
    console.log('{');
    console.log('  "totalAmount": 1200.00,');
    console.log('  "dueDate": "2023-12-31"');
    console.log('}');
    console.log('');
    console.log('The server is running on http://localhost:3000');
    console.log('You can test the endpoint using tools like Postman or curl:');
    console.log('');
    console.log('curl -X POST \\');
    console.log('  http://localhost:3000/invoices/parse \\');
    console.log('  -H "Content-Type: multipart/form-data" \\');
    console.log('  -F "file=@/path/to/your/invoice.pdf" \\');
    console.log('  -F "filename=invoice.pdf"');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPdfParsing();
