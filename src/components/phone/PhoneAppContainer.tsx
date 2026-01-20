/**
 * Phone App Container
 *
 * Wrapper that hosts individual phone apps and provides navigation.
 * Routes to the appropriate app component based on appId.
 */

import { getApp } from '../../config/app-registry.js'

// Phone app components
import { MessagesApp } from './apps/MessagesApp.js'
import { MySpaceChatApp } from './apps/MySpaceChatApp.js'
import { PlaceholderApp } from './apps/PlaceholderApp.js'

interface PhoneAppContainerProps {
  appId: string
  onBack: () => void
  onHome: () => void
}

// Map app IDs to components - PlaceholderApp used for unimplemented apps
const APP_COMPONENTS: Record<string, React.ComponentType<AppProps>> = {
  'messages': MessagesApp,
  'myspace-chat': MySpaceChatApp,
  // All other apps use PlaceholderApp until implemented
}

export interface AppProps {
  appId: string
  onBack: () => void
  onHome: () => void
}

export function PhoneAppContainer({ appId, onBack, onHome }: PhoneAppContainerProps) {
  const app = getApp(appId)
  const AppComponent = APP_COMPONENTS[appId] || PlaceholderApp

  if (!app) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">App not found: {appId}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <AppComponent
        appId={appId}
        onBack={onBack}
        onHome={onHome}
      />
    </div>
  )
}

export default PhoneAppContainer
