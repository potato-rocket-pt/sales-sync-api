import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Router, withCORS } from '@devyethiha/samjs';
import DefaultController from './default/default.controller';
import CreateContactController from './contact/create-contact.controller';
import { ContactService } from './contact/contact.service';
import FormController from './form/form.controller';
import { FormService } from './form/form.service';
import ContactController from './contact/contact.controller';

async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const region = 'ap-southeast-2';
    try {
        const router = new Router(
            event,
            region,
            [
                { controller: DefaultController, services: [ContactService, FormService] },
                {
                    controller: CreateContactController,
                    services: [ContactService],
                },
                {
                    controller: ContactController,
                    services: [ContactService],
                },
                {
                    controller: FormController,
                    services: [FormService],
                },
            ],
            '/crm',
        );

        return router.handle();
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
}

export const lambdaHandler = withCORS(main, [
    'https://app.salessync.biz',
    'https://staging.salessync.biz',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]);
