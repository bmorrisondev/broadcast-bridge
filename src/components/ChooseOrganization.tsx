import React from 'react'
import { useOrganizationList } from '@clerk/nextjs'
import { Input } from './ui/input'
import { Button } from './ui/button'

function ChooseOrganization() {
  const { createOrganization } = useOrganizationList()
  const [organizationName, setOrganizationName] = React.useState('')

  async function onClick() {
    if(!createOrganization) return
    await createOrganization({ name: organizationName })
  }

  return (
    <div>
      <h1>Create Organization</h1>
      <Input
        type="text"
        placeholder="Organization name"
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
      />
      <Button
        onClick={onClick}
      >
        Create
      </Button>
    </div>
  )
}

export default ChooseOrganization