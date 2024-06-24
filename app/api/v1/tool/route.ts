import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Hi" })
}

export async function OPTIONS() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
}
