import { apiHandler } from '@/lib/apiHandler';
import { ApiError } from '@/lib/errors';
import { getUserFromRequest } from '@/lib/auth';
import { generateDailyReport, generateWeeklyReport, generateMonthlyReport } from '@/lib/reportService';

async function handler(request) {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) throw new ApiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'weekly';

  let report;

  switch (type) {
    case 'daily':
      report = await generateDailyReport(userPayload.companyId);
      break;
    case 'weekly':
      report = await generateWeeklyReport(userPayload.companyId);
      break;
    case 'monthly':
      report = await generateMonthlyReport(userPayload.companyId);
      break;
    default:
      throw new ApiError('Invalid report type. Use: daily, weekly, or monthly', 400);
  }

  return { report };
}

export const GET = apiHandler(handler);
