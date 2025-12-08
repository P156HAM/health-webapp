import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Checkbox } from 'src/components/ui/checkbox'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase/firebase'
import { useToast } from 'src/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog'

interface HealthcareProfessional {
  uid: string
  firstName: string
  lastName: string
  email: string
  isAdmin: boolean
}

interface EditAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  existingAccount: HealthcareProfessional | null
  onSuccess: () => void
}

const EditAccountDialog = ({
  isOpen,
  onClose,
  existingAccount,
  onSuccess,
}: EditAccountDialogProps) => {
  const [translation] = useTranslation('global')
  const [formData, setFormData] = useState({
    firstName: existingAccount?.firstName || '',
    lastName: existingAccount?.lastName || '',
    isAdmin: existingAccount?.isAdmin || false,
  })

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (existingAccount) {
      setFormData({
        firstName: existingAccount.firstName,
        lastName: existingAccount.lastName,
        isAdmin: existingAccount.isAdmin,
      })
    }
  }, [existingAccount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      isAdmin: checked,
    }))
  }

  const validateForm = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
    }
    let isValid = true

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.firstName = translation('createAccountComponent.first_name_error')
      isValid = false
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.lastName = translation('createAccountComponent.last_name_error')
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!existingAccount) return
    if (validateForm()) {
      try {
        setLoading(true)
        const userDocRef = doc(db, 'healthcareProfessionals', existingAccount.uid)

        await updateDoc(userDocRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          isAdmin: formData.isAdmin,
        })

        toast({
          className: 'bg-green-200 border border-green-500 text-green-900',
          title: translation('editAccountDialog.toast_success_heading'),
          description: translation('editAccountDialog.toast_success_subheading')
        })

        handleClose()
        onSuccess()
      } catch (error: any) {
        console.error('Error updating account: ', error)
        setError('Error updating account. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleClose = () => {
    setErrors({
      firstName: '',
      lastName: '',
    })
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-xl lg:max-w-xl xl:max-w-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-xl sm:text-2xl font-medium">
            {translation('editAccountDialog.heading')}
          </DialogTitle>
          <DialogDescription className="text-left text-sm sm:text-base">
            {translation('editAccountDialog.subheading')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium mb-1">
              {translation('createAccountComponent.first_name_label')}
            </p>
            <Input
              name="firstName"
              placeholder={translation('createAccountComponent.first_name_placeholder')}
              value={formData.firstName}
              onChange={handleChange}
              required
              type="text"
              className="w-full"
            />
            {errors.firstName && (
              <p className="text-red-600 text-xs mt-1">
                {translation('createAccountComponent.first_name_error')}
              </p>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs sm:text-sm font-medium mb-1">
              {translation('createAccountComponent.last_name_label')}
            </p>
            <Input
              name="lastName"
              placeholder={translation('createAccountComponent.last_name_placeholder')}
              value={formData.lastName}
              onChange={handleChange}
              required
              type="text"
              className="w-full"
            />
            {errors.lastName && (
              <p className="text-red-600 text-xs mt-1">
                {translation('createAccountComponent.last_name_error')}
              </p>
            )}
          </div>

          <div className="items-top flex space-x-3 mt-6 bg-blue-100 px-4 py-4 rounded-md">
            <Checkbox
              id="isAdmin"
              checked={formData.isAdmin}
              onCheckedChange={handleCheckboxChange}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="isAdmin" className="text-sm font-medium leading-none">
                {translation('createAccountComponent.admin_heading')}
              </label>
              <p className="text-xs font-normal">
                {translation('createAccountComponent.admin_subheading')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-8">
          <Button variant="outline" size={'lg'} onClick={handleClose} className="w-full sm:w-auto">
            {translation('createAccountComponent.cancel_button')}
          </Button>
          <Button onClick={handleSubmit} size={'lg'} className="w-full sm:w-auto">
            {translation('editAccountDialog.apply_button')}
          </Button>
        </div>
        {error && (
          <div className="bg-red-100 text-sm rounded-sm p-4 text-red-700 mt-4">{error}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditAccountDialog
