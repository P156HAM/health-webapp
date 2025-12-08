import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Button } from '../../components/ui/button'
import { CircleBackslashIcon, FileTextIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import PersonalQRCode from './PersonalQRCode'
import { useAuth } from 'src/auth/AuthProvider'
import { Badge } from '../ui/badge'
import QuickShareQRCode from './QuickShareQRCode'
import { useQRCode } from '../../hooks/useGenerateQRCode'
import { useLogSnag } from '@logsnag/react'

function Dashboard() {
  const { isActive, userData } = useAuth()
  const [translation] = useTranslation('global')
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isQSDialogOpen, setQSDialogOpen] = useState(false)
  const { qrCode, error, loading, handleGenerateQRCode } = useQRCode()
  const { track } = useLogSnag()

  const openPersonalQRCode = () => {
    setDialogOpen(!isDialogOpen)
    track({
      channel: 'qr-clicks',
      event: 'Personal QR clicked',
      icon: '📷',
      tags: {
        userid: `${userData?.email}`,
      },
    })
  }
  const openQSQRCode = () => {
    setQSDialogOpen(!isQSDialogOpen)
    handleGenerateQRCode()
    track({
      channel: 'qr-clicks',
      event: 'Quick share QR clicked',
      icon: '📸',
      tags: {
        userid: `${userData?.email}`,
      },
    })
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 lg:gap-12">
      {!isActive && (
        <Card className="w-full md:w-full xl:w-1/3 h-fit border shadow-none text-stone-300 rounded-lg">
          <CardHeader>
            <div className="flex flex-row justify-between">
              <CircleBackslashIcon className="h-8 w-8 mb-12" />
              <Badge
                variant={'outline'}
                className="h-6 text-xs font-normal bg-blue-600 border-blue-600 text-white shadow-sm"
              >
                {translation('onboarding.premium_feature')}
              </Badge>
            </div>
            <CardTitle className="text-lg font-normal text-stone-300">
              {translation('longTermSharing.heading')}
            </CardTitle>
            <CardDescription className="text-stone-300">
              {translation('longTermSharing.subheading')}
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="">
            <Button
              size={'lg'}
              variant={'default'}
              onClick={openPersonalQRCode}
              disabled
              className="flex flex-row"
            >
              <CircleBackslashIcon className="h-4 w-4 mr-2" />
              {translation('longTermSharing.button_inactive')}
            </Button>
          </CardFooter>
        </Card>
      )}
      {isActive && (
        <Card className="w-full md:w-full xl:w-1/3 h-fit border shadow-sm hover:text-blue-600 rounded-lg">
          <CardHeader>
            <FileTextIcon className="h-8 w-8 mb-12" />
            <CardTitle className="text-lg font-normal text-black">
              {translation('longTermSharing.heading')}
            </CardTitle>
            <CardDescription>{translation('longTermSharing.subheading')}</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter className="">
            <Button size={'lg'} variant={'default'} onClick={openPersonalQRCode}>
              <span className="relative flex h-2 w-2 mr-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              {translation('longTermSharing.button')}
            </Button>
          </CardFooter>
        </Card>
      )}
      <Card className="w-full md:w-full xl:w-1/3 h-fit border shadow-sm hover:text-blue-600 rounded-lg">
        <CardHeader>
          <LightningBoltIcon className="h-8 w-8 mb-12" />
          <CardTitle className="text-lg font-normal text-black">
            {translation('quickSharing.heading')}
          </CardTitle>
          <CardDescription>{translation('quickSharing.subheading')}</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="">
          <Button size={'lg'} variant={'outline'} onClick={openQSQRCode}>
            {translation('quickSharing.button')}
          </Button>
        </CardFooter>
      </Card>
      {isDialogOpen && <PersonalQRCode isOpen={isDialogOpen} onClose={openPersonalQRCode} />}
      {isQSDialogOpen && (
        <QuickShareQRCode
          isOpen={isQSDialogOpen}
          onClose={openQSQRCode}
          qrCode={qrCode}
          loading={loading}
        />
      )}
    </div>
  )
}

export default Dashboard
