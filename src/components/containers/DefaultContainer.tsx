import React, { ReactNode } from 'react'
import NavigationMenu from './NavigationMenu'
import SubscriptionInactive from './SubscriptionInactive'
import { useAuth } from '../../auth/AuthProvider'
import AuthenticationLoading from '../containers/AuthenticationLoading'
import { useLocation } from 'react-router-dom'

interface DefaultContainerProps {
  children: ReactNode
}

// Default Container is only used for pages as logged in healthcare provider
const DefaultContainer: React.FC<DefaultContainerProps> = ({ children }) => {
  const { isActive, userData } = useAuth()
  const location = useLocation()
  const pathname = location.pathname
  return (
    <div className="w-full h-screen flex flex-col lg:flex-row">
      {!userData && !pathname.startsWith('/quick-shared-report') && <AuthenticationLoading />}
      {userData && (
        <>
          <div className="lg:w-[250px] flex-none bg-slate-100">
            <NavigationMenu />
          </div>
          <div className="flex-grow h-full overflow-auto px-6 py-6 lg:px-20 lg:py-24 bg-slate-100">
            {!isActive && userData && <SubscriptionInactive />}
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export default DefaultContainer
