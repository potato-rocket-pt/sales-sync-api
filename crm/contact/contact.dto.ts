import { IB2BContact, IB2CContact, IContact, IContactItem } from '@sales-sync/shared';

// Refractor: Need to use zod for DTO
export type ICreateContactDto = Omit<IContact, 'id'>;

export type IAddContactItemDto =
    | ({ contact_id: string } & Omit<IB2BContact, 'id'>)
    | ({ contact_id: string } & Omit<IB2CContact, 'id'>);
