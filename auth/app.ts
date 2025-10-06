import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Router } from '@devyethiha/samjs';
import LoginController from './login/login.controller';
import { AuthService } from './services/auth.service';
import { withCORS } from './middlewares/cors';

async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const region = 'ap-southeast-2';
    try {
        const router = new Router(event, region, [{ controller: LoginController, services: [AuthService] }], '/auth');

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

export const lambdaHandler = withCORS(main);
