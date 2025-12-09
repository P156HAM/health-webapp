import React from 'react'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'
import { signOut, getAuth } from 'firebase/auth'
import logo from '../../assets/logo_with_text.png'
import { Separator } from 'src/components/ui/separator'
import {
  DashboardIcon,
  TokensIcon,
  ViewHorizontalIcon,
  HamburgerMenuIcon,
  InfoCircledIcon,
  ExitIcon,
} from '@radix-ui/react-icons'
import { Badge } from '../ui/badge'
import { NavLink } from 'react-router-dom'
import { FileTextIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from 'src/components/ui/sheet'
import { useAuth } from '../../auth/AuthProvider'
import { useLogSnag } from '@logsnag/react'
import { useNavigate } from 'react-router-dom'
import { isMockMode } from '../../mocks/config'

function NavigationMenu() {
  const [translation] = useTranslation('global')
  const auth = getAuth()
  const { userData, logout } = useAuth()
  const { track } = useLogSnag()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Handle mock mode logout
      if (isMockMode && logout) {
        logout()
        localStorage.removeItem('mockAuthState')
        navigate('/')
        return
      }

      const loginTime = localStorage.getItem('loginTime')

      if (loginTime) {
        const loginTimestamp = parseInt(loginTime, 10)
        const currentTime = Math.floor(Date.now() / 1000)
        const timeSpent = currentTime - loginTimestamp
        track({
          channel: 'user-activity',
          event: 'User Logged Out',
          icon: '⏰',
          description: `User ${userData?.clinicName} spent ${timeSpent} seconds logged in.`,
          notify: true,
          tags: {
            userid: `${userData?.email}`,
          },
        })
      }
      await signOut(auth)
    } catch (error) {}
  }

  const openOnboarding = async () => {
    userData!.isOnboarded = false
  }

  return (
    <div>
      {userData && (
        <div className="bg-zinc-50 lg:h-screen lg:w-[250px] hidden lg:flex lg:flex-col lg:justify-between lg:bg-white lg:border-r">
          <div className="flex flex-col">
            <div className="px-8 py-8 w-full">
              <img src={logo} alt="Vizu Health Logo" width={'160'} />
            </div>
            <Separator className="bg-zinc-200" />
            <div>
              <div className="flex flex-col gap-1 px-4 pt-8">
                <Badge
                  variant={'outline'}
                  className="text-xs font-normal bg-white w-fit py-1 px-2 mb-2"
                >
                  {translation('navigationMenu.badge_general')}
                </Badge>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-md ${isActive ? 'text-blue-600  bg-slate-100' : 'text-gray-900'}`
                  }
                >
                  <DashboardIcon className="h-4 w-4 mr-4" />
                  {translation('navigationMenu.dashboard')}
                </NavLink>
                {userData.isActive && (
                  <NavLink
                    to="/patients"
                    className={({ isActive }) =>
                      `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-md ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                    }
                  >
                    <FileTextIcon className="h-4 w-4 mr-4" />
                    {translation('navigationMenu.long_term_sharing')}
                  </NavLink>
                )}
              </div>
            </div>
          </div>
          <div className="">
            <div className="flex flex-col gap-1 px-4 pt-8 mb-8">
              <Badge
                variant={'outline'}
                className="text-xs font-normal bg-white w-fit py-1 px-2 mb-2"
              >
                {translation('navigationMenu.badge_other')}
              </Badge>
              {userData?.isAdmin && (
                <NavLink
                  to="/clinic"
                  className={({ isActive }) =>
                    `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-md ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                  }
                >
                  <TokensIcon className="h-4 w-4 mr-4" />
                  {translation('navigationMenu.clinic')}
                </NavLink>
              )}
              {userData?.isAdmin && (
                <NavLink
                  to="/billing"
                  className={({ isActive }) =>
                    `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-md ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                  }
                >
                  <ViewHorizontalIcon className="h-4 w-4 mr-4" />
                  {translation('navigationMenu.billing')}
                </NavLink>
              )}
              <NavLink
                to="/"
                onClick={openOnboarding}
                className={({ isActive }) =>
                  `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-md ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                }
              >
                <InfoCircledIcon className="h-4 w-4 mr-4" />
                {translation('navigationMenu.tutorial')}
              </NavLink>
            </div>
            <Separator className="bg-zinc-200" />
            <div className="px-4 mt-6 mb-6">
              <Button size={'sm'} variant={'outline'} onClick={handleLogout}>
                <ExitIcon className="h-4 w-4 mr-2" />
                {translation('navigationMenu.logout_button')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden">
        <Sheet>
          <div className="flex flex-row w-full justify-between items-center px-6 py-8 bg-white">
            <SheetTrigger asChild className="">
              <span className="h-9 px-4 rounded-md py-2 bg-white border border-2 border-black text-black rounded-sm inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-primary text-xs shadow-none underline-offset-4 hover:underline">
                <HamburgerMenuIcon className="w-6 h-6" />
              </span>
            </SheetTrigger>
          </div>
          <SheetContent side={'left'} className="flex flex-col justify-between h-full">
            <div className="flex flex-col">
              <div className="lg:px-8 py-8 w-full">
                <img src={logo} alt="Vizu Health Logo" width={'175'} />
              </div>
              <Separator className="bg-zinc-200" />
              <div>
                <div className="flex flex-col gap-1 px-0 pt-0 lg:px-4 pt-8">
                  <Badge variant={'outline'} className="text-xs font-normal w-fit py-1 px-2 mb-2">
                    {translation('navigationMenu.badge_general')}
                  </Badge>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-sm ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                    }
                  >
                    <DashboardIcon className="h-4 w-4 mr-4" />
                    {translation('navigationMenu.dashboard')}
                  </NavLink>
                  {userData?.isActive && (
                    <NavLink
                      to="/patients"
                      className={({ isActive }) =>
                        `text-sm font-normal flex items-center  hover:text-blue-600 px-2 py-2 rounded-sm ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                      }
                    >
                      <FileTextIcon className="h-4 w-4 mr-4" />
                      {translation('navigationMenu.long_term_sharing')}
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
            <div className="">
              <div className="flex flex-col gap-1 mt-4 lg:px-4 lg:pt-8 lg:mb-8">
                {userData?.isAdmin && (
                  <Badge variant={'outline'} className="text-xs font-normal w-fit py-1 px-2 mb-2">
                    {translation('navigationMenu.badge_other')}
                  </Badge>
                )}
                {userData?.isAdmin && (
                  <NavLink
                    to="/clinic"
                    className={({ isActive }) =>
                      `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-sm ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                    }
                  >
                    <TokensIcon className="h-4 w-4 mr-4" />
                    {translation('navigationMenu.clinic')}
                  </NavLink>
                )}
                {userData?.isAdmin && (
                  <NavLink
                    to="/billing"
                    className={({ isActive }) =>
                      `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-sm ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                    }
                  >
                    <ViewHorizontalIcon className="h-4 w-4 mr-4" />
                    {translation('navigationMenu.billing')}
                  </NavLink>
                )}
                <NavLink
                  to="/"
                  onClick={openOnboarding}
                  className={({ isActive }) =>
                    `text-sm font-normal flex items-center hover:text-blue-600 px-2 py-2 rounded-sm ${isActive ? 'text-blue-600 bg-slate-100' : 'text-gray-900'}`
                  }
                >
                  <InfoCircledIcon className="h-4 w-4 mr-4" />
                  {translation('navigationMenu.tutorial')}
                </NavLink>
              </div>
              <Separator className="bg-zinc-200 mt-4" />
              <div className="mb-2">
                <Button
                  variant={'outline'}
                  size={'sm'}
                  onClick={handleLogout}
                  className="w-fit mt-8 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                >
                  <ExitIcon className="h-4 w-4 mr-2" />
                  {translation('navigationMenu.logout_button')}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default NavigationMenu
