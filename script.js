function calculateTotal(inputField) {
  const row = inputField.closest('tr');
  const quantity = parseFloat(row.cells[1].querySelector('input').value);
  const price = parseFloat(row.cells[2].querySelector('input').value);
  const totalField = row.cells[3].querySelector('input');
  
  if (!isNaN(quantity) && !isNaN(price)) {
      totalField.value = (quantity * price).toFixed(2);
  } else {
      totalField.value = '';
  }
}

function addRow(tableId) {
  const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  const newRow = table.insertRow(table.rows.length);
  
  newRow.innerHTML = `
      <td><input type="text" placeholder="Enter product name" /></td>
      <td><input type="number" placeholder="Enter quantity" oninput="calculateTotal(this)" /></td>
      <td><input type="number" placeholder="Enter price" oninput="calculateTotal(this)" /></td>
      <td><input type="text" readonly /></td>
  `;
}

function getTableData(tableId) {
  const table = document.getElementById(tableId);
  const rows = table.getElementsByTagName('tr');
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      const product = cells[0].querySelector('input').value;
      const quantity = parseFloat(cells[1].querySelector('input').value);
      const price = parseFloat(cells[2].querySelector('input').value);
      const rowTotal = quantity * price;
      
      if (product && !isNaN(quantity) && !isNaN(price)) {
          data.push({
              product,
              quantity,
              price,
              rowTotal
          });
      }
  }
  
  return data;
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const customerName1 = document.getElementById('customer-name-1').value || 'Customer 1';
  const customerName2 = document.getElementById('customer-name-2').value || 'Customer 2';
  
  function generateBill(yStart, customerName, tableData) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text('Invoice / Bill', 105, yStart + 15, null, null, 'center');
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Customer: ${customerName}`, 10, yStart + 25);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, yStart + 30);
      
      doc.setFontSize(8);
      doc.text('Product Name', 10, yStart + 40);
      doc.text('Quantity', 70, yStart + 40);
      doc.text('Price', 90, yStart + 40);
      doc.text('Total', 110, yStart + 40);
      
      let yPosition = yStart + 45;
      let total = 0;
      
      tableData.forEach((row) => {
          if (yPosition < yStart + 120) {
              const { product, quantity, price, rowTotal } = row;
              
              doc.setFontSize(8);
              doc.text(product.substring(0, 25), 10, yPosition);
              doc.text(quantity.toString(), 70, yPosition);
              doc.text(price.toFixed(2), 90, yPosition);
              doc.text(rowTotal.toFixed(2), 110, yPosition);
              
              total += rowTotal;
              yPosition += 5;
          }
      });
      
      yPosition += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount: Rs ${total.toFixed(2)}`, 10, yPosition);
  }
  
  const firstBillData = getTableData('items-table-1');
  generateBill(0, customerName1, firstBillData);
  
  doc.setLineWidth(0.5);
  doc.line(10, 148.5, 200, 148.5);
  
  const secondBillData = getTableData('items-table-2');
  generateBill(148.5, customerName2, secondBillData);
  
  doc.save('dual_bills.pdf');
}