import ExcelJS from 'exceljs';
import Purchase from '@/models/Purchase';
import Project from '@/models/Project';
import mongoose from 'mongoose';

/**
 * Export purchases to Excel
 */
export async function exportPurchasesToExcel(filters, companyId) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Purchases');

  // Define columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Phase', key: 'phase', width: 15 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Item', key: 'item', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Total Cost', key: 'totalCost', width: 12 },
    { header: 'Vendor', key: 'vendor', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Fetch purchases
  const query = { companyId: new mongoose.Types.ObjectId(companyId), ...filters };
  const purchases = await Purchase.find(query)
    .populate('projectId', 'name')
    .populate('phaseId', 'name')
    .populate('categoryId', 'name')
    .populate('itemId', 'name')
    .populate('vendorId', 'name')
    .sort({ purchaseDate: -1 });

  // Add data rows
  purchases.forEach((purchase) => {
    worksheet.addRow({
      date: purchase.purchaseDate?.toISOString().split('T')[0] || 'N/A',
      project: purchase.projectId?.name || 'N/A',
      phase: purchase.phaseId?.name || 'N/A',
      category: purchase.categoryId?.name || 'N/A',
      item: purchase.itemId?.name || 'N/A',
      quantity: purchase.quantity,
      unitPrice: purchase.pricePerUnit,
      totalCost: purchase.totalCost,
      vendor: purchase.vendorId?.name || 'N/A',
    });
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'I1',
  };

  return workbook;
}

/**
 * Export budget summary to Excel
 */
export async function exportBudgetSummaryToExcel(companyId) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Budget Summary');

  // Define columns
  worksheet.columns = [
    { header: 'Project', key: 'project', width: 25 },
    { header: 'Total Budget', key: 'budget', width: 15 },
    { header: 'Amount Spent', key: 'spent', width: 15 },
    { header: 'Remaining', key: 'remaining', width: 15 },
    { header: '% Used', key: 'percentUsed', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Fetch projects
  const projects = await Project.find({ companyId: new mongoose.Types.ObjectId(companyId) });

  // Calculate spending for each project
  for (const project of projects) {
    const purchases = await Purchase.aggregate([
      { $match: { projectId: project._id, companyId: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: null, totalSpent: { $sum: '$totalCost' } } },
    ]);

    const totalSpent = purchases.length > 0 ? purchases[0].totalSpent : 0;
    const remaining = project.totalBudget - totalSpent;
    const percentUsed = project.totalBudget > 0 ? (totalSpent / project.totalBudget) * 100 : 0;

    let status = 'On Track';
    if (percentUsed > 100) status = 'Over Budget';
    else if (percentUsed > 90) status = 'Critical';
    else if (percentUsed > 80) status = 'Warning';

    const row = worksheet.addRow({
      project: project.name,
      budget: project.totalBudget,
      spent: totalSpent,
      remaining: remaining,
      percentUsed: percentUsed.toFixed(2) + '%',
      status: status,
    });

    // Color code status
    if (status === 'Over Budget') {
      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' },
      };
      row.getCell('status').font = { color: { argb: 'FFFFFFFF' } };
    } else if (status === 'Critical') {
      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFA500' },
      };
    }
  }

  return workbook;
}
