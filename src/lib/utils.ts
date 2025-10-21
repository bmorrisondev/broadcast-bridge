import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BillingSubscriptionResource } from '@clerk/types';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isFreeTier(subscription: BillingSubscriptionResource | null | undefined) {
  return subscription?.subscriptionItems[0].plan.name === 'Free'
}