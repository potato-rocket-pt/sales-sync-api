import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Router, withCORS } from '@devyethiha/samjs';
import DefaultController from './default/default.controller';
import { WorkspaceService } from './services/workspace.service';

async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const region = 'ap-southeast-2';
    try {
        const router = new Router(
            event,
            region,
            [{ controller: DefaultController, services: [WorkspaceService] }],
            '/workspace',
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
