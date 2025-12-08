import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/onboarding-dialog'
import { Button } from 'src/components/ui/button'
import DefaultInnerContainer from './DefaultInnerContainer'
import { Badge } from '../ui/badge'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/firebase'
import { useToast } from 'src/components/ui/use-toast'
import { useAuth } from 'src/auth/AuthProvider'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  CheckCircledIcon,
  CheckIcon,
  FileTextIcon,
  LightningBoltIcon,
} from '@radix-ui/react-icons'
import { Alert, AlertDescription, AlertTitle } from 'src/components/ui/alert'
import { ShieldCheck, SparkleIcon } from 'lucide-react'
import { useLogSnag } from '@logsnag/react'

function OnboardingDialog() {
  const { userData } = useAuth()
  const [translation] = useTranslation('global')
  const [isDialogOpen, setDialogOpen] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1) // Manage the current step
  const { identify } = useLogSnag()

  const closeDialog = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        const userDocRef = doc(db, 'healthcareProfessionals', user.uid)
        await updateDoc(userDocRef, {
          isOnboarded: true,
        })
        userData!.isOnboarded = true
        setDialogOpen(false)
        if (userData?.isAdmin) {
          navigate('/clinic')
        }
      } else {
        //console.error("No user is currently signed in");
      }
    } catch (error) {
      toast({
        title: translation('onboarding.toast_heading'),
        description: translation('onboarding.toast_subheading'),
        variant: 'destructive',
      })
    }
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      closeDialog()
    }
  }

  useEffect(() => {
    identify({
      user_id: userData?.email,
      properties: {
        name: `${userData?.firstName} ${userData?.lastName}`,
        email: `${userData?.email}`,
        onboarding: currentStep,
      },
    })
  }, [currentStep])

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="flex flex-col gap-12 text-left">
              <div className="flex flex-col">
                <DialogTitle className="text-3xl font-medium text-left mb-1">
                  {translation('onboarding.step_one_heading')}
                </DialogTitle>
                <DialogDescription className="text-black text-md mt-2">
                  {translation('onboarding.step_one_subheading')}
                </DialogDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
                <Alert className="flex flex-col hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <AlertTitle className="text-md text-black text-lg font-normal">
                    <div className="flex flex-row w-full justify-between mb-4">
                      <LightningBoltIcon className="w-6 h-6 mb-4 text-blue-600" />
                    </div>
                    {translation('quickSharing.heading')}
                  </AlertTitle>
                  <AlertDescription className="text-sm font-normal text-zinc-500">
                    {translation('quickSharing.subheading')}
                  </AlertDescription>
                </Alert>
                <Alert className="flex flex-col hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <AlertTitle className="text-md text-black text-lg font-normal">
                    <div className="flex flex-row w-full justify-between mb-4">
                      <FileTextIcon className="w-6 h-6 mb-4 text-blue-600" />
                      <Badge
                        variant={'outline'}
                        className="h-6 text-xs font-normal bg-white border-blue-600 text-blue-600"
                      >
                        {translation('onboarding.premium_feature')}
                      </Badge>
                    </div>
                    {translation('longTermSharing.heading')}
                  </AlertTitle>
                  <AlertDescription className="text-sm font-normal text-zinc-500">
                    {translation('longTermSharing.subheading')}
                  </AlertDescription>
                </Alert>
                <Alert className="flex flex-col hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <AlertTitle className="text-md text-black text-lg font-normal">
                    <div className="flex flex-row w-full justify-between mb-4">
                      <SparkleIcon className="w-6 h-6 mb-4 text-blue-600" />
                      <Badge
                        variant={'outline'}
                        className="h-6 text-xs font-normal bg-white border-blue-600 text-blue-600"
                      >
                        {translation('onboarding.premium_feature')}
                      </Badge>
                    </div>
                    {translation('onboarding.ai_anomaly_heading')}
                  </AlertTitle>
                  <AlertDescription className="text-sm font-normal text-zinc-500">
                    {translation('onboarding.ai_anomaly_subheading')}
                  </AlertDescription>
                </Alert>
                <Alert className="flex flex-col hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <AlertTitle className="text-md text-black text-lg font-normal">
                    <div className="flex flex-row w-full justify-between mb-4">
                      <ShieldCheck className="w-6 h-6 mb-4 text-blue-600" />
                      <Badge
                        variant={'outline'}
                        className="h-6 text-xs font-normal bg-white border-blue-600 text-blue-600"
                      >
                        {translation('onboarding.premium_feature')}
                      </Badge>
                    </div>
                    {translation('onboarding.preventive_plan_heading')}
                  </AlertTitle>
                  <AlertDescription className="text-sm font-normal text-zinc-500">
                    {translation('onboarding.preventive_plan_subheading')}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="flex flex-col gap-12 text-left">
              <div>
                <DialogTitle className="text-3xl font-medium text-left mb-1">
                  {translation('onboarding.quickSharing.heading')}
                </DialogTitle>
                <DialogDescription className="text-light text-md mt-2">
                  {translation('onboarding.quickSharing.subheading')}
                </DialogDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.quickSharing.badge_1')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.quickSharing.card_one_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.quickSharing.card_one_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.quickSharing.badge_2')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.quickSharing.card_two_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.quickSharing.card_two_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.quickSharing.badge_3')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.quickSharing.card_three_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.quickSharing.card_three_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.quickSharing.badge_4')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.quickSharing.card_four_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.quickSharing.card_four_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <div className="flex flex-col gap-12 text-left">
              <div>
                <DialogTitle className="text-3xl font-medium text-left mb-1">
                  {translation('onboarding.longTermAccess.heading')}
                </DialogTitle>
                <DialogDescription className="text-light text-md mt-2">
                  {translation('onboarding.longTermAccess.subheading')}
                </DialogDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.longTermAccess.badge_1')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.longTermAccess.card_one_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.longTermAccess.card_one_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.longTermAccess.badge_2')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.longTermAccess.card_two_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.longTermAccess.card_two_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.longTermAccess.badge_3')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.longTermAccess.card_three_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.longTermAccess.card_three_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.longTermAccess.badge_4')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.longTermAccess.card_four_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.longTermAccess.card_four_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
              <div className="flex flex-row gap-6 w-full bg-blue-200 rounded-sm px-6 py-4">
                <CheckCircledIcon className="hidden md:block w-9 md:h-9 text-blue-600" />
                <p className="text-black text-xs md:text-sm">
                  {translation('onboarding.longTermAccess.premium_feature')}
                </p>
              </div>
            </div>
          </>
        )
      case 4:
        return (
          <>
            <div className="flex flex-col gap-12 text-left">
              <div>
                <DialogTitle className="text-3xl font-medium text-left mb-1">
                  {translation('onboarding.anomalyDetection.heading')}
                </DialogTitle>
                <DialogDescription className="text-light text-md mt-2">
                  {translation('onboarding.anomalyDetection.subheading')}
                </DialogDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.anomalyDetection.badge_1')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.anomalyDetection.card_one_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.anomalyDetection.card_one_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.anomalyDetection.badge_2')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.anomalyDetection.card_two_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.anomalyDetection.card_two_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.anomalyDetection.badge_3')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.anomalyDetection.card_three_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.anomalyDetection.card_three_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.anomalyDetection.badge_4')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.anomalyDetection.card_four_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.anomalyDetection.card_four_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
              <div className="flex flex-row gap-6 w-full bg-blue-200 rounded-sm px-6 py-4">
                <CheckCircledIcon className="hidden md:block w-9 md:h-9 text-blue-600" />
                <p className="text-black text-xs md:text-sm">
                  {translation('onboarding.anomalyDetection.premium_feature')}
                </p>
              </div>
            </div>
          </>
        )
      case 5:
        return (
          <>
            <div className="flex flex-col gap-12 text-left">
              <div>
                <DialogTitle className="text-3xl font-medium text-left mb-1">
                  {translation('onboarding.preventionPlan.heading')}
                </DialogTitle>
                <DialogDescription className="text-light text-md mt-2">
                  {translation('onboarding.preventionPlan.subheading')}
                </DialogDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.preventionPlan.badge_1')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.preventionPlan.card_one_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.preventionPlan.card_one_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.preventionPlan.badge_2')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.preventionPlan.card_two_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.preventionPlan.card_two_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.preventionPlan.badge_3')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.preventionPlan.card_three_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.preventionPlan.card_three_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
                <Alert className="flex flex-col justify-between hover:text-blue-600 hover:shadow-sm hover:border-stone-200">
                  <Badge
                    variant={'outline'}
                    className="w-fit mb-10 border border-blue-600 bg-white text-blue-600"
                  >
                    {translation('onboarding.preventionPlan.badge_4')}
                  </Badge>
                  <div>
                    <AlertTitle className="flex flex-col w-fit text-md text-lg font-normal">
                      {translation('onboarding.preventionPlan.card_four_heading')}
                    </AlertTitle>
                    <AlertDescription className="text-sm font-normal">
                      {translation('onboarding.preventionPlan.card_four_subheading')}
                    </AlertDescription>
                  </div>
                </Alert>
              </div>
              <div className="flex flex-row gap-6 w-full bg-blue-200 rounded-sm px-6 py-4">
                <CheckCircledIcon className="hidden md:block w-9 md:h-9 text-blue-600" />
                <p className="text-black text-xs md:text-sm">
                  {translation('onboarding.preventionPlan.premium_feature')}
                </p>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <DefaultInnerContainer>
      <Dialog open={isDialogOpen}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader className="">
            <Badge
              variant={'default'}
              className="text-sm font-normal w-fit text-white bg-blue-600 border-blue-600 mb-6 hover:bg-blue-600 hover:text-white shadow-none"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              {translation('onboarding.badge')}
            </Badge>
            {renderContent()}
          </DialogHeader>
          <div className="flex flex-row w-full mt-12 justify-end">
            <Button variant="default" size={'lg'} onClick={nextStep}>
              {currentStep < 5 ? (
                <div className="flex flex-row">
                  {' '}
                  {translation('onboarding.button_next')}{' '}
                  <ArrowRightIcon className="w-4 h-4 ml-2" />{' '}
                </div>
              ) : (
                <div className="flex flex-row">
                  {' '}
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {translation('onboarding.button_close')}
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DefaultInnerContainer>
  )
}

export default OnboardingDialog
