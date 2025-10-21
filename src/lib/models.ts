
export type PlanFeature = {
  id: string
  name: string
}

export type PlanFee = {
  amount: number
  amountFormatted: string
  currencySymbol: string
}

export type Plan = {
  id: string
  name: string
  description?: string
  publiclyVisible?: boolean
  fee: PlanFee
  features?: PlanFeature[]
}