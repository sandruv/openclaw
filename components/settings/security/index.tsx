'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useState } from 'react'

export default function SecuritySettings() {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(false)
  const [loginNotifications, setLoginNotifications] = useState(true)
  const [ipRestriction, setIpRestriction] = useState(false)
  const [deviceManagement, setDeviceManagement] = useState(true)
  const [passwordExpiry, setPasswordExpiry] = useState(false)

  return (
    <div className="grid grid-cols-[1fr,auto,1fr] gap-8 relative h-[calc(100vh-130px)] max-w-[1000px]">
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Security Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa" className="text-muted-foreground">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account (Not yet implemented)</p>
            </div>
            <Switch
              id="2fa"
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session-timeout" className="text-muted-foreground">Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out after 30 minutes of inactivity (Not yet implemented)</p>
            </div>
            <Switch
              id="session-timeout"
              checked={sessionTimeout}
              onCheckedChange={setSessionTimeout}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="login-notifications" className="text-muted-foreground">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified of new sign-ins to your account (Not yet implemented)</p>
            </div>
            <Switch
              id="login-notifications"
              checked={loginNotifications}
              onCheckedChange={setLoginNotifications}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ip-restriction" className="text-muted-foreground">IP Restriction</Label>
              <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses (Not yet implemented)</p>
            </div>
            <Switch
              id="ip-restriction"
              checked={ipRestriction}
              onCheckedChange={setIpRestriction}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="device-management" className="text-muted-foreground">Device Management</Label>
              <p className="text-sm text-muted-foreground">Monitor and manage devices logged into your account (Not yet implemented)</p>
            </div>
            <Switch
              id="device-management"
              checked={deviceManagement}
              onCheckedChange={setDeviceManagement}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="password-expiry" className="text-muted-foreground">Password Expiry</Label>
              <p className="text-sm text-muted-foreground">Require password change every 90 days (Not yet implemented)</p>
            </div>
            <Switch
              id="password-expiry"
              checked={passwordExpiry}
              onCheckedChange={setPasswordExpiry}
              disabled
              className="data-[state=checked]:bg-lime-600 opacity-50"
            />
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-full min-h-[500px]" />

      <div className="space-y-4 p-6 pl-2">
        <h3 className="text-lg font-medium">Password Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="text-muted-foreground">Current Password</Label>
            <p className="text-sm text-muted-foreground mb-2">Enter your current password (Not yet implemented)</p>
            <Input id="current-password" type="password" disabled className="opacity-50" />
          </div>
          <div>
            <Label htmlFor="new-password" className="text-muted-foreground">New Password</Label>
            <p className="text-sm text-muted-foreground mb-2">Choose a strong password (min. 8 characters) (Not yet implemented)</p>
            <Input id="new-password" type="password" disabled className="opacity-50" />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-muted-foreground">Confirm New Password</Label>
            <p className="text-sm text-muted-foreground mb-2">Confirm your new password (Not yet implemented)</p>
            <Input id="confirm-password" type="password" disabled className="opacity-50" />
          </div>
          <Button type="button" disabled className="w-full bg-green-600 hover:bg-green-700 opacity-50 cursor-not-allowed">Update Password</Button>
        </div>
      </div>
    </div>
  )
}
