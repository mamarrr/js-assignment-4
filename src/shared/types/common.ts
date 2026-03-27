export type Uuid = string

export type IsoDateTimeString = string

export interface ApiMessageDto {
  messages: string[] | null
}

export interface ProblemDetailsDto {
  type?: string | null
  title?: string | null
  status?: number | null
  detail?: string | null
  instance?: string | null
}
