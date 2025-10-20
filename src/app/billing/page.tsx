'use client'

import { CheckoutProvider, PaymentElement, PaymentElementProvider, useCheckout, usePaymentElement, usePlans, useSubscription } from '@clerk/nextjs/experimental'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

type PlanFeature = {
  id: string
  name: string
}

type PlanFee = {
  amount: number
  amountFormatted: string
  currencySymbol: string
}

type Plan = {
  id: string
  name: string
  description?: string
  publiclyVisible?: boolean
  fee: PlanFee
  features?: PlanFeature[]
}

function BillingPage() {
  const { data: subscription, isLoading } = useSubscription()
  const { data: plans, isLoading: plansLoading } = usePlans({ for: 'user' })
  const [selectedPlan, setSelectedPlan] = useState<string>()

  if(isLoading || plansLoading) {
    return <div>Loading...</div>
  }

  function isFreeTier() {
    return subscription?.subscriptionItems[0].plan.name === 'Free'
  }

  function isCurrentPlan(name: string) {
    return subscription?.subscriptionItems[0]?.plan?.name === name
  }

  function formatPrice(plan: Plan) {
    const amount = plan.fee?.amount ?? 0
    const symbol = plan.fee?.currencySymbol ?? '$'
    const formatted = plan.fee?.amountFormatted ?? '0.00'
    if (amount === 0) return 'Free'
    return `${symbol}${formatted}/mo`
  }

  if(selectedPlan) {
    return (
      <CheckoutProvider for="user" planId={selectedPlan} planPeriod="month">
        <CustomCheckout />
      </CheckoutProvider>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Current tier: {subscription?.subscriptionItems[0]?.plan?.name ?? '—'}
        </p>
      </div>

      {(() => {
        const visiblePlans = (plans as Plan[] | undefined)?.filter((p) => p.publiclyVisible) ?? []
        return (
          <div className="mx-auto w-full max-w-3xl">
            <div className="grid grid-cols-1 gap-4">
              {visiblePlans.map((plan, idx) => {
                const preferred = idx === 1
                const current = isCurrentPlan(plan.name)
                return (
                  <Card
                    key={plan.id}
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
                      <div className="text-3xl font-bold">{formatPrice(plan)}</div>
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
                      <Button className="w-full" disabled={current} onClick={() => setSelectedPlan(plan.id)}>
                        {current ? 'Current plan' : (isFreeTier() ? 'Upgrade' : 'Choose')}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default BillingPage

function CustomCheckout() {
  const { checkout } = useCheckout()
  const { plan } = checkout

  return (
    <div className="checkout-container">
      <span>Subscribe to {plan?.name}</span>

      <PaymentElementProvider checkout={checkout}>
        <PaymentSection />
      </PaymentElementProvider>
    </div>
  )
}

function PaymentSection() {
  const { checkout } = useCheckout()
  const { isConfirming, confirm } = checkout
  const { isFormReady, submit } = usePaymentElement()
  const isButtonDisabled = !isFormReady || isConfirming

  const subscribe = async () => {
    const { data } = await submit()
    if (!data) return
    await confirm(data)
  }

  return (
    <>
      <PaymentElement fallback={<div>Loading payment element...</div>} />
      <button disabled={isButtonDisabled} onClick={subscribe}>
        {isConfirming ? 'Processing...' : 'Complete Purchase'}
      </button>
    </>
  )
}