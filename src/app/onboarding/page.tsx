'use client'

import { useSession } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Billing from '@/components/Billing'
import ChooseOrganization from '@/components/ChooseOrganization'
import { useSubscription, usePlans } from '@clerk/nextjs/experimental'

function OnboardingPage() {
  const router = useRouter()
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription()
  const { isLoading: plansLoading } = usePlans({ for: 'user' })
  const { session, isLoaded: sessionLoaded } = useSession()

  if(subscriptionLoading || plansLoading || !sessionLoaded) {
    return <div>Loading...</div>
  }

  if(session?.tasks && session?.tasks[0].key === 'choose-organization' ) {
    return <ChooseOrganization />
  }

  function isFreeTier() {
    return subscription?.subscriptionItems[0].plan.name === 'Free'
  }
  
  if(isFreeTier()) {
    return <Billing />
  } else {
    router.push("/app")
  }
}

export default OnboardingPage
