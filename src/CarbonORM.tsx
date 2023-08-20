import {CarbonReact} from "@carbonorm/carbonreact";
import getCarbons from "api/rest/getCarbons";
import {AxiosResponse} from "axios";
import {iUsers} from "C6";
import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import swal from '@sweetalert/with-react';
import {ppr} from "api/hoc/passPropertiesAndRender";

// This is our ajax class
import {CodeBlock, dracula, googlecode} from 'react-code-blocks';
import axiosInstance from "variables/axiosInstance";

export default class CarbonORM extends CarbonReact<{}, {
    authenticate: string,
    authenticated?: boolean,
    maintenanceMode?: boolean,
    backendThrowable: { [key: string]: any }[],
    pureWordpressPluginConfigured?: boolean,
    documentationVersionURI: string,
    alert?: boolean,
    operationActive: boolean,
    isLoaded: boolean,
    darkMode: boolean,
    alertsWaiting: Array<any>,
    versions: Array<any>,
    users?: Array<iUsers>,
    websocketEvents?: Array<any>,
    websocketData?: Array<any>,
    id?: string
}> {

    static instance: CarbonORM;

    state = {
        carbons: undefined, websocketData: [], websocketEvents: [], websocketMounted: false,
        users: undefined,
        backendThrowable: [],
        maintenanceMode: false,
        authenticate: '/carbon/authenticated',
        documentationVersionURI: '0.0.0',
        authenticated: undefined,
        pureWordpressPluginConfigured: false,
        alert: false,
        operationActive: false,
        isLoaded: false,
        alertsWaiting: [],
        darkMode: true,
        versions: [],
        id: ''
    };

    constructor(props) {
        super(props);
        CarbonORM.instance = this;


        this.switchDarkAndLightTheme = this.switchDarkAndLightTheme.bind(this);
        this.handleResponseCodes = this.handleResponseCodes.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.subRoutingSwitch = this.subRoutingSwitch.bind(this);
        this.semaphoreLock = this.semaphoreLock.bind(this);
        this.testRestfulPostPutDeleteResponse = this.testRestfulPostPutDeleteResponse.bind(this);
        this.codeBlock = this.codeBlock.bind(this);
    }

    codeBlock = (markdown: string, highlight: string = "", language: string = "php", dark: boolean = true) => {
        return <CodeBlock
            // @ts-ignore
            text={markdown}
            language={language}
            showLineNumbers={true}
            // @ts-ignore
            theme={dark ? dracula : googlecode}
            highlight={highlight}
        />
    };

    switchDarkAndLightTheme = () => {
        this.setState({
            darkMode: !this.state.darkMode
        });
    };

    semaphoreLock = <T extends React.Component>(context ?: T): Function =>

        (callback: Function, localLock: boolean = false): Function => (opt ?: any): boolean => {

            const criticalSection = async (): Promise<void> => {
                console.time("Critical Section");
                try {
                    if (context === undefined) {
                        await callback(opt);
                    } else {
                        console.log('opActive: true');
                        await context.setState({operationActive: true}, async () => {
                            await callback(opt);
                            console.log('opActive: false');
                            context.setState({
                                operationActive: false
                            })
                        })
                    }
                } finally {
                    console.timeEnd("Critical Section")
                }
                if (!localLock) {
                    this.setState({
                        operationActive: false
                    })
                }
            };

            const lockError = () => {
                swal({
                    text: 'An issue with out system has occurred.',
                    buttons: {
                        cancel: "Close",
                    }
                })
            };

            if (!this.state.operationActive) {
                if (!localLock) {
                    this.setState({operationActive: true},
                        () => criticalSection().catch(lockError))
                } else {
                    criticalSection().catch(lockError)
                }
                return true;
            }
            return false;
        };


    changeLoggedInStatus = () => {
        this.setState({authenticated: !this.state.authenticated});
    };

    subRoutingSwitch = (routes) => <Routes>{routes.map((prop, key) => {

        console.log('prop', prop);

        if (prop.redirect) {
            if (!prop.pathTo) {
                console.log('bad route redirect,', prop);
                return "";
            }
            return <Route
                key={key}
                path={prop.path}
                element={<><Navigate
                    to={prop.pathTo}
                    key={key}/></>}/>;
        }
        if (prop.views) {
            return prop.views.map((x, key) => {
                return (
                    <Route
                        path={x.path}
                        element={ppr(x.component, {})}
                        key={key}/>
                );
            });
        }
        return <Route
            path={prop.path}
            element={ppr(prop.component, {})}
            key={key}/>;
    })}</Routes>;


    authenticate = () => {

        axiosInstance.get<any, AxiosResponse<{
            versions: string[],
            success: boolean,
            pureWordpressPluginConfigured: boolean,
            authenticated: boolean,
            id: string,
        }, any>>(this.state.authenticate)
            .then(res => {
                console.log("authenticate data: ", res);
                this.setState({
                    id: res?.data?.id || '',
                    pureWordpressPluginConfigured: res?.data?.pureWordpressPluginConfigured || false,
                    authenticated: res?.data?.success || false,
                    versions: res?.data?.versions?.sort((v1: string, v2: string) => {
                        let lexicographical = false,
                            zeroExtend = false,
                            v1parts = v1.split('.'),
                            v2parts = v2.split('.');

                        function isValidPart(x) {
                            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
                        }

                        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
                            return NaN;
                        }

                        if (zeroExtend) {
                            while (v1parts.length < v2parts.length) v1parts.push("0");
                            while (v2parts.length < v1parts.length) v2parts.push("0");
                        }

                        for (let i = 0; i < v1parts.length; ++i) {
                            if (v2parts.length === i) {
                                return 1;
                            }

                            if (v1parts[i] === v2parts[i]) {
                                // noinspection UnnecessaryContinueJS - clarity call
                                continue;
                            } else if (v1parts[i] > v2parts[i]) {
                                return 1;
                            } else {
                                return -1;
                            }
                        }

                        if (v1parts.length !== v2parts.length) {
                            return -1;
                        }

                        return 0;

                    }).reverse() ?? [],
                    isLoaded: true
                });
            })
            .catch(err => {
              console.log("authenticate error: ", err);
                this.setState({
                    isLoaded: true,
                    authenticated: false,
                    versions: ['loading error'],
                })

            })
    };

    testRestfulPostPutDeleteResponse = (response, success, error) => {
        if (('data' in response) && ('rest' in response.data) &&
            (('created' in response.data.rest) ||
                ('updated' in response.data.rest) ||
                ('deleted' in response.data.rest))
        ) {
            if (typeof success === 'function') {
                return success(response);
            }
            if (success === null || typeof success === 'string') {
                swal("Success!", success, "success");
            }

            return response.data.rest?.created ?? response.data.rest?.updated ?? response.data.rest?.deleted ?? true;
        }

        if (typeof error === 'function') {
            return error(response);
        }

        if (error === null || typeof error === 'string') {
            swal("Whoops!", error, "error");
        }

        return false;
    };

    handleResponseCodes = data => {
        console.log("handleResponseCodes data", data);

        interface iAlert {
            intercept?: boolean,
            message?: string,
            title?: string,
            type?: string,
        }

        let handleAlert = (alert: iAlert): void => {

            console.log("alert", Object.assign({}, alert));

            if (alert.intercept === false) {
                return; // recursive ending condition
            }

            swal({
                title: alert.title || 'Danger! You didn\'t set a title in your react alert.',
                text: alert.message || 'An alert was encountered, but no message could be parsed.',
                icon: alert.type || 'error',
            }).then(() => {
                let alertsWaiting = this.state.alertsWaiting;
                let nextAlert = alertsWaiting?.pop();
                this.setState({
                    alert: nextAlert !== undefined,
                    alertsWaiting: alertsWaiting
                }, () => nextAlert !== undefined && handleAlert(nextAlert));     // this is another means to end. note: doesn't hurt
            });

            //
        };

        if (data?.data?.alert) {
            console.log("handleResponseCodes ∈ Bootstrap");

            let a: iAlert = data.data.alert, stack: Array<iAlert> = [];

            // C6 Public Alerts

            ['info', 'success', 'warning', 'danger'].map(value => {
                if (value in a) {
                    a[value].map(message => {
                        stack.push({
                            'intercept': true,    // for now lets intercept all
                            'message': message,
                            'title': value,
                            'type': value,
                        });
                        return null;
                    });
                    console.log("stack", Object.assign({}, stack));
                }
                return false; // free up memory through a map
            });

            if (stack.length === 0) {
                return null;
            }

            if (this.state.alert === true) {
                let alertsWaiting: any = this.state.alertsWaiting;
                alertsWaiting.push(stack);
                this.setState({
                    alertsWaiting: alertsWaiting
                });
                return null;
            }

            let alert = stack.pop();

            if (undefined === alert) {
                return;
            }

            console.log("alert", Object.assign({}, alert));

            this.setState({
                alert: true,
                alertsWaiting: stack
            });

            handleAlert(alert);
        }
    };

    componentDidMount() {
        axiosInstance.interceptors.request.use(req => {
                if (req.method === 'get' && req.url?.match(/^\/rest\/.*$/)) {
                    req.params = JSON.stringify(req.params)
                }
                return req;
            }, error => {
                return Promise.reject(error);
            }
        );
        axiosInstance.interceptors.response.use(
            response => {
                // Do something with response data
                console.log(
                    "Every Axios response is logged in login.jsx :: ",
                    response
                );
                if (response?.data?.alert) {
                    console.log("alert ∈ response");
                    this.handleResponseCodes(response);
                    return (response?.data?.alert?.error || response?.data?.alert?.danger) ?
                        Promise.reject(response) :
                        response;
                }
                return response;
            },
            error => {
                this.handleResponseCodes(error.response);
                console.log("Carbon Axios Caught A Response Error response :: ", error.response);
                return Promise.reject(error);
            }
        );

        getCarbons()

        this.authenticate();
    }

    render() {
        console.log("LOGIN JSX RENDER");

        const {isLoaded, authenticated, alert} = this.state;

        if (!isLoaded) {

            return <h2>Loading...</h2>;

        }

        return (
            <div>
                {alert}
                {authenticated
                    ? 'is authenticated'
                    : 'is not authenticated'}
            </div>
        );

    }
}

