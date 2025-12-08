import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetchLongTermReports from '../../hooks/useFetchLongTermReports'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../../components/ui/button'
import { CircleBackslashIcon, ReloadIcon } from '@radix-ui/react-icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Input } from 'src/components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Report } from '../../constants/types'
import { useNavigate } from 'react-router-dom'
import PaginationContainer from '../../components/containers/PaginationContainer'
import { useLTRServices } from '../../context/LTRServicesContext'
import { useLogSnag } from '@logsnag/react'

function LongTermReports() {
  const { userData } = useAuth()
  const navigate = useNavigate()
  const [translation] = useTranslation('global')
  const [triggerFetch, setTriggerFetch] = useState(0)
  const { healthReports, error, isLoading, noPatients } = useFetchLongTermReports(
    userData?.uid,
    triggerFetch
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { fetchPatientData } = useLTRServices()
  const pageSize = 8
  const { track } = useLogSnag()

  const filteredReports = healthReports.filter((report: Report) => {
    const fullName = `${report.patientName.toLowerCase()} ${report.patientLastName.toLowerCase()}`
    return (
      report.dateOfBirth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase())
    )
  })

  // Sorting the reports alphabetically by the patient's first name
  const filteredAndSortedReports = filteredReports.sort((a, b) => {
    return a.patientName.toLowerCase().localeCompare(b.patientName.toLowerCase())
  })

  // This is to determine the reports shown on the current page
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentReports = filteredAndSortedReports.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAndSortedReports.length / pageSize)

  const refetchReports = () => {
    setTriggerFetch((prev) => prev + 1)
  }

  function toReport(user_uid: string) {
    fetchPatientData(user_uid)
    navigate(`/report/${user_uid}`)
    track({
      channel: 'report-clicks',
      event: 'A report has been opened',
      icon: '📊',
      tags: {
        userid: `${userData?.email}`,
      },
    })
  }

  return (
    <div>
      {!userData?.isActive && (
        <div className="bg-white px-6 py-6 border shadow-sm lg:px-8 lg:py-8 rounded-lg text-stone-300">
          <div className="flex flex-row gap-1 justify-between items-end">
            <div className="flex flex-col gap-1">
              <Badge
                variant={'outline'}
                className="h-6 w-fit mb-4 text-xs font-normal bg-blue-600 border-blue-600 text-white shadow-sm"
              >
                {translation('onboarding.premium_feature')}
              </Badge>
              <h1 className="text-lg font-normal">{translation('longTermAccess.table_heading')}</h1>
              <p className="text-sm font-normal text-stone-300 mt-1">
                {translation('longTermAccess.table_subheading')}
              </p>
            </div>
          </div>
          <div className="flex flex-row w-full justify-between mt-14">
            <div className="w-2/6">
              <Input
                className="shadow-none text-stone-300"
                placeholder={translation('longTermAccess.input_placeholder_disabled')}
                disabled
              />
            </div>
            <div className="flex self-end">
              <Button
                variant="default"
                size="default"
                onClick={refetchReports}
                className=""
                disabled
              >
                <CircleBackslashIcon className="h-4 w-4 mr-2" />
                {translation('longTermSharing.button_inactive')}
              </Button>
            </div>
          </div>
        </div>
      )}
      {userData?.isActive && (
        <div className="bg-white px-6 py-6 shadow-sm border lg:px-8 lg:py-8 rounded-lg">
          <div className="flex flex-row gap-1 justify-between items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-normal">{translation('longTermAccess.table_heading')}</h1>
              <p className="text-sm font-normal text-stone-500 mt-1">
                {translation('longTermAccess.table_subheading')}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:gap-0 md:flex-row w-full justify-between mt-6 lg:mt-14">
            <div className="w-full lg:w-8/8 xl:w-4/6">
              <Input
                className="shadow-none"
                placeholder={translation('longTermAccess.input_placeholder')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="w-full flex flex-row justify-end">
              <Button
                variant="default"
                size="default"
                onClick={refetchReports}
                className="w-full md:w-fit group"
              >
                <ReloadIcon className="w-4 h-4 mr-3 group-hover:animate-spin" />
                {translation('longTermAccess.refresh_button')}
              </Button>
            </div>
          </div>
          <div className="mt-6">
            {/* {isLoading &&
                            <div className='flex flex-row items-center justify-center w-full rounded-md px-4 py-12 bg-zinc-100 border text-sm text-zinc-500 font-light animate-pulse'>
                                <ReloadIcon className='w-4 h-4 mr-4 animate-spin text-zinc-500' />
                                {translation('longTermAccess.fetching_text')}
                            </div>
                        } */}
            {error && (
              <div className="flex flex-row items-center justify-center w-full rounded-md px-4 py-12 bg-white border border-red-600 text-red-600 font-light ">
                <span className="relative flex h-3 w-3 mr-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <p className="text-md">{error}</p>
              </div>
            )}
            {noPatients && (
              <div className="flex flex-row items-center justify-left w-full rounded-md bg-zinc-50 px-8 py-12 border text-md text-black font-light">
                {translation('longTermAccess.no_reports')}
              </div>
            )}
            {!isLoading && !error && !noPatients && (
              <>
                <Table className="">
                  <TableHeader className="">
                    <TableRow className="bg-white hover:bg-white">
                      <TableHead className="text-blue-600">
                        {translation('longTermAccess.table_first_name')}
                      </TableHead>
                      <TableHead className="text-blue-600">
                        {translation('longTermAccess.table_last_name')}
                      </TableHead>
                      <TableHead className="text-blue-600">
                        {translation('longTermAccess.table_date_of_birth')}
                      </TableHead>
                      <TableHead className="hidden md:block text-blue-600 text-right">
                        {translation('longTermAccess.table_view_report')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="w-full">
                    {currentReports.map((report, index) => (
                      <TableRow
                        key={index}
                        className="bg-white hover:bg-zinc-100 hover:cursor-pointer"
                        onClick={() => toReport(report.id)}
                      >
                        <TableCell className="font-normal">{report.patientName}</TableCell>
                        <TableCell className="font-normal">{report.patientLastName}</TableCell>
                        <TableCell className="font-normal">{report.dateOfBirth}</TableCell>
                        <TableCell className="font-normal text-right hidden md:block ">
                          <Button
                            size={'sm'}
                            variant={'outline'}
                            className="text-xs bg-transparent"
                          >
                            {translation('longTermAccess.table_view_report')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages >= pageSize - 1 && (
                  <PaginationContainer
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LongTermReports
