import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Checkbox } from 'src/components/ui/checkbox'
import { auth, db, functions } from '../../firebase/firebase' // Ensure the correct path to your Firebase config
import { sendPasswordResetEmail } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { useAuth } from '../../auth/AuthProvider'
import { useToast } from 'src/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import useClinicServices from '../../hooks/useClinicServices'

interface CreateHealthcareProfessionalResponse {
  message?: string
  error?: string
  password?: string
  email: string
}

interface NewAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  onAccountCreated: () => void
}

const NewAccountDialog: React.FC<NewAccountDialogProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
}) => {
  const [translation] = useTranslation('global')
  const { userData } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isAdmin: false,
  })
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { toast } = useToast()
  const { updateStripeSubscription, isPaymentReceived } = useClinicServices(userData)

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
      email: '',
    }
    let isValid = true

    if (!formData.firstName.trim()) {
      newErrors.firstName = translation('createAccountComponent.first_name_error')
      isValid = false
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = translation('createAccountComponent.last_name_error')
      isValid = false
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true)
        const createHealthcareProfessional = httpsCallable(
          functions,
          'createHealthcareProfessional'
        )
        const response = (await createHealthcareProfessional({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          isAdmin: formData.isAdmin,
          clinicID: userData?.clinicID,
          clinicName: userData?.clinicName,
          clinicAddress: userData?.clinicAddress,
          clinicCity: userData?.clinicCity,
          clinicCountry: userData?.clinicCountry,
          paymentCheck: await isPaymentReceived(),
        })) as { data: CreateHealthcareProfessionalResponse }

        if (response.data.message === 'Account created successfully') {
          await sendPasswordResetEmail(auth, response.data.email)

          onClose()

          toast({
            className: 'bg-green-200 border border-green-500 text-green-900',
            title: translation('createAccountComponent.success_toast'),
            description:
              translation('createAccountComponent.success_subtext_toast_one') +
              response.data.email +
              translation('createAccountComponent.success_subtext_toast_two'),
          })

          onAccountCreated()

          // Reset the form and errors
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            isAdmin: false,
          })
          setErrors({
            firstName: '',
            lastName: '',
            email: '',
          })
        } else if (response.data.error) {
          setError(response.data.error)
        }
      } catch (error: any) {
        setLoading(false)
        const errorMessage = (error as { message?: string }).message || 'An unknown error occurred'
        if (errorMessage.includes('email-already-in-use')) {
          setError('This email address is already in use.')
        } else if (errorMessage.includes('weak-password')) {
          setError('Please set a stronger password.')
        } else if (errorMessage.includes('invalid-email')) {
          setError('The email address is not valid.')
        } else if (errorMessage.includes('functions')) {
          setError('Error with the cloud function. Please contact support.')
        } else {
          setError('Error creating user. Please try again.')
        }
      } finally {
        setLoading(false)
        updateStripeSubscription()
      }
    }
  }

  // Reset form and errors on close
  const handleDialogClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      isAdmin: false,
    })
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
    })
    setError('')
    setSuccess('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-2xl font-medium">
            {translation('createAccountComponent.heading')}
          </DialogTitle>
          <DialogDescription className="text-left">
            {translation('createAccountComponent.subheading')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium mb-1">
              {translation('createAccountComponent.first_name_label')}
            </p>
            <Input
              name="firstName"
              placeholder={translation('createAccountComponent.first_name_placeholder')}
              value={formData.firstName}
              onChange={handleChange}
              required
              type="text"
            />
            {errors.firstName && (
              <p className="text-red-600 text-xs mt-1">
                {translation('createAccountComponent.first_name_error')}
              </p>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">
              {translation('createAccountComponent.last_name_label')}
            </p>
            <Input
              name="lastName"
              placeholder={translation('createAccountComponent.last_name_placeholder')}
              value={formData.lastName}
              onChange={handleChange}
              required
              type="text"
            />
            {errors.lastName && (
              <p className="text-red-600 text-xs mt-1">
                {translation('createAccountComponent.last_name_placeholder')}
              </p>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">
              {translation('createAccountComponent.email_label')}
            </p>
            <Input
              name="email"
              placeholder={translation('createAccountComponent.email_placeholder')}
              value={formData.email}
              onChange={handleChange}
              required
              type="email"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">
                {translation('createAccountComponent.email_error')}
              </p>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs font-medium mb-1">
              {translation('createAccountComponent.password')}
            </p>
            <Input
              name="password"
              value="RandomGeneratedPassword"
              required
              type="password"
              disabled
              className="bg-gray-300 border-gray-400"
            />
            <p className="text-sm font-normal mt-4 text-blue-600">
              {translation('createAccountComponent.password_subheading')}
            </p>
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
        <div className="flex justify-end gap-2 mt-8">
          <Button variant="outline" size={'lg'} onClick={handleDialogClose}>
            {translation('createAccountComponent.cancel_button')}
          </Button>
          <Button onClick={handleSubmit} size={'lg'} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            {loading
              ? translation('signUpPage.waiting_text')
              : translation('createAccountComponent.create_account_button')}
          </Button>
        </div>
        {error && (
          <div className="bg-red-100 text-sm rounded-sm p-4 text-red-700 mt-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-sm rounded-sm p-4 text-green-700 mt-4">{success}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default NewAccountDialog
