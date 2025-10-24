'use client'

import { useEffect, useState } from 'react'
import { useCheckout, PaymentElementProvider, usePaymentElement, useSubscription, usePlans } from '@clerk/nextjs/experimental'
import { CheckoutProvider, PaymentElement } from '@clerk/nextjs/experimental'
import PlanCard from '@/components/PlanCard'
import { Plan } from '@/lib/models'
import { isFreeTier } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { ClerkLoaded, SignedIn } from '@clerk/nextjs'

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
    <ClerkLoaded>
      <SignedIn>
        <CheckoutProvider for="user" planId={selectedPlanId} planPeriod="month">
          <CustomCheckout /> 
        </CheckoutProvider>
      </SignedIn>
    </ClerkLoaded>
  )
}

export default Billing

function CustomCheckout() {
  const { checkout } = useCheckout()
  const { plan, start, status } = checkout

  useEffect(() => {
    async function init() {
      await start()
    }
    if(status === 'needs_initialization') {
      init()
    }
  }, [status, start])

  return (
    <div className="checkout-container">
      <span>Subscribe to {plan?.name}</span>
      {status !== 'needs_initialization' && (
        <PaymentElementProvider checkout={checkout}>
          <PaymentSection />
        </PaymentElementProvider>
      )}
    </div>
  )
}

function PaymentSection() {
  const router = useRouter()
  const { checkout } = useCheckout()
  const { isConfirming, confirm, finalize, error } = checkout

  const { isFormReady, submit } = usePaymentElement()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormReady || isProcessing) return
    setIsProcessing(true)

    try {
      // Submit payment form to get payment method
      const { data, error } = await submit()
      // Usually a validation error from stripe that you can ignore
      if (error) {
        return
      }
      // Confirm checkout with payment method
      await confirm(data)
      // Complete checkout and redirect
      finalize({ navigate: () => {
        router.push('/app')
      }})
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement fallback={<div>Loading payment element...</div>} />

      {error && <div>{error.message}</div>}

      <button type="submit" disabled={!isFormReady || isProcessing || isConfirming}>
        {isProcessing || isConfirming ? 'Processing...' : 'Complete Purchase'}
      </button>
    </form>
  )
}