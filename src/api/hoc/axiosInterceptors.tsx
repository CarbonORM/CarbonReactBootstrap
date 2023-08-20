import {AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse} from "axios";
import {iAlert} from "components/alert/Alert";
import isTest from "variables/isTest";
import isVerbose from "variables/isVerbose";
import logout from "api/hoc/logout";
import {parseMultipleJson} from "api/hoc/parseMultipleJson";
import {addValidSQL} from "api/hoc/validSQL";
import CarbonORM from "CarbonORM";


export function HandleResponseCodes(data: any): void {

    const bootstrap: CarbonORM = CarbonORM.instance

    if (undefined === data?.data?.alert) {
        return;
    }

    if (Array.isArray(data.data.alert) === false) {

        throw new Error("data.data.alert is not an array (" + JSON.stringify(data.data.alert) + ")");

    }

    console.log("handleResponseCodes ∈ Bootstrap");

    let stack: Array<iAlert> = data.data.alert;

    if (stack.length === 0) {

        return;

    }

    bootstrap.setState(previousState => {

        previousState.alertsWaiting.push(...stack)

        return {

            alertsWaiting: previousState.alertsWaiting

        }
    });

}

export function setCookies(cookies: string[], req: AxiosResponse | undefined = undefined): void {

    console.log("Setting cookies", cookies);

    cookies.map(cookie => {

        const newCookie = cookie
            .replace("HttpOnly", "")
            .replace("secure", "");

        if (document === undefined || document === null) {

            const getStackTrace = function () {
                let obj: any = {};
                Error.captureStackTrace(obj, getStackTrace);
                return obj.stack;
            };

            console.error(req)

            console.log('Testing error, document not defined', req)

            throw new Error("Document is undefined while trying to set cookie: (" + newCookie + ") in axiosInterceptors.tsx after (" + JSON.stringify([req?.config, req?.data], undefined, 4) + ") Please make sure all requests are wrapped in an act() from import {act} from '@testing-library/react'; (" + JSON.stringify(getStackTrace(), undefined, 4) + ")");

        }

        document.cookie = newCookie

    });

}

export default function axiosInterceptors(axios: AxiosInstance): void {

    if (isTest) {

        axios.defaults.adapter = require('axios/lib/adapters/http')

    }

    axios.interceptors.request.use(
        req => {

            setCookies([
                'github_revision=' + process.env.REACT_APP_GITHUB_REVISION + '; path=/',
            ])

            if (isTest) {

                setCookies([
                    'dropDeveloper=554378!@#$(K-asSfdsf-fd!@#$439; path=/',
                    'XDEBUG_SESSION=start; path=/'
                ])

                req.headers ??= {} as AxiosRequestHeaders

                req.headers['Cookie'] = document.cookie;

            }

            if (true === isVerbose) {

                console.log(req.method, req.url, req.data)

                const log = {
                    baseURL: req.baseURL,
                    url: req.url,
                    method: req.method,
                    headers: req.headers,
                    data: req.data,
                    params: req.params,
                };

                console.groupCollapsed("Every Axios request is logged in axiosInterceptors.tsx :: <" + req.method + ">(" + req.url + ")");

                console.log(log);

                console.groupEnd();

            }

            return req;

        }
    );

    function logResponseSetCookiesForTests(response: AxiosResponse | any) {

        // axios sets cookies correctly; just not in jest tests
        if (isTest && response?.headers?.['set-cookie']) {

            setCookies(response?.headers?.['set-cookie'], response)

        }

        if (true === isVerbose) {

            if (response?.response) {

                response = response.response;

            }

            // JSON is so it prints completely in intellij run console
            if (isTest && isVerbose) {

                console.debug(
                    "Every Axios response is logged in axiosInterceptors.tsx :: ",
                    JSON.stringify({
                        baseURL: response.config.baseURL,
                        uri: response.config?.url,
                        status: response?.status,
                        statusText: response?.statusText,
                        headers: response?.headers,
                        data: response?.data,
                    }, undefined, 4)
                );

            }

        }

    }

    axios.interceptors.response.use(
        response => {

            logResponseSetCookiesForTests(response);

            if (undefined !== response?.data?.TRACE) {

                if (isTest) {

                    throw new Error(JSON.stringify(response.data, undefined, 4))

                }

                CarbonORM.instance.setState((previous) => (
                    {
                        backendThrowable: [
                            ...previous.backendThrowable,
                            response?.data
                        ]
                    }))

                return response;

            }

            if (null !== CarbonORM.instance.state.id
                && response?.data?.session?.['@close']?.id !== CarbonORM.instance.state.id
                && response?.data?.session?.id !== CarbonORM.instance.state.id) {

                console.groupCollapsed('%c Session ('+CarbonORM.instance.state.id+') Ended', 'color: #0c0')

                console.log(response?.data, 'session data invalid', CarbonORM.instance.state.id)

                console.trace()

                console.groupEnd()

                if (isTest) {

                    throw new Error('The <' + response.config.method + '>(' + response.config.url + ') response did not have the correct user (' + CarbonORM.instance.state.id + ') session info \n(' + JSON.stringify(response.data, undefined, 4) + ') needed are present! (' + JSON.stringify(response.data) + ')')

                }

                logout().then(() => {

                    console.warn(response?.data?.session ?? response?.data, 'Users was logged out due to session ending')

                });

                return Promise.reject(response)

            }

            if (isTest) {

                if (Array.isArray(response?.data?.sql)) {

                    addValidSQL(response.data.sql)

                }

            }

            // DO NOT REMOVE THIS - if an alert annoys you, fix it; it annoys our users too
            if (response?.data?.alert) {

                console.log("alert ∈ response");

                HandleResponseCodes(response);

            }

            return response;

        },// @link https://stackoverflow.com/posts/75956421
        async error => {

            // @link https://stackoverflow.com/questions/56074531/how-to-retry-5xx-requests-using-axios/75956421#75956421
            if (error?.config?.headers?.['X-Retry-Count'] !== undefined) {

                console.log('X-Retry-Count', error?.config?.headers?.['X-Retry-Count'])

                if (false === isTest || true === isVerbose) {

                    console.log(error)

                }

                return error;

            }

            logResponseSetCookiesForTests(error);

            error.response ??= {};

            error.response.status ??= 520;

            const shouldRetry = (error) => undefined !== error.config && error?.response?.status >= 500 && error?.response?.status < 600

            const firstRetry = shouldRetry(error)

            if (false === isTest || true === isVerbose) {

                console.group("Retrying request ", error.config?.url ?? error.config);
                console.log(error);
                console.groupEnd();

            } else if (isTest) {

                console.log('AXIOS ERROR', error.code, error.baseURL, error.config?.url, error.headers, error.data, error.params, error.path, error.response?.status, error.response?.statusText, error.response?.headers, error.response?.data)

                if (false === firstRetry) {

                    throw new Error(error?.response?.status + ' ' + JSON.stringify(error?.response?.data, undefined, 4))

                }

            }

            if (false === firstRetry) {

                console.error("Error in axiosInterceptors.tsx (Not attempting retry)", error);

                if (undefined !== error?.response?.data?.TRACE ||
                    undefined === error?.response?.data?.alert) {

                    if (isTest) {

                        throw new Error(error?.response.data['CarbonPHP\\Error\\PublicAlert'] ?? error?.response.data['DropInGaming\\PHP\\Errors\\DropException'] ?? JSON.stringify(error?.response.data, undefined, 4))

                    }

                    console.log('backend throwable', error?.response?.data || error?.response)

                    if (undefined !== error?.response?.data
                        && Array.isArray(error.response.data)) {

                        error.response.data.status = error?.response?.status

                    }

                    // if string try to see if malformed json
                    const jsonErrors = parseMultipleJson(error?.response?.data || error?.response || error)

                    CarbonORM.instance.setState((previous) => (
                        {
                            backendThrowable: [
                                ...previous.backendThrowable,
                                ...jsonErrors
                            ]
                        }))


                    return Promise.reject(error);

                }

                /* Do something with response error
                   this changes from project to project depending on how your server uses response codes.
                   when you can control all errors universally from a single api, return Promise.reject(error);
                   is the way to go.
                */
                HandleResponseCodes(error.response);


                return Promise.reject(error);

            }

            console.warn("Error in axiosInterceptors.tsx - Attempting retry!!!");

            const config: AxiosRequestConfig = error.config

            // @link https://stackoverflow.com/questions/3561381/custom-http-headers-naming-conventions
            let retries = parseInt(config.headers?.['X-Retry-Count'] ?? '0');

            const maxRetries = isTest ? 5 : 3;

            // todo - handle retries better
            while (retries < maxRetries) {

                config.headers = {
                    ...config.headers,
                    'X-Retry-Count': `${++retries}`
                }

                try {

                    // @link https://stackoverflow.com/questions/51563821/axios-interceptors-retry-original-request-and-access-original-promise
                    return axios(config)

                } catch (err) {

                    error = err;

                    console.log('AXIOS ERROR', error.code, error.baseURL, error.config?.url, error.headers, error.data, error.params, error.path, error.response?.status, error.response?.statusText, error.response?.headers, error.response?.data)

                    if (false === shouldRetry(error)) {

                        break;

                    }

                }

            }

            console.log(`Too many request retries.`);

            return Promise.reject(error);

        });

}

