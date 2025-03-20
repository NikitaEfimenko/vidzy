#! /usr/bin/env -S npx tsx

import { generateObject } from 'ai'
import { ollama } from 'ollama-ai-provider'
import { z } from 'zod'

import { Command } from 'commander'
import { argv } from 'process'

export async function buildProgram(
  defaultModel:
    | Parameters<typeof ollama.languageModel>[0]
    | Parameters<typeof ollama.textEmbeddingModel>[0],
  action: (model: string) => Promise<void>,
) {
  const program = new Command()

  program
    .option('-m, --model [model]', 'The model to be used', defaultModel)
    .action(async (options) => {
      await action(options.model)
    })

  program.parse(argv)
}

const exampleObj = {
  title: "name of entity",
  price: 300,
  descriptions: "descriptions"
}

async function main(model: Parameters<typeof ollama>[0]) {
  const result = await generateObject({
    model: ollama(model, { structuredOutputs: true }),
    output: 'array',
    prompt:
      'Generate 10 items.',
    schema: objectToZodSchema(exampleObj)
  })

  console.log(JSON.stringify(result.object, null, 2))
  console.log()
  console.log('Token usage:', result.usage)
  console.log('Finish reason:', result.finishReason)
}

function objectToZodSchema(obj: Record<string, any>): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Преобразуем значение в строку для описания
      const description = `Example: ${value.toString()}`;

      // Определяем тип значения и создаем соответствующую Zod-схему
      if (typeof value === 'string') {
        schemaShape[key] = z.string().describe(description);
      } else if (typeof value === 'number') {
        schemaShape[key] = z.number().describe(description);
      } else if (typeof value === 'boolean') {
        schemaShape[key] = z.boolean().describe(description);
      } else if (Array.isArray(value)) {
        // Если значение — массив, проверяем тип его элементов
        if (value.length > 0) {
          const firstElement = value[0];
          if (typeof firstElement === 'string') {
            schemaShape[key] = z.array(z.string()).describe(description);
          } else if (typeof firstElement === 'number') {
            schemaShape[key] = z.array(z.number()).describe(description);
          } else if (typeof firstElement === 'boolean') {
            schemaShape[key] = z.array(z.boolean()).describe(description);
          } else {
            // Если тип элемента массива неизвестен, используем z.any()
            schemaShape[key] = z.array(z.any()).describe(description);
          }
        } else {
          // Если массив пустой, используем z.array(z.any())
          schemaShape[key] = z.array(z.any()).describe(description);
        }
      } else if (value && typeof value === 'object') {
        // Если значение — объект, рекурсивно создаем схему для него
        schemaShape[key] = objectToZodSchema(value).describe(description);
      } else {
        // Если тип неизвестен, используем z.any()
        schemaShape[key] = z.any().describe(description);
      }
    }
  }

  return z.object(schemaShape);
}

buildProgram('llama3.2:1b', main).catch(console.error)