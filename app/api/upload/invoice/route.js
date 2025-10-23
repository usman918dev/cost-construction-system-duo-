import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiError } from '@/lib/errors';

export async function POST(request) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) throw new ApiError('Unauthorized', 401);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { message: 'No file uploaded', statusCode: 400 } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: { message: 'Invalid file type. Only PDF, JPG, and PNG are allowed', statusCode: 400 } },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: { message: 'File size exceeds 5MB limit', statusCode: 400 } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(process.cwd(), 'public', 'uploads', 'invoices', filename);

    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/invoices/${filename}`;

    return NextResponse.json({
      ok: true,
      data: {
        filename,
        url: fileUrl,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { ok: false, error: { message: error.message || 'File upload failed', statusCode: 500 } },
      { status: 500 }
    );
  }
}
