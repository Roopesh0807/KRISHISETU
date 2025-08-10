import { jsPDF } from 'jspdf';

// Function to download a single plan bill as a PDF
export const downloadPlanPDF = async (plan, billData, consumer) => {
  try {
    const doc = new jsPDF();
    
    // Add bill content to PDF
    doc.setFontSize(16);
    doc.text(`${plan} SUBSCRIPTION BILL`, 105, 10, { align: 'center' });
    
    // Consumer Info
    doc.setFontSize(12);
    doc.text(`Consumer: ${consumer.first_name} ${consumer.last_name} (ID: ${consumer.consumer_id})`, 14, 20);
    doc.text(`Billing Date: ${billData.billingDate}`, 14, 30);
    doc.text(`Next Billing Date: ${billData.nextBillingDate}`, 14, 40);
    
    // Table header
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Product', 14, 60);
    doc.text('Qty', 80, 60);
    doc.text('Price', 120, 60);
    doc.text('Amount', 160, 60);
    doc.setFont(undefined, 'normal');
    
    // Table rows
    let y = 70;
    billData.items.forEach(item => {
      doc.text(item.product_name, 14, y);
      doc.text(item.quantity.toString(), 80, y);
      doc.text(`₹${item.price.toFixed(2)}`, 120, y);
      doc.text(`₹${item.total.toFixed(2)}`, 160, y);
      y += 10;
    });
    
    // Totals
    doc.setFont(undefined, 'bold');
    doc.text('Subtotal:', 120, y + 10);
    doc.text(`₹${billData.subtotal.toFixed(2)}`, 160, y + 10);
    
    doc.text('Subscription Fee:', 120, y + 20);
    doc.text(`₹${billData.subscriptionFee.toFixed(2)}`, 160, y + 20);
    
    doc.text('Total:', 120, y + 30);
    doc.text(`₹${billData.total.toFixed(2)}`, 160, y + 30);
    
    // Save the PDF
    doc.save(`subscription_bill_${plan}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true, message: 'PDF bill generated successfully' };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

// Function to generate and download a combined bill PDF
export const generateCombinedBillPDF = async (consumerId, token) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);

        const formattedStart = startDate.toISOString().split('T')[0];
        const formattedEnd = endDate.toISOString().split('T')[0];

        // Fetch the combined bill PDF from the server
        const pdfResponse = await fetch(
            `http://localhost:5000/api/subscriptions/combined-bill-pdf/${consumerId}?start_date=${formattedStart}&end_date=${formattedEnd}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!pdfResponse.ok) {
            throw new Error('Failed to generate PDF');
        }

        // Create a blob from the response and trigger download
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `combined_subscription_bill_${formattedStart}_to_${formattedEnd}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        return { success: true, message: 'Combined PDF bill downloaded successfully' };
    } catch (error) {
        console.error('Combined bill error:', error);
        return { success: false, message: `Error: ${error.message}` };
    }
};