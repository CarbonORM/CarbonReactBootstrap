import classNames from "classnames";
import OutsideClickHandler from 'react-outside-click-handler';
import RootStyles from "index";


interface iPopupProperties {
    open?: boolean;
    handleClose: () => any;
    children: any;
    minWidth?: string;
    maxWidth?: string;

}

// @link https://stackoverflow.com/questions/58399637/include-modal-functionality-in-react-higher-order-component
export default function Popup({
                                  open = true,
                                  handleClose,
                                  children,
                                  maxWidth,
                              }: iPopupProperties) {

    if (false === open) {

        return null;

    }

    const styles = RootStyles

    return <>
        <div className={classNames(styles.modal, styles.fade, styles.show, styles.dBlock)}
             style={{backgroundColor: "rgba(0,0,0,0.8)"}}
             id="exampleModalCenter"
             tabIndex={-1} aria-labelledby="exampleModalCenterTitle"
             aria-modal="true" role="dialog">

            <div
                style={{maxWidth: maxWidth}}
                className={classNames(
                    styles.modalDialog, styles.modalDialogCentered,
                )}
            >
                <OutsideClickHandler onOutsideClick={() => handleClose()}>
                    <div className={classNames(styles.modalContent, styles.bgTransparent, styles.modalDialogScrollable, styles.modal)}>
                        {children}
                    </div>
                </OutsideClickHandler>
            </div>

        </div>
    </>

}

