'use client'

import { EditUserForm } from "./form"

interface UsersUpdateProps {
  userId: number
}

export function UsersUpdate({ userId }: UsersUpdateProps) {
  return <EditUserForm userId={userId} />
}

export default UsersUpdate
