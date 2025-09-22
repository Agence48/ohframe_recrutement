import { z } from 'zod'
import { TestDefinitionSchema } from './test'

export const CandidateSummarySchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string().email().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
  status: z.string().optional().nullable(),
  video_url: z.string().url().optional().nullable(),
  answers_json: z.unknown().optional().nullable()
})

export const JobListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  level: z.string(),
  link: z.string(),
  created_at: z.string(),
  candidates: z.array(z.object({ count: z.number() })).optional()
})

export const JobDetailsSchema = JobListItemSchema.extend({
  test_json: TestDefinitionSchema.nullable().optional(),
  candidates: z.array(CandidateSummarySchema).optional().nullable()
})

export type CandidateSummary = z.infer<typeof CandidateSummarySchema>
export type JobListItem = z.infer<typeof JobListItemSchema>
export type JobDetails = z.infer<typeof JobDetailsSchema>
