import { getUserFromRequest } from '@/lib/auth';
import { ApiError } from '@/lib/errors';
import { exportPurchasesToExcel, exportBudgetSummaryToExcel } from '@/lib/exportService';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) throw new ApiError('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'purchases';
    const projectId = searchParams.get('projectId');

    let workbook;
    let filename;

    if (type === 'purchases') {
      const filters = {};
      if (projectId) filters.projectId = projectId;
      
      workbook = await exportPurchasesToExcel(filters, userPayload.companyId);
      filename = `purchases_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (type === 'budget-summary') {
      workbook = await exportBudgetSummaryToExcel(userPayload.companyId);
      filename = `budget_summary_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      throw new ApiError('Invalid export type', 400);
    }

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { ok: false, error: { message: error.message, statusCode: error.statusCode || 500 } },
      { status: error.statusCode || 500 }
    );
  }
}
