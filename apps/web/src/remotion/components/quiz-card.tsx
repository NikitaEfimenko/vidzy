
"use client"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../shared/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { cn } from "../../shared/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card"
import { Label } from "../../shared/ui/label"
import { RadioGroup, RadioGroupItem } from "../../shared/ui/radio-group"


type QuizCardProps = {
  question?: string
  options: string[],
  showResult: boolean,
  correctAnswerIdx?: number,
  explanation?: string
  remainingTime?: number
}

export const QuizCard = ({
  question,
  options,
  showResult,
  correctAnswerIdx,
  explanation,
  remainingTime
}: QuizCardProps) => {


  return <Card className="flex flex-col justify-center">
    <CardHeader>
      <CardTitle className="text-xl">{question}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-stretch justify-stretch gap-2">
      {showResult ?
        <Alert className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-sm">
            <span className="text-green-600 dark:text-green-400">Correct is {options.at(correctAnswerIdx ?? 0)}!</span>
          </AlertTitle>
          <AlertDescription>
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </AlertDescription>
        </Alert> : remainingTime && <Alert className="flex items-center justify-center">
          <AlertTitle className="text-sm">
            Осталось - {remainingTime}с
          </AlertTitle>
        </Alert>
      }
      <RadioGroup
        defaultValue={String(correctAnswerIdx)}
        className="space-y-1"
        disabled={showResult}
      >
        {options.map((option, index) => (
          <div
            key={index}
            className={cn('flex items-center space-x-1 rounded-md border p-4', showResult && index === correctAnswerIdx
              && "border-green-500 bg-green-50 dark:bg-green-950/20")}
          >
            <RadioGroupItem value={option} id={String(index)} />
            <Label htmlFor={String(index)} className="flex-grow cursor-pointer text-sm">
              {option}
            </Label>
            {showResult && index === correctAnswerIdx && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
        ))}
      </RadioGroup>
    </CardContent>
  </Card>
}