import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import Interviewsession from "@/models/Interviewsession";
import Candidateprofile from "@/models/Candidateprofile";
import Turn from "@/models/Turn";
import Evaluation from "@/models/Evaluation";
import { evaluateAnswer } from "@/lib/Evaluateanswer";
import { generateNextQuestion } from "@/lib/questionGenerator";

const MAX_QUESTIONS = 15;

/**
 * POST /api/interview/[sessionId]/answer
 * Body: { "answer": "..." }
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    if (!mongoose.isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const answerText = body?.answer;

    if (typeof answerText !== "string" || !answerText.trim()) {
      return NextResponse.json(
        { error: "'answer' is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const session = await Interviewsession.findById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    if (session.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "This interview has already been completed" },
        { status: 400 }
      );
    }


    // The most recent turn with an empty answer is the one currently "open"
    const currentTurn = await Turn.findOne({
      sessionId: session._id,
      answer: "",
    }).sort({ index: -1 });

    if (!currentTurn) {
      return NextResponse.json(
        { error: "No pending question found for this session" },
        { status: 400 }
      );
    }

    // 1. Save the candidate's answer onto the current turn
    currentTurn.answer = answerText.trim();
    await currentTurn.save();

    // 2. Load the candidate profile up front — both evaluateAnswer() and
    //    generateNextQuestion() need it, so fetch it once and reuse it.
    // ASSUMPTION: Interviewsession stores candidateProfileId (see patch notes).
    const candidateProfile = session.candidateProfileId
      ? await Candidateprofile.findById(session.candidateProfileId)
      : null;

    // 3. Load everything answered so far. At this point currentTurn has an
    //    answer but no Evaluation yet, so allEvaluations naturally covers
    //    only the PRIOR turns — exactly the context evaluateAnswer() should
    //    see (it should know the trend so far, but it isn't being told how
    //    THIS answer scored before it's judged it).
    const allTurns = await Turn.find({ sessionId: session._id }).sort({ index: 1 });
    const turnIds = allTurns.map((t) => t._id);
    const priorEvaluations = await Evaluation.find({ turnId: { $in: turnIds } });
    const priorTurns = allTurns.filter(
      (t) => t._id.toString() !== currentTurn._id.toString()
    );

    // 4. Evaluate the answer with Groq, using the same candidate-profile +
    //    history context questionGenerator.js uses for question generation.
    const evaluationResult = await evaluateAnswer({
      question: currentTurn.question,
      answer: currentTurn.answer,
      questionType: currentTurn.questionType,
      candidateProfile,
      interviewType: session.interviewType,
      jobDescription: session.jobDescription,
      previousTurns: priorTurns,
      previousEvaluations: priorEvaluations,
    });

    // 5. Persist the evaluation (one per turn, enforced by a unique index)
    const evaluation = await Evaluation.create({
      sessionId: session._id,
      turnId: currentTurn._id,
      score: evaluationResult.score,
      dimensionScores: evaluationResult.dimensionScores,
      strengths: evaluationResult.strengths,
      weaknesses: evaluationResult.weaknesses,
      recommendedFollowUpTopics: evaluationResult.recommendedFollowUpTopics,
      feedback: evaluationResult.feedback,
    });

    // 6. Flip session to in_progress on the first answer
    if (session.status === "created") {
      session.status = "in_progress";
      session.startedAt = session.startedAt || new Date();
    }

    // 7. Build the full evaluation history for next-question generation by
    //    appending the evaluation we just created — no need to re-query
    //    the DB for something we already have sitting in memory.
    const allEvaluations = [...priorEvaluations, evaluation];

    if (currentTurn.index + 1 >= MAX_QUESTIONS) {
      session.status = "ready_for_completion";
      await session.save();

      return NextResponse.json({
        completed: true,
        readyForCompletion: true,
        message:
          "Interview completed. Generate the final report.",
      });
    }


    // 8. Generate the next, difficulty-adjusted question
    const nextQuestionResult = await generateNextQuestion({
      candidateProfile,
      interviewType: session.interviewType,
      jobDescription: session.jobDescription,
      previousTurns: allTurns,
      evaluations: allEvaluations,
    });


    // 9. Create the next turn
    const nextIndex = currentTurn.index + 1;
    const nextTurn = await Turn.create({
      sessionId: session._id,
      index: nextIndex,
      question: nextQuestionResult.question,
      questionType: nextQuestionResult.questionType,
      answer: "",
    });

    await session.save();

    return NextResponse.json(
      {
        evaluation: {
          score: evaluation.score,
          dimensionScores: evaluation.dimensionScores,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          recommendedFollowUpTopics: evaluation.recommendedFollowUpTopics,
          feedback: evaluation.feedback,
        },
        nextQuestion: nextTurn.question,
        questionType: nextTurn.questionType,
        turnIndex: nextTurn.index,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "POST /api/interview/[sessionId]/answer error:"
    );

    console.error(error);
    console.error(error.stack);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}