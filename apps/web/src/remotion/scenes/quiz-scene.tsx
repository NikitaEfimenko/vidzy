'use client'
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { Slide } from '../components/slide';
import { QuizCard } from '../components/quiz-card';
import { TextFade } from '../components/text-fade';
import { BaseSceneSchema, getFormatByEnum } from "../helpers";


export const QuizSchema = BaseSceneSchema.extend({
  audioOffsetInSeconds: z.number().min(0),
  delayBeforeNextQuestion: z.number().min(0),
  beforeQuizDelayInFrames: z.number().min(0),
  audioFileName: z.string().describe("url").optional(),
  coverImgFileName: z.array(z
    .string().describe("url")),
  audioWizEnabled: z.boolean(),

  questions: z.array(z.string()).min(0),
  options: z.array(z.array(z.string()).min(0)).min(0),
  correctAnswers: z.array(z.number()).min(0),
  explanations: z.array(z.string()).min(0),
  timeToRespond: z.number().positive()
});

export type QuizSchemaType = z.infer<typeof QuizSchema>;

export const QuizComposition = ({
  timeToRespond,

  coverImgFileName,
  audioOffsetInSeconds,
  audioFileName,

  questions,
  options,
  correctAnswers,
  explanations,
  delayBeforeNextQuestion,
  beforeQuizDelayInFrames
}: QuizSchemaType): JSX.Element => {

  if (!questions || !options || !correctAnswers || !explanations) return <></>

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  useEffect(() => {
    if (frame === 0) {
      setCurrentQuestionIndex(0); // Сбрасываем индекс вопроса
    }
  }, [frame]);

  const _timeToRespond = Number(timeToRespond)
  const _audioOffsetInSeconds = Number(audioOffsetInSeconds)
  const _delayBeforeNextQuestion = Number(delayBeforeNextQuestion)
  const _beforeQuizDelayInFrames = Number(beforeQuizDelayInFrames)
  // Рассчитываем время для каждого вопроса и задержки
  const timeToRespondInFrames = Math.round((_timeToRespond) * fps); // Переводим время в кадры
  const delayBeforeNextQuestionInFrames = _delayBeforeNextQuestion * fps; // Задержка в 3 секунды перед переходом к следующему вопросу

  // Общее количество кадров для одного вопроса (время на ответ + задержка)
  const totalFramesPerQuestion = timeToRespondInFrames + delayBeforeNextQuestionInFrames;

  // Определяем, на каком вопросе мы находимся, исходя из текущего кадра
  const currentQuestionFrame = frame % totalFramesPerQuestion;
  const isShowingResult = currentQuestionFrame >= timeToRespondInFrames;
  const areQuestionsFinished = currentQuestionIndex >= (questions?.length ?? 0);

  // Обновляем индекс вопроса, если текущий кадр превышает общее время для текущего вопроса
  useEffect(() => {
    if (frame > 0 && frame % totalFramesPerQuestion === 0 && !areQuestionsFinished) {
      setCurrentQuestionIndex((prev) => (prev + 1));
    }
  }, [frame, totalFramesPerQuestion, questions, areQuestionsFinished])

  const currentQuestion = questions.at(currentQuestionIndex);
  const currentOptions = options.at(currentQuestionIndex) ?? [];
  const correctAnswer = correctAnswers.at(currentQuestionIndex);
  const currentExplanation = explanations.at(currentQuestionIndex);

  const audioOffsetInFrames = Math.round(_audioOffsetInSeconds * fps);

  const overlapFrames = 15; // Перекрытие в 15 кадров
  const slideDuration = durationInFrames / (coverImgFileName?.length ?? 1) - overlapFrames

  const quizCardOpacity = interpolate(
    frame,
    [_beforeQuizDelayInFrames, _beforeQuizDelayInFrames + fps], // Плавное появление в течение 1 секунды
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Если текущий кадр меньше задержки, QuizCard не показываем

  const isQuizVisible = frame >= _beforeQuizDelayInFrames && !areQuestionsFinished;

  const remainingTimeInSeconds = Math.max(
    0,
    Math.ceil((timeToRespondInFrames - currentQuestionFrame) / fps)
  );

  return <div>
    <AbsoluteFill>
      {coverImgFileName.map((img, index) => {

        const startFrame = index * (slideDuration + overlapFrames); // Учитываем перекрытие
        const endFrame = startFrame + slideDuration + overlapFrames; // Учитываем перекрытие

        return (
          <Sequence
            key={img}
            from={startFrame - audioOffsetInFrames}
            durationInFrames={slideDuration + 1.5 * overlapFrames} // Увеличиваем длительность Sequence
          >
            <Slide
              img={img}
              startFrame={startFrame}
              endFrame={endFrame}
              fps={fps}
              overlapFrames={overlapFrames} // Передаем перекрытие в Slide
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
    <AbsoluteFill>
      <Sequence from={-audioOffsetInFrames}>
        {audioFileName && <Audio pauseWhenBuffering src={audioFileName} />}
      </Sequence>
      <Sequence from={-audioOffsetInFrames} durationInFrames={(durationInFrames - audioOffsetInFrames) - Math.round(1.5 * fps)}>
        {isQuizVisible && <div
          className="container relative flex items-center w-full justify-center px-4 flex-1"
          style={{ opacity: quizCardOpacity }}
        >
          <QuizCard
            showResult={isShowingResult}
            options={currentOptions}
            correctAnswerIdx={correctAnswer}
            question={currentQuestion}
            explanation={currentExplanation}
            remainingTime={remainingTimeInSeconds}
          />
        </div>}
      </Sequence>
      <Sequence from={durationInFrames - 1.5 * fps}>
        <TextFade>
          <div className="text-3xl font-bold flex items-center gap-2">
            by Vidzy
          </div>
        </TextFade>
      </Sequence>
    </AbsoluteFill>
  </div>
};


export const compositionName = "QuizScene" as const



export const initInputProps = {
  audioOffsetInSeconds: 0,
  delayBeforeNextQuestion: 3,
  beforeQuizDelayInFrames: 2,
  // audioFileName: undefined,
  audioFileName: undefined,
  coverImgFileName: [],
  audioWizEnabled: false,


  "questions": [
    "Как переводится слово 'agree'?",
    "Как переводится слово 'avoid'?",
    "Как переводится слово 'consider'?",
    "Как переводится слово 'decide'?",
    "Как переводится слово 'expect'?",
    "Как переводится слово 'improve'?",
    "Как переводится слово 'manage'?",
    "Как переводится слово 'offer'?",
    "Как переводится слово 'refuse'?",
    "Как переводится слово 'suggest'?"
  ],
  "explanations": [
    "'Agree' означает 'соглашаться'.",
    "'Avoid' означает 'избегать'.",
    "'Consider' означает 'обдумывать'.",
    "'Decide' означает 'решать'.",
    "'Expect' означает 'ожидать'.",
    "'Improve' означает 'улучшать'.",
    "'Manage' означает 'управлять'.",
    "'Offer' означает 'предлагать'.",
    "'Refuse' означает 'отказывать'.",
    "'Suggest' означает 'предлагать' (идею или план)."
  ],
  "options": [
    ["1. Спорить", "2. Соглашаться", "3. Отказывать", "4. Игнорировать"],
    ["1. Привлекать", "2. Искать", "3. Избегать", "4. Терять"],
    ["1. Игнорировать", "2. Обдумывать", "3. Отказывать", "4. Терять"],
    ["1. Сомневаться", "2. Откладывать", "3. Решать", "4. Забывать"],
    ["1. Игнорировать", "2. Ожидать", "3. Отказывать", "4. Терять"],
    ["1. Ухудшать", "2. Игнорировать", "3. Улучшать", "4. Терять"],
    ["1. Терять", "2. Игнорировать", "3. Управлять", "4. Отказывать"],
    ["1. Отказывать", "2. Игнорировать", "3. Предлагать", "4. Терять"],
    ["1. Принимать", "2. Игнорировать", "3. Отказывать", "4. Терять"],
    ["1. Отказывать", "2. Игнорировать", "3. Предлагать", "4. Терять"]
  ],
  "correctAnswers": [
    1,
    2,
    1,
    2,
    1,
    2,
    2,
    2,
    2,
    2
  ],
  format: "1:1" as const,

  timeToRespond: 5

} satisfies z.infer<typeof QuizSchema>

export const FPS = 30

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof QuizSchema>> = async ({ props }) => {
  // const durationInSeconds = await getAudioDurationInSeconds(
  //   props.audioFileName,
  // );
  const formatValues = getFormatByEnum(props.format)
  return {
    durationInFrames: Math.floor(
      (((Number(props.timeToRespond) + Number(props.delayBeforeNextQuestion)) * (props.questions.length ?? 1) + Number(props.beforeQuizDelayInFrames)) - Number(props.audioOffsetInSeconds)) * FPS,
    ),
    props: {
      ...props,
    },
    abortSignal: new AbortController().signal,
    defaultProps: initInputProps,
    fps: FPS,
    ...formatValues
  };
}


export const config = {
  durationInFrames: 30 * 20,
  fps: FPS,
  height: 720,
  width: 1280,
  calculateMetadata
}


