import {AxiosResponse} from "axios";
import {toast} from "react-toastify";
import {setCookies} from "api/hoc/axiosInterceptors";
import CarbonORM from "CarbonORM";
import axiosInstance from "variables/axiosInstance";
import toastOptions from "variables/toastOptions";


export default async function logout(userDeleted = false): Promise<null|AxiosResponse<any>> {

    console.groupCollapsed('%c logout', 'color: #cc0')
    console.trace();
    console.groupEnd()

    const bootstrap = CarbonORM.instance;

    if (undefined === bootstrap.state.id) {

        toast.error('Failed to change the logged in status! Please contact Drop-In Gaming if problems persist.', toastOptions.toastOptions)

        return null;

    }

    const clearCookies = () => setCookies(document.cookie.split(";").map(function(c) {

        // we need to keep some cookies, even removing all and setting back immediately will run into race conditions
        if (c.includes('dropDeveloper') || c.includes('XDEBUG_SESSION')) {

            return c;

        }

        return c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");

    }));

    const clearState = () => bootstrap.setState({
        id: undefined,
        websocketEvents: [],
        websocketData: [],
        alertsWaiting: [],
    });

    if (false === userDeleted) {

        clearState()

        let promise = await axiosInstance.get('/logout/');

        clearCookies();

        // redirect hard to clear local state
        window.location.href = window.location.href + '#logout';

        return promise;

    }

    localStorage.clear();

    clearState()

    clearCookies();

    return null;

}