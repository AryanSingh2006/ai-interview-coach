import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import InterviewSession from "@/models/Interviewsession";
import Turn from "@/models/Turn";

/**
 * GET /api/interview/[sessionId]
 *
 * Resumes an existing interview session by returning its current state.
 *
 * Responsibilities:
 * - Authenticate the user
 * - Validate the sessionId
 * - Load the session and confirm ownership
 * - Load all turns for the session
 * - Determine answered turns and the current open turn (if any)
 * - Return a normalized payload describing where the user left off
 *
 * This route does NOT generate questions, evaluate answers,
 * or complete interviews. It is purely a read/resume endpoint.
 */
export async function GET(request, { params }) {
  try {
    // ----------------------------------------------------
    // 1. Authentication
    // ----------------------------------------------------
    const authUser = await getCurrentUser(request);

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ----------------------------------------------------
    // 2. Validate sessionId param
    // ----------------------------------------------------
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { error: "Invalid sessionId" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // 3. Database connection
    // ----------------------------------------------------
    await connectDB();

    // ----------------------------------------------------
    // 4. Load session and verify ownership
    // ----------------------------------------------------
    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId.toString() !== authUser._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ----------------------------------------------------
    // 5. Load all turns for this session, ordered by index
    // ----------------------------------------------------
    const allTurns = await Turn.find({ sessionId: session._id }).sort({
      index: 1,
    });

    // ----------------------------------------------------
    // 6. Derive answered turns and the current open turn
    // ----------------------------------------------------
    const answeredTurns = allTurns.filter((turn) => turn.answer !== "");

    // The open turn is the one with no answer yet.
    // There should only ever be one open turn at a time,
    // but we defensively sort descending by index and take the latest.
    const currentTurn = await Turn.findOne({
      sessionId: session._id,
      answer: "",
    }).sort({ index: -1 });

    // ----------------------------------------------------
    // 7. Handle completed sessions
    // ----------------------------------------------------
    if (session.status === "completed") {
      return NextResponse.json(
        {
          sessionId: session._id.toString(),
          interviewType: session.interviewType,
          status: session.status,
          completed: true,
          answeredQuestions: answeredTurns.length,
          currentQuestion: null,
        },
        { status: 200 }
      );
    }

    // ----------------------------------------------------
    // 8. Handle active (resumable) sessions
    // ----------------------------------------------------
    // Defensive null check: if no open turn exists for an
    // in-progress session, currentQuestion is null rather
    // than throwing — the frontend can decide how to handle it
    // (e.g. trigger next-question generation), since this route
    // is not responsible for generating questions.
    const currentQuestion = currentTurn
      ? {
          turnId: currentTurn._id.toString(),
          index: currentTurn.index,
          question: currentTurn.question,
          questionType: currentTurn.questionType,
        }
      : null;

    return NextResponse.json(
      {
        sessionId: session._id.toString(),
        interviewType: session.interviewType,
        status: session.status,
        completed: false,
        answeredQuestions: answeredTurns.length,
        currentQuestion,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/interview/[sessionId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}