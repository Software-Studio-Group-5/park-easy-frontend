import { getSession } from "@/app/lib";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  console.log("api GET - getsession session", session);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(session.data); // Return session data
}
