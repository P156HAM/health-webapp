import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DefaultContainer from '../components/containers/DefaultContainer'
import HeadingSubheading from '../components/containers/HeadingSubheading'
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowRightIcon, ViewHorizontalIcon } from '@radix-ui/react-icons'
import { useAuth } from '../auth/AuthProvider'
import useClinicServices from '../hooks/useClinicServices'
import { useLogSnag } from '@logsnag/react'

function BillingPage() {
  const [hasInactiveDoctorsState, setHasInactiveDoctorsState] = useState(false)
  const [isFirstPaymentReceived, setFirstPaymentReceived] = useState(false)
  const [translation] = useTranslation('global')
  const { userData } = useAuth()
  const { identify } = useLogSnag()
  const { loading, error, goToDashboard, goToPayment, hasInactiveDoctors, isPaymentReceived } =
    useClinicServices(userData)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentStatus = await isPaymentReceived()
      setFirstPaymentReceived(paymentStatus)
    }
    checkPaymentStatus()
  }, [])

  useEffect(() => {
    const checkInactiveDoctors = async () => {
      const result = await hasInactiveDoctors()
      setHasInactiveDoctorsState(result)
    }

    checkInactiveDoctors()
  }, [])

  useEffect(() => {
    if (isFirstPaymentReceived === true) {
      identify({
        user_id: userData?.email,
        properties: {
          name: `${userData?.firstName} ${userData?.lastName}`,
          email: `${userData?.email}`,
          plan: 'Premium',
        },
      })
    }
  }, [])

  return (
    <DefaultContainer>
      <HeadingSubheading
        heading={translation('billing.heading')}
        subheading={translation('billing.subheading')}
      />
      <DefaultInnerContainer>
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-2/4 lg:w-2/4 h-fit shadow-sm border hover:text-blue-600 rounded-lg">
            <CardHeader>
              <ViewHorizontalIcon className="h-8 w-8 mb-8" />
              <CardTitle className="text-xl font-normal text-black">
                {translation('billing.card_heading')}
              </CardTitle>
              <CardDescription>{translation('billing.card_subheading')}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter className="flex flex-col xl:flex-row gap-2">
              <Button
                size={'lg'}
                variant={'default'}
                onClick={goToDashboard}
                className="w-full xl:w-fit group transition-all duration-300"
                disabled={!isFirstPaymentReceived}
              >
                {translation('billing.card_button')}
                <ArrowRightIcon className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-2" />
              </Button>
              {hasInactiveDoctorsState && (
                <Button
                  size={'lg'}
                  variant={'outline'}
                  onClick={goToPayment}
                  className="w-full xl:w-fit group transition-all duration-300"
                >
                  <span className="relative flex h-2 w-2 mr-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75 group-hover:bg-white"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 group-hover:bg-white"></span>
                  </span>
                  {translation('billing.card_button_pay')}
                  <ArrowRightIcon className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </DefaultInnerContainer>
    </DefaultContainer>
  )
}

export default BillingPage
