import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import DefaultContainer from '../components/containers/DefaultContainer'
import HeadingSubheading from '../components/containers/HeadingSubheading'
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer'
import OnboardingDialog from '../components/containers/OnboardingDialog'
import DashboardCards from '../components/containers/DashboardCards'
import { useEffect } from 'react'
import { useLogSnag } from '@logsnag/react'

function Dashboard() {
  const { userData } = useAuth()
  const [translation] = useTranslation('global')
  const { identify } = useLogSnag()

  useEffect(() => {
    document.title = 'Dashboard | Vizu Health'
  })

  useEffect(() => {
    identify({
      user_id: userData?.email,
      properties: {
        name: `${userData?.firstName} ${userData?.lastName}`,
        email: `${userData?.email}`,
      },
    })
  }, [userData])

  return (
    <DefaultContainer>
      <HeadingSubheading
        heading={translation('dashboard.heading') + userData?.firstName + ' ' + userData?.lastName}
        subheading={translation('dashboard.subheading')}
      />
      <DefaultInnerContainer>
        {!userData?.isOnboarded && (
          <div>
            <DashboardCards />
            <OnboardingDialog />
          </div>
        )}

        {userData?.isOnboarded && <DashboardCards />}
      </DefaultInnerContainer>
    </DefaultContainer>
  )
}

export default Dashboard
