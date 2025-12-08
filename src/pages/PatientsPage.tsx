import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DefaultContainer from '../components/containers/DefaultContainer';
import HeadingSubheading from '../components/containers/HeadingSubheading';
import { useAuth } from '../auth/AuthProvider';
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer';
import LongTermReports from '../components/containers/LongTermReports';

function PatientsPage() {
    const { userData } = useAuth();
    const [translation] = useTranslation("global");

    return (
        <DefaultContainer>
            <HeadingSubheading heading={translation('longTermSharing.heading')} subheading={translation('longTermSharing.subheading')} />
            <DefaultInnerContainer>
                <LongTermReports />
            </DefaultInnerContainer >
        </DefaultContainer >
    );
}

export default PatientsPage;
