import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'src/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { db, functions, auth } from '../../firebase/firebase'
import { useToast } from 'src/components/ui/use-toast'
import { useAuth } from '../../auth/AuthProvider'
import { httpsCallable } from 'firebase/functions'
import { signOut } from "firebase/auth";

interface HealthcareProfessional {
  uid: string
  firstName: string
  lastName: string
  email: string
}

interface DeleteAccountDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accountToDelete: HealthcareProfessional | null
}

const DeleteAccountDialog = ({
  isOpen,
  onClose,
  onSuccess,
  accountToDelete,
}: DeleteAccountDialogProps) => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [translation] = useTranslation('global')
  const { userData, user } = useAuth()
  const deleteUser = httpsCallable(functions, 'deleteHealthcareProfessionals')
  const handleDelete = async () => {
    if (!accountToDelete) return

    try {
      setLoading(true)
      await deleteUser({ uid: accountToDelete.uid })

      const accountDocRef = doc(db, 'healthcareProfessionals', accountToDelete.uid)
      await deleteDoc(accountDocRef)

      if (!userData) return
      const clinicDocRef = doc(db, 'clinics', userData?.clinicID)
      await updateDoc(clinicDocRef, {
        healthcareProfessionals: arrayRemove(accountToDelete.uid),
      })

      toast({
        className: 'bg-green-200 border border-green-500 text-green-900',
        title: translation('deleteAccountComponent.toast_success_heading'),
        description: translation('deleteAccountComponent.toast_success_subheading'),
      })

      onSuccess()
      onClose()

      // Check if the deleted account is the current user's account
      if (user && accountToDelete.uid === user.uid) {
        await signOut(auth)
      }
    } catch (error) {
      console.error('Error deleting account: ', error)
      toast({
        className: 'bg-red-200 border border-red-500 text-red-900',
        title: translation('deleteAccountComponent.toast_error_heading'),
        description: translation('deleteAccountComponent.toast_error_subheading'),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='text-2xl font-medium text-left'>{translation('deleteAccountComponent.delete_button')}</DialogTitle>
        </DialogHeader>
        <div className="text-md text-gray-600 mt-4">
          {`${translation('deleteAccountComponent.delete_account_confirmation')}${accountToDelete?.firstName} ${accountToDelete?.lastName}?`}
        </div>
        <div className='w-full px-4 py-4 bg-red-100 rounded-sm mt-2'>
          <p className='text-red-800 text-sm'>{translation('deleteAccountComponent.delete_account_explanation')}</p>
        </div>
        <div className="flex justify-end mt-8 gap-2">
          <Button variant="outline" size="lg" onClick={onClose}>
            {translation('deleteAccountComponent.cancel_button')}
          </Button>
          <Button variant="destructive" size="lg" onClick={handleDelete}>
            {translation('deleteAccountComponent.delete_button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAccountDialog
