import { z } from 'zod'

export const TestQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  hint: z.string().optional(),
  choices: z.array(z.string().min(1)).optional(),
  variants: z.array(z.string().min(1)).min(1)
})

export const TestDefinitionSchema = z.object({
  questions: z.array(TestQuestionSchema).min(1),
  scoring: z.record(z.string(), z.unknown()),
  antiCheat: z.union([
    z.array(z.string().min(1)),
    z.record(z.string(), z.unknown())
  ])
})

export type TestQuestion = z.infer<typeof TestQuestionSchema>
export type TestDefinition = z.infer<typeof TestDefinitionSchema>
