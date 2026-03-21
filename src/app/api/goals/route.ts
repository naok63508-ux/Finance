import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: any = { userId };
    if (month && year) {
      where.month = parseInt(month);
      where.year = parseInt(year);
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { category: 'asc' }
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { category, limitAmount, month, year } = data;

    const goal = await prisma.goal.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month: parseInt(month),
          year: parseInt(year)
        }
      },
      update: { limitAmount: parseFloat(limitAmount) },
      create: {
        userId,
        category,
        limitAmount: parseFloat(limitAmount),
        month: parseInt(month),
        year: parseInt(year)
      }
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
