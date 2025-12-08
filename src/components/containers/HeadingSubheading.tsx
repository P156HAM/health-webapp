import React from 'react'
import { useAuth } from '../../auth/AuthProvider'
import { Skeleton } from '../ui/skeleton'
import { useLocation } from 'react-router-dom'

interface HeadingSubheadingProps {
  heading: string
  subheading: string | ''
  isUserOnDashboard?: boolean
}

const HeadingSubheading: React.FC<HeadingSubheadingProps> = ({
  heading,
  subheading,
  isUserOnDashboard,
}) => {
  const { userData } = useAuth()
  const location = useLocation()
  const pathname = location.pathname
  return (
    <div className="flex flex-col mt-6 lg:mt-0">
      {!userData && !pathname.startsWith('/quick-shared-report') && (
        <div className="flex flex-col gap-4">
          <Skeleton className="w-[325px] h-[25px] md:w-[375px] h-[40px] rounded-full" />
          <Skeleton className="w-[150px] h-[10px] md:w-[200px] h-[25px] rounded-full" />
        </div>
      )}
      {userData && !pathname.startsWith('/quick-shared-report') && (
        <div className="flex flex-col gap-1 lg:gap-3">
          <h1 className="text-xl lg:text-2xl font-medium">{heading}</h1>
          <p className="text-md font-normal text-slate-500">{subheading}</p>
        </div>
      )}
      {pathname.startsWith('/quick-shared-report') && (
        <div className="flex flex-col gap-1 lg:gap-3">
          <h1 className="text-xl lg:text-2xl font-medium">{heading}</h1>
          <p className="text-md font-normal text-slate-500">{subheading}</p>
        </div>
      )}
    </div>
  )
}

export default HeadingSubheading
