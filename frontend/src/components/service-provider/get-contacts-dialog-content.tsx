'use client';

import { useContext, useEffect, useState } from 'react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { SessionContext } from '@/context/session-context';
import api from '@/lib/api';
import { EmergencyContact } from '@/types/emergency-contact';
import { EmergencyContactDto } from '@/dto/dto';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import ViewContactForm from './view-contact-form';

type Props = {
  ownerEmail: string;
};

const GetContactsDialogContent = ({ ownerEmail }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<Array<EmergencyContact>>([]);
  const { session } = useContext(SessionContext);

  // Fetch all of the owner's emergency contacts from the API
  const getContacts = async () => {
    setIsLoading(true);
    api
      .get(`/emergency_contacts/${ownerEmail}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      })
      .then((response) => {
        // Parse each emergency contact from the response
        const newContacts: Array<EmergencyContact> = [];
        const data: Array<EmergencyContactDto> = response.data;
        data.forEach((contact) => {
          const contactData: EmergencyContact = {
            phoneNumber: contact.phone_num,
            ...(contact.email ? { email: contact.email } : {}),
            relationship: contact.relationship,
            firstName: contact.f_name,
            lastName: contact.l_name,
          };
          newContacts.push(contactData);
        });
        setContacts(newContacts);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to get emergency contacts: ${apiError}`);
        } else {
          console.error(error);
          toast.error('Failed to get emergency contacts. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getContacts();
  }, []);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold">
          Emergency Contacts
        </DialogTitle>
        <DialogDescription className="sr-only">
          Use this form to write a review.
        </DialogDescription>
      </DialogHeader>
      {isLoading ? (
        <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />
      ) : contacts.length === 0 ? (
        <div className="flex justify-center">
          <p className="text-muted-foreground">
            No emergency contacts available.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Render a card for each emergency contact */}
          {contacts.map((contact, id) => (
            <Card key={id} className="border-3">
              <CardContent>
                <ViewContactForm emergencyContact={contact} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DialogContent>
  );
};

export default GetContactsDialogContent;
