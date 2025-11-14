import { Card, CardContent } from '@/components/ui/card';
import EmergencyContactForm from '@/components/owner/emergency-contact-form';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  emergencyContact: EmergencyContact;
  isEditingAContact: boolean;
  setIsEditingAContact: React.Dispatch<React.SetStateAction<boolean>>; // Called to notify parent when this card is being edited
  updateContact: (
    oldPhoneNumber: string,
    newContactData: EmergencyContact
  ) => Promise<void>;
  deleteContact: (phoneNumber: string) => Promise<void>;
};

// Base card to view and manage an emergency contact
const EmergencyContactCard = ({
  emergencyContact,
  isEditingAContact,
  setIsEditingAContact,
  updateContact,
  deleteContact,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card
      className={`border-3 ${isEditing ? 'border-teal-400/50' : 'hover:cursor-pointer hover:opacity-60'}`}
      onClick={() => {
        if (!isEditing) {
          // Check if another dog is already being edited
          if (isEditingAContact) {
            toast.warning(
              'Only one emergency contact can be edited at a time!'
            );
          } else {
            setIsEditing(true);
            setIsEditingAContact(true);
          }
        }
      }}
    >
      <CardContent>
        <EmergencyContactForm
          emergencyContact={emergencyContact}
          isEditing={isEditing}
          setIsEditing={(val) => {
            setIsEditing(val);
            setIsEditingAContact(val);
          }}
          updateContact={updateContact}
          deleteContact={deleteContact}
        />
      </CardContent>
    </Card>
  );
};

export default EmergencyContactCard;
