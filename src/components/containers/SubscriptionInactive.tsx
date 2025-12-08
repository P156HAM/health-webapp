import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/ui/button';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useNavigate } from "react-router-dom";

function SubscriptionInactive() {
    const { userData } = useAuth();
    const [translation] = useTranslation("global");
    const navigate = useNavigate();

    const toBilling = () => {
        navigate("/billing")
    };

    return (
        <div className='flex flex-col gap-12 md:gap-8 lg:flex-row justify-between text-left px-6 py-6 bg-red-500 rounded-lg lg:mb-16'>
            <div className='flex flex-col justify-center'>
                <h1 className="text-2xl text-white font-medium">{translation('billing.expired')}</h1>
                <p className="text-sm text-white font-normal mt-2">{translation('billing.expired_subheading')}</p>
            </div>
            {userData?.isAdmin ? (
                <div className="flex items-center">
                    <Button
                        variant={'outline'}
                        size={'lg'}
                        className="bg-white border-white text-red-900 hover:border-white hover:bg-white hover:text-red-700 hover:shadow-sm group transition-all duration-300"
                        onClick={toBilling}
                    >
                        {translation('billing.button_to_billing')}
                        <ArrowRightIcon
                            className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-2"
                        />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

export default SubscriptionInactive;
