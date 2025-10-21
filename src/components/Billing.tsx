'use client'

import { useState } from 'react'
import { useCheckout, PaymentElementProvider, usePaymentElement, useSubscription, usePlans } from '@clerk/nextjs/experimental'
import { CheckoutProvider, PaymentElement } from '@clerk/nextjs/experimental'
import PlanCard from '@/components/PlanCard'
import { Plan } from '@/lib/models'
import { isFreeTier } from '@/lib/utils'

function Billing() {  
  const { data: subscription } = useSubscription()
  const { data: plans} = usePlans({ for: 'user' })
  const [selectedPlanId, setSelectedPlanId] = useState<string>()

  function isCurrentPlan(name: string) {
    return subscription?.subscriptionItems[0]?.plan?.name === name
  }

  if(!selectedPlanId) {
    return (
      <div className="flex flex-col items-center">
        <div className="py-12 flex flex-col items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p>Consider upgrading to a paid plan to unlock additional features and support!</p>
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
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      preferred={preferred}
                      current={current}
                      price={plan.fee.amount}
                      ctaLabel={current ? 'Current plan' : (isFreeTier(subscription) ? 'Upgrade' : 'Choose')}
                      onSelect={(id) => setSelectedPlanId(id)}
                    />
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  return (
    <CheckoutProvider for="user" planId={selectedPlanId} planPeriod="month">
      <CustomCheckout /> 
    </CheckoutProvider>
  )
}

export default Billing

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

  console.log(checkout)

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