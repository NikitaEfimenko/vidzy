'use client'
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { Slide } from '../components/slide';
import { QuizCard } from '../components/quiz-card';
import { TextFade } from '../components/text-fade';

export const QuizSchema = z.object({
  audioOffsetInSeconds: z.number().min(0),
  delayBeforeNextQuestion: z.number().min(0),
  beforeQuizDelayInFrames: z.number().min(0),
  audioFileName: z.string().optional(),
  coverImgFileName: z.array(z
    .string()),
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
  const areQuestionsFinished = currentQuestionIndex >= questions.length;

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
  const slideDuration = durationInFrames / coverImgFileName.length - overlapFrames

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
  audioFileName: "https://storage.procat-saas.online/vidzy/1742394255588-test-audio.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250319T142420Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=c36da094315d8dd6ce9e79e15ed455713f36ee5dc8d2d4436791cd28ec5c640b",
  coverImgFileName: [
    "https://storage.procat-saas.online/vidzy/1742394109471-en-im1.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250319T142150Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=3a275eed92670b022e739894306af866298ff0fb615caa09f0a1631a39bb7a2f",
    "https://storage.procat-saas.online/vidzy/1742394126642-en-im3.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250319T142208Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=0f05a3eaf97de7d39f8571a6d29f7b99e558dd0ccf44148a80529fc7ba752700",
    "https://storage.procat-saas.online/vidzy/1742394133788-en-im4.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250319T142215Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=832310c35f89796a184cda27ce042b039c2ae1303ed8e3b30bc4ad1c1757d106",
    // "https://storage.procat-saas.online/vidzy/1742394142604-en-im5.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250319T142224Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=c14d3274530b4d51ec5b8fff83784778df3332b9c2627f49f6d0fac84743c73d",
    // "https://storage.procat-saas.online/vidzy/1742394118488-en-im2.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250319T142159Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=59a408cbc9f0193c26a6e7535c3bfcfc04029c03a9b24d61fe55ab358ba5c902",

  ],
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


  timeToRespond: 5

} satisfies z.infer<typeof QuizSchema>

export const FPS = 30

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof QuizSchema>> = async ({ props }) => {
  // const durationInSeconds = await getAudioDurationInSeconds(
  //   props.audioFileName,
  // );
  return {
    durationInFrames: Math.floor(
      (((Number(props.timeToRespond) + Number(props.delayBeforeNextQuestion)) * props.questions.length + Number(props.beforeQuizDelayInFrames)) - Number(props.audioOffsetInSeconds)) * FPS,
    ),
    // durationInFrames: 10 * 15,
    props: {
      ...props,
    },
    abortSignal: new AbortController().signal,
    defaultProps: initInputProps,
    fps: FPS,
  };
}


export const config = {
  durationInFrames: 30 * 20,
  fps: FPS,
  height: 480,
  width: 640,
  calculateMetadata
}


