'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plan } from '@/lib/models'

interface Props {
  plan: Plan
  preferred: boolean
  current: boolean
  price: number
  ctaLabel: string
  onSelect: (id: string) => void
}

export default function PlanCard(props: Props) {
  const { plan, preferred, current, price, ctaLabel, onSelect } = props

  function handleSelect() {
    onSelect(plan.id)
  }

  function formatPrice() {
    const symbol = '$'
    const formatted = (price/100).toFixed(2)
    return `${symbol}${formatted}/mo`
  }

  return (
    <Card
      className={
        `flex flex-col border ${preferred ? 'border-primary ring-1 ring-primary/30' : ''} ${current ? 'bg-accent/30' : ''}`
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{plan.name}</CardTitle>
            {plan.description ? (
              <CardDescription>{plan.description}</CardDescription>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {preferred ? (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Preferred</span>
            ) : null}
            {current ? (
              <span className="rounded-full bg-foreground/10 px-2 py-1 text-xs font-medium">Current</span>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="text-3xl font-bold">{formatPrice()}</div>
        {Array.isArray(plan.features) && plan.features.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {plan.features.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{f.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-muted-foreground">&nbsp;</div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={current} onClick={handleSelect}>
          {ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
