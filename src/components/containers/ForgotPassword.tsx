// src/components/ForgotPassword.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from 'src/components/ui/dialog';

interface ForgotPasswordProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isOpen, onClose }) => {
    const [translation] = useTranslation("global");
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(translation('landingPage.ForgotPassword.success'));
            setError('');
            setEmail('');
        } catch (error: any) {
            setSuccess(translation('landingPage.ForgotPassword.error'));
            setEmail('');
            setSuccess('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className='mb-4'>
                    <DialogTitle className='text-2xl font-medium text-left'>{translation('landingPage.ForgotPassword.heading')}</DialogTitle>
                    <DialogDescription className='text-left'>
                        {translation('landingPage.ForgotPassword.subheading')}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        type="email"
                        placeholder={translation('landingPage.ForgotPassword.email_placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {error && <div className="bg-red-100 text-sm rounded-sm p-4 text-red-700">{error}</div>}
                    {success && <div className="bg-green-100 text-sm rounded-sm p-4 text-green-700">{success}</div>}
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>{translation('landingPage.ForgotPassword.cancel_button')}</Button>
                    <Button onClick={handleResetPassword}>{translation('landingPage.ForgotPassword.submit_button')}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassword;
