import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../../components/ui/button'
import { PlusIcon, Cross2Icon, MixerHorizontalIcon } from '@radix-ui/react-icons'
import { db } from '../../firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { isMockMode } from '../../mocks/config'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table'
import NewAccountDialog from './NewAccountDialog'
import EditAccountDialog from './EditingAccountDialog'
import DeleteAccountDialog from './DeleteAccountDialog'
import { Input } from 'src/components/ui/input'
import PaginationContainer from '../../components/containers/PaginationContainer'

interface HealthcareProfessional {
  uid: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  isAdmin: boolean
}

function AccountTable() {
  const [translation] = useTranslation('global')
  const { userData } = useAuth()
  const [accounts, setAccounts] = useState<HealthcareProfessional[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<null | HealthcareProfessional>(null)
  const [accountToDelete, setAccountToDelete] = useState<null | HealthcareProfessional>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const fetchHealthcareProfessionals = async () => {
    if (isMockMode) {
      setAccounts([
        {
          uid: 'mock-user-1',
          firstName: 'Dana',
          lastName: 'Care',
          email: 'dana.care@demo.clinic',
          isActive: true,
          isAdmin: true,
        },
        {
          uid: 'mock-user-2',
          firstName: 'Leo',
          lastName: 'Heart',
          email: 'leo.heart@demo.clinic',
          isActive: false,
          isAdmin: false,
        },
        {
          uid: 'mock-user-3',
          firstName: 'Mia',
          lastName: 'Sleep',
          email: 'mia.sleep@demo.clinic',
          isActive: true,
          isAdmin: false,
        },
      ])
      return
    }
    if (userData?.clinicID) {
      try {
        setLoading(true)
        const clinicDocRef = doc(db, 'clinics', userData.clinicID)
        const clinicDoc = await getDoc(clinicDocRef)
        if (clinicDoc.exists()) {
          const { healthcareProfessionals } = clinicDoc.data()
          const accountPromises = healthcareProfessionals.map(async (uid: string) => {
            const userDocRef = doc(db, 'healthcareProfessionals', uid)
            const userDoc = await getDoc(userDocRef)
            if (userDoc.exists()) {
              const userData = userDoc.data() as Omit<HealthcareProfessional, 'uid'>
              return { ...userData, uid }
            }
            return null
          })
          const accountData = await Promise.all(accountPromises)
          setAccounts(accountData.filter((account) => account !== null) as HealthcareProfessional[])
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching healthcare professionals: ', error)
      }
    }
  }

  useEffect(() => {
    fetchHealthcareProfessionals()
  }, [userData?.clinicID])

  const toggleDialog = () => {
    setDialogOpen(!isDialogOpen)
  }

  const handleEditAccount = (account: HealthcareProfessional) => {
    setSelectedAccount(account)
    setIsEditingDialogOpen(true)
  }

  const handleDeleteAccount = (account: HealthcareProfessional) => {
    setAccountToDelete(account)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleEditingDialog = () => {
    setIsEditingDialogOpen(false)
    setSelectedAccount(null)
  }

  const handleToggleDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  const filteredAccounts = accounts.filter((account) => {
    const fullName = `${account.firstName.toLowerCase()} ${account.lastName.toLowerCase()}`
    return (
      account.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase())
    )
  })

  const filteredAndSortedAccounts = filteredAccounts.sort((a, b) => {
    return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
  })

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentAccounts = filteredAndSortedAccounts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAndSortedAccounts.length / pageSize)

  return (
    <div className="bg-white border px-6 py-6 lg:px-8 lg:py-8 rounded-lg">
      <div className="flex flex-row gap-1 justify-between items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-normal">{translation('clinic.accounts')}</h1>
          <p className="text-sm font-normal text-stone-500">
            {translation('clinic.accounts_subheading')}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 lg:gap-0 md:flex-row w-full justify-between mt-6 lg:mt-14">
        <div className="w-full lg:w-8/8 xl:w-4/6">
          <Input
            className="shadow-none"
            placeholder={translation('clinic.search_placeholder')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="w-full flex flex-row justify-end">
          <Button variant="default" size="default" onClick={() => setDialogOpen(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {translation('clinic.button_add_account')}
          </Button>
        </div>
      </div>
      <div className="mt-10">
        {!loading && (
          <>
            <Table className="">
              <TableHeader className="">
                <TableRow className="bg-white hover:bg-white">
                  <TableHead className="text-blue-600"> {translation('clinic.status')}</TableHead>
                  <TableHead className="text-blue-600">{translation('clinic.name')}</TableHead>
                  <TableHead className="text-blue-600 hidden md:table-cell">
                    {translation('clinic.email')}
                  </TableHead>
                  <TableHead className="text-blue-600 hidden md:table-cell">
                    {translation('clinic.admin')}
                  </TableHead>
                  <TableHead className="text-blue-600 text-right">
                    {translation('clinic.account_management')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {currentAccounts.map((account, index) => (
                  <TableRow key={account.email} className="bg-white hover:bg-zinc-100">
                    <TableCell className="font-normal">
                      <div className="flex flex-row gap-2 items-center">
                        {!account.isActive && (
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                        {account.isActive && (
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                        <div className="hidden md:flex md:flex-row">
                          {account.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.firstName} {account.lastName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{account.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {account.isAdmin ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell flex justify-end">
                      <div className="flex flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleEditAccount(account)}
                        >
                          <MixerHorizontalIcon className='h-4 w-4 lg:mr-2' />
                          <p className='hidden lg:block text-xs'>
                            {translation('clinic.edit')}
                          </p>
                        </Button>
                        <Button
                          variant="destructive"
                          size="default"
                          onClick={() => handleDeleteAccount(account)}
                          className="hover:bg-red-700"
                        >
                          <Cross2Icon className='w-4 h-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <PaginationContainer
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>
      <NewAccountDialog
        isOpen={isDialogOpen}
        onClose={toggleDialog}
        onAccountCreated={fetchHealthcareProfessionals}
      />
      <EditAccountDialog
        isOpen={isEditingDialogOpen}
        onClose={handleToggleEditingDialog}
        onSuccess={fetchHealthcareProfessionals}
        existingAccount={selectedAccount}
      />
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleToggleDeleteDialog}
        onSuccess={fetchHealthcareProfessionals}
        accountToDelete={accountToDelete}
      />
    </div>
  )
}

export default AccountTable
