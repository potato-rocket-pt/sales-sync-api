import { APIGatewayProxyEvent } from 'aws-lambda';
import { jwtDecode } from 'jwt-decode';

type IUser = {
    id: string;
    name: string;
    email: string;
    email_verified: string;
};

export const isAuthorize = (event: APIGatewayProxyEvent): boolean => {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    let authValue = null;
    let uid = null;

    if (cookieHeader) {
        const cookies = Object.fromEntries(
            cookieHeader.split(';').map((c) => {
                const [k, v] = c.trim().split('=');
                return [k, decodeURIComponent(v)];
            }),
        );
        console.log({
            cookies,
        });
        authValue = cookies['Authentication'] || null;
        if (!authValue) return false;
        // authValue = JSON.parse(cookies['Authentication']);

        uid = cookies['Identifier'] || null;
        if (!uid) return false;
        // uid = JSON.parse(cookies['Identifier']);
        return true;
    }

    return false;
};

export const getUser = (event: APIGatewayProxyEvent): IUser | null => {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    let uid = null;

    if (cookieHeader) {
        const cookies = Object.fromEntries(
            cookieHeader.split(';').map((c) => {
                const [k, v] = c.trim().split('=');
                return [k, decodeURIComponent(v)];
            }),
        );
        console.log({
            cookies,
        });

        uid = cookies['Identifier'] || null;
        if (!uid) return null;
        const obj = jwtDecode(uid) as any;
        const user = {
            id: obj.sub ?? '',
            name: obj.name ?? '',
            email: obj.email ?? '',
            email_verified: obj.email_verified ?? false,
        };
        return user;
        // uid = JSON.parse(cookies['Identifier']);
    }

    return null;
};

export const UNAUTHORIZE_ERROR = {
    statusCode: 401,
    body: JSON.stringify({
        message: 'Unauthorize Error',
    }),
};

export const NO_USER = {
    statusCode: 404,
    body: JSON.stringify({
        message: 'User not found',
    }),
};
