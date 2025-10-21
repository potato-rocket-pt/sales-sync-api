import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Service } from '@devyethiha/samjs';
import { IContact, IContactItem } from '@sales-sync/shared';
import { v4 as uuidv4 } from 'uuid';
import { IAddContactItemDto, ICreateContactDto } from './contact.dto';

export interface IContactService {
    createContact: (param: ICreateContactDto) => Promise<IContact>;
    addContactItem: (param: IAddContactItemDto) => Promise<IContactItem>;
    getContactItems(contact_id: string): Promise<IContactItem[]>;
    getContacts: (workspace_uuid: string) => Promise<IContact[]>;
}

export class ContactService extends Service implements IContactService {
    private DB_Client: DynamoDBClient;

    constructor(DB_Client: DynamoDBClient) {
        super('contact');
        this.DB_Client = DB_Client;
    }

    public async createContact(param: ICreateContactDto) {
        try {
            const data: IContact = {
                id: uuidv4(),
                ...param,
            };

            await this.DB_Client.send(
                new PutCommand({
                    TableName: 'sales-sync-crm',
                    Item: {
                        pk: `WORKSPACE#${data.workspace_uuid}#CONTACT`,
                        sk: `CONTACT#${data.id}`,
                        data: JSON.stringify(data),
                    },
                }),
            );
            return data;
        } catch (error) {
            console.log({ error });
            throw Error(JSON.stringify(error));
        }
    }

    public async addContactItem(param: IAddContactItemDto) {
        try {
            const data: IContactItem = {
                id: uuidv4(),
                ...param,
            };

            await this.DB_Client.send(
                new PutCommand({
                    TableName: 'sales-sync-crm',
                    Item: {
                        pk: `CONTACT#${param.contact_id}`,
                        sk: `METADATA#`,
                        data: JSON.stringify(data),
                    },
                }),
            );
            return data;
        } catch (error) {
            console.log({ error });
            throw Error(JSON.stringify(error));
        }
    }

    public async getContactItems(contact_id: string): Promise<IContactItem[]> {
        try {
            const command = new QueryCommand({
                TableName: 'sales-sync-crm',
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': `CONTACT#${contact_id}`,
                    ':skPrefix': 'METADATA#',
                },
            });

            const res = await this.DB_Client.send(command);
            const items = res.Items ?? [];

            // Your createContact stores JSON in the "data" attribute
            const contact_items = items.map((it) => JSON.parse(it.data as string) as IContactItem);

            return contact_items;
        } catch (error) {
            console.error('Failed to get contact', error);
            throw Error('Failed to get contacts');
        }
    }

    public async getContacts(workspace_uuid: string): Promise<IContact[]> {
        try {
            const command = new QueryCommand({
                TableName: 'sales-sync-crm',
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': `WORKSPACE#${workspace_uuid}#CONTACT`,
                    ':skPrefix': 'CONTACT#',
                },
            });

            const res = await this.DB_Client.send(command);
            const items = res.Items ?? [];

            // Your createContact stores JSON in the "data" attribute
            const contacts = items.map((it) => JSON.parse(it.data as string) as IContact);

            return contacts;
        } catch (error) {
            console.error('Failed to get contact', error);
            throw Error('Failed to get contacts');
        }
    }
}
