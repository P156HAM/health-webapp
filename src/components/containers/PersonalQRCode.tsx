// src/components/ForgotPassword.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';
import { useAuth } from '../../auth/AuthProvider';
import QRCode from 'react-qr-code';
import logo from "../../assets/logo_with_text.png";
import { Badge } from '../ui/badge';

interface PersonalQRCodeProps {
    isOpen: boolean;
    onClose: () => void;
}

const PersonalQRCode: React.FC<PersonalQRCodeProps> = ({ isOpen, onClose }) => {
    const [translation] = useTranslation("global");
    const { user, userData } = useAuth();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='md:px-12 py-12'>
                <DialogHeader className='mb-4 items-center gap-2'>
                    <Badge variant={'outline'} className='font-normal bg-blue-600 border-blue-600 text-white mb-8'>{translation("longTermSharing.badge")}</Badge>
                    <DialogTitle className='text-4xl font-normal'>{userData?.firstName} {userData?.lastName}</DialogTitle>
                    <DialogDescription className='text-md font-normal text-blue-600'>
                        {userData?.clinicName}
                    </DialogDescription>
                </DialogHeader>
                <div className='flex flex-col md:hidden items-center mt-6 border rounded-xl px-8 py-8 shadow-lg'>
                    <QRCode value={user?.uid!} size={250} className='' />
                </div>
                <div className='hidden flex flex-col md:block items-center mt-6 border rounded-xl px-8 py-8 shadow-lg'>
                    <QRCode value={user?.uid!} size={350} className='' />
                </div>
                <div className='flex flex-col items-center mt-12'>
                    <img src={logo} width={"125"} alt='Vizu Health Logo' />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PersonalQRCode;
