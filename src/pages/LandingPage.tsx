import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo_with_text.png'
import { Button } from 'src/components/ui/button'
import { Alert } from 'src/components/ui/alert'
import { ArrowRight } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useQRCode } from '../hooks/useGenerateQRCode'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import {
  CornerBottomLeftIcon,
  CornerBottomRightIcon,
  CornerTopLeftIcon,
  CornerTopRightIcon,
  FileTextIcon,
  MobileIcon,
} from '@radix-ui/react-icons'
import { Separator } from '@radix-ui/react-separator'

function LandingPage() {
  const [translation] = useTranslation('global')
  const navigate = useNavigate()
  const { qrCode, error, loading, handleGenerateQRCode } = useQRCode()

  const toRegister = () => {
    navigate('/register')
  }

  const toLogin = () => {
    navigate('/login')
  }

  const toTermsAndConditions = () => {
    window.open('https://www.vizuhealth.com/terms-and-conditions', '_blank')
  }

  const toPrivacyPolicy = () => {
    window.open('https://www.vizuhealth.com/privacy-policy', '_blank')
  }

  useEffect(() => {
    handleGenerateQRCode();
  }, [])

  return (
    <div className="flex flex-col items-center h-full lg:flex-row lg:w-screen lg:h-screen lg:px-4 lg:py-4 lg:gap-4 xl:px-8 xl:py-8 xl:gap-8">
      <div className="relative w-full flex flex-col justify-between lg:w-2/4 h-full xl:rounded-lg">
        <div className="flex flex-col justify-center h-full px-6 py-6 lg:pl-12 lg:pr-16 lg:py-12 bg-white xl:rounded-lg">
          <div className="absolute top-6 lg:top-12 px-0">
            <img
              src={logo}
              alt="Vizu Health logo"
              className="w-[160px] object-contain"
            />
          </div>
          <h1 className="text-3xl font-medium lg:text-6xl text-black lg:font-normal mt-24">{translation('landingPage.QuickSharedReport.heading')}</h1>
          <p className="text-sm text-black font-normal mt-2 lg:mt-6 lg:text-lg">{translation('landingPage.QuickSharedReport.subheading')}</p>
          <Alert className="border-none bg-transparent px-0 py-6 mt-4 lg:mt-12">
            <Badge
              variant={'outline'}
              className="border-blue-600 text-blue-600 font-normal text-sm mb-3"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75 group-hover:bg-white"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 group-hover:bg-white"></span>
              </span>
              {translation('landingPage.QuickSharedReport.step_one')}
            </Badge>
            <div className='flex flex-col gap-4 mt-4'>
              <div className='flex flex-row gap-4 items-center'>
                <div className='border rounded-lg px-2 py-2'>
                  <MobileIcon className='w-8 h-8' />
                </div>
                <p className='text-[15px] font-normal'>
                  {translation('landingPage.QuickSharedReport.step_two_description')}
                </p>
              </div>
              <div className='flex flex-row gap-4 items-center'>
                <div className='border rounded-lg px-2 py-2'>
                  <FileTextIcon className='w-8 h-8' />
                </div>
                <p className='text-[15px] font-normal'>
                  {translation('landingPage.QuickSharedReport.step_three_description')}
                </p>
              </div>
            </div>
          </Alert>
        </div>
        <div className='lg:mb-6 lg:mt-6 lg:ml-10'>
          <Separator className='h-0.5 w-full rounded-xl bg-slate-200' />
        </div>
        <div className="px-6 py-6 lg:pl-12 lg:pr-16 lg:py-6 bg-white xl:rounded-lg">
          {/* <h1 className="text-2xl font-medium lg:text-6xl text-black lg:font-normal">
            {translation('landingPage.Login.heading')}
          </h1> */}
          {/* <p className="text-sm text-black font-light mt-1 lg:mt-4 lg:text-lg">
            Register as a premium healthcare professional or login to your account.
          </p> */}
          <div className="hidden md:flex md:flex-row md:gap-1 md:gap-2 md:mt-6 lg:mt-0">
            <Button
              size={'lg'}
              onClick={toLogin}
              variant={'default'}
              className="w-fit lg:py-6 text-xs lg:text-sm border bg-blue-600 border-blue-600 text-white hover:border-blue-900"
            >
              {translation('landingPage.Login.login')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size={'lg'}
              onClick={toRegister}
              variant={'default'}
              className="w-fit lg:py-6 text-xs lg:text-sm bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white"
            >
              {translation('landingPage.Login.register_button')}
            </Button>
          </div>
          <div className="md:hidden flex flex-row gap-2 mt-6">
            <Button
              size={'sm'}
              onClick={toLogin}
              variant={'default'}
              className="w-1/2 px-6 py-5 text-xs border bg-blue-600 border-blue-600 text-white"
            >
              {translation('landingPage.Login.login')}
            </Button>
            <Button
              size={'sm'}
              onClick={toRegister}
              variant={'default'}
              className="w-fit px-6 py-5 text-xs bg-transparent border border-blue-600 text-blue-600"
            >
              {translation('landingPage.Login.register_button')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-none w-full lg:px-2 lg:px-4 justify-between pt-8 lg:pt-16 pb-4 lg:w-2/4 h-full flex px-6 lg:px-0lg:justify-center lg:items-center lg:rounded-lg">
        <div></div>
        <div className="w-[350px]">
          <div className="hidden md:block w-full">
            {error && !loading && (
              <div className="w-full h-[350px] flex items-center justify-center rounded-lg border border-red-600 bg-red-100 shadow-sm">
                <p className='text-red-600'>
                  {error}
                </p>
              </div>
            )}
            {!error && loading && (
              <Skeleton className="w-full h-[340px] rounded-lg border flex flex-col justify-center items-center bg-zinc-50">
                <div className="flex flex-col h-full w-full px-8 py-8 justify-between">
                  <div className="flex flex-row w-full justify-between">
                    <p>
                      <CornerTopLeftIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                    <p>
                      <CornerTopRightIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-600">Generating QR Code</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <p>
                      <CornerBottomLeftIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                    <p>
                      <CornerBottomRightIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                  </div>
                </div>
              </Skeleton>
            )}
            {!error && !loading && (
              <div className='text-center'>
                <QRCode
                  value={qrCode}
                  size={350}
                  className="border px-6 py-6 rounded-lg shadow-sm"
                />
              </div>
            )}
            {!error && !loading && (
              <div className='flex flex-row w-full mt-4 justify-center items-center'>
                <p className='flex flex-row text-xs text-black/55 items-center'>
                  {translation('landingPage.QuickSharedReport.generate_qr_code_button')}
                </p>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex flex-row md:hidden w-full">
            {error && !loading && (
              <div className="w-11/12 h-[200px] flex items-center justify-center rounded-lg border border-red-600 bg-red-100 shadow-sm">
                <p className='text-red-600'>
                  {error}
                </p>
              </div>
            )}
            {loading && !error && (
              <Skeleton className="w-full h-[350px] rounded-lg border border-zinc-200 flex flex-col justify-center items-center bg-zinc-50">
                <div className="flex flex-col h-full w-full px-8 py-8 justify-between">
                  <div className="flex flex-row w-full justify-between">
                    <p>
                      <CornerTopLeftIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                    <p>
                      <CornerTopRightIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-600">Generating QR Code</p>
                  </div>
                  <div className="flex flex-row w-full justify-between">
                    <p>
                      <CornerBottomLeftIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                    <p>
                      <CornerBottomRightIcon className="w-6 h-6 text-zinc-400" />
                    </p>
                  </div>
                </div>
              </Skeleton>
            )}
            {!loading && !error && (
              <div className='flex flex-col w-full px-6 align-center items-center'>
                <QRCode
                  value={qrCode}
                  size={335}
                  className="border px-4 py-4 rounded-md shadow-sm"
                />
                {/* <Button variant={'outline'} className="w-full mt-4" onClick={handleGenerateQRCode}>
                  {translation('landingPage.QuickSharedReport.generate_qr_code_button')}
                </Button> */}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-row mt-8 lg:mt-0">
          <Button
            variant="link"
            className="font-normal text-black"
            onClick={toTermsAndConditions}
          >
            {translation('landingPage.QuickSharedReport.terms_and_conditions')}
          </Button>
          <Button variant="link" className="font-normal text-black" onClick={toPrivacyPolicy}>
            {translation('landingPage.QuickSharedReport.privacy_policy')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
