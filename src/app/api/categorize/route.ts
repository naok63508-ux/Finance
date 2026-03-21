import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { categorizeTransaction } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const category = await categorizeTransaction(description);
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Categorize error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
