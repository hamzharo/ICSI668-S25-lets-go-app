// frontend/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: "Hello from Let's GO Frontend API!" });
}

// You can also define POST, PUT, DELETE, etc.
// export async function POST(request: Request) {
//   const body = await request.json();
//   return NextResponse.json({ received: body });
// }