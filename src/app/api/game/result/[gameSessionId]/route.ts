import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
interface GameResultResponse {
  success: boolean;
  data: {
    gameSessionId: string;
    totalScore: number;
    averageScore: number;
    questionsCompleted: number;
    totalQuestions: number;
    gameMode: string;
    timeLimit?: number;
    isCompleted: boolean;
    completedAt?: string;
    questionSessions: Array<{
      questionSessionId: string;
      eventId: string;
      guessedYear: number;
      guessedLocation?: {
        lat: number;
        lng: number;
      };
      answerTime?: number;
      finalScore: number;
      rank: string;
    }>;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { gameSessionId: string } }
) {
  try {
    const { gameSessionId } = await params;
    
    if (!gameSessionId) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'gameSessionId is required',
        }
      }, { status: 400 });
    }

    // 这里应该从数据库获取游戏结果，现在返回模拟数据
    const mockQuestionSessions = [
      {
        questionSessionId: 'question_1',
        eventId: '1',
        guessedYear: 2008,
        guessedLocation: { lat: 39.9042, lng: 116.4074 },
        answerTime: 45,
        finalScore: 850,
        rank: 'A'
      },
      {
        questionSessionId: 'question_2',
        eventId: '2',
        guessedYear: 2010,
        guessedLocation: { lat: 31.2304, lng: 121.4737 },
        answerTime: 38,
        finalScore: 920,
        rank: 'S'
      },
      {
        questionSessionId: 'question_3',
        eventId: '3',
        guessedYear: 1980,
        guessedLocation: { lat: 22.3193, lng: 114.1694 },
        answerTime: 52,
        finalScore: 780,
        rank: 'B'
      },
      {
        questionSessionId: 'question_4',
        eventId: '4',
        guessedYear: 1997,
        guessedLocation: { lat: 22.3193, lng: 114.1694 },
        answerTime: 41,
        finalScore: 890,
        rank: 'A'
      },
      {
        questionSessionId: 'question_5',
        eventId: '5',
        guessedYear: 2016,
        guessedLocation: { lat: 30.2741, lng: 120.1551 },
        answerTime: 35,
        finalScore: 950,
        rank: 'S'
      }
    ];

    const totalScore = mockQuestionSessions.reduce((sum, q) => sum + q.finalScore, 0);
    const averageScore = Math.round(totalScore / mockQuestionSessions.length);

    const response: GameResultResponse = {
      success: true,
      data: {
        gameSessionId,
        totalScore,
        averageScore,
        questionsCompleted: mockQuestionSessions.length,
        totalQuestions: 5,
        gameMode: 'timed',
        timeLimit: 120,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        questionSessions: mockQuestionSessions
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting game result:', error);
    return NextResponse.json({
      success: false,
      error: {
        type: 'DATABASE_ERROR',
        message: 'Failed to get game result',
      }
    }, { status: 500 });
  }
}