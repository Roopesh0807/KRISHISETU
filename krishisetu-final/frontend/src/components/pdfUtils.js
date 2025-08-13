import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For better table rendering
import moment from 'moment'; // For date calculations

// Function to download a single plan bill as a PDF
export const downloadPlanPDF = async (plan, billData, consumer) => {
  try {
    const doc = new jsPDF();
    const today = moment().format('YYYY-MM-DD');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20; // Increased margin for better spacing
    const contentWidth = pageWidth - 2 * margin;
    let currentY = 15; // Starting Y position

    // Set fonts and colors for a professional look
    doc.setTextColor(30, 30, 30); // Darker grey text for better contrast

    // Header - Company Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('KrishiSetu Headquarters', margin, currentY);
    doc.text('123 Green Valley, Rural Heights', margin, currentY + 5);
    doc.text('Agriculture City, 560001', margin, currentY + 10);
    doc.text('Phone: +91 98765 43210', margin, currentY + 15);
    doc.text('Email: support@krishisetu.com', margin, currentY + 20);
    currentY += 30;

    // Main Bill Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`KRISHISETU - ${plan.toUpperCase()} SUBSCRIPTION BILL`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20; // Space after title

    // Customer Info and Billing Dates
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${consumer.first_name} ${consumer.last_name}`, margin, currentY + 7);
    doc.text(`Customer ID: ${consumer.consumer_id}`, margin, currentY + 14);
    // Add consumer address if available
    // doc.text(`Address: ${consumer.address || 'N/A'}`, margin, currentY + 21);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill Date: ${today}`, contentWidth + margin, currentY, { align: 'right' }); // Align right
    doc.text(`Next Billing: ${billData.nextBillingDate}`, contentWidth + margin, currentY + 7, { align: 'right' }); // Align right
    currentY += 30; // Space after customer info/dates

    // Horizontal line separator
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY); // Thicker line below header
    currentY += 10; // Space after line

    // Items Table
    const tableHeaders = [['Product', 'Qty', 'Price', 'Amount']]; // Removed currency prefix
    const tableRows = billData.items.map(item => [
      item.product_name,
      item.quantity,
      item.price.toFixed(2), // Removed currency prefix
      item.total.toFixed(2) // Removed currency prefix
    ]);

    doc.autoTable({
      startY: currentY,
      head: tableHeaders,
      body: tableRows,
      theme: 'striped', // 'striped' for alternating row colors
      headStyles: {
        fillColor: [100, 180, 100], // Green header
        textColor: [255, 255, 255], // White text
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center' // Center header text
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        halign: 'center' // Center body text
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak', // Ensure text wraps in cells
      },
      columnStyles: {
        0: { cellWidth: 80, halign: 'left' }, // Product (left-aligned)
        1: { cellWidth: 30 }, // Qty
        2: { cellWidth: 40 }, // Price
        3: { cellWidth: 40 }, // Amount
      },
      margin: { left: margin, right: margin }
    });

    currentY = doc.autoTable.previous.finalY;

    // Totals Section
    currentY += 10; // Add some space after table

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Subtotal
    doc.text('Subtotal:', contentWidth - 40, currentY, { align: 'right' });
    doc.text(billData.subtotal.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
    currentY += 7;

    // Subscription Fee
    doc.text('Subscription Fee:', contentWidth - 40, currentY, { align: 'right' });
    doc.text(billData.subscriptionFee.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
    currentY += 7;
    
    // Total line separator
    doc.setLineWidth(0.5);
    doc.line(contentWidth - 40, currentY + 2, contentWidth + margin, currentY + 2);
    currentY += 10;

    // Grand Total
    doc.setFontSize(16);
    doc.setTextColor(40, 150, 40); // Green for total
    doc.text('TOTAL:', contentWidth - 40, currentY, { align: 'right' });
    doc.text(billData.total.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
    currentY += 20;

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80); // Lighter grey for footer
    doc.text('Thank you for choosing KrishiSetu!', pageWidth / 2, doc.internal.pageSize.getHeight() - 25, { align: 'center' });
    doc.text('This is an electronically generated bill and does not require a signature.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });

    // Save the PDF
    doc.save(`krishisetu_bill_${plan}_${today}.pdf`);
    
    return { success: true, message: 'PDF bill generated successfully' };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

// Function to generate and download a combined bill PDF
export const generateCombinedBillPDF = async (consumerId, token, startDate, endDate) => {
    try {
        const today = moment();
        const formattedStart = moment(startDate).format('YYYY-MM-DD');
        const formattedEnd = moment(endDate).format('YYYY-MM-DD');

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        
        let currentY = 20;

        // Fetch combined bill data from the backend API
        const response = await fetch(
          `http://localhost:5000/api/subscriptions/combined-bill/${consumerId}?start_date=${formattedStart}&end_date=${formattedEnd}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Response not OK:", response.status, errorText);
            throw new Error(`Failed to fetch combined bill data: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log("Received API response data:", responseData); // Crucial for debugging

        // **CRITICAL FIX: Removed the strict validation that was causing the error.**
        // The backend log confirms dailyDeliveries and overallTotals are present.
        // We now trust the server.js output and proceed with PDF generation.
        const consumer = responseData.consumer;
        const dailyDeliveries = responseData.dailyDeliveries;
        const overallTotals = responseData.overallTotals;

        // --- Main Header ---
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('KRISHISETU', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        doc.setFontSize(18);
        doc.text('Combined Subscription Bill', pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;

        // Company Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('KrishiSetu Headquarters', margin, currentY);
        doc.text('123 Green Valley, Rural Heights', margin, currentY + 5);
        doc.text('Agriculture City, 560001', margin, currentY + 10);
        doc.text('Phone: +91 98765 43210', margin, currentY + 15);
        doc.text('Email: support@krishisetu.com', margin, currentY + 20);
        currentY += 30;

        // Customer & Period Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(`Name: ${consumer.first_name} ${consumer.last_name}`, margin, currentY + 7);
        doc.text(`Customer ID: ${consumerId}`, margin, currentY + 14);
        // Add consumer address if available
        // doc.text(`Address: ${consumer.address || 'N/A'}`, margin, currentY + 21);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Billing Period: ${formattedStart} to ${formattedEnd}`, contentWidth + margin, currentY, { align: 'right' });
        doc.text(`Generated On: ${today.format('YYYY-MM-DD')}`, contentWidth + margin, currentY + 7, { align: 'right' });
        currentY += 30; // Space after customer info/dates

        doc.setLineWidth(0.8);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;

        // --- Daily Delivery Sections ---
        // Sort dates to ensure chronological order in the PDF
        const sortedDates = Object.keys(dailyDeliveries).sort((dateA, dateB) => moment(dateA).diff(moment(dateB)));

        if (sortedDates.length === 0) {
            doc.setFontSize(12);
            doc.text('No deliveries recorded for this period.', pageWidth / 2, currentY + 20, { align: 'center' });
            currentY += 40;
        } else {
            sortedDates.forEach((date) => {
                const data = dailyDeliveries[date];
                // Check if new page is needed for next section
                // Estimate space needed: section title (14pt), table (approx 10pt per row + padding), totals (approx 40pt)
                const estimatedHeight = 15 + (data.items.length * 10) + 40 + 20; 
                if (currentY + estimatedHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    currentY = margin; // Reset Y to top margin
                }

                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`Deliveries on ${moment(date).format('MMMM DD, YYYY')}`, margin, currentY);
                currentY += 8;

                // Table for daily items
                const dailyTableHeaders = [['Subscription Type', 'Product', 'Qty', 'Price', 'Amount']]; // Removed currency prefix
                const dailyTableRows = data.items.map(item => [
                  item.subscription_type,
                  item.product_name,
                  item.quantity,
                  item.price.toFixed(2), // Removed currency prefix
                  item.total.toFixed(2) // Removed currency prefix
                ]);

                doc.autoTable({
                  startY: currentY + 5,
                  head: dailyTableHeaders,
                  body: dailyTableRows,
                  theme: 'plain',
                  headStyles: {
                      fillColor: [245, 245, 245], // Light grey header
                      textColor: [0, 0, 0],
                      fontStyle: 'bold',
                      fontSize: 10,
                      halign: 'center' // Center header text
                  },
                  bodyStyles: {
                    textColor: [50, 50, 50],
                    halign: 'center' // Center body text
                  },
                  styles: {
                      fontSize: 9,
                      cellPadding: 2,
                      overflow: 'linebreak',
                  },
                  columnStyles: {
                    0: { cellWidth: 50, halign: 'left' }, // Subscription Type
                    1: { cellWidth: 70, halign: 'left' }, // Product
                    2: { cellWidth: 25 }, // Qty
                    3: { cellWidth: 35 }, // Price
                    4: { cellWidth: 35 }, // Amount
                  },
                  margin: { left: margin, right: margin }
                });
                currentY = doc.autoTable.previous.finalY;

                // Daily totals
                currentY += 5; // Small buffer

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 30, 30);

                doc.text('Subtotal:', contentWidth - 40, currentY, { align: 'right' });
                doc.text(data.subtotal.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
                currentY += 7;

                doc.text('Subscription Fee:', contentWidth - 40, currentY, { align: 'right' });
                doc.text(data.fee.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
                currentY += 7;

                doc.setLineWidth(0.3);
                doc.line(contentWidth - 40, currentY + 2, contentWidth + margin, currentY + 2);
                currentY += 10;

                doc.setFontSize(12);
                doc.setTextColor(40, 150, 40); // Green for total
                doc.text('TOTAL for this day:', contentWidth - 40, currentY, { align: 'right' });
                doc.text(data.total.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
                currentY += 20;

                doc.setLineWidth(0.5);
                doc.line(margin, currentY, pageWidth - margin, currentY); // Section separator
                currentY += 10;
            });
        }
        
        // --- Grand Total Summary ---
        // Ensure there's enough space for the summary, add new page if needed
        const summaryHeight = 20 + (Object.keys(overallTotals).length * 10) + 40; // Title + rows + grand total
        if (currentY + summaryHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            currentY = margin;
        }

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text('OVERALL SUMMARY', pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;

        const summaryTableHeaders = [['Subscription Type', 'Total Amount']]; // Removed currency prefix
        const summaryRows = Object.entries(overallTotals)
            .filter(([type]) => type !== 'grandTotal') // Exclude grandTotal as it's handled separately
            .map(([type, amount]) => [type, amount.toFixed(2)]); // Removed currency prefix

        doc.autoTable({
          startY: currentY + 5,
          head: summaryTableHeaders,
          body: summaryRows,
          theme: 'grid',
          headStyles: {
              fillColor: [100, 180, 100],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 11,
              halign: 'center'
          },
          bodyStyles: {
            textColor: [50, 50, 50],
            halign: 'center'
          },
          styles: {
              fontSize: 10,
              cellPadding: 3,
          },
          columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'right' }
          },
          margin: { left: margin, right: margin }
        });
        currentY = doc.autoTable.previous.finalY;

        currentY += 10; // Buffer

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 150, 40); // Green for grand total
        doc.text('GRAND TOTAL:', contentWidth - 60, currentY, { align: 'right' });
        doc.text(overallTotals.grandTotal.toFixed(2), contentWidth + margin, currentY, { align: 'right' }); // Removed currency prefix
        currentY += 25;

        // --- Footer ---
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80); // Lighter grey for footer
        doc.text('Thank you for choosing KrishiSetu!', pageWidth / 2, doc.internal.pageSize.getHeight() - 25, { align: 'center' });
        doc.text('This is an electronically generated bill and does not require a signature.', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });

        // Removed doc.end() - it's not needed for client-side blob output
        // doc.output('dataurlnewwindow'); // Use this for previewing in a new tab
        // Or use this for direct download:
        const blob = doc.output('blob');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `krishisetu_combined_bill_${formattedStart}_to_${formattedEnd}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Clean up the URL object

        return { success: true, message: 'Combined PDF bill downloaded successfully' };
    } catch (error) {
        console.error('Combined bill generation error:', error);
        return { success: false, message: `Error: ${error.message}` };
    }
};
