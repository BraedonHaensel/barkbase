'use client';

import EmergencyContactCard from '@/components/owner/emergency-contact-card';
import { SessionContext } from '@/context/session-context';
import { AccountType } from '@/enums/account-type';
import { SquarePlus, LoaderCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { EmergencyContact } from '@/types/emergency-contact';
import { UserContext } from '@/context/user-context';
import { EmergencyContactDto } from '@/dto/dto';

// Emergency contacts management page
export default function EmergencyContactsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState<Array<EmergencyContact>>([]);
  const [isEditingAContact, setIsEditingAContact] = useState(false);
  const { session } = useContext(SessionContext);
  const { user } = useContext(UserContext);

  // A session is required
  useEffect(() => {
    if (!session || session.accountType !== AccountType.OWNER) {
      redirect('/login');
    }
  }, [session]);

  // Fetch all of the owner's emergency contacts from the API
  const getContacts = async () => {
    setIsLoading(true);
    api
      .get(`/emergency_contacts/${user?.email}`, {
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

  // Create a new emergency contact
  const createContact = async (contactData: EmergencyContact) => {
    api
      .post(
        '/emergency_contacts',
        {
          phone_num: contactData.phoneNumber,
          relationship: contactData.relationship,
          f_name: contactData.firstName,
          l_name: contactData.lastName,
          ...(contactData.email ? { email: contactData.email } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message);
        // Refresh the owner's contacts
        getContacts();
        setIsEditingAContact(false);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to save changes: ${apiError}`);
        } else {
          console.error(error);
          toast.error(`Failed to save changes. Please try again.`);
        }
      });
  };

  // Update the details for an existing emergency contact
  const updateContact = async (
    oldPhoneNumber: string,
    newContactData: EmergencyContact
  ) => {
    // Check if this is a new emergency contact
    if (oldPhoneNumber === '') {
      // This is a new emergency contact, use a POST request to create it
      createContact(newContactData);
      return;
    }

    // TODO Support editing contacts?
    // Updating an existing emergency contact
    // Add old_phone_number field if the contact's phone number changed
    // if (oldPhoneNumber !== newContactData.phoneNumber) {
    //   formData.append('old_phone_number', oldPhoneNumber);
    // }
    api
      .put(
        '/TODO',
        {
          phone_num: newContactData.phoneNumber,
          relationship: newContactData.relationship,
          f_name: newContactData.firstName,
          l_name: newContactData.lastName,
          email: newContactData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message);
        // Refresh the owner's emergency contacts
        getContacts();
        setIsEditingAContact(false);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to save changes: ${apiError}`);
        } else {
          console.error(error);
          toast.error(`Failed to save changes. Please try again.`);
        }
      });
  };

  // Delete an emergency contact
  const deleteContact = async (phoneNumber: string) => {
    if (phoneNumber === '') {
      // This is the newest emergency contact. Delete it directly
      setContacts((prevContacts) => {
        return prevContacts.slice(0, -1);
      });
      toast.success('Emergency contact successfully deleted');
      setIsEditingAContact(false);
      return;
    }
    api
      .delete('/emergency_contacts', {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
        data: {
          phone_num: phoneNumber,
        },
      })
      .then((response) => {
        toast.success(response.data.message);
        // Refresh the owner's emergency contacts
        getContacts();
        setIsEditingAContact(false);
      })
      .catch((error) => {
        // Handle request errors
        const apiError = error?.response?.data?.error;
        if (apiError) {
          console.error(`API error: ${apiError}`);
          toast.error(`Failed to delete: ${apiError}`);
        } else {
          console.error(error);
          toast.error(`Failed to delete. Please try again.`);
        }
      });
  };

  return isLoading ? (
    <LoaderCircle className="mx-auto mt-3 h-10 w-10 animate-spin" />
  ) : (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <p style={{ fontSize: '35px' }} className="text-center font-bold">
        Emergency Contacts
      </p>
      <div className="grid min-w-[400px] gap-6 md:grid-cols-2">
        {/* Render a card for each emergency contact */}
        {contacts.map((contact, id) => (
          <EmergencyContactCard
            key={id}
            emergencyContact={contact}
            isEditingAContact={isEditingAContact}
            setIsEditingAContact={setIsEditingAContact}
            updateContact={updateContact}
            deleteContact={deleteContact}
          />
        ))}
        {/* Add new emergency contacts button */}
        <div
          className={`flex min-h-50 items-center justify-center ${contacts.length % 2 == 0 && 'md:col-span-2'}`}
        >
          <SquarePlus
            className="text-teal-600 hover:cursor-pointer hover:opacity-60"
            size={50}
            onClick={() => {
              // Check for max number of emergency contacts
              if (contacts.length >= 2) {
                toast.warning('Maximum number of emergency contacts reached!');
                return;
              }

              // Check if another emergency contact is currently being edited
              if (isEditingAContact) {
                toast.warning(
                  'Finish editing all emergency contacts before adding a new one!'
                );
                return;
              }

              // Check if the previous emergency contact is new and needs to be saved first
              if (
                contacts.length >= 1 &&
                contacts[contacts.length - 1].phoneNumber === ''
              ) {
                toast.warning(
                  'Save the previous emergency contact before adding a new one!'
                );
                return;
              }

              setContacts((prevContacts) => {
                const newContact: EmergencyContact = {
                  phoneNumber: '',
                  relationship: '',
                  firstName: '',
                  lastName: '',
                };
                return [...prevContacts, newContact];
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
