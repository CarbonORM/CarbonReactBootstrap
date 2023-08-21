import classNames from "classnames";
import {ReactNode} from "react";
import getCurrentLoggedInUser from "api/hoc/getCurrentLoggedInUser";
import {getRootStyleValue} from "api/hoc/getStyles";
import RootStyles from "index"


import CarbonORM from "CarbonORM";
import Popup from "components/Popup/Popup";
import {faClose} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import isWWW from "../../variables/isWWW";

//  'digBtnBlue': string;
//   'digBtnGreen': string;
//   'digBtnLightRed': string;
//   'digBtnRed': string;
export interface iAlertButtonOptions {
    text: string,
    value?: string,
    className?: string,
    color: "default" | "primary" | "secondary" | "inherit" | "danger" | "info" | "success" | "warning" | undefined,
}

export function addAlert(props: iAlert) {

    CarbonORM.instance.setState(previousState => ({
        alertsWaiting: previousState.alertsWaiting.length === 0
            ? [props]
            : [...previousState.alertsWaiting, props]
    }))

}

export interface iAlert {
    title: string,
    text: string,
    component?: ReactNode,
    icon?: "warning" | "error" | "success" | "info" | "question" | null,
    buttons?: (iAlertButtonOptions)[] | undefined, //['No thanks!', 'Yes, Delete it'],
    dangerMode?: true,
    then?: (value: string | undefined) => void,
    timeout?: number,
    footerText?: string,

    intercept?: boolean,
    backendThrowable?: { [key: string]: any },
}

export default function Alert() {

    const {alertsWaiting, backendThrowable} = CarbonORM.instance.state

    let alert: iAlert | undefined = undefined;

    const alertWaiting = alertsWaiting.length + backendThrowable.length

    if (backendThrowable.length !== 0) {

        const buttons: iAlertButtonOptions[] = [{
            text: 'Close',
            color: 'danger',
        }];

        const user = getCurrentLoggedInUser()

        const hideExpandInformation = (undefined === user) && isWWW()

        if (false === isWWW()
            || (user !== undefined && hideExpandInformation === false)) {
            buttons.push({
                text: 'Expand',
                color: 'primary',
            })
        }

        const backendThrowable = CarbonORM.instance.state.backendThrowable[0]

        alert = {
            title: "Oh no! An issue occurred!",
            text: backendThrowable?.['DropInGaming\\PHP\\Errors\\DropException'] ?? 'An unknown issue occurred. Please try again.',
            timeout: 0,
            footerText: hideExpandInformation ? '' : 'These alert footer options are only shown to admins and in development environments. Click "Expand" to see more details.',
            buttons: buttons,
            // backendThrowable has its own custom component that can be expanded (called in the Bootstrap component)
            // our then function will be called when the user clicks on the button providing the option to expand or close
            backendThrowable: backendThrowable,
            then: (value: string | undefined) => {

                if (value === 'Expand') {

                    CarbonORM.instance.setState(previousState => {

                        let backendThrowable = previousState.backendThrowable.pop()

                        if (backendThrowable === undefined) {
                            return {
                                backendThrowable: []
                            }
                        }

                        backendThrowable.expanded = true

                        return {
                            backendThrowable: [backendThrowable, ...(previousState.backendThrowable ?? [])]
                        }
                    })

                } else {
                    CarbonORM.instance.setState(previousState => ({
                        backendThrowable: previousState.backendThrowable.slice(1)
                    }))
                }
            }
        }

    } else if (alertsWaiting.length !== 0) {

        alert = alertsWaiting[0]

    }

    if (alert === undefined) {

        return null

    }

    const timeout = alert?.timeout || 15000

    const bootstrap = CarbonORM.instance

    const styles = RootStyles

    let cancelTimeout: any = null

    const handleClose = () => {
        if (null !== cancelTimeout) {
            clearTimeout(cancelTimeout)
        }

        if (alert?.backendThrowable === undefined) {
            bootstrap.setState(previousState => ({
                alertsWaiting: previousState.alertsWaiting.slice(1)
            }))
        }

    }

    if (alert?.intercept === false) {
        handleClose()
        return null
    }

    if (0 !== timeout) {

        cancelTimeout = setTimeout(() => {
            handleClose()
        }, timeout)

    }

    return <Popup handleClose={handleClose}>
        <div className={classNames(styles.modalContent, styles.rounded0, styles.border0)} style={{
            maxWidth: '75vw',
            maxHeight: '75vh',
        }}>
            <div className={classNames(styles.modalHeader, styles.rounded0, styles.border0, {
                // icon?: "warning" | "error" | "success" | "info" | "question"
                [styles.bgCyan]: "info" === alert.icon || alert.icon === undefined || alert.icon === null,
                [styles.bgGreen]: "success" === alert.icon,
                [styles.bgWarning]: "warning" === alert.icon,
                [styles.bgRed]: "error" === alert.icon, // TODO - change to red
                [styles.bgPrimary]: "question" === alert.icon,
            })}>
                <h3 className={classNames(styles.modalTitle, styles.textDark)} id="staticBackdropLabel">
                    #{alertWaiting} {alert.title}
                </h3>
                <div onClick={handleClose}>
                    <FontAwesomeIcon
                        style={{color: getRootStyleValue()}}
                        icon={faClose}
                        size={'xl'}/>
                </div>
            </div>
            <div className={classNames(styles.modalBody, styles.border0, styles.bgWhite, styles.text)}>
                <div className={styles.textCenter}>
                    {alert.text}
                    {alert.component}
                </div>
            </div>
            {undefined !== alert.buttons &&
                <div className={classNames(styles.modalFooter, styles.bgGray, styles.border0, styles.rounded0)}>
                    {alert.footerText && <div className={classNames(styles.textCenter, styles.text)}>{alert.footerText}</div>}

                    {alert.buttons?.map((button: iAlertButtonOptions, index: number) => {

                        return <button key={index}
                                       className={classNames(styles.btn, styles.btnLg, {
                                           // todo - color: "default" | "primary" | "secondary" | "inherit" | "danger" | "info" | "success" | "warning" | undefined,
                                           [styles.bgCyan]: "info" === button.color,
                                           [styles.bgGreen]: "success" === button.color,
                                           [styles.bgRed]: "danger" === button.color,
                                           [styles.bgPrimary]: "primary" === button.color,
                                           [styles.bgWarning]: "warning" === button.color,
                                       }, "btn-Yes", styles.rounded0)}
                                       onClick={() => {
                                           handleClose()
                                           alert?.then?.(button.value ?? button.text)
                                       }}>{button.text}</button>

                    })}

                </div>}
        </div>
    </Popup>


}