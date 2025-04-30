'use client'
import { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { RPGQuestionCard } from '../components/quest-card';
import { Slide } from '../components/slide';
import { BaseSceneSchema, getFormatByEnum } from "../helpers";


export const QuestSchema = BaseSceneSchema.extend({
  audioOffsetInSeconds: z.number().min(0).optional(),
  delayBeforeNextQuestion: z.number().min(0).optional(),
  beforeQuestDelayInFrames: z.number().min(0).optional(),
  audioFileName: z.string().describe("url").optional(),
  coverImgFileName: z.array(z
    .string().describe("url")),

  questions: z.array(z.string()).min(0),
  options: z.array(z.array(z.string()).min(0)),
  answers: z.array(z.number()).min(0),
  timeToRespond: z.number().positive().optional()
});

export type QuestSchemaType = z.infer<typeof QuestSchema>;

export const QuestComposition = ({
  timeToRespond,

  coverImgFileName,
  audioOffsetInSeconds,
  audioFileName,
  questions,
  options,
  answers,
  delayBeforeNextQuestion,
  beforeQuestDelayInFrames
}: QuestSchemaType): JSX.Element => {

  if (!questions || !options || !answers) return <></>

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  useEffect(() => {
    if (frame === 0) {
      setCurrentQuestionIndex(0); // Сбрасываем индекс вопроса
    }
  }, [frame]);

  const _timeToRespond = Number(timeToRespond ?? 5)
  const _audioOffsetInSeconds = Number(audioOffsetInSeconds ?? 0)
  const _delayBeforeNextQuestion = Number(delayBeforeNextQuestion ?? 0)
  const _beforeQuestDelayInFrames = Number(beforeQuestDelayInFrames ?? 0)
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
  const correctAnswer = answers.at(currentQuestionIndex);
  const currentExplanation = answers.at(currentQuestionIndex);

  const audioOffsetInFrames = Math.round(_audioOffsetInSeconds * fps);

  const overlapFrames = 15; // Перекрытие в 15 кадров
  const slideDuration = durationInFrames / (coverImgFileName?.length ?? 1) - overlapFrames

  const QuestCardOpacity = interpolate(
    frame,
    [_beforeQuestDelayInFrames, _beforeQuestDelayInFrames + fps], // Плавное появление в течение 1 секунды
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Если текущий кадр меньше задержки, QuestCard не показываем

  const isQuestVisible = frame >= _beforeQuestDelayInFrames && !areQuestionsFinished;

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
        {isQuestVisible && <div
          className="container relative flex items-center w-full justify-center px-12 flex-1"
          style={{ opacity: QuestCardOpacity }}
        >
          {currentQuestion && <RPGQuestionCard
            showResult={isShowingResult}
            options={currentOptions}
            correctAnswerIdx={Number(correctAnswer ?? 0)}
            question={currentQuestion}
            remainingTime={remainingTimeInSeconds}
            timeLimit={_timeToRespond}
          />}
        </div>}
      </Sequence>
    </AbsoluteFill>
  </div>
};


export const compositionName = "QuestScene" as const



export const initInputProps = {
  audioOffsetInSeconds: 0,
  delayBeforeNextQuestion: 3,
  beforeQuestDelayInFrames: 2,
  // audioFileName: undefined,
  audioFileName: undefined,
  coverImgFileName: [],

  "questions": [
    "С кем поработаешь сегодня?",
  ],
  "options": [
    ["Я пойду к Серверовичу - подушу гуся", "Помогу Сверстаеву, а он опять что-то придумает"],
  ],
  "answers": [
    0,
  ],
  format: "1:1" as const,

  timeToRespond: 5

} satisfies z.infer<typeof QuestSchema>

export const FPS = 30

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof QuestSchema>> = async ({ props }) => {
  // const durationInSeconds = await getAudioDurationInSeconds(
  //   props.audioFileName,
  // );
  const formatValues = getFormatByEnum(props.format)
  return {
    durationInFrames: Math.floor(
      (((Number(props.timeToRespond ?? 0) + Number(props.delayBeforeNextQuestion ?? 0)) * (props.questions.length ?? 1) + Number(props.beforeQuestDelayInFrames ?? 0)) - Number(props.audioOffsetInSeconds ?? 0)) * FPS,
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
  durationInFrames: 30 * 10,
  fps: FPS,
  height: 1280,
  width: 720,
  calculateMetadata
}


