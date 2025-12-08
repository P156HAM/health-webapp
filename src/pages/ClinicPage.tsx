import React from 'react'
import { useTranslation } from 'react-i18next'
import DefaultContainer from '../components/containers/DefaultContainer'
import HeadingSubheading from '../components/containers/HeadingSubheading'
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer'
import AccountTable from '../components/containers/AccountTable'

function ClinicPage() {
  const [translation] = useTranslation('global')

  return (
    <DefaultContainer>
      <HeadingSubheading
        heading={translation('clinic.heading')}
        subheading={translation('clinic.subheading')}
      />
      <DefaultInnerContainer>
        <AccountTable />
      </DefaultInnerContainer>
    </DefaultContainer>
  )
}

export default ClinicPage
