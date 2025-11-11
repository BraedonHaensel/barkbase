import { Card, CardContent } from '@/components/ui/card';
import EmergencyContactForm from '@/components/owner/emergency-contact-form';
import { useState } from 'react';

type Props = {
  emergencyContact?: EmergencyContact;
};

// Base card to view and manage an emergency contact
const EmergencyContactCard = ({ emergencyContact }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card
      className={`border-3 ${!isEditing && 'hover:cursor-pointer hover:opacity-60'}`}
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
    >
      <CardContent>
        <EmergencyContactForm
          emergencyContact={emergencyContact}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </CardContent>
    </Card>
  );
};

export default EmergencyContactCard;
