// src/components/ForgotPassword.tsx
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog'
import { useAuth } from '../../auth/AuthProvider'
import QRCode from 'react-qr-code'
import { useQRCode } from '../../hooks/useGenerateQRCode'
import logo from '../../assets/logo_with_text.png'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { CornerBottomLeftIcon, CornerBottomRightIcon, CornerTopLeftIcon, CornerTopRightIcon } from '@radix-ui/react-icons'

interface QuickShareQRCodeProps {
  qrCode: string
  loading: boolean
  isOpen: boolean
  onClose: () => void
}

const QuickShareQRCode: React.FC<QuickShareQRCodeProps> = ({ isOpen, onClose }) => {
  const [translation] = useTranslation('global')
  const { user, userData } = useAuth()
  const { qrCode, error, loading, handleGenerateQRCode } = useQRCode()

  useEffect(() => {
    handleGenerateQRCode();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="px-12 py-12">
        <DialogHeader className="mb-4 items-center gap-2">
          <Badge variant={'outline'} className='font-normal bg-zinc-200 border text-black mb-8'>{translation("quickSharing.heading")}</Badge>
          <DialogTitle className="text-4xl font-normal">
            {translation("quickSharing.heading")}
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-black text-center">
            {translation("quickSharing.subheading")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:hidden items-center mt-6 border rounded-xl px-8 py-8 shadow-lg">
          {loading && (
            <Skeleton className='w-full h-[350px] rounded-lg border border-zinc-200 flex flex-col justify-center items-center bg-zinc-50'>
              <div className='flex flex-col h-full w-full px-8 py-8 justify-between'>
                <div className='flex flex-row w-full justify-between'>
                  <p><CornerTopLeftIcon className='w-6 h-6 text-zinc-400' /></p>
                  <p><CornerTopRightIcon className='w-6 h-6 text-zinc-400' /></p>
                </div>
                <div className='text-center'>
                  <p className='text-sm text-zinc-600'>Generating QR Code</p>
                </div>
                <div className='flex flex-row w-full justify-between'>
                  <p><CornerBottomLeftIcon className='w-6 h-6 text-zinc-400' /></p>
                  <p><CornerBottomRightIcon className='w-6 h-6 text-zinc-400' /></p>
                </div>
              </div>
            </Skeleton>
          )}
          {!loading && (
            <QRCode value={qrCode} size={250} className="" />
          )}
        </div>
        <div className="hidden flex flex-col md:block items-center mt-6 border rounded-xl px-8 py-8 shadow-lg">
          {loading && (
            <Skeleton className='w-full h-[350px] rounded-lg border flex flex-col justify-center items-center bg-zinc-50'>
              <div className='flex flex-col h-full w-full px-8 py-8 justify-between'>
                <div className='flex flex-row w-full justify-between'>
                  <p><CornerTopLeftIcon className='w-6 h-6 text-zinc-400' /></p>
                  <p><CornerTopRightIcon className='w-6 h-6 text-zinc-400' /></p>
                </div>
                <div className='text-center'>
                  <p className='text-sm text-zinc-600'>Generating QR Code</p>
                </div>
                <div className='flex flex-row w-full justify-between'>
                  <p><CornerBottomLeftIcon className='w-6 h-6 text-zinc-400' /></p>
                  <p><CornerBottomRightIcon className='w-6 h-6 text-zinc-400' /></p>
                </div>
              </div>
            </Skeleton>
          )}
          {!loading && (
            <QRCode value={qrCode} size={350} className="" />
          )}
        </div>
        <div className="flex flex-col items-center mt-12">
          <img src={logo} width={'125'} alt="Vizu Health Logo" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuickShareQRCode
