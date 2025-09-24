export type Lang = { code: string; label: string }

export type Faq = {
  id: number
  question: Record<string, string>
  answer: Record<string, string>
  type: "web" | "user_app"
  status: string
}

