import {ToastOptions} from "react-toastify";

export default {
    toastOptions: {
        position: "bottom-left",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
    } as ToastOptions,
    toastOptionsDevs: {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
    } as ToastOptions,
}